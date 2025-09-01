import React, { useEffect, useState } from 'react';
import { Profile } from './components/Profile';
import { AuthForm } from './components/AuthForm';

interface User {
  name: string;
  email: string;
  avatar: string;
}

const API_BASE = '/api';

export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    avatar: '',
  });

  // On mount → check for token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) fetchProfile(token);
  }, []);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');

    if (isSignUp && formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match!');
      return;
    }

    const url = isSignUp
      ? `${API_BASE}/signup`
      : `${API_BASE}/login`;

    const body = isSignUp
      ? {
          username: formData.name,
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }
      : {
          email: formData.email,
          password: formData.password,
        };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      console.log('Response from server:', data);

      if (!response.ok) {
        setErrorMessage(data.detail || 'An unknown error occurred.');
        return;
      }

      if (isSignUp) {
        setErrorMessage('Signup successful! Please log in.');
        setIsSignUp(false);
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          avatar: '',
        });
      } else {
        localStorage.setItem('token', data.access_token);
        await fetchProfile(data.access_token);
        setErrorMessage('');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setErrorMessage('Could not connect to the server.');
    }
  };

  const fetchProfile = async (token: string) => {
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) {
        setUser({
          name: data.name,
          email: data.email,
          avatar: data.avatar ? `${API_BASE}/avatars/${data.avatar}` : '',
        });
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  const onLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setErrorMessage('');
    setIsSignUp(false);
  };

  const onProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    const form = new FormData();
    form.append('name', formData.name);
    form.append('email', formData.email);

    try {
      const res = await fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.detail || 'Profile update failed.');
        return;
      }

      setUser({
        name: data.name,
        email: data.email,
        avatar: data.avatar ? `${API_BASE}/avatars/${data.avatar}` : '',
      });
      setErrorMessage('Profile updated!');
    } catch {
      setErrorMessage('Error updating profile.');
    }
  };

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const token = localStorage.getItem('token');
    if (!e.target.files?.[0] || !token) return;

    const form = new FormData();
    form.append('name', formData.name);
    form.append('email', formData.email);
    form.append('avatar', e.target.files[0]);

    try {
      const res = await fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      const data = await res.json();
      if (res.ok) {
        setUser({
          name: data.name,
          email: data.email,
          avatar: data.avatar ? `${API_BASE}/avatars/${data.avatar}` : '',
        });
        setErrorMessage('Avatar updated!');
      } else {
        setErrorMessage(data.detail || 'Avatar update failed.');
      }
    } catch {
      setErrorMessage('Avatar upload failed.');
    }
  };

  const onSwitchForm = () => {
    setIsSignUp((prev) => !prev);
    setErrorMessage('');
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      avatar: '',
    });
  };

  return (
    <div>
      {user ? (
        <Profile
          user={user}
          formData={formData}
          onInputChange={onInputChange}
          onProfileUpdate={onProfileUpdate}
          onAvatarChange={onAvatarChange}
          onLogout={onLogout}
          errorMessage={errorMessage}
        />
      ) : (
        <AuthForm
          title={isSignUp ? 'Sign Up' : 'Log In'}
          onSubmit={onSubmit}
          formData={formData}
          onInputChange={onInputChange}
          showName={isSignUp}
          showConfirmPassword={isSignUp}
          errorMessage={errorMessage}
          onSwitchForm={onSwitchForm}
        />
      )}
    </div>
  );
};

export default App;

