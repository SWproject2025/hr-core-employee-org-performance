'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth.service';
import { Button } from '@/components/employee-profile-ui/button';
import { Input } from '@/components/employee-profile-ui/input';
import { Card, CardContent, CardHeader } from '@/components/employee-profile-ui/card';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevents 404 error
    setLoading(true);

    try {
      await AuthService.login(form);
      toast.success('Welcome back!');
      router.push('/profile/me'); // Redirect to profile after login
    } catch (error: any) {
      toast.error('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Employee Login</h1>
          <p className="text-sm text-gray-500">Access your HR portal</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input 
                type="email" 
                placeholder="Email Address" 
                value={form.email}
                onChange={(e) => setForm({...form, email: e.target.value})}
                required 
              />
            </div>
            <div>
              <Input 
                type="password" 
                placeholder="Password" 
                value={form.password}
                onChange={(e) => setForm({...form, password: e.target.value})}
                required 
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            Don't have an account?{' '}
            <Link href="/employee/register" className="text-blue-600 hover:underline">
              Register here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}