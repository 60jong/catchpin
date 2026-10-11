import Constants from 'expo-constants';
import { File, UploadType } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { Platform } from 'react-native';

import { LOGIN_REQUIRED_MESSAGE, NETWORK_MESSAGE, TRY_AGAIN_MESSAGE } from './member';
import { getAccessToken } from './session';

const { apiBaseUrl } = Constants.expoConfig?.extra ?? {};

const PROFILE_IMAGE_WIDTH = 512;
const PROFILE_IMAGE_TYPE = 'image/jpeg';

/** 성공하면 CloudFront 공개 URL, 실패하면 화면에 그대로 보여줄 메시지 하나만 준다. */
export type ProfileImageOutcome = { ok: true; imageUrl: string } | { ok: false; message: string };

async function readError(response: Response) {
  // 백엔드는 실패 시 ProblemDetail(RFC 7807)을 주는데, 400대의 "detail"은 우리가 쓴 안내 문구다.
  // 500대는 시스템이 만든 문구일 수 있어 그대로 보여주지 않는다.
  const problem = await response.json().catch(() => null);
  return (response.status < 500 && problem?.detail) || TRY_AGAIN_MESSAGE;
}

type ReadyUpload = {
  /** 바이트 단위 실제 파일 크기 — 서버가 이 값을 서명에 넣는다. */
  size: number;
  put: (url: string) => Promise<{ status: number; body: string }>;
};

/**
 * 줄인 사진을 S3에 PUT할 수 있는 형태로 준비한다.
 * 네이티브는 파일을 그대로 올리는 expo-file-system을 쓴다 — 안드로이드의 fetch는 Blob 본문을 보낼 때
 * 우리가 지정한 Content-Type 헤더를 빠뜨려서 S3 서명이 어긋났다. 웹에는 네이티브 업로드가 없어 fetch + Blob을 쓴다.
 */
async function prepareUpload(uri: string): Promise<ReadyUpload> {
  if (Platform.OS === 'web') {
    const blob = await (await fetch(uri)).blob();
    return {
      size: blob.size,
      put: async (url) => {
        const response = await fetch(url, { method: 'PUT', headers: { 'Content-Type': PROFILE_IMAGE_TYPE }, body: blob });
        return { status: response.status, body: await response.text().catch(() => '') };
      },
    };
  }
  const file = new File(uri);
  return {
    size: file.size,
    put: async (url) => {
      const result = await file.upload(url, {
        httpMethod: 'PUT',
        uploadType: UploadType.BINARY_CONTENT,
        headers: { 'Content-Type': PROFILE_IMAGE_TYPE },
      });
      return { status: result.status, body: result.body };
    },
  };
}

/**
 * 고른 사진을 프로필 사진으로 올린다.
 * 1) 512px JPEG로 줄인다 (서버 제한 5MB를 넉넉히 지키고 전송량도 줄임)
 * 2) 서버에서 S3 업로드용 URL을 받고 → 3) 그 URL로 S3에 직접 PUT → 4) 서버에 key를 알려서 프로필에 반영한다.
 * 서버가 URL을 만들 때 Content-Type/크기를 서명에 넣으므로, 2)에서 보낸 값과 3)의 실제 값이 똑같아야 한다.
 */
export async function uploadProfileImage(localUri: string): Promise<ProfileImageOutcome> {
  const accessToken = getAccessToken();
  if (!accessToken) return { ok: false, message: LOGIN_REQUIRED_MESSAGE };
  const auth = { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` };

  try {
    const manipulator = ImageManipulator.manipulate(localUri);
    manipulator.resize({ width: PROFILE_IMAGE_WIDTH });
    const rendered = await manipulator.renderAsync();
    const resized = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: 0.8 });

    // 크기는 바이트 단위로 정확해야 한다 — 줄인 뒤의 실제 파일에서 읽는다.
    const upload = await prepareUpload(resized.uri);

    const urlResponse = await fetch(`${apiBaseUrl}/api/v1/members/me/profile-image/upload-url`, {
      method: 'POST',
      headers: auth,
      body: JSON.stringify({ contentType: PROFILE_IMAGE_TYPE, size: upload.size }),
    });
    if (!urlResponse.ok) return { ok: false, message: await readError(urlResponse) };
    const { uploadUrl, key } = (await urlResponse.json()).data;

    // S3로 가는 요청에는 우리 서버 인증 헤더를 붙이지 않는다 (서명이 URL에 들어 있고, 다른 헤더는 서명을 깨뜨림).
    const putResponse = await upload.put(uploadUrl);
    if (putResponse.status < 200 || putResponse.status >= 300) {
      // S3가 XML로 알려주는 에러(<Code>: SignatureDoesNotMatch, AccessDenied 등)와 받은 헤더 값은 사용자에게 보일 내용이 아니라
      // 개발자가 원인을 찾는 데 쓰는 정보라서, 화면 대신 개발 로그에만 남긴다.
      console.warn('[profile-image] S3 업로드 실패', putResponse.status, `서명한 크기: ${upload.size}`, putResponse.body);
      return { ok: false, message: TRY_AGAIN_MESSAGE };
    }

    const patchResponse = await fetch(`${apiBaseUrl}/api/v1/members/me`, {
      method: 'PATCH',
      headers: auth,
      body: JSON.stringify({ profileImageKey: key }),
    });
    if (!patchResponse.ok) return { ok: false, message: await readError(patchResponse) };

    const { profileImageUrl } = (await patchResponse.json()).data;
    return { ok: true, imageUrl: profileImageUrl };
  } catch (error: any) {
    console.warn('[profile-image] 사진 업로드 실패', error);
    return { ok: false, message: NETWORK_MESSAGE };
  }
}
