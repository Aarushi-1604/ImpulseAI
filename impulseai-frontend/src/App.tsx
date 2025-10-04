import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { WelcomePage } from './components/WelcomePage';
import { Dashboard } from './components/dashboard/Dashboard';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';

interface User {
  name: string;
  email: string;
}

type AuthView = 'login' | 'register';
type AppState = 'loading' | 'auth' | 'welcome' | 'dashboard';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<AuthView>('login');
  const [appState, setAppState] = useState<AppState>('loading');
  const [showWelcome, setShowWelcome] = useState(false);

  // Check for existing session on app load
  useEffect(() => {
    // Apply initial theme
    const savedTheme = localStorage.getItem('spendwise_theme');
    const isDark = savedTheme ? savedTheme === 'dark' : true;
    
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }

    const timer = setTimeout(() => {
      const savedUser = localStorage.getItem('spendwise_user');
      const hasSeenWelcome = localStorage.getItem('spendwise_welcome_seen');
      
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          
          if (!hasSeenWelcome) {
            setShowWelcome(true);
            setAppState('welcome');
          } else {
            setAppState('dashboard');
            toast.success(`Welcome back, ${userData.name}!`);
          }
        } catch (error) {
          console.error('Error parsing saved user data:', error);
          localStorage.removeItem('spendwise_user');
          setAppState('auth');
        }
      } else {
        setAppState('auth');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (email: string, password: string) => {
    // Mock authentication - in real app, this would call an API
    const mockUser: User = {
      name: email === 'user@gmail.com' ? 'Google User' : email.split('@')[0],
      email: email
    };

    setUser(mockUser);
    localStorage.setItem('spendwise_user', JSON.stringify(mockUser));
    
    // Show welcome page for new users
    const hasSeenWelcome = localStorage.getItem('spendwise_welcome_seen');
    if (!hasSeenWelcome) {
      setShowWelcome(true);
      setAppState('welcome');
    } else {
      setAppState('dashboard');
      toast.success(`Welcome back, ${mockUser.name}!`);
    }
  };

  const handleRegister = (name: string, email: string, password: string) => {
    // Mock registration - in real app, this would call an API
    const newUser: User = {
      name: name,
      email: email
    };

    setUser(newUser);
    localStorage.setItem('spendwise_user', JSON.stringify(newUser));
    
    // Always show welcome for new registrations
    setShowWelcome(true);
    setAppState('welcome');
    toast.success(`Account created successfully! Welcome, ${newUser.name}!`);
  };

  const handleWelcomeComplete = () => {
    localStorage.setItem('spendwise_welcome_seen', 'true');
    setShowWelcome(false);
    setAppState('dashboard');
    toast.success('Welcome to SpendWise! Start tracking your expenses.');
  };

  const handleLogout = () => {
    setUser(null);
    setShowWelcome(false);
    localStorage.removeItem('spendwise_user');
    localStorage.removeItem('spendwise_welcome_seen');
    localStorage.removeItem('spendwise_transactions');
    localStorage.removeItem('spendwise_income');
    localStorage.removeItem('spendwise_budgets');
    localStorage.removeItem('spendwise_notifications');
    setAuthView('login');
    setAppState('auth');
    toast.success('Logged out successfully');
  };

  const handleAccountDelete = () => {
    // Reset all state variables
    setUser(null);
    setShowWelcome(false);
    setAuthView('login');
    setAppState('auth');
    
    toast.success('Account deleted successfully. You can create a new account.');
  };

  // Add a development helper to clear all data
  const clearAllData = () => {
    localStorage.clear();
    setUser(null);
    setShowWelcome(false);
    setAuthView('login');
    setAppState('auth');
    toast.success('All data cleared - you can now test the full flow');
  };

  // Loading state
  if (appState === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-blue rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl">₹</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">SpendWise</h1>
            <p className="text-muted-foreground">Loading your financial insights...</p>
          </div>
          <div className="flex justify-center">
            <div className="w-8 h-8 border-4 border-accent-blue border-t-transparent rounded-full animate-spin"></div>
          </div>
          
          {/* Development helper - remove in production */}
          <div className="mt-8">
            <button
              onClick={clearAllData}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Clear All Data (Dev Only)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Welcome page
  if (appState === 'welcome' && user) {
    return (
      <>
        <WelcomePage user={user} onGetStarted={handleWelcomeComplete} />
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              background: '#111111',
              border: '1px solid #333333',
              color: '#ffffff',
            },
          }}
        />
      </>
    );
  }

  // Dashboard
  if (appState === 'dashboard' && user) {
    return (
      <>
        <Dashboard 
          user={user} 
          onLogout={handleLogout} 
          onAccountDelete={handleAccountDelete}
        />
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              background: '#111111',
              border: '1px solid #333333',
              color: '#ffffff',
            },
          }}
        />
      </>
    );
  }

  // Authentication pages
  return (
    <div className="min-h-screen bg-background">
      {authView === 'login' ? (
        <LoginPage
          onLogin={handleLogin}
          onSwitchToRegister={() => setAuthView('register')}
        />
      ) : (
        <RegisterPage
          onRegister={handleRegister}
          onSwitchToLogin={() => setAuthView('login')}
        />
      )}
      
      {/* Toast notifications */}
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#111111',
            border: '1px solid #333333',
            color: '#ffffff',
          },
        }}
      />
    </div>
  );
}