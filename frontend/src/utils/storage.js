const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';

const getStorage = () => window.localStorage;

export const getStoredToken = () => getStorage().getItem(TOKEN_KEY);

export const setStoredToken = (token) => getStorage().setItem(TOKEN_KEY, token);

export const getStoredRefreshToken = () => getStorage().getItem(REFRESH_TOKEN_KEY);

export const setStoredRefreshToken = (token) => getStorage().setItem(REFRESH_TOKEN_KEY, token);

export const clearAuthStorage = () => {
  const storage = getStorage();
  storage.removeItem(TOKEN_KEY);
  storage.removeItem(REFRESH_TOKEN_KEY);
};
