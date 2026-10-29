const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(message, { status, data } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

function getUrl(path) {
  if (/^https?:\/\//i.test(path)) return path;
  if (!API_BASE_URL) {
    throw new ApiError('VITE_API_BASE_URL is not configured.');
  }
  return `${API_BASE_URL}/${String(path).replace(/^\/+/, '')}`;
}

async function readResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return response.json();
  return response.text();
}

export async function apiRequest(path, options = {}) {
  const { body, headers, ...requestOptions } = options;
  const requestHeaders = new Headers(headers);
  requestHeaders.set('Accept', 'application/json');

  let requestBody = body;
  if (body !== undefined && !(body instanceof FormData)) {
    requestHeaders.set('Content-Type', 'application/json');
    requestBody = JSON.stringify(body);
  }

  const token = localStorage.getItem('turn_and_burn_access_token');
  if (token) requestHeaders.set('Authorization', `Bearer ${token}`);

  let response = await fetch(getUrl(path), {
    ...requestOptions,
    body: requestBody,
    headers: requestHeaders,
  });

  // Silent Token Refresh Interceptor on 401
  if (response.status === 401 && !path.includes('/auth/refresh') && !path.includes('/auth/login')) {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        const refreshRes = await fetch(getUrl('/auth/refresh'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });
        const refreshData = await readResponse(refreshRes);
        const newAccessToken = refreshData?.data?.accessToken;
        if (newAccessToken) {
          setAccessToken(newAccessToken);
          requestHeaders.set('Authorization', `Bearer ${newAccessToken}`);
          // Retry original request with newly issued access token
          response = await fetch(getUrl(path), {
            ...requestOptions,
            body: requestBody,
            headers: requestHeaders,
          });
        }
      } catch (refreshErr) {
        console.warn('Auto token refresh failed:', refreshErr);
      }
    }
  }

  const data = await readResponse(response);

  if (!response.ok) {
    let message = 'API request failed';
    if (data && typeof data === 'object') {
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        message = data.errors.join(', ');
      } else if (data.message) {
        message = data.message;
      } else if (data.error) {
        message = data.error;
      }
    } else if (typeof data === 'string' && data) {
      message = data;
    } else {
      message = `API request failed with status ${response.status}`;
    }
    throw new ApiError(message, { status: response.status, data });
  }

  return data;
}

export function setAccessToken(token) {
  if (token) localStorage.setItem('turn_and_burn_access_token', token);
  else localStorage.removeItem('turn_and_burn_access_token');
}

export function setRefreshToken(token) {
  if (token) localStorage.setItem('turn_and_burn_refresh_token', token);
  else localStorage.removeItem('turn_and_burn_refresh_token');
}

export function getRefreshToken() {
  return localStorage.getItem('turn_and_burn_refresh_token');
}

export function setCurrentUser(user) {
  if (user) localStorage.setItem('turn_and_burn_user', JSON.stringify(user));
  else localStorage.removeItem('turn_and_burn_user');
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem('turn_and_burn_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem('turn_and_burn_access_token');
  localStorage.removeItem('turn_and_burn_refresh_token');
  localStorage.removeItem('turn_and_burn_user');
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}

/**
 * Downloads a file from an authenticated endpoint (e.g. CSV or PDF),
 * extracting the filename from Content-Disposition if present.
 */
export async function downloadFile(path, defaultFilename = 'download') {
  const token = localStorage.getItem('turn_and_burn_access_token');
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(getUrl(path), {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    let errorText = 'File download failed';
    try {
      const errJson = await response.json();
      errorText = errJson.message || errorText;
    } catch {
      errorText = `Download failed with status ${response.status}`;
    }
    throw new ApiError(errorText, { status: response.status });
  }

  const disposition = response.headers.get('content-disposition');
  let filename = defaultFilename;
  if (disposition && disposition.includes('filename=')) {
    const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (match && match[1]) {
      filename = match[1].replace(/['"]/g, '').trim();
    }
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
}


