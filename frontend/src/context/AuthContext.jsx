import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import i18n, { LANG_KEY } from '../i18n/index.js';
import { authApi, userApi } from '../services/endpoints.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true until we know whether a session exists
  const [loggedOut, setLoggedOut] = useState(false); // true after the person chose to log out (so we show the home page, not login)

  // When the app opens, ask the server "who am I?" (the browser sends the cookie automatically).
  useEffect(() => {
    authApi
      .me()
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // The saved language of a logged-in user wins over the browser's local choice.
  useEffect(() => {
    if (user?.language && user.language !== i18n.language) i18n.changeLanguage(user.language);
  }, [user?.language]);

  // The axios interceptor fires this event when the session has expired.
  useEffect(() => {
    const onExpired = () => {
      setUser((current) => {
        if (current) toast.error(i18n.t('auth.sessionExpired'));
        return null;
      });
    };
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, []);

  const register = useCallback(async (values) => {
    const data = await authApi.register({ ...values, language: i18n.language });
    setLoggedOut(false);
    setUser(data.user);
    return data.user;
  }, []);

  const login = useCallback(async (values) => {
    const data = await authApi.login(values);
    setLoggedOut(false);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setLoggedOut(true);
      setUser(null);
    }
  }, []);

  // Used by the language switcher (header + landing page + settings).
  const changeLanguage = useCallback(
    async (lng) => {
      await i18n.changeLanguage(lng);
      try { localStorage.setItem(LANG_KEY, lng); } catch { /* private mode: ignore */ }
      if (user) {
        try {
          const data = await userApi.update({ language: lng });
          setUser(data.user);
        } catch (err) {
          console.warn('Could not save language preference', err);
        }
      }
    },
    [user]
  );

  const value = useMemo(
    () => ({ user, setUser, loading, loggedOut, register, login, logout, changeLanguage }),
    [user, loading, loggedOut, register, login, logout, changeLanguage]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
