'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { AlertCircle, Loader2, Stethoscope } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { authAPI } from '@/services/api/auth';
import { PatientRegisterPayload } from '@/types/auth';

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: any, token: string) => void;
  onSwitchToSignIn?: () => void;
}

export function SignUpModal({ 
  isOpen, 
  onClose,
  onSuccess,
  onSwitchToSignIn
}: SignUpModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    password_confirm: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleDoctorRedirect = () => {
    onClose();
    router.push('/auth/doctor-register');
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || 
        !formData.password || !formData.password_confirm) {
      setError('Please fill in all required fields');
      return false;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }

    if (!/\d/.test(formData.password) || !/[a-zA-Z]/.test(formData.password)) {
      setError('Password must contain both letters and numbers');
      return false;
    }

    if (formData.password !== formData.password_confirm) {
      setError('Passwords do not match');
      return false;
    }

    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
      setError('Please enter a valid email');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Generate username from email if not provided
      const username = formData.email.split('@')[0] + '_' + Date.now().toString().slice(-6);
      
      const registerData: PatientRegisterPayload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        username: username,
        password: formData.password,
        password_confirm: formData.password_confirm,
        phone: '', // Optional for patients
        gender: 3, // Default to "Other" for patients
        role: 3, // Patient role
      };
  

      const result = await authAPI.registerPatient(registerData);
      if ("user" in result && "tokens" in result && result.tokens.access) {
        onSuccess?.(result.user, result.tokens.access);
        onClose();
      
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          password_confirm: '',
        });
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Patient Account</DialogTitle>
          <DialogDescription>
            Sign up to book appointments and access our services
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
          </div>


          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Min 8 chars, letters & numbers"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password_confirm">Confirm Password</Label>
            <Input
              id="password_confirm"
              name="password_confirm"
              type="password"
              placeholder="Confirm password"
              value={formData.password_confirm}
              onChange={handleChange}
              disabled={isLoading}
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
                Creating account...
              </>
            ) : (
              'Sign Up'
            )}
          </Button>

          <div className="space-y-4 pt-4 border-t">
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <button
                type="button"
                onClick={onSwitchToSignIn}
                className="text-primary font-semibold hover:underline"
              >
                Sign In
              </button>
            </div>
            
            <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg border border-border">
              <Stethoscope className="w-5 h-5 text-primary flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground mb-1">
                  Are you a Doctor?
                </p>
                <button
                  type="button"
                  onClick={handleDoctorRedirect}
                  className="text-sm text-primary font-semibold hover:underline"
                >
                  Apply to join our team here →
                </button>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
