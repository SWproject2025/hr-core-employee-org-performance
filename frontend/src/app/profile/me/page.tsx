'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { EmployeeService } from '@/services/employee.service';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

// ✅ CORRECT IMPORTS based on your file paths
// Go up one level (..) to find ProfileHeader and ContactForm
import { ProfileHeader } from '../ProfileHeader';
import { ContactForm } from '../ContactForm'; 

export default function MyProfilePage() {
  const [profile, setProfile] = useState<any | null>(null);
  const [role, setRole] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchProfile = async () => {
    try {
      const data = await EmployeeService.getMe();
      setProfile(data.profile);
      setRole(data.role);
    } catch (error: any) {
      console.error("Fetch profile error", error);
      
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        router.push('/employee/login');
        return;
      }
      
      toast.error("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-blue-600">
        <Loader2 className="animate-spin h-10 w-10" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 text-center text-red-500">
        <h2 className="text-xl font-bold">Profile Not Found</h2>
        <p>We could not retrieve your user data.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* 1. Header Section */}
      <ProfileHeader profile={profile} refreshProfile={fetchProfile} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Contact & Employment Data */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Contact Form */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Contact Information</h2>
            <ContactForm profile={profile} />
          </div>

          {/* Employment Details */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Core Employment Data</h2>
            <div className="grid grid-cols-2 gap-y-4 text-sm">
              <div>
                <p className="text-gray-500">Date of Hire/Application</p>
                <p className="font-medium">
                  {profile.dateOfHire 
                    ? new Date(profile.dateOfHire).toLocaleDateString() 
                    : (profile.applicationDate ? new Date(profile.applicationDate).toLocaleDateString() : '-')}
                </p>
              </div>
              <div>
                <p className="text-gray-500">National ID</p>
                <p className="font-medium">{profile.nationalId}</p>
              </div>
              <div>
                <p className="text-gray-500">Department</p>
                <p className="font-medium">{profile.primaryDepartmentId || 'Not Assigned'}</p>
              </div>
              <div>
                <p className="text-gray-500">Position</p>
                <p className="font-medium">{profile.primaryPositionId || 'Not Assigned'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Roles & Bio */}
        <div className="space-y-6">
          
          {/* System Roles */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-4">System Roles</h2>
            {role?.roles && role.roles.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {role.roles.map((r: string, i: number) => (
                  <span key={i} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold uppercase">
                    {r}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No specific system roles assigned.</p>
            )}
          </div>

          {/* Bio */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Biography</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              {profile.biography || "No biography provided."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}