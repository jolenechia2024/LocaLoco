import axios from "axios";

export const API_BASE = "http://localhost:3000/api";

// Note: signup and login are now handled by better-auth
// Use the auth-client instead:
// import { signUp, signIn } from '../lib/auth-client';

export async function signup(payload: {
  email: string;
  password: string;
  name?: string;
  referralCode?: string;
}) {
  console.warn('signup() in ref.ts is deprecated. Use signUp from auth-client instead.');
  const res = await axios.post(`${API_BASE}/auth/sign-up/email`, payload, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });
  return res.data;
}

export async function login(payload: {
  email: string;
  password: string;
}) {
  console.warn('login() in ref.ts is deprecated. Use signIn from auth-client instead.');
  const res = await axios.post(`${API_BASE}/auth/sign-in/email`, payload, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });
  return res.data;
}

export async function getReferralInfo(userId: number | string) {
  const res = await axios.get(`${API_BASE}/users/profile/${userId}`, {
    withCredentials: true,
  });
  // Return user data which includes referralCode
  return {
    referralCode: res.data.referralCode,
    userId: res.data.id,
    name: res.data.name,
    email: res.data.email,
  };
}

// export async function getVouchers(params: { userId: number; status?: 'issued' | 'used' | 'expired' | 'revoked'; page?: number; limit?: number }) {
//   const { userId, status, page, limit } = params;
//   const res = await axios.get(`${API_BASE}/get-vouchers.php`, {
//     params: { user_id: userId, status, page, limit },
//   });
//   return res.data;
// }

export async function getVouchers({
  userId,
  page = 1,
  limit = 100,
  status,
}: { userId: number | string; page?: number; limit?: number; status?: 'issued'|'used'|'expired'|'revoked'; }) {
  const res = await axios.get(`${API_BASE}/users/${userId}/vouchers`, {
    params: { page, limit, status },
    withCredentials: true,
  });
  return res.data;
}

