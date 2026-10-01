import { loginWithEmail, loginWithGoogle, signup } from './auth';

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
