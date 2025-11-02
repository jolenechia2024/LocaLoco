// src/components/pages/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, AlertCircle } from 'lucide-react';
import { UserRole } from '../../types/auth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';

// ✅ NO PROPS - Uses hooks instead
export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  
  const [role, setRole] = useState<UserRole>('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const headerBgColor = isDarkMode ? '#3a3a3a' : '#ffffff';
  const headerTextColor = isDarkMode ? '#ffffff' : '#000000';
  const bgColor = isDarkMode ? '#3a3a3a' : 'bg-gradient-to-br from-pink-50 via-pink-100 to-orange-50';
  const cardBgColor = isDarkMode ? '#2a2a2a' : '#ffffff';
  const textColor = isDarkMode ? '#ffffff' : '#000000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!email.trim() || !password.trim()) {
      setError('Login failed. Please check your login details and try again.');
      return;
    }
    if (role === 'user' && !email.includes('@')) {
      setError('Login failed. Please check your login details and try again.');
      return;
    }

    // Mock login - accepts any credentials
    try {
      const userId = role === 'business' ? 'business-1' : 'customer-1';
      login(userId, role, 'mock-token-123');
      navigate('/map');
    } catch (err) {
      setError('Login failed. Please try again.');
    }

  
    // UNCOMMENT THIS WHEN YOU WANT TO USE REAL API:
    const handleLogin = async (email: string, password: string, role: UserRole) => {
      const payload = new URLSearchParams();
      if (role === 'business') payload.append('uen', email);
      else payload.append('email', email);

      payload.append('password', password);
      payload.append('role', role);
      payload.append('mode', 'login');

      try {
        const response = await fetch('/api/getUsers, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: payload.toString(),
        });

        if (!response.ok) throw new Error('Network response was not ok');
        const result = await response.json();

        if (result.success) {
          setError(null);
          login(result.userId, role, result.token);
          navigate('/map');
        } else {
          setError('Login failed. Please check your login details and try again.');
        }
      } catch (error: any) {
        setError('Login failed. Please check your login details and try again.');
      }
    };
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div
      className={`min-h-screen relative ${!isDarkMode ? 'bg-gradient-to-br from-pink-50 via-pink-100 to-orange-50' : ''}`}
      style={isDarkMode ? { backgroundColor: bgColor } : {}}
    >
      {/* Background pattern */}
      {!isDarkMode && (
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#FFA1A3" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      )}

      {/* Header */}
      <header className="shadow-md relative z-10" style={{ backgroundColor: headerBgColor, color: headerTextColor }}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl">LocalLoco</h1>
              <p className="text-sm opacity-90">
                Discover and support local businesses in your community - or nearby you!
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Login Form */}
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)] p-4 relative z-10">
        <div className="w-full max-w-md">
          <form onSubmit={handleSubmit} className="rounded-lg shadow-lg p-8 space-y-6" style={{ backgroundColor: cardBgColor, color: textColor }}>
            {/* Account Type */}
            <div className="space-y-2">
              <Label htmlFor="role">Account Type</Label>
              <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                <SelectTrigger className="bg-primary/80 text-white border-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Email / UEN */}
            <div className="space-y-2">
              <Label htmlFor="email">{role === 'business' ? 'UEN (Unique Entity Number)' : 'Email'}</Label>
              <Input
                id="email"
                type={role === 'business' ? 'text' : 'email'}
                placeholder="Enter"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                required
                className="bg-input-background"
              />
            </div>

            {/* Password and Error */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                required
                className="bg-input-background"
              />
              {/* Error directly below password field */}
              {error && (
                <div className="flex items-center gap-2 mt-2" style={{ color: '#d4183d' }}>
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
              Log in
            </Button>

            {/* Links */}
            <div className="text-center space-y-2">
              <button
                type="button"
                className="text-sm underline text-foreground hover:text-primary"
                onClick={() => alert('Password reset functionality would be implemented here')}
              >
                Forgot password?
              </button>
            </div>

            {/* Back Button */}
            <div className="text-center pt-4">
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-foreground"
                onClick={handleBack}
              >
                Back to welcome screen
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}