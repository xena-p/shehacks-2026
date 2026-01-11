// User-related types based on backend/user/models.py

export interface UserProfile {
  school: 'TMU' | 'UofT' | 'Western' | 'York';
  degree: string;
  program: string;
  '#ofratings': number;
  rating: number;
}

export interface PossibleDateSlot {
  location: string;
  slots: string[];
}

export interface User {
  user_id: string;
  username: string;
  email: string;
  profile: UserProfile;
  possible_dates: PossibleDateSlot[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user_id: string;
  username: string;
  email: string;
  profile: UserProfile;
  possible_dates: PossibleDateSlot[];
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  possible_dates?: PossibleDateSlot[];
  profile?: Partial<UserProfile>;
  program?: string;
  degree?: string;
}

export interface SignupResponse {
  message: string;
}

export interface ApiError {
  error: string;
}

// Item-related types based on backend/item/models.py

export type ItemCondition = 'excellent' | 'gently used' | 'fair' | 'poor';
export type ItemStatus = 'available' | 'unavailable' | 'old';

export interface ItemOwner {
  username: string;
  profile: UserProfile;
}

export interface Item {
  _id: string;
  user_id: string;
  title: string;
  description: string;
  condition: ItemCondition;
  category: string;
  requester?: string;
  program?: string;
  school: string;
  images: string[];
  return_date: string; // ISO date string
  status: ItemStatus;
  owner?: ItemOwner;
  virtual_status?: 'active' | 'pending_review';
}

export interface ItemsResponse {
  items: Item[];
}

export interface CreateItemRequest {
  title: string;
  description: string;
  category: string;
  condition: ItemCondition;
  return_date: string;
  images?: File[];
}

export interface UserActivityResponse {
  active: Item[];
  needs_rating: Item[];
  history: Item[];
}
