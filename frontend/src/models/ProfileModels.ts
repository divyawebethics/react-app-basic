import React from 'react';

export interface User {
  name: string;
  email: string;
  avatar: string;
}

export interface ProfileProps {
  user: User;
  formData: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    avatar: string;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onProfileUpdate: (e: React.FormEvent<HTMLFormElement>) => void;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLogout: () => void;
  errorMessage: string;
}