describe('axios instance interceptors', () => {
  let requestSuccessHandler;
  let requestErrorHandler;
  let responseSuccessHandler;
  let responseErrorHandler;
  let axiosCreateMock;
  let axiosModule;
  let instanceMock;
  let originalLocation;

  beforeEach(() => {
    jest.resetModules();
    localStorage.clear();

    requestSuccessHandler = undefined;
    requestErrorHandler = undefined;
    responseSuccessHandler = undefined;
    responseErrorHandler = undefined;

    instanceMock = {
      interceptors: {
        request: {
          use: jest.fn((onFulfilled, onRejected) => {
            requestSuccessHandler = onFulfilled;
            requestErrorHandler = onRejected;
          }),
        },
        response: {
          use: jest.fn((onFulfilled, onRejected) => {
            responseSuccessHandler = onFulfilled;
            responseErrorHandler = onRejected;
          }),
        },
      },
    };

    axiosCreateMock = jest.fn(() => instanceMock);

    jest.doMock('axios', () => ({
      __esModule: true,
      default: {
        create: axiosCreateMock,
      },
    }));

    originalLocation = window.location;
    delete window.location;
    window.location = { href: 'http://localhost/' };

    axiosModule = require('./axios').default;
  });

  afterEach(() => {
    window.location = originalLocation;
  });

  it('creates instance with default API config', () => {
    expect(axiosModule).toBe(instanceMock);
    expect(axiosCreateMock).toHaveBeenCalledWith({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });

  it('adds bearer token when token exists', () => {
    localStorage.setItem('token', 'abc123');

    const config = { headers: {} };
    const updated = requestSuccessHandler(config);

    expect(updated.headers.Authorization).toBe('Bearer abc123');
  });

  it('does not add auth header when token is missing', () => {
    const config = { headers: {} };
    const updated = requestSuccessHandler(config);

    expect(updated.headers.Authorization).toBeUndefined();
  });

  it('removes content-type header for FormData payloads', () => {
    const formData = new FormData();
    formData.append('photo', 'blob');

    const config = {
      headers: { 'Content-Type': 'application/json' },
      data: formData,
    };

    const updated = requestSuccessHandler(config);

    expect(updated.headers['Content-Type']).toBeUndefined();
  });

  it('clears token and redirects to login on 401 responses', async () => {
    localStorage.setItem('token', 'abc123');
    const error = { response: { status: 401 }, config: { url: '/Users/me' } };

    await expect(responseErrorHandler(error)).rejects.toBe(error);

    expect(localStorage.getItem('token')).toBeNull();
    expect(window.location.href).toBe('/login');
  });

  it('does not redirect on 401 from login endpoint', async () => {
    localStorage.setItem('token', 'abc123');
    const error = { response: { status: 401 }, config: { url: '/Auth/login' } };

    await expect(responseErrorHandler(error)).rejects.toBe(error);

    expect(localStorage.getItem('token')).toBe('abc123');
    expect(window.location.href).toBe('http://localhost/');
  });

  it('does not redirect on 401 from register endpoint', async () => {
    localStorage.setItem('token', 'abc123');
    const error = { response: { status: 401 }, config: { url: '/Auth/register' } };

    await expect(responseErrorHandler(error)).rejects.toBe(error);

    expect(localStorage.getItem('token')).toBe('abc123');
    expect(window.location.href).toBe('http://localhost/');
  });

  it('keeps token and does not redirect for non-401 responses', async () => {
    localStorage.setItem('token', 'abc123');
    const error = { response: { status: 500 } };

    await expect(responseErrorHandler(error)).rejects.toBe(error);

    expect(localStorage.getItem('token')).toBe('abc123');
    expect(window.location.href).toBe('http://localhost/');
  });

  it('forwards request interceptor errors', async () => {
    const requestErr = new Error('request failed');

    await expect(requestErrorHandler(requestErr)).rejects.toThrow('request failed');
  });

  it('returns response unchanged in response success interceptor', () => {
    const response = { data: { ok: true } };

    expect(responseSuccessHandler(response)).toBe(response);
  });
});
