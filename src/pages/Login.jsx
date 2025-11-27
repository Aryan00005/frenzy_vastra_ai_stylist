import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Login = () => {
  const { login, user } = useAuth();
  const currentLocation = useLocation();
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  // If user is already logged in, redirect them
  if (user) {
    let redirectPath = '/';
    if (currentLocation.state && currentLocation.state.from && currentLocation.state.from.pathname) {
      redirectPath = currentLocation.state.from.pathname;
    }
    return <Navigate to={redirectPath} replace />;
  }

  const handleFormSubmit = async (formData) => {
    setIsLoading(true);
    setErrorMessage('');
    
    const loginResult = await login(formData.email, formData.password);
    
    if (loginResult.success) {
      let redirectPath = '/';
      if (currentLocation.state && currentLocation.state.from && currentLocation.state.from.pathname) {
        redirectPath = currentLocation.state.from.pathname;
      }
      window.location.href = redirectPath;
    } else {
      setErrorMessage(loginResult.error);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
              create a new account
            </Link>
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Demo Account</h3>
            <p className="text-sm text-blue-700">
              Email: <span className="font-mono">demo@example.com</span><br />
              Password: <span className="font-mono">demo123</span>
            </p>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-green-800 mb-2">Admin Account</h3>
            <p className="text-sm text-green-700">
              Email: <span className="font-mono">admin@example.com</span><br />
              Password: <span className="font-mono">admin123</span>
            </p>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="space-y-4">
            <Input
              label="Email address"
              type="email"
              required
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Invalid email address'
                }
              })}
              error={errors.email?.message}
            />

            <Input
              label="Password"
              type="password"
              required
              {...register('password', { 
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
              error={errors.password?.message}
            />
          </div>

          {errorMessage && (
            <div className="text-red-600 text-sm text-center">
              {errorMessage}
            </div>
          )}

          <Button
            type="submit"
            fullWidth
            loading={isLoading}
            disabled={isLoading}
          >
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;