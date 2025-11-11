import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Demo account credentials
const DEMO_ACCOUNT = {
  email: 'demo@example.com',
  password: 'demo123',
  name: 'Demo User',
  role: 'user'
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Check demo account
    if (email === DEMO_ACCOUNT.email && password === DEMO_ACCOUNT.password) {
      const userData = {
        email: DEMO_ACCOUNT.email,
        name: DEMO_ACCOUNT.name,
        role: DEMO_ACCOUNT.role
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true };
    }
    
    // Check registered users
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const foundUser = users.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const userData = {
        email: foundUser.email,
        name: foundUser.name,
        role: foundUser.role || 'user'
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true };
    }
    
    return { success: false, error: 'Invalid credentials' };
  };

  const signup = async (email, password, name) => {
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    // Check if user already exists
    if (users.find(u => u.email === email) || email === DEMO_ACCOUNT.email) {
      return { success: false, error: 'User already exists' };
    }
    
    // Add new user
    const newUser = { email, password, name, role: 'user' };
    users.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(users));
    
    // Auto login
    const userData = { email, name, role: 'user' };
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};