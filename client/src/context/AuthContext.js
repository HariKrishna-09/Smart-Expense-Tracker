import React, {
  createContext,
  useState,
  useEffect
} from 'react';

import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  // Load user on refresh
  useEffect(() => {

    const userInfo =
      localStorage.getItem('userInfo');

    if (userInfo) {

      setUser(JSON.parse(userInfo));
    }

    setLoading(false);

  }, []);

  // LOGIN
  const login = async (
    email,
    password
  ) => {

    try {

      const res = await API.post(
        '/auth/login',
        {
          email,
          password
        }
      );

      // Save full user
      localStorage.setItem(
        'userInfo',
        JSON.stringify(res.data)
      );

      // Save token separately
      localStorage.setItem(
        'token',
        res.data.token
      );

      setUser(res.data);

      return res.data;

    } catch (error) {

      console.log(
        'LOGIN ERROR:',
        error.response?.data ||
        error.message
      );

      throw error;
    }
  };

  // REGISTER
  const register = async (
    name,
    email,
    password
  ) => {

    try {

      const res = await API.post(
        '/auth/register',
        {
          name,
          email,
          password
        }
      );

      // Save full user
      localStorage.setItem(
        'userInfo',
        JSON.stringify(res.data)
      );

      // Save token separately
      localStorage.setItem(
        'token',
        res.data.token
      );

      setUser(res.data);

      return res.data;

    } catch (error) {

      console.log(
        'REGISTER ERROR:',
        error.response?.data ||
        error.message
      );

      throw error;
    }
  };

  // LOGOUT
  const logout = () => {

    // Remove everything
    localStorage.removeItem('userInfo');

    localStorage.removeItem('token');

    setUser(null);

    // Redirect
    window.location.href = '/login';
  };

  return (

    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loading
      }}
    >

      {children}

    </AuthContext.Provider>
  );
};