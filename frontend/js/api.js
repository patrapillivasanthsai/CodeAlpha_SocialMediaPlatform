// Connectly Frontend API Client
const API_BASE_URL = window.location.origin + '/api';

const TokenStorage = {
  get: () => localStorage.getItem('connectly_token'),
  set: (token) => localStorage.setItem('connectly_token', token),
  clear: () => {
    localStorage.removeItem('connectly_token');
    localStorage.removeItem('connectly_user');
  }
};

const UserStorage = {
  get: () => {
    const data = localStorage.getItem('connectly_user');
    return data ? JSON.parse(data) : null;
  },
  set: (user) => localStorage.setItem('connectly_user', JSON.stringify(user))
};

async function fetchAPI(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  const token = TokenStorage.get();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401 && token) {
        // Token expired or invalid
        TokenStorage.clear();
      }
      throw new Error(data.message || 'An API error occurred');
    }

    return data;
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err.message);
    throw err;
  }
}

const API = {
  // Auth
  register: (userData) => fetchAPI('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  login: (credentials) => fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getMe: () => fetchAPI('/auth/me'),

  // Users
  getUserProfile: (userId) => fetchAPI(`/users/${userId}`),
  updateUserProfile: (userId, data) => fetchAPI(`/users/${userId}`, { method: 'PUT', body: JSON.stringify(data) }),
  searchUsers: (query) => fetchAPI(`/users/search?q=${encodeURIComponent(query)}`),
  followUser: (userId) => fetchAPI(`/users/${userId}/follow`, { method: 'POST' }),
  unfollowUser: (userId) => fetchAPI(`/users/${userId}/follow`, { method: 'DELETE' }),
  getUserPosts: (userId) => fetchAPI(`/users/${userId}/posts`),

  // Posts
  getPosts: (feed = 'all') => fetchAPI(`/posts?feed=${feed}`),
  createPost: (postData) => fetchAPI('/posts', { method: 'POST', body: JSON.stringify(postData) }),
  getPost: (postId) => fetchAPI(`/posts/${postId}`),
  updatePost: (postId, data) => fetchAPI(`/posts/${postId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePost: (postId) => fetchAPI(`/posts/${postId}`, { method: 'DELETE' }),
  likePost: (postId) => fetchAPI(`/posts/${postId}/like`, { method: 'POST' }),
  unlikePost: (postId) => fetchAPI(`/posts/${postId}/like`, { method: 'DELETE' }),

  // Comments
  getComments: (postId) => fetchAPI(`/posts/${postId}/comments`),
  addComment: (postId, content) => fetchAPI(`/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify({ content }) }),
  deleteComment: (commentId) => fetchAPI(`/comments/${commentId}`, { method: 'DELETE' }),

  // Notifications
  getNotifications: () => fetchAPI('/notifications'),
  markNotificationRead: (id) => fetchAPI(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => fetchAPI('/notifications/read-all', { method: 'PUT' })
};
