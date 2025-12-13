"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { register } from '../../../lib/auth';

export default function RegisterPage() {
  const [form, setForm] = useState<any>({
    firstName: '',
    lastName: '',
    nationalId: '',
    employeeNumber: '',
    dateOfHire: '',
    personalEmail: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (k: string, v: any) => setForm({ ...form, [k]: v });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Prepare payload that EmployeeProfile expects minimally
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        nationalId: form.nationalId,
        employeeNumber: form.employeeNumber,
        dateOfHire: form.dateOfHire || new Date().toISOString(),
        personalEmail: form.personalEmail,
        password: form.password,
      };

      await register(payload);
      // After register, go to login page
      router.push('/employee/login');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow text-gray-900">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Create Employee Account</h2>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="First name" required value={form.firstName} onChange={(e) => handleChange('firstName', e.target.value)} className="p-2 border rounded text-gray-900 placeholder-gray-500" />
            <input placeholder="Last name" required value={form.lastName} onChange={(e) => handleChange('lastName', e.target.value)} className="p-2 border rounded text-gray-900 placeholder-gray-500" />
          </div>
          <div>
            <input placeholder="National ID" required value={form.nationalId} onChange={(e) => handleChange('nationalId', e.target.value)} className="p-2 border rounded w-full text-gray-900 placeholder-gray-500" />
          </div>
          <div>
            <input placeholder="Employee number" required value={form.employeeNumber} onChange={(e) => handleChange('employeeNumber', e.target.value)} className="p-2 border rounded w-full text-gray-900 placeholder-gray-500" />
          </div>
          <div>
            <label className="text-xs">Date of hire</label>
            <input type="date" value={form.dateOfHire} onChange={(e) => handleChange('dateOfHire', e.target.value)} className="p-2 border rounded w-full text-gray-900" />
          </div>
          <div>
            <input placeholder="Email" type="email" required value={form.personalEmail} onChange={(e) => handleChange('personalEmail', e.target.value)} className="p-2 border rounded w-full text-gray-900 placeholder-gray-500" />
          </div>
          <div>
            <input placeholder="Password" type="password" required value={form.password} onChange={(e) => handleChange('password', e.target.value)} className="p-2 border rounded w-full text-gray-900 placeholder-gray-500" />
          </div>
          <div className="flex items-center justify-between">
            <button type="submit" disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded">{loading ? 'Creating...' : 'Create account'}</button>
            <a href="/employee/login" className="text-blue-600">Already have an account? Login</a>
          </div>
        </form>
      </div>
    </div>
  );
}
