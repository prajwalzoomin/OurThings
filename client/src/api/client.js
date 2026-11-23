// OurThings API Client

let activeUserId = null; // Default to Guest mode (no account by default)
let activeCommunityId = 1; // Default fallback to primary community (Cauvery Boys Hostel)
let userLat = null;
let userLng = null;

export function setApiContext(userId, communityId) {
  activeUserId = userId !== undefined ? userId : null;
  activeCommunityId = communityId !== undefined && communityId !== null ? communityId : 1;
}

export function setApiLocation(lat, lng) {
  userLat = lat !== undefined ? lat : null;
  userLng = lng !== undefined ? lng : null;
}

export function getApiContext() {
  return { activeUserId, activeCommunityId, userLat, userLng };
}

async function request(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(activeUserId ? { 'X-User-Id': String(activeUserId) } : {}),
    ...(activeCommunityId ? { 'X-Community-Id': String(activeCommunityId) } : {}),
    ...(userLat != null ? { 'X-User-Lat': String(userLat) } : {}),
    ...(userLng != null ? { 'X-User-Lng': String(userLng) } : {}),
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
  login: (payload) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  updateProfile: (payload) => request('/api/auth/profile', { method: 'PUT', body: JSON.stringify(payload) }),
  registerUser: (payload) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  switchCommunity: (communityId) => request('/api/auth/switch-community', { method: 'POST', body: JSON.stringify({ communityId }) }),

  // Address & Semantic Search Services (Under the hood)
  getAiStatus: () => request('/api/ai/status'),
  setAiKey: (key) => request('/api/ai/key', { method: 'POST', body: JSON.stringify({ key }) }),
  parseAddress: (rawAddress) => request('/api/ai/parse-address', { method: 'POST', body: JSON.stringify({ rawAddress }) }),
  smartSearch: (query) => request('/api/ai/smart-search', { method: 'POST', body: JSON.stringify({ query }) }),

  // Precise Real-Time Geocoding Services
  reverseGeocode: (lat, lng) => request(`/api/location/reverse-geocode?lat=${lat}&lng=${lng}`),
  searchLocation: (query) => request(`/api/location/search?query=${encodeURIComponent(query)}`),

  // Communities
  getCommunities: () => request('/api/communities'),
  getCommunity: (id) => request(`/api/communities/${id}`),
  createCommunity: (payload) => request('/api/communities', { method: 'POST', body: JSON.stringify(payload) }),
  resolveCommunity: (query, latitude, longitude) => request('/api/communities/resolve', { method: 'POST', body: JSON.stringify({ query, latitude, longitude }) }),

  // Items
  getItems: (params = {}) => {
    const query = new URLSearchParams();
    if (params.category) query.append('category', params.category);
    if (params.keyword) query.append('keyword', params.keyword);
    if (params.condition) query.append('condition', params.condition);
    if (params.dateFrom) query.append('dateFrom', params.dateFrom);
    if (params.dateTo) query.append('dateTo', params.dateTo);
    if (params.userLat != null) query.append('userLat', params.userLat);
    if (params.userLng != null) query.append('userLng', params.userLng);
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

  // Reviews & Reputation
  getItemReviews: (itemId) => request(`/api/reviews/item/${itemId}`),
  getUserReviews: (userId) => request(`/api/reviews/user/${userId}`),
  submitReview: (payload) => request('/api/reviews', { method: 'POST', body: JSON.stringify(payload) }),

  // Peer-to-Peer In-App Messaging
  getChatThread: (itemId, otherUserId) => request(`/api/chat/thread?itemId=${itemId}&otherUserId=${otherUserId}`),
  getRequestChatThread: (requestId) => request(`/api/chat/request/${requestId}`),
  getConversations: () => request('/api/chat/conversations'),
  sendChatMessage: (payload) => request('/api/chat/send', { method: 'POST', body: JSON.stringify(payload) }),

  // Live Notifications
  getNotifications: () => request('/api/notifications'),
  getUnreadNotificationCount: () => request('/api/notifications/unread-count'),
  markNotificationRead: (id) => request(`/api/notifications/${id}/read`, { method: 'POST' }),
  markAllNotificationsRead: () => request('/api/notifications/read-all', { method: 'POST' }),

  // Unmet Demand
  getAggregatedDemands: () => request('/api/demands/aggregated'),
  getOpenDemands: () => request('/api/demands/open'),
  getMyDemands: () => request('/api/demands/my'),
  submitDemand: (payload) => request('/api/demands', { method: 'POST', body: JSON.stringify(payload) }),
  fulfillDemand: (id) => request(`/api/demands/${id}/fulfill`, { method: 'POST' }),

  // Dashboard
  getDashboard: () => request('/api/dashboard'),
};

