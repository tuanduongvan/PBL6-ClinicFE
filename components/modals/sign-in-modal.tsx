'use client';

import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { authAPI } from '@/services/api/auth';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: any, token: string) => void;
  onSwitchToSignUp?: () => void;
}

export function SignInModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  onSwitchToSignUp 
}: SignInModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
  
    try {
      const result = await authAPI.login({
        username: formData.username,
        password: formData.password
      });
  
      if ("errors" in result) {
        setError(result.errors.non_field_errors?.[0] || result.message);
        return;
      }
      
      // TH2: lỗi success=false
      if ("success" in result && result.success === false) {
        setError(result.message);
        return;
      }
      
      // TH3: đăng nhập thành công (lúc này chắc chắn có tokens)
      if ("tokens" in result && result.tokens.access) {
        onSuccess?.(result.user, result.tokens.access);
        onClose();
        setFormData({ username: '', password: '' });
        return;
      }
      
      // fallback
      setError(result.message || "Login failed");
  
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sign In</DialogTitle>
          <DialogDescription>
            Enter your credentials to access your account
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              disabled={isLoading}
              autoComplete="username"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              autoComplete="current-password"
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <button
              type="button"
              onClick={onSwitchToSignUp}
              className="text-primary font-semibold hover:underline"
            >
              Sign Up
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
