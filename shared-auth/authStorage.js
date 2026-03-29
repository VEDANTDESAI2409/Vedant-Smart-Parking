const createStorageKeys = (prefix = 'auth') => ({
  token: `${prefix}:token`,
  user: `${prefix}:user`,
});

export const createAuthStorage = (prefix = 'auth') => {
  const keys = createStorageKeys(prefix);

  return {
    getToken() {
      return localStorage.getItem(keys.token);
    },

    setToken(token) {
      localStorage.setItem(keys.token, token);
    },

    removeToken() {
      localStorage.removeItem(keys.token);
    },

    getUser() {
      const raw = localStorage.getItem(keys.user);
      return raw ? JSON.parse(raw) : null;
    },

    setUser(user) {
      localStorage.setItem(keys.user, JSON.stringify(user));
    },

    removeUser() {
      localStorage.removeItem(keys.user);
    },

    clear() {
      localStorage.removeItem(keys.token);
      localStorage.removeItem(keys.user);
    },

    keys,
  };
};

export const authStorage = createAuthStorage();
