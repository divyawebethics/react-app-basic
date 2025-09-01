import React from 'react';
import { MainLayout } from './Layout'; 

interface AuthFormProps {
  title: string;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  formData: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    avatar: string;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showName?: boolean;
  showConfirmPassword?: boolean;
  errorMessage: string;
  onSwitchForm: () => void;
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

export const AuthForm: React.FC<AuthFormProps> = ({
  title,
  onSubmit,
  formData,
  onInputChange,
  showName = false,
  showConfirmPassword = false,
  errorMessage,
  onSwitchForm,
}) => {
  return (
    <MainLayout title={title}>
      <form onSubmit={onSubmit} className="space-y-4">
        {showName && (
          <FormInput
            id="name"
            name="name"
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={onInputChange}
          />
        )}
        <FormInput
          id="email"
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={onInputChange}
        />
        <FormInput
          id="password"
          name="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={onInputChange}
        />
        {showConfirmPassword && (
          <FormInput
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={onInputChange}
          />
        )}
        {errorMessage && <p className="text-red-400 text-center text-sm">{errorMessage}</p>}
        <button
          type="submit"
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg transition-colors"
        >
          {title}
        </button>
        <div className="text-center text-sm text-gray-400">
          {title === "Sign Up" ? "Already have an account?" : "Don't have an account?"}{' '}
         <span
            className="text-indigo-400 cursor-pointer hover:underline"
            onClick={(e) => {
              e.preventDefault();
              onSwitchForm();
            }}
          >
            {title === "Sign Up" ? "Log In" : "Sign Up"}
          </span>

        </div>
      </form>
    </MainLayout>
  );
};
