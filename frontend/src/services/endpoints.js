import { api } from './api.js';

// Every function returns the "data" part of { success, data }.
const unwrap = (promise) => promise.then((r) => r.data.data);
const get = (url, params) => unwrap(api.get(url, { params }));
const post = (url, body, config) => unwrap(api.post(url, body, config));
const put = (url, body) => unwrap(api.put(url, body));
const patch = (url, body) => unwrap(api.patch(url, body));
const del = (url, body) => unwrap(api.delete(url, body ? { data: body } : undefined));

// Remove empty values so they are not sent as filters.
export const clean = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== '' && v != null));

export const authApi = {
  register: (body) => post('/auth/register', body),
  login: (body) => post('/auth/login', body),
  logout: () => post('/auth/logout'),
  me: () => get('/auth/me'),
};

export const userApi = {
  update: (body) => patch('/users/me', body),
  remove: (password) => del('/users/me', { password }),
};

export const medicineApi = {
  list: (params) => get('/medicines', params),
  get: (id) => get(`/medicines/${id}`),
  create: (body) => post('/medicines', body),
  update: (id, body) => put(`/medicines/${id}`, body),
  remove: (id) => del(`/medicines/${id}`),
};

export const doseApi = {
  list: (params) => get('/doses', clean(params || {})),
  history: (params) => get('/doses/history', clean(params || {})),
  mark: (id, status) => patch(`/doses/${id}`, { status }),
};

export const reminderApi = { claim: () => post('/reminders/claim') };

export const appointmentApi = {
  list: (params) => get('/appointments', params),
  create: (body) => post('/appointments', body),
  update: (id, body) => put(`/appointments/${id}`, body),
  setStatus: (id, body) => patch(`/appointments/${id}/status`, body),
  remove: (id) => del(`/appointments/${id}`),
};

export const recordApi = {
  list: (params) => get('/records', clean(params || {})),
  upload: (formData, onProgress) =>
    post('/records', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => e.total && onProgress?.(Math.round((e.loaded * 100) / e.total)),
    }),
  file: (id, download) =>
    api.get(`/records/${id}/file`, { params: download ? { download: 1 } : undefined, responseType: 'blob' }).then((r) => r.data),
  remove: (id) => del(`/records/${id}`),
};

export const testApi = {
  list: (params) => get('/tests', clean(params || {})),
  get: (id) => get(`/tests/${id}`),
  create: (body) => post('/tests', body),
  update: (id, body) => put(`/tests/${id}`, body),
  remove: (id) => del(`/tests/${id}`),
  names: () => get('/tests/names'),
  // unit: undefined = let the server choose; '' = measurements without a unit
  compare: ({ unit, ...rest }) => get('/tests/compare', { ...clean(rest), ...(unit !== undefined ? { unit } : {}) }),
};

export const dashboardApi = { get: () => get('/dashboard') };
