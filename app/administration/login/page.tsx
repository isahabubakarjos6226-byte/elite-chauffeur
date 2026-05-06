'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Lock, Mail, Key } from 'lucide-react';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, loginWithMasterPassword, settings } = useStore();
  
  const [loginMode, setLoginMode] = useState<'staff' | 'master'>('staff');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 500));

    let success = false;
    if (loginMode === 'staff') {
      success = login(email, password);
    } else {
      success = loginWithMasterPassword(password);
    }

    if (success) {
      router.push('/administration');
    } else {
      setError('Invalid credentials. Please try again.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo - Pure Black & White */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-xl bg-foreground flex items-center justify-center">
              <span className="text-background font-serif text-3xl font-bold">E</span>
            </div>
          </Link>
          <h1 className="font-serif text-3xl text-foreground mb-2">
            {settings.siteName}
          </h1>
          <p className="text-muted-foreground">Admin Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-card border border-border rounded-2xl p-8">
          {/* Tab Switcher - Black & White */}
          <div className="flex gap-2 mb-6 p-1 bg-secondary rounded-lg">
            <button
              type="button"
              onClick={() => setLoginMode('staff')}
              className={cn(
                'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors',
                loginMode === 'staff'
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Staff Login
            </button>
            <button
              type="button"
              onClick={() => setLoginMode('master')}
              className={cn(
                'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors',
                loginMode === 'master'
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Master Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {loginMode === 'staff' && (
              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="admin@elitechauffeur.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="ec-input w-full pl-11"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                {loginMode === 'staff' ? 'Password' : 'Master Password'}
              </label>
              <div className="relative">
                {loginMode === 'staff' ? (
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                ) : (
                  <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                )}
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="ec-input w-full pl-11 pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-foreground text-background font-medium py-3 px-6 rounded-lg hover:bg-foreground/90 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Demo credentials: admin@elitechauffeur.com / admin123
            </p>
          </div>
        </div>

        <p className="text-center mt-6 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            Return to website
          </Link>
        </p>
      </div>
    </div>
  );
}
