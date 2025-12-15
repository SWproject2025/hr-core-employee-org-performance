"use client"
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Use Next.js Router for redirects
import { getAuthHeaders, getToken, authFetch, logout } from '../../../lib/auth';

export default function EmployeeProfilePage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true); // Default to true to prevent hydration mismatch
  const [error, setError] = useState<string | null>(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwMsg, setPwMsg] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // New state to track auth

  useEffect(() => {
    // 1. Check Auth Client-Side Only
    const token = getToken();
    
    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    setIsAuthenticated(true);

    // 2. Fetch Profile Data
    const fetchProfile = async () => {
      try {
        const res = await authFetch('http://localhost:3000/employee-profile/me');
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Failed to load');
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);
    try {
      const res = await authFetch('http://localhost:3000/employee-profile/me/password', {
        method: 'PUT',
        body: JSON.stringify({ oldPassword: oldPassword || undefined, newPassword }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Change password failed');
      }
      setPwMsg('Password changed successfully');
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPwMsg(err.message || 'Change password failed');
    }
  };

  // 3. Render Loading State (Matches Server & Client initially)
  if (loading) {
    return (
      <div className="min-h-screen p-8 bg-gray-50 text-black flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading profile...</p>
      </div>
    );
  }

  // 4. Render Not Authenticated State
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen p-8 bg-gray-50 text-black flex items-center justify-center">
        <div className="bg-white p-6 rounded shadow text-center">
          <p className="text-lg mb-4">You must be logged in to view your profile.</p>
          <a href="/employee/login" className="text-blue-600 hover:underline">Go to login</a>
        </div>
      </div>
    );
  }

  // 5. Render Profile (Authenticated)
  return (
    <div className="min-h-screen p-8 bg-gray-50 text-black">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow text-gray-900">
        <div className="flex justify-between items-start">
          <h1 className="text-2xl font-bold mb-4 text-black">My Profile</h1>
          <div>
            <button onClick={() => { logout(); window.location.href = '/employee/login'; }} className="text-sm text-red-600 hover:underline">Logout</button>
          </div>
        </div>

        {error ? (
          <div className="text-red-600 p-4 bg-red-50 rounded">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h2 className="text-lg font-semibold border-b pb-2 mb-3 text-gray-800">Personal</h2>
              <div className="space-y-2 text-sm">
                <p><strong className="text-gray-700">Name:</strong> {data?.profile?.firstName} {data?.profile?.lastName}</p>
                <p><strong className="text-gray-700">Employee #:</strong> {data?.profile?.employeeNumber}</p>
                <p><strong className="text-gray-700">National ID:</strong> {data?.profile?.nationalId}</p>
                <p><strong className="text-gray-700">Personal Email:</strong> {data?.profile?.personalEmail}</p>
                <p><strong className="text-gray-700">Work Email:</strong> {data?.profile?.workEmail || '—'}</p>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold border-b pb-2 mb-3 text-gray-800">Role & Permissions</h2>
              {data?.role ? (
                <div className="space-y-2 text-sm">
                  <p><strong className="text-gray-700">Roles:</strong> {(data.role.roles || []).join(', ') || 'None'}</p>
                  <p><strong className="text-gray-700">Permissions:</strong> {(data.role.permissions || []).join(', ') || 'None'}</p>
                </div>
              ) : (
                <p className="text-gray-500 italic">No role assigned</p>
              )}

              <div className="mt-8 pt-4 border-t">
                <h3 className="font-semibold mb-3 text-gray-800">Change Password</h3>
                {pwMsg && <div className={`mb-2 text-sm ${pwMsg.includes('failed') ? 'text-red-600' : 'text-green-600'}`}>{pwMsg}</div>}
                <form onSubmit={handleChangePassword} className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Current Password</label>
                    <input 
                      type="password" 
                      value={oldPassword} 
                      onChange={(e) => setOldPassword(e.target.value)} 
                      className="w-full p-2 border border-gray-300 rounded mt-1 text-black focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">New Password</label>
                    <input 
                      type="password" 
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)} 
                      className="w-full p-2 border border-gray-300 rounded mt-1 text-black focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                  <div>
                    <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow-sm transition-colors">
                      Change Password
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="md:col-span-2 mt-6">
              <h3 className="font-semibold mb-2 text-gray-800">Debug Data</h3>
              <pre className="text-xs bg-gray-900 text-green-400 p-4 rounded-lg shadow-inner max-h-60 overflow-auto border border-gray-700">
                {JSON.stringify(data?.profile, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}