// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  // CAMBIO CLAVE 1: De `currentUser` a `user`
  const [user, setUser] = useState(null); // Estado para el usuario actual

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser)); // CAMBIO CLAVE 2: Usar `setUser`
    }
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Sending login data:', { email, password });
      const res = await axios.post('http://localhost:3001/login', {
        email,
        password,
      });
      console.log('Login successful response data:', res.data);

      if (res.data.usuario) {
        const userData = res.data.usuario; // Nombrarlo temporalmente para evitar confusión
        setUser(userData); // CAMBIO CLAVE 3: Usar `setUser`
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
      } else {
        throw new Error('Invalid credentials or unexpected response from server.');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        throw new Error(err.response.data.error);
      } else if (err.message) {
        throw new Error(err.message);
      } else {
        throw new Error('Failed to log in. Please check your connection.');
      }
    }
  };

  const loginWithGoogle = async () => {
    try {
      console.log('Google login not yet implemented on the backend.');
      throw new Error('Google login not implemented.');
    } catch (err) {
      throw new Error(err.message);
    }
  };

  const signup = async (nombre, email, password) => {
    try {
      const res = await axios.post('http://localhost:3001/usuarios', {
        nombre, email, password, role: 'cliente'
      });
      if (res.data.error) throw new Error(res.data.error);
      const newUserData = {
        id: res.data.id,
        nombre,
        email,
        role: 'cliente'
      };
      setUser(newUserData); // CAMBIO CLAVE 4: Usar `setUser`
      localStorage.setItem('user', JSON.stringify(newUserData));
      return newUserData;
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        throw new Error(err.response.data.error);
      } else {
        throw new Error('Failed to sign up.');
      }
    }
  };

  const logout = () => {
    setUser(null); // CAMBIO CLAVE 5: Usar `setUser`
    localStorage.removeItem('user');
  };

  const value = {
    user, // CAMBIO CLAVE 6: Exportando `user`
    signup,
    login,
    loginWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}