import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../AppIcon';
import Button from './Button';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const navigationItems = [
    {
      label: 'Virtual Try-On',
      path: '/virtual-tryon',
      icon: 'Camera',
      description: 'Try on clothes virtually'
    },
    {
      label: 'My History',
      path: '/user-session-history',
      icon: 'Clock',
      description: 'View past styling sessions'
    }
  ];
  
  // Add admin item only for admin users
  if (user && user.role === 'admin') {
    navigationItems.push({
      label: 'Admin',
      path: '/admin-product-management',
      icon: 'Settings',
      description: 'Manage products and analytics'
    });
  }

  const isActivePath = (path) => {
    if (path === '/admin-product-management') {
      return location?.pathname?.startsWith('/admin');
    }
    return location?.pathname === path;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-100 bg-surface border-b border-border shadow-subtle">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Logo */}
        <Link 
          to="/virtual-tryon" 
          className="flex items-center space-x-2 hover-scale"
          onClick={closeMobileMenu}
        >
          <div className="flex items-center justify-center w-8 h-8 bg-accent rounded-lg">
            <Icon name="Sparkles" size={20} color="white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-primary leading-none">
              Frenzy Vastra
            </span>
            <span className="text-xs text-text-secondary leading-none">
              AI Stylist
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navigationItems.map((item) => (
            <Link
              key={item?.path}
              to={item?.path}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-smooth hover:bg-muted group ${
                isActivePath(item?.path)
                  ? 'bg-accent text-accent-foreground'
                  : 'text-text-primary hover:text-primary'
              }`}
            >
              <Icon 
                name={item?.icon} 
                size={18} 
                color={isActivePath(item?.path) ? 'currentColor' : 'var(--color-text-secondary)'} 
              />
              <span className="font-medium text-sm">{item?.label}</span>
            </Link>
          ))}
        </nav>

        {/* User Menu & Mobile Menu Button */}
        <div className="flex items-center space-x-2">
          {user && (
            <div className="hidden md:flex items-center space-x-3">
              <span className="text-sm text-text-secondary">
                Welcome, {user.name}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
              >
                Logout
              </Button>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <Icon name={isMobileMenuOpen ? 'X' : 'Menu'} size={20} />
          </Button>
        </div>
      </div>
      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-surface border-t border-border shadow-modal">
          <nav className="px-4 py-2 space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item?.path}
                to={item?.path}
                onClick={closeMobileMenu}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-smooth ${
                  isActivePath(item?.path)
                    ? 'bg-accent text-accent-foreground'
                    : 'text-text-primary hover:bg-muted'
                }`}
              >
                <Icon 
                  name={item?.icon} 
                  size={20} 
                  color={isActivePath(item?.path) ? 'currentColor' : 'var(--color-text-secondary)'} 
                />
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{item?.label}</span>
                  <span className="text-xs text-text-secondary">{item?.description}</span>
                </div>
              </Link>
            ))}
            
            {user && (
              <div className="border-t border-border pt-2 mt-2">
                <div className="px-4 py-2">
                  <span className="text-sm text-text-secondary">
                    Welcome, {user.name}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => {
                    logout();
                    closeMobileMenu();
                  }}
                  className="mx-4"
                >
                  Logout
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;