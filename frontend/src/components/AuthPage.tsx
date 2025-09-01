import React, { useEffect, useState } from 'react';
import { Profile } from './Profile';
import { AuthForm } from './AuthForm';

interface User {
  name: string;
  email: string;
  avatar: string;
}

const API_BASE = 'http://127.0.0.1:8000';

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

  // Check if token is already stored
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

  // Validate password confirmation on signup
  if (isSignUp && formData.password !== formData.confirmPassword) {
    setErrorMessage('Passwords do not match!');
    return;
  }

  // Set API URL and request body based on form type
  const url = isSignUp
    ? 'http://127.0.0.1:8000/signup'
    : 'http://127.0.0.1:8000/login';

  const body = isSignUp
    ? {
        username: formData.name,  // if backend expects username separately
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

    if (!response.ok) {
      setErrorMessage(data.detail || 'An unknown error occurred.');
      return;
    }

    if (isSignUp) {
      // On successful signup, switch to login form
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
      // On successful login, save user data and token if needed
      setUser({
        name: data.name || formData.name,  // adjust based on backend response
        email: data.email,
        avatar: data.avatar || '',          // if available
      });
      setErrorMessage('');
      // Optionally save token to localStorage/sessionStorage here
      // localStorage.setItem('token', data.access_token);
    }
  } catch (error) {
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
        setUser({ ...data, avatar: `${API_BASE}/static/avatars/${data.email}.jpg` });
        setFormData({ ...formData, ...data, avatar: `${API_BASE}/static/avatars/${data.email}.jpg` });
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

    try {
      const res = await fetch(`${API_BASE}/me/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setErrorMessage(data.detail || 'Profile update failed.');
        return;
      }

      const data = await res.json();
      setUser(data);
      setErrorMessage('Profile updated!');
    } catch {
      setErrorMessage('Error updating profile.');
    }
  };

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const token = localStorage.getItem('token');
    if (!e.target.files?.[0] || !token) return;

    const form = new FormData();
    form.append('file', e.target.files[0]);

    try {
      const res = await fetch(`${API_BASE}/me/avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (res.ok) {
        fetchProfile(token);
        setErrorMessage('Avatar updated!');
      } else {
        const data = await res.json();
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
