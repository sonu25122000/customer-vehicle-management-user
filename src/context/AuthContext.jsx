import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as portal from '../api/portal';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // undefined = still checking the session, null = logged out.
  const [customer, setCustomer] = useState(undefined);
  // True once they log out on purpose, so members-only pages send them home rather than to the login page.
  const [signedOut, setSignedOut] = useState(false);

  useEffect(() => {
    portal
      .fetchMe()
      .then(setCustomer)
      .catch(() => setCustomer(null));
  }, []);

  const login = useCallback(async (mobile, password) => {
    const c = await portal.login(mobile, password);
    setSignedOut(false);
    setCustomer(c);
    return c;
  }, []);

  // Login with the code emailed to the account (no password).
  const loginWithCode = useCallback(async (mobile, code) => {
    const c = await portal.loginWithCode(mobile, code);
    setSignedOut(false);
    setCustomer(c);
    return c;
  }, []);

  const signup = useCallback(async (payload) => {
    const c = await portal.signup(payload);
    setSignedOut(false);
    setCustomer(c);
    return c;
  }, []);

  // First login of a customer our team created: they must replace the temporary password.
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    const c = await portal.changePassword(currentPassword, newPassword);
    setCustomer(c);
    return c;
  }, []);

  // Forgot password: the emailed link sets a new password and logs them in.
  const resetPassword = useCallback(async (token, password) => {
    const c = await portal.resetPassword(token, password);
    setSignedOut(false);
    setCustomer(c);
    return c;
  }, []);

  const logout = useCallback(async () => {
    try {
      await portal.logout();
    } finally {
      setSignedOut(true);
      setCustomer(null);
    }
  }, []);

  const value = useMemo(
    () => ({ customer, checking: customer === undefined, signedOut, setCustomer, login, loginWithCode, signup, logout, changePassword, resetPassword }),
    [customer, signedOut, login, loginWithCode, signup, logout, changePassword, resetPassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// oxlint-disable-next-line react/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
