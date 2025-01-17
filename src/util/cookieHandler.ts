import Cookies from 'js-cookie';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from './consts';
// Save tokens to cookies
export const setTokens = (accessToken: string, refreshToken: string) => {
  Cookies.set(ACCESS_TOKEN_KEY, accessToken, { secure: true, sameSite: 'strict' });
  Cookies.set(REFRESH_TOKEN_KEY, refreshToken, { secure: true, sameSite: 'strict' });
};

// Get access token
export const getAccessToken = () => {
  return Cookies.get(ACCESS_TOKEN_KEY);
};

// Get refresh token
export const getRefreshToken = () => {
  return Cookies.get(REFRESH_TOKEN_KEY);
};

// Clear tokens from cookies (on logout)
export const clearTokens = () => {
  Cookies.remove(ACCESS_TOKEN_KEY);
  Cookies.remove(REFRESH_TOKEN_KEY);
};
