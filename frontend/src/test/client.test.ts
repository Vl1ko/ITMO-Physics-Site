import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, api, tokenStorage } from '../api/client';

function mockFetch(response: Partial<Response> & { json?: () => Promise<unknown> }) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({}),
    ...response,
  } as Response);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
  tokenStorage.clear();
});

describe('api client', () => {
  it('подставляет Bearer-токен в заголовки', async () => {
    tokenStorage.set('test-token');
    const fetchMock = mockFetch({ json: async () => ({ ok: true }) });

    await api.get('/api/cabinet');

    const headers = fetchMock.mock.calls[0][1].headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer test-token');
  });

  it('не шлёт заголовок авторизации без токена', async () => {
    const fetchMock = mockFetch({ json: async () => ({}) });

    await api.get('/api/tasks');

    const headers = fetchMock.mock.calls[0][1].headers as Record<string, string>;
    expect(headers.Authorization).toBeUndefined();
  });

  it('бросает ApiError и чистит токен при 401', async () => {
    tokenStorage.set('expired');
    mockFetch({ ok: false, status: 401, json: async () => ({ message: 'unauthorized' }) });

    await expect(api.get('/api/cabinet')).rejects.toBeInstanceOf(ApiError);
    expect(tokenStorage.get()).toBeNull();
  });

  it('прокидывает ошибки валидации по полям', async () => {
    mockFetch({
      ok: false,
      status: 400,
      json: async () => ({ message: 'Ошибка валидации', fields: { email: 'Некорректный email' } }),
    });

    await expect(api.post('/api/auth/register', {})).rejects.toMatchObject({
      status: 400,
      fields: { email: 'Некорректный email' },
    });
  });
});
