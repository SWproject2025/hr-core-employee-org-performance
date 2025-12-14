'use client';

import { useEffect, useState } from 'react';
import { EmployeeService } from '@/services/employee.service';
import { EmployeeProfile } from '@/types/employee';
import { Card, CardContent, CardHeader } from '@/components/employee-profile-ui/card';

export default function TeamPage() {
  const [team, setTeam] = useState<EmployeeProfile[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    // 1. Get Me to get ID
    // 2. Get Team using that ID
    const loadTeam = async () => {
      try {
        const me = await EmployeeService.getMe();
        if(me.profile._id) {
          const teamData = await EmployeeService.getTeam(me.profile._id);
          setTeam(teamData);
        }
      } catch (e) {
        console.error("Error loading team", e);
      }
    };
    loadTeam();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">My Team</h1>
      
      {team.length === 0 ? (
        <p className="text-gray-500">No direct reports found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {team.map((emp) => (
            <Card key={emp._id} className="hover:shadow-md transition">
              <CardContent className="pt-6 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mb-3">
                  {emp.firstName[0]}{emp.lastName[0]}
                </div>
                <h3 className="font-semibold text-lg">{emp.firstName} {emp.lastName}</h3>
                <p className="text-sm text-gray-500">{emp.workEmail}</p>
                <div className="mt-4 w-full">
                  <a href={`/profile/${emp._id}`} className="block w-full text-center bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200 text-sm font-medium">
                    View Profile
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}