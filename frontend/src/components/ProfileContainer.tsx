import React from 'react';
import { Profile } from './Profile';
import { profileService } from './../services/ProfileServices';
import { useAuth } from '../hooks/useAuth';
import { useForm } from '../hooks/useForm';

interface ProfileContainerProps {
  onLogout: () => void;
}

export const ProfileContainer: React.FC<ProfileContainerProps> = ({ onLogout }) => {
  const { user, errorMessage, setErrorMessage, fetchProfile } = useAuth();
  const { formData, onInputChange} = useForm({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    confirmPassword: '',
    avatar: ''
  });

  const onProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    // console.log(token)
    // console.log(user)
    if (!token || !user) {
      // console.log(user)
      return;}

    try {
      const form = new FormData();
      form.append('name', formData.name);
      form.append('email', formData.email);
      await profileService.updateProfile(token, form);
      await fetchProfile(token);
      setErrorMessage('Profile updated successfully!');
    } catch (error: any) {
      setErrorMessage(error.message);
    }
  };

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const token = localStorage.getItem('token');
    if (!e.target.files?.[0] || !token || !user) return;

    try {
      await profileService.updateAvatar(token, e.target.files[0], {
        name: formData.name,
        email: formData.email
      });
      await fetchProfile(token);
      setErrorMessage('Avatar updated successfully!');
    } catch (error: any) {
      console.log(error.message)
      setErrorMessage(error.message);
    }
  };
  console.log(user)
  if (!user) return null;

  return (
    <Profile
      user={user}
      formData={formData}
      onInputChange={onInputChange}
      onProfileUpdate={onProfileUpdate}
      onAvatarChange={onAvatarChange}
      onLogout={onLogout}
      errorMessage={errorMessage}
    />
  );
};