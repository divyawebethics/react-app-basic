import React from 'react';
import type { FC } from 'react';
import { MainLayout } from './Layout';

interface User {
  name: string;
  email: string;
  avatar: string;
}

interface ProfileProps {
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

const FormInput: React.FC<{
  id: string;
  name: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ id, name, type, placeholder, value, onChange }) => (
  <input
    id={id}
    name={name}
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className="w-full px-4 py-3 bg-gray-700 text-gray-200 placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
  />
);

export const Profile: FC<ProfileProps> = ({
  user,
  formData,
  onInputChange,
  onProfileUpdate,
  onAvatarChange,
  onLogout,
  errorMessage,
}) => {
  return (
    <MainLayout title="Profile">
      <div className="flex flex-col items-center mb-6">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt="Avatar"
            className="w-24 h-24 rounded-full object-cover mb-2"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-600 flex items-center justify-center mb-2">
            <span className="text-gray-300">No Avatar</span>
          </div>
        )}

        <h2 className="text-lg font-semibold text-gray-200">{user.name}</h2>
        <p className="text-gray-400 text-sm">{user.email}</p>

        <label className="cursor-pointer text-indigo-400 hover:underline mt-2">
          Change Avatar
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onAvatarChange}
          />
        </label>
      </div>

      {errorMessage && <p className="text-red-400 text-center mb-4">{errorMessage}</p>}

      <form onSubmit={onProfileUpdate} className="space-y-4">
        <FormInput
          id="name"
          name="name"
          type="text"
          placeholder="Full Name"
          value={formData.name}
          onChange={onInputChange}
        />
        <FormInput
          id="email"
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={onInputChange}
        />

        <button
          type="submit"
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg transition-colors"
        >
          Update Profile
        </button>

        <button
          type="button"
          onClick={onLogout}
          className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-lg transition-colors"
        >
          Logout
        </button>
      </form>
    </MainLayout>
  );
};
