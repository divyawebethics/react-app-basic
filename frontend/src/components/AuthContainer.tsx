import React from 'react';
import { useNavigate } from 'react-router-dom'; 

import { AuthForm } from './AuthForm';
import { useAuth } from '../hooks/useAuth';
import { useForm } from '../hooks/useForm';

interface AuthContainerProps {
  isLoginMode: boolean;
}
export const AuthContainer: React.FC<AuthContainerProps> = ({ 
  isLoginMode
}) => {
  const navigate = useNavigate(); 
  const { login, signup, errorMessage, setErrorMessage } = useAuth();
  const { formData, onInputChange, resetForm } = useForm({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    avatar: ''
  });
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isLoginMode) {
      const success = await signup(formData.name, formData.email, formData.password, formData.confirmPassword);
      if (success) {
        setErrorMessage('Signup successful! Please log in.');
        navigate('/login');
        resetForm();
      }
    } else {
      const success = await login(formData.email, formData.password);
      console.log(success)
      if (success) {
        navigate('/profile');
      }
    }
  };
  const onSwitchForm = () => {
    if (isLoginMode) {
      navigate('/signup');
    } else {
      navigate('/login');
    }
    setErrorMessage('');
    resetForm();
  };
  return (
    <AuthForm
      title={isLoginMode ? 'Log In' : 'Sign Up'}
      onSubmit={onSubmit}
      formData={formData}
      onInputChange={onInputChange}
      showName={!isLoginMode}
      showConfirmPassword={!isLoginMode}
      errorMessage={errorMessage}
      onSwitchForm={onSwitchForm}
    />
  );
};