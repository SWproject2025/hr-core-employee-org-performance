'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth.service';
import { Button } from '@/components/employee-profile-ui/button';
import { Input } from '@/components/employee-profile-ui/input';
import { Card, CardContent, CardHeader } from '@/components/employee-profile-ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/employee-profile-ui/select';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    nationalId: '',     
    // candidateNumber: '',  <-- REMOVED (Backend will handle this)
    personalEmail: '', 
    password: '',
    mobilePhone: '',
    gender: '',       
    maritalStatus: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // FIX: Remove empty optional fields so Mongoose doesn't complain about Enums
    const payload: any = {
      firstName: form.firstName,
      lastName: form.lastName,
      nationalId: form.nationalId,
      personalEmail: form.personalEmail,
      email: form.personalEmail, // Send both to be safe
      password: form.password,
    };

    // Only add optional fields if they have values
    if (form.middleName) payload.middleName = form.middleName;
    if (form.mobilePhone) payload.mobilePhone = form.mobilePhone;
    if (form.gender) payload.gender = form.gender;
    if (form.maritalStatus) payload.maritalStatus = form.maritalStatus;

    try {
      await AuthService.register(payload);
      toast.success('Application submitted successfully!');
      router.push('/employee/login');
    } catch (error: any) {
      console.error(error);
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(Array.isArray(message) ? message[0] : message);
    } finally {
      setLoading(false);
    }
    
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Candidate Registration</h1>
          <p className="text-sm text-gray-500">Join our talent pool</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input name="firstName" placeholder="First Name *" onChange={handleChange} required />
              <Input name="middleName" placeholder="Middle Name" onChange={handleChange} />
              <Input name="lastName" placeholder="Last Name *" onChange={handleChange} required />
            </div>

            {/* National ID is the only unique ID the user provides */}
            <Input name="nationalId" placeholder="National ID *" onChange={handleChange} required />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select onValueChange={(val) => handleSelectChange('gender', val)}>
                <SelectTrigger><SelectValue placeholder="Gender" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={(val) => handleSelectChange('maritalStatus', val)}>
                <SelectTrigger><SelectValue placeholder="Marital Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="SINGLE">Single</SelectItem>
                  <SelectItem value="MARRIED">Married</SelectItem>
                  <SelectItem value="DIVORCED">Divorced</SelectItem>
                  <SelectItem value="WIDOWED">Widowed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input name="personalEmail" type="email" placeholder="Personal Email *" onChange={handleChange} required />
              <Input name="mobilePhone" placeholder="Mobile Phone" onChange={handleChange} />
            </div>

            <Input name="password" type="password" placeholder="Password *" onChange={handleChange} required />
            
            <Button type="submit" className="w-full mt-6" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Application'}
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/employee/login" className="text-blue-600 hover:underline">
              Login here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}