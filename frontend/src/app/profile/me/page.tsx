'use client';

import { useEffect, useState } from 'react';
import { EmployeeService } from '@/services/employee.service';
import { EmployeeProfile } from '@/types/employee';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ContactForm } from '@/components/profile/ContactForm';
import { Loader2 } from 'lucide-react';

export default function MyProfilePage() {
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      // FIX: Destructure 'profile' from the response object
      const { profile } = await EmployeeService.getMe(); 
      
      // Now you are setting the correct type
      setProfile(profile); 
    } catch (error) {
      console.error("Failed to fetch profile", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  if (!profile) return (
    <div className="p-8 text-center">
      <h3 className="text-lg font-semibold text-gray-900">Profile Not Found</h3>
      <p className="text-gray-500">Could not load employee profile data.</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <ProfileHeader profile={profile} refreshProfile={fetchProfile} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Contact Information</h2>
            <ContactForm profile={profile} />
          </div>
          
          {/* Employment Details Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Employment Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              <div className="p-4 bg-gray-50 rounded-lg">
                <span className="block text-gray-500 mb-1">Date of Hire</span>
                <span className="font-medium text-gray-900">
                  {new Date(profile.dateOfHire).toLocaleDateString(undefined, { 
                    year: 'numeric', month: 'long', day: 'numeric' 
                  })}
                </span>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <span className="block text-gray-500 mb-1">Position ID</span>
                <span className="font-medium text-gray-900">
                  {profile.primaryPositionId || 'Not Assigned'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {profile.biography || "No biography provided yet."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}