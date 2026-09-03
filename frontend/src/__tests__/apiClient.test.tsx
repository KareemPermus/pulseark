import apiClient from '@/api/client';

describe('apiClient', () => {
  it('has empty baseURL', () => {
    expect(apiClient.defaults.baseURL).toBe('');
  });

  it('has json content type', () => {
    expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
  });
});