import type { UserProfileResponse, AuthTokenResponse } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://127.0.0.1:8000/api';

const TOKEN_KEY = 'aegis_access_token';
const USER_KEY = 'aegis_user_profile';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): UserProfileResponse | null {
  const data = localStorage.getItem(USER_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function saveAuthSession(session: AuthTokenResponse) {
  localStorage.setItem(TOKEN_KEY, session.accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(session.user));
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// 1-Click Demo Login
export async function executeDemoLogin(): Promise<AuthTokenResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/demo-login`, { method: 'POST' });
    if (res.ok) {
      const data: AuthTokenResponse = await res.json();
      saveAuthSession(data);
      return data;
    }
  } catch (err) {
    console.info('Backend auth offline, using client mock demo user.');
  }

  // Client fallback demo session
  const fallback: AuthTokenResponse = {
    accessToken: 'demo_token_secops_2026',
    tokenType: 'bearer',
    user: {
      id: 'usr_demo_eval',
      email: 'alex.vance@apex-infra.cloud',
      fullName: 'Alex Vance',
      companyName: 'Apex Infrastructure',
      role: 'Lead SecOps Engineer',
      createdAt: '2026-09-22'
    }
  };
  saveAuthSession(fallback);
  return fallback;
}

// User Registration
export async function registerUser(formData: {
  email: string;
  password: string;
  fullName: string;
  companyName: string;
  role?: string;
}): Promise<AuthTokenResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
    throw new Error(err.detail || 'Registration failed');
  }

  const data: AuthTokenResponse = await res.json();
  saveAuthSession(data);
  return data;
}

// User Login
export async function loginUser(credentials: {
  email: string;
  password: string;
}): Promise<AuthTokenResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Invalid credentials' }));
    throw new Error(err.detail || 'Invalid email or password');
  }

  const data: AuthTokenResponse = await res.json();
  saveAuthSession(data);
  return data;
}
