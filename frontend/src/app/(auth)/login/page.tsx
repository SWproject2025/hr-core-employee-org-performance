"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/auth';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        login(data.access_token);
        toast.success(`Welcome back, ${data.user.firstName}!`);
        
        if (data.user.type === 'ADMIN' || data.user.type === 'HR ADMIN') {
           router.push('/admin');
        } else {
           router.push('/employee/profile');
        }
      } else {
        toast.error("Invalid credentials");
      }
    } catch (error) {
      toast.error("Connection failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Employee Login</h1>
        <p className="text-gray-500 text-sm text-center mb-6">Access your HR portal</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input 
              type="email" 
              placeholder="Email Address"
              className="w-full border p-2 rounded"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div>
            <input 
              type="password" 
              placeholder="Password"
              className="w-full border p-2 rounded"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700">
            Login
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <a href="/register" className="text-blue-600 hover:underline font-bold">
            Register here
          </a>
        </p>
      </div>
    </div>
  );
}