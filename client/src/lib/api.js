import { getStoredToken } from './session.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

async function request(path, options = {}) {
  const token = getStoredToken();
  const isFormData = options.body instanceof FormData;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const message = payload?.message || 'Request failed';
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

export function fetchPosts(params) {
  const search = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, value);
    }
  });

  return request(`/posts?${search.toString()}`);
}

export function fetchPost(postId) {
  return request(`/posts/${postId}`);
}

export function login(payload) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function register(payload) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fetchCurrentUser() {
  return request('/auth/me');
}

export function fetchStats() {
  return request('/posts/stats/overview');
}

export function createPost(payload) {
  return request('/posts', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updatePost(postId, payload) {
  return request(`/posts/${postId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deletePost(postId) {
  return request(`/posts/${postId}`, {
    method: 'DELETE',
  });
}

export function fetchHealth() {
  return request('/health');
}

export function fetchCategories() {
  return request('/taxonomy/categories');
}

export function createCategory(payload) {
  return request('/taxonomy/categories', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateCategory(categoryId, payload) {
  return request(`/taxonomy/categories/${categoryId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteCategory(categoryId) {
  return request(`/taxonomy/categories/${categoryId}`, {
    method: 'DELETE',
  });
}

export function fetchTags() {
  return request('/taxonomy/tags');
}

export function createTag(payload) {
  return request('/taxonomy/tags', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateTag(tagId, payload) {
  return request(`/taxonomy/tags/${tagId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteTag(tagId) {
  return request(`/taxonomy/tags/${tagId}`, {
    method: 'DELETE',
  });
}

export function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);

  return request('/uploads/image', {
    method: 'POST',
    body: formData,
  });
}
