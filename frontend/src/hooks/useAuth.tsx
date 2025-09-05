import { useEffect, useState } from 'react';

import type { User } from './../models/ProfileModels'

const API_BASE = ' http://127.0.0.1:8000';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const fetchProfile = async (token: string) => {
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if(!res.ok) {
        localStorage.removeItem('token');
        setUser(null);
        return;
      }

      const data = await res.json();

      const avatarUrl = data.avatar ? `${API_BASE}/avatars/${data.avatar}` : '';

      setUser({ ...data, avatar: avatarUrl });
      } catch {
      setUser(null);
      localStorage.removeItem('token');
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.detail || 'Login failed');
        return false;
      }

      localStorage.setItem('token', data.access_token);

      await fetchProfile(data.access_token);

      return data

    } catch (error) {
      setErrorMessage('Could not connect to the server.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, confirmPassword: string) => {
    setLoading(true);
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match!');
      setLoading(false);
      return false;
    }

    try {
      const response = await fetch(`${API_BASE}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: name, name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.detail || 'Signup failed');
        return false;
      }

      return true;
    } catch (error) {
      setErrorMessage('Could not connect to the server.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setErrorMessage('');
  };

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      await fetchProfile(token);
    }
  };


  useEffect(()=>{
        const token = localStorage.getItem('token');  
        if (token){
            fetchProfile(token);

        }
  },[])


  return {
    user,
    errorMessage,
    loading,
    setErrorMessage,
    login,
    signup,
    logout,
    checkAuth,
    fetchProfile
  };
};