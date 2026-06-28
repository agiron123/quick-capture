import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';

import { authClient, isAuthConfigured } from '@/services/auth-client';
import { registerExpoPushDevice } from '@/services/register-push-device';
import { clearAllLocalReminders } from '@/services/reminder-scheduler';
import { setServerRemindersEnabled } from '@/services/sync-mode';
import { syncOnSignIn } from '@/services/todo-sync';

type AuthSession = {
  userId: string;
  email?: string;
};

type AuthContextValue = {
  session: AuthSession | null;
  isLoading: boolean;
  isConfigured: boolean;
  refreshSession: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(isAuthConfigured());

  const refreshSession = useCallback(async () => {
    if (!authClient) {
      setServerRemindersEnabled(false);
      setSession(null);
      setIsLoading(false);
      return;
    }

    const result = await authClient.getSession();
    const activeSession = result.data?.session;
    const user = result.data?.user;

    if (activeSession?.userId) {
      setSession({
        userId: activeSession.userId,
        email: user?.email ?? undefined,
      });
      setServerRemindersEnabled(true);
      await clearAllLocalReminders();
      try {
        await syncOnSignIn();
      } catch (error) {
        console.warn('Todo sync failed:', error);
      }
      try {
        await registerExpoPushDevice();
      } catch (error) {
        console.warn('Push device registration failed:', error);
      }
    } else {
      setSession(null);
      setServerRemindersEnabled(false);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!authClient) throw new Error('Auth is not configured');
      const result = await authClient.signIn.email({ email, password });
      if (result.error) {
        throw new Error(result.error.message ?? 'Sign in failed');
      }
      await refreshSession();
    },
    [refreshSession]
  );

  const signUp = useCallback(
    async (email: string, password: string, name?: string) => {
      if (!authClient) throw new Error('Auth is not configured');
      const result = await authClient.signUp.email({
        email,
        password,
        name: name ?? email.split('@')[0] ?? 'User',
      });
      if (result.error) {
        throw new Error(result.error.message ?? 'Sign up failed');
      }
      await refreshSession();
    },
    [refreshSession]
  );

  const signOut = useCallback(async () => {
    if (!authClient) return;
    await authClient.signOut();
    setSession(null);
    setServerRemindersEnabled(false);
  }, []);

  const value = useMemo(
    () => ({
      session,
      isLoading,
      isConfigured: isAuthConfigured(),
      refreshSession,
      signIn,
      signUp,
      signOut,
    }),
    [session, isLoading, refreshSession, signIn, signUp, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
