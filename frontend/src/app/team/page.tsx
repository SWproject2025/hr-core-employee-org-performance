'use client';

import { useEffect, useState } from 'react';
import { EmployeeService } from '@/services/employee.service';
import { EmployeeProfile } from '@/types/employee';
import { Card, CardContent } from '@/components/employee-profile-ui/card';
import { Button } from '@/components/employee-profile-ui/button';
import { Loader2, Mail, Phone, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TeamPage() {
  const [team, setTeam] = useState<EmployeeProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        // 1. Get current user's ID
        const { profile } = await EmployeeService.getMe();
        
        if (profile._id) {
          // 2. Fetch team using that ID
          const teamData = await EmployeeService.getTeam(profile._id);
          setTeam(teamData);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load team members");
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Team</h1>
          <p className="text-gray-500">Manage your direct reports</p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium text-sm">
          Total Members: {team.length}
        </div>
      </div>
      
      {team.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
          <User className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No Direct Reports</h3>
          <p className="text-gray-500">You do not have any team members assigned yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.map((member) => (
            <Card key={member._id} className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  {/* Avatar */}
                  <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden mb-4">
                    {member.profilePictureUrl ? (
                      <img src={`http://localhost:3000/${member.profilePictureUrl}`} alt={member.firstName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-gray-400">
                        {member.firstName[0]}{member.lastName[0]}
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-lg text-gray-900">
                    {member.firstName} {member.lastName}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">{member.workEmail}</p>

                  <div className="w-full space-y-2 border-t pt-4">
                    <div className="flex items-center justify-center text-sm text-gray-600 gap-2">
                      <Mail size={14} />
                      <span className="truncate">{member.workEmail}</span>
                    </div>
                    <div className="flex items-center justify-center text-sm text-gray-600 gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        member.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {member.status}
                      </span>
                    </div>
                  </div>

                  <Button className="w-full mt-6" variant="outline">
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}