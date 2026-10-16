import { autoLogin, loginWithEmail, loginWithGoogle, signup } from './auth';
import { clearSession, getAccessToken, loadStoredRefreshToken } from './session';

jest.mock('./session', () => ({
  ...jest.requireActual('./session'),
  loadStoredRefreshToken: jest.fn(),
  persistSession: jest.fn(),
  clearSession: jest.fn(),
}));

// fetch는 실제 네트워크를 타지 않도록 매번 새로 모킹한다.
beforeEach(() => {
  globalThis.fetch = jest.fn() as unknown as typeof fetch;
});

function mockFetchOnce(status: number, jsonBody: unknown) {
  (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: async () => jsonBody,
  });
}

describe('loginWithGoogle', () => {
  test('성공하면 ok: true와 토큰을 반환한다', async () => {
    mockFetchOnce(200, { success: true, data: { accessToken: 'a', refreshToken: 'r', profileComplete: true } });

    const outcome = await loginWithGoogle('fake-id-token');

    expect(outcome.ok).toBe(true);
    if (outcome.ok) {
      expect(outcome.result.accessToken).toBe('a');
    }
  });

  test('실패하면 서버의 ProblemDetail.detail을 메시지로 반환한다', async () => {
    mockFetchOnce(401, { detail: '유효하지 않은 구글 토큰이에요.', status: 401, title: 'Unauthorized' });

    const outcome = await loginWithGoogle('bad-token');

    expect(outcome.ok).toBe(false);
    if (!outcome.ok) {
      expect(outcome.message).toBe('유효하지 않은 구글 토큰이에요.');
    }
  });

  test('네트워크 자체가 실패해도 던지지 않고 ok: false로 돌려준다', async () => {
    (globalThis.fetch as jest.Mock).mockRejectedValueOnce(new Error('네트워크 연결 실패'));

    const outcome = await loginWithGoogle('any-token');

    expect(outcome.ok).toBe(false);
    if (!outcome.ok) {
      expect(outcome.message).toContain('네트워크 연결 실패');
    }
  });

  test('올바른 엔드포인트로 idToken을 보낸다', async () => {
    mockFetchOnce(200, { data: { accessToken: 'a', refreshToken: 'r', profileComplete: false } });

    await loginWithGoogle('token-123');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/auth/google'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ idToken: 'token-123' }),
      }),
    );
  });
});

describe('loginWithEmail', () => {
  test('올바른 엔드포인트로 email/password를 보낸다', async () => {
    mockFetchOnce(200, { data: { accessToken: 'a', refreshToken: 'r', profileComplete: true } });

    await loginWithEmail('me@catchpin.dev', 'password1234');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/auth/login'),
      expect.objectContaining({
        body: JSON.stringify({ email: 'me@catchpin.dev', password: 'password1234' }),
      }),
    );
  });
});

describe('signup', () => {
  test('올바른 엔드포인트로 email/password/nickname을 보낸다', async () => {
    mockFetchOnce(200, { data: { accessToken: 'a', refreshToken: 'r', profileComplete: true } });

    await signup('me@catchpin.dev', 'password1234', 'tester');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/auth/signup'),
      expect.objectContaining({
        body: JSON.stringify({ email: 'me@catchpin.dev', password: 'password1234', nickname: 'tester', avatarId: null }),
      }),
    );
  });
});

describe('autoLogin', () => {
  const stored = loadStoredRefreshToken as jest.Mock;

  test('저장된 토큰이 없으면 none', async () => {
    stored.mockResolvedValueOnce(null);
    expect(await autoLogin()).toBe('none');
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  test('저장된 리프레시 토큰으로 새 토큰을 받으면 ok이고 액세스 토큰이 채워진다', async () => {
    stored.mockResolvedValueOnce('old-refresh');
    mockFetchOnce(200, { success: true, data: { accessToken: 'new-a', refreshToken: 'new-r', profileComplete: true } });

    expect(await autoLogin()).toBe('ok');
    expect(getAccessToken()).toBe('new-a');
    expect((globalThis.fetch as jest.Mock).mock.calls[0][1].body).toBe(JSON.stringify({ refreshToken: 'old-refresh' }));
  });

  test('토큰이 거부되면 저장된 로그인을 지우고 none', async () => {
    stored.mockResolvedValueOnce('expired');
    mockFetchOnce(401, { detail: '유효하지 않은 토큰이에요.' });

    expect(await autoLogin()).toBe('none');
    expect(clearSession).toHaveBeenCalled();
  });

  test('서버 오류나 네트워크 문제면 failed (저장된 로그인은 남겨둔다)', async () => {
    stored.mockResolvedValueOnce('r');
    (globalThis.fetch as jest.Mock).mockRejectedValueOnce(new Error('offline'));

    expect(await autoLogin()).toBe('failed');
  });
});
