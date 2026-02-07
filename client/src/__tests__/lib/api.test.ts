import '@testing-library/jest-dom';
import api from '@/lib/api';

const BASE_URL = 'http://localhost:5000/api';

describe('API client', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('api.get calls fetch with credentials: "include"', async () => {
    const mockData = { success: true };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await api.get('/test');

    expect(global.fetch).toHaveBeenCalledWith(`${BASE_URL}/test`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    expect(result).toEqual(mockData);
  });

  it('api.post sends JSON body', async () => {
    const mockData = { created: true };
    const postData = { name: 'test' };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await api.post('/test', postData);

    expect(global.fetch).toHaveBeenCalledWith(`${BASE_URL}/test`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(postData),
    });
    expect(result).toEqual(mockData);
  });

  it('api.put sends JSON body', async () => {
    const mockData = { updated: true };
    const putData = { name: 'updated' };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await api.put('/test', putData);

    expect(global.fetch).toHaveBeenCalledWith(`${BASE_URL}/test`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'PUT',
      body: JSON.stringify(putData),
    });
    expect(result).toEqual(mockData);
  });

  it('api.delete sends DELETE', async () => {
    const mockData = { deleted: true };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await api.delete('/test');

    expect(global.fetch).toHaveBeenCalledWith(`${BASE_URL}/test`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'DELETE',
    });
    expect(result).toEqual(mockData);
  });

  it('throws on non-OK response with error message', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Bad request' }),
    });

    await expect(api.get('/test')).rejects.toThrow('Bad request');
  });

  it('throws on non-OK response with HTTP status fallback', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    await expect(api.get('/test')).rejects.toThrow('HTTP 500');
  });

  it('throws generic error if JSON parsing fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error('Invalid JSON');
      },
    });

    await expect(api.get('/test')).rejects.toThrow('Request failed');
  });

  it('uses NEXT_PUBLIC_API_URL as base', async () => {
    const originalEnv = process.env.NEXT_PUBLIC_API_URL;
    process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com/api';

    // Re-require the module to pick up the new env var
    jest.resetModules();
    const apiWithCustomUrl = require('@/lib/api').default;

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    await apiWithCustomUrl.get('/test');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/api/test',
      expect.any(Object)
    );

    // Restore
    process.env.NEXT_PUBLIC_API_URL = originalEnv;
    jest.resetModules();
  });
});
