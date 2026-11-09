// OurThings API Client

let activeUserId = 1;
let activeCommunityId = 1;

export function setApiContext(userId, communityId) {
  if (userId) activeUserId = userId;
  if (communityId) activeCommunityId = communityId;
}

export function getApiContext() {
  return { activeUserId, activeCommunityId };
}

async function request(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'X-User-Id': String(activeUserId),
    'X-Community-Id': String(activeCommunityId),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = (data && (data.message || data.error)) || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth & Context
  getUsers: () => request('/api/auth/users'),
  getCurrentUser: () => request('/api/auth/me'),
  registerUser: (payload) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  switchCommunity: (communityId) => request('/api/auth/switch-community', { method: 'POST', body: JSON.stringify({ communityId }) }),

  // Communities
  getCommunities: () => request('/api/communities'),
  getCommunity: (id) => request(`/api/communities/${id}`),
  createCommunity: (payload) => request('/api/communities', { method: 'POST', body: JSON.stringify(payload) }),

  // Items
  getItems: (params = {}) => {
    const query = new URLSearchParams();
    if (params.category) query.append('category', params.category);
    if (params.keyword) query.append('keyword', params.keyword);
    if (params.dateFrom) query.append('dateFrom', params.dateFrom);
    if (params.dateTo) query.append('dateTo', params.dateTo);
    const qs = query.toString();
    return request(`/api/items${qs ? '?' + qs : ''}`);
  },
  getItem: (id) => request(`/api/items/${id}`),
  getMyListings: () => request('/api/items/my-listings'),
  createItem: (payload) => request('/api/items', { method: 'POST', body: JSON.stringify(payload) }),
  updateItem: (id, payload) => request(`/api/items/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  togglePauseItem: (id) => request(`/api/items/${id}/toggle-pause`, { method: 'POST' }),
  removeItem: (id) => request(`/api/items/${id}`, { method: 'DELETE' }),

  // Borrow Requests & Booking
  submitRequest: (payload) => request('/api/requests', { method: 'POST', body: JSON.stringify(payload) }),
  getMyRequests: () => request('/api/requests/borrower'),
  getOwnerRequests: () => request('/api/requests/owner'),
  getRequest: (id) => request(`/api/requests/${id}`),
  approveRequest: (id) => request(`/api/requests/${id}/approve`, { method: 'POST' }),
  declineRequest: (id) => request(`/api/requests/${id}/decline`, { method: 'POST' }),
  withdrawRequest: (id) => request(`/api/requests/${id}/withdraw`, { method: 'POST' }),

  // Handover & Return
  recordHandover: (requestId, payload) => request(`/api/handovers/${requestId}/handover`, { method: 'POST', body: JSON.stringify(payload) }),
  recordReturn: (requestId, payload) => request(`/api/handovers/${requestId}/return`, { method: 'POST', body: JSON.stringify(payload) }),

  // Unmet Demand
  getAggregatedDemands: () => request('/api/demands/aggregated'),
  getOpenDemands: () => request('/api/demands/open'),
  getMyDemands: () => request('/api/demands/my'),
  submitDemand: (payload) => request('/api/demands', { method: 'POST', body: JSON.stringify(payload) }),
  fulfillDemand: (id) => request(`/api/demands/${id}/fulfill`, { method: 'POST' }),

  // Dashboard
  getDashboard: () => request('/api/dashboard'),
};
