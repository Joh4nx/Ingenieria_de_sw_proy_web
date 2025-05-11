// src/context/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from 'react';
import { auth, db } from '../services/firebase';  // Ajustado al path correcto
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';

const AuthContext = createContext();

// Accesos por defecto para administradores
const defaultAccesosAdmin = {
  platos: true,
  reservas: true,
  mesas: true,
  pedidos: true,
  inventario: true,
  usuarios: true,
  roles: true,
  cajero: true,
  reportes: true,
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loadingAuthState, setLoadingAuthState] = useState(true);

  const persistUser = useCallback(u => {
    setUser(u);
    localStorage.setItem('user', JSON.stringify(u));
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async fbUser => {
      if (fbUser) {
        const snap = await get(ref(db, `usuarios/${fbUser.uid}`));
        const perfil = snap.exists()
          ? snap.val()
          : { nombre: fbUser.displayName || '', role: 'cliente' };
        const u = { id: fbUser.uid, email: fbUser.email, ...perfil };
        if (u.role === 'admin' && !u.accesos) {
          u.accesos = defaultAccesosAdmin;
        }
        persistUser(u);
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
      setLoadingAuthState(false);
    });
    return unsubscribe;
  }, [persistUser]);

  const signup = useCallback(
    async (nombre, email, password) => {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;
      const perfil = { nombre, role: 'cliente' };
      await set(ref(db, `usuarios/${uid}`), perfil);
      const u = { id: uid, email, ...perfil };
      persistUser(u);
      return u;
    },
    [persistUser]
  );

  const login = useCallback(
    async (email, password) => {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const fbUser = cred.user;
      const snap = await get(ref(db, `usuarios/${fbUser.uid}`));
      const perfil = snap.exists()
        ? snap.val()
        : { nombre: fbUser.displayName || '', role: 'cliente' };
      const u = { id: fbUser.uid, email, ...perfil };
      if (u.role === 'admin' && !u.accesos) {
        u.accesos = defaultAccesosAdmin;
      }
      persistUser(u);
      return u;
    },
    [persistUser]
  );

  const loginWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const fbUser = result.user;
    const perfil = { nombre: fbUser.displayName || '', role: 'cliente' };
    await set(ref(db, `usuarios/${fbUser.uid}`), perfil);
    const u = { id: fbUser.uid, email: fbUser.email, ...perfil };
    persistUser(u);
    return u;
  }, [persistUser]);

  const resetPassword = useCallback(email => {
    const actionCodeSettings = {
      url: window.location.origin + '/login',
      handleCodeInApp: false,
    };
    return sendPasswordResetEmail(auth, email, actionCodeSettings);
  }, []);

  const logout = useCallback(() => {
    signOut(auth);
    setUser(null);
    localStorage.removeItem('user');
  }, []);

  const updateUser = useCallback(
    updated => {
      persistUser(updated);
    },
    [persistUser]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        loadingAuthState,
        signup,
        login,
        loginWithGoogle,
        resetPassword,
        logout,
        updateUser,
      }}
    >
      {!loadingAuthState && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
