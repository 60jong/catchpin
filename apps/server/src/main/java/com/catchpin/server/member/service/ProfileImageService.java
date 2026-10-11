package com.catchpin.server.member.service;

import com.catchpin.server.common.storage.ObjectStorage;
import com.catchpin.server.member.domain.ProfileImageUploadResponse;
import com.catchpin.server.member.exception.InvalidProfileImageException;
import java.time.Duration;
import java.util.Map;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/** 프로필 사진 업로드 — presigned URL 발급과, 업로드가 끝난 키를 프로필에 반영하기 전 검증. */
@Slf4j
@Service
public class ProfileImageService {

	private static final long MAX_SIZE_BYTES = 5L * 1024 * 1024;
	private static final Duration UPLOAD_URL_TTL = Duration.ofMinutes(5);
	// SVG처럼 스크립트가 들어갈 수 있는 형식은 공개 도메인으로 서빙하면 위험해서 허용하지 않는다.
	private static final Map<String, String> EXTENSIONS = Map.of(
			"image/jpeg", "jpg",
			"image/png", "png",
			"image/webp", "webp");

	private final ObjectStorage objectStorage;

	public ProfileImageService(ObjectStorage objectStorage) {
		this.objectStorage = objectStorage;
	}

	public ProfileImageUploadResponse createUpload(Long memberId, String contentType, long size) {
		String extension = EXTENSIONS.get(contentType);
		if (extension == null) {
			throw new InvalidProfileImageException("jpeg, png, webp 이미지만 올릴 수 있어요.");
		}
		if (size <= 0 || size > MAX_SIZE_BYTES) {
			throw new InvalidProfileImageException("사진은 5MB 이하만 올릴 수 있어요.");
		}
		String key = keyPrefix(memberId) + UUID.randomUUID() + "." + extension;
		String url = objectStorage.presignPut(key, contentType, size, UPLOAD_URL_TTL);
		return new ProfileImageUploadResponse(url, key, (int) UPLOAD_URL_TTL.toSeconds());
	}

	/**
	 * 클라이언트가 알려준 키가 내 폴더의 것인지만 확인한다 — 아니면 남의 파일을 내 프로필로 지정할 수 있다.
	 * 타입/크기는 presigned URL 서명이 이미 강제하므로 여기서 다시 보지 않는다.
	 */
	public void verifyOwnKey(Long memberId, String key) {
		if (!key.startsWith(keyPrefix(memberId)) || key.contains("..")) {
			throw new InvalidProfileImageException("올바르지 않은 사진이에요.");
		}
	}

	/** 업로드한 사진을 S3에서 지운다 — 탈퇴 정리용이라, 실패해도 탈퇴를 막지 않고 로그만 남긴다. */
	public void deleteQuietly(String key) {
		if (key == null) {
			return;
		}
		try {
			objectStorage.delete(key);
		} catch (RuntimeException e) {
			log.warn("프로필 사진 삭제에 실패했어요 key={}", key, e);
		}
	}

	/** 키 → 공개 URL (사진이 없으면 null). */
	public String urlOf(String key) {
		return key == null ? null : objectStorage.publicUrl(key);
	}

	private String keyPrefix(Long memberId) {
		return "profile/" + memberId + "/";
	}
}
