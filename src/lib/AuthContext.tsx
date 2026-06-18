import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from './firebase.ts';
import { GoogleAuthProvider } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  dbUser: any | null; // Student or Faculty profile from db
  role: 'STUDENT' | 'FACULTY' | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  completeRegistration: (role: 'STUDENT' | 'FACULTY', data: any) => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  dbUser: null,
  role: null,
  loading: true,
  loginWithGoogle: async () => {},
  completeRegistration: async () => {},
  logOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<any | null>(null);
  const [role, setRole] = useState<'STUDENT' | 'FACULTY' | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (firebaseUser: User) => {
    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch('/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDbUser(data.profile);
        setRole(data.role);
      } else {
        setDbUser(null);
        setRole(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchProfile(firebaseUser);
      } else {
        setDbUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const completeRegistration = async (role: 'STUDENT' | 'FACULTY', data: any) => {
    if (!user) return;
    const token = await user.getIdToken();
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ role, ...data })
    });
    if (!res.ok) {
        throw new Error('Failed to create profile in database');
    }
    await fetchProfile(user);
  };

  const logOut = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, dbUser, role, loading, loginWithGoogle, completeRegistration, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
