import React from 'react';

export interface AuthFormProps {
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
  onSwitchForm: () => any;
}



