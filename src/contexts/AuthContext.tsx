import { onAuthStateChanged, User } from 'firebase/auth';
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import { useAppDispatch } from '@/store';
import { setUser } from '@/store/authSlice';
import { auth } from '@/services/firebase';

// ─── State & Actions ────────────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  loading: boolean;
}

type AuthAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_LOADING'; payload: boolean };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, { user: null, loading: true });
  const reduxDispatch = useAppDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      firebaseUser => {
        dispatch({ type: 'SET_USER', payload: firebaseUser });
        reduxDispatch(
          setUser(
            firebaseUser
              ? { uid: firebaseUser.uid, email: firebaseUser.email }
              : null,
          ),
        );
      },
      () => {
        dispatch({ type: 'SET_LOADING', payload: false });
      },
    );

    return unsubscribe;
  }, [reduxDispatch]);

  const value = useMemo<AuthContextValue>(
    () => ({ user: state.user, loading: state.loading }),
    [state.user, state.loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
