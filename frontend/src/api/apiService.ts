import api from './axiosInstance';

// --- Types ---
export interface SignupData {
  username: string;
  email: string;
  password?: string;
  possible_dates: string[];
  program: string;
  degree: string;
  profile: {
    school?: string;
    [key: string]: any;
  };
}

export interface ItemData {
  title: string;
  description: string;
  condition: "excellent" | "gently used" | "fair" | "poor";
  category: string;
  return_date: string; 
  images?: string[];
}

// --- The Service ---
export const apiService = {
  // Auth
  signup: async (data: SignupData) => {
    const response = await api.post('/signup', data);
    return response.data;
  },

  login: async (credentials: { email: string; password: any }) => {
    const response = await api.post('/login', credentials);
    return response.data;
  },

  // Items
  createItem: async (userId: string, itemData: ItemData) => {
    const response = await api.post(`/users/${userId}/items`, itemData);
    return response.data;
  },

  getUserItems: async (userId: string) => {
    const response = await api.get(`/items/user/${userId}`);
    return response.data;
  },

  searchItems: async (userId: string, query: string) => {
    const response = await api.get(`/items/search`, {
      params: { user_input: query, user_id: userId }
    });
    return response.data;
  },

  // Borrowing / Activity
  requestItem: async (itemId: string, requesterId: string) => {
    const response = await api.post(`/items/${itemId}/request`, { requester_id: requesterId });
    return response.data;
  },

  getUserActivity: async (requesterId: string) => {
    // This returns the {active, needs_rating, history} object from your Python logic
    const response = await api.get(`/users/${requesterId}/activity`);
    return response.data;
  },

  getLoanedItems: async (userId: string) => {
    const response = await api.get(`/users/${userId}/loaned-items`);
    return response.data;
  },

  completeAndRate: async (itemId: string, ratingValue: number) => {
    const response = await api.post(`/items/${itemId}/complete`, { rating_value: ratingValue });
    return response.data;
  },

  // Matches page endpoints
  getActiveRequests: async (requesterId: string) => {
    const response = await api.get(`/my_requests/${requesterId}`);
    return response.data;
  },

  getMyLoanedItems: async (userId: string) => {
    const response = await api.get(`/items/loaned/${userId}`);
    return response.data;
  },
};