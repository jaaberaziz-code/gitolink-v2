const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Auth
export const auth = {
  me: () => fetchAPI('/api/auth/me'),
  login: (email: string, password: string) =>
    fetchAPI('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (data: { username: string; email: string; password: string; name?: string }) =>
    fetchAPI('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  logout: () => fetchAPI('/api/auth/logout', { method: 'POST' }),
};

// Links
export const links = {
  getAll: () => fetchAPI('/api/links'),
  create: (data: { title: string; url: string; description?: string; icon?: string }) =>
    fetchAPI('/api/links', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<{ title: string; url: string; description: string; icon: string; active: boolean; order: number }>) =>
    fetchAPI(`/api/links/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchAPI(`/api/links/${id}`, { method: 'DELETE' }),
  reorder: (linkIds: string[]) =>
    fetchAPI('/api/links/reorder', {
      method: 'POST',
      body: JSON.stringify({ linkIds }),
    }),
};

// Profile
export const profile = {
  get: (username: string) => fetchAPI(`/api/profile/${username}`),
};

// Analytics
export const analytics = {
  track: (linkId: string) =>
    fetchAPI(`/api/click/${linkId}`, { method: 'POST' }),
  getStats: () => fetchAPI('/api/analytics'),
};