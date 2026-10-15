import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as portal from '../api/portal';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // undefined = still checking the session, null = logged out.
  const [customer, setCustomer] = useState(undefined);

  useEffect(() => {
    portal
      .fetchMe()
      .then(setCustomer)
      .catch(() => setCustomer(null));
  }, []);

  const login = useCallback(async (mobile, password) => {
    const c = await portal.login(mobile, password);
    setCustomer(c);
    return c;
  }, []);

  const signup = useCallback(async (payload) => {
    const c = await portal.signup(payload);
    setCustomer(c);
    return c;
  }, []);

  // First login of a customer our team created: they must replace the temporary password.
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    const c = await portal.changePassword(currentPassword, newPassword);
    setCustomer(c);
    return c;
  }, []);

  const logout = useCallback(async () => {
    try {
      await portal.logout();
    } finally {
      setCustomer(null);
    }
  }, []);

  const value = useMemo(
    () => ({ customer, checking: customer === undefined, setCustomer, login, signup, logout, changePassword }),
    [customer, login, signup, logout, changePassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// oxlint-disable-next-line react/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
