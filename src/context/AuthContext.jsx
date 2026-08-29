import { createContext, useContext, useState, useEffect } from 'react';
import api from '../Api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/login', { email, password });
    const { user, token } = response.data;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    setUser(user);
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (err) {
      console.error(err);
    }

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}