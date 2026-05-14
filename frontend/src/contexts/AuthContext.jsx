import React, { createContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

  // Verificar si existe token al cargar
  useEffect(() => {
    const storedToken = Cookies.get('auth_token');
    if (storedToken) {
      setToken(storedToken);
      validateToken(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const validateToken = async (authToken) => {
    try {
      const response = await axios.get(`${API_URL}/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (response.data.status === 'success') {
        setUser(response.data.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      Cookies.remove('auth_token');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback(async (email, password) => {
    try {
      setIsLoading(true);
      console.log('Login attempt with:', { email, api: API_URL });
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });

      console.log('Login response:', response.data);
      if (response.data.status === 'success') {
        const authToken = response.data.token;
        const userData = response.data.user;

        setToken(authToken);
        setUser(userData);
        setIsAuthenticated(true);

        // Guardar token en cookie con expiración de 7 días
        Cookies.set('auth_token', authToken, {
          expires: 7,
          secure: false,
          sameSite: 'Lax',
        });

        return { success: true };
      } else {
        return {
          success: false,
          error: response.data.message || 'Error al iniciar sesión',
        };
      }
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
      });
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Error al iniciar sesión',
      };
    } finally {
      setIsLoading(false);
    }
  }, [API_URL]);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    Cookies.remove('auth_token');
  }, []);

  const updateUser = useCallback((partial) => {
    setUser((prev) => ({ ...prev, ...partial }));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
