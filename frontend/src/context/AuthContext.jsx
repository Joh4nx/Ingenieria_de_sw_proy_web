// src/context/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from 'react';
import { auth, db } from '../services/firebase';
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

// Accesos por defecto para un usuario "cliente"
const defaultAccesosCliente = {
  platos: false,
  reservas: false,
  mesas: false,
  pedidos: false,
  inventario: false,
  usuarios: false,
  roles: false,
  cajero: false,
  reportes: false
};

// Accesos completos para un usuario "admin"
const defaultAccesosAdmin = {
  platos: true,
  reservas: true,
  mesas: true,
  pedidos: true,
  inventario: true,
  usuarios: true,
  roles: true,
  cajero: true,
  reportes: true
};

export function AuthProvider({ children }) {
  // Estado inicializa desde localStorage si existe
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loadingAuthState, setLoadingAuthState] = useState(true);

  // Guarda el usuario en estado y en localStorage
  const persistUser = useCallback(u => {
    setUser(u);
    localStorage.setItem('user', JSON.stringify(u));
  }, []);

  // Listener de Firebase Auth para cambios de estado
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async fbUser => {
      if (fbUser) {
        // Leer el perfil desde Realtime Database: /usuarios/{uid}
        const snapshot = await get(ref(db, `usuarios/${fbUser.uid}`));
        let perfil;
        if (snapshot.exists()) {
          perfil = snapshot.val();
        } else {
          // Si no existe en la base, lo inicializamos como "cliente"
          perfil = {
            nombre: fbUser.displayName || '',
            role: 'cliente',
            accesos: defaultAccesosCliente
          };
          await set(ref(db, `usuarios/${fbUser.uid}`), perfil);
        }

        // Si es admin pero no tiene accesos definidos, asignar completos
        if (perfil.role === 'admin' && !perfil.accesos) {
          perfil.accesos = defaultAccesosAdmin;
          await set(ref(db, `usuarios/${fbUser.uid}/accesos`), defaultAccesosAdmin);
        }

        const u = {
          id: fbUser.uid,
          email: fbUser.email,
          nombre: perfil.nombre,
          role: perfil.role,
          accesos: perfil.accesos
        };
        persistUser(u);
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
      setLoadingAuthState(false);
    });

    return () => unsubscribe();
  }, [persistUser]);

  // Registro de nuevo usuario: crea en Auth + guarda perfil en RTDB
  const signup = useCallback(
    async (nombre, email, password) => {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;

      // Perfil inicial para cliente
      const perfil = {
        nombre: nombre.trim(),
        role: 'cliente',
        accesos: defaultAccesosCliente,
        email: email.trim()
      };

      // Guardar en Realtime Database en /usuarios/{uid}
      await set(ref(db, `usuarios/${uid}`), perfil);

      const u = {
        id: uid,
        email: email.trim(),
        nombre: perfil.nombre,
        role: perfil.role,
        accesos: perfil.accesos
      };
      persistUser(u);
      return u;
    },
    [persistUser]
  );

  // Inicio de sesión con email+password: lee perfil de RTDB
  const login = useCallback(
    async (email, password) => {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const fbUser = cred.user;

      const snapshot = await get(ref(db, `usuarios/${fbUser.uid}`));
      let perfil = snapshot.exists()
        ? snapshot.val()
        : { nombre: fbUser.displayName || '', role: 'cliente', accesos: defaultAccesosCliente };

      // Si faltan accesos para admin, asignar completos
      if (perfil.role === 'admin' && !perfil.accesos) {
        perfil.accesos = defaultAccesosAdmin;
        await set(ref(db, `usuarios/${fbUser.uid}/accesos`), defaultAccesosAdmin);
      }

      const u = {
        id: fbUser.uid,
        email: fbUser.email,
        nombre: perfil.nombre,
        role: perfil.role,
        accesos: perfil.accesos
      };
      persistUser(u);
      return u;
    },
    [persistUser]
  );

  // Inicio de sesión con Google: crea/actualiza perfil en RTDB
  const loginWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const fbUser = result.user;

    // Chequear si existe perfil; si no, crearlo como cliente
    const snapshot = await get(ref(db, `usuarios/${fbUser.uid}`));
    let perfil;
    if (snapshot.exists()) {
      perfil = snapshot.val();
    } else {
      perfil = {
        nombre: fbUser.displayName || '',
        role: 'cliente',
        accesos: defaultAccesosCliente,
        email: fbUser.email
      };
      await set(ref(db, `usuarios/${fbUser.uid}`), perfil);
    }

    // Si admin y no tiene accesos, asignar completos
    if (perfil.role === 'admin' && !perfil.accesos) {
      perfil.accesos = defaultAccesosAdmin;
      await set(ref(db, `usuarios/${fbUser.uid}/accesos`), defaultAccesosAdmin);
    }

    const u = {
      id: fbUser.uid,
      email: fbUser.email,
      nombre: perfil.nombre,
      role: perfil.role,
      accesos: perfil.accesos
    };
    persistUser(u);
    return u;
  }, [persistUser]);

  // Solicitar restablecimiento de contraseña
  const resetPassword = useCallback(email => {
    const actionCodeSettings = {
      url: window.location.origin + '/login',
      handleCodeInApp: false
    };
    return sendPasswordResetEmail(auth, email, actionCodeSettings);
  }, []);

  // Cerrar sesión
  const logout = useCallback(() => {
    signOut(auth);
    setUser(null);
    localStorage.removeItem('user');
  }, []);

  // Permite actualizar manualmente el objeto user en contexto/localStorage
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
        updateUser
      }}
    >
      {!loadingAuthState && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
