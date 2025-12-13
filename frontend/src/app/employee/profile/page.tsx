"use client"
import React, { useEffect, useState } from 'react';
import { getAuthHeaders, getToken, authFetch, logout } from '../../../lib/auth';

export default function EmployeeProfilePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwMsg, setPwMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
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

  if (!getToken()) {
    return (
      <div className="p-8">
        <p className="text-lg">You must be logged in to view your profile.</p>
        <a href="/employee/login" className="text-blue-600">Go to login</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-black">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
        <div className="flex justify-between items-start">
          <h1 className="text-2xl font-bold mb-4">My Profile</h1>
          <div>
            <button onClick={() => { logout(); window.location.href = '/employee/login'; }} className="text-sm text-red-600">Logout</button>
          </div>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h2 className="text-lg font-semibold">Personal</h2>
              <p><strong>Name:</strong> {data?.profile?.firstName} {data?.profile?.lastName}</p>
              <p><strong>Employee #:</strong> {data?.profile?.employeeNumber}</p>
              <p><strong>National ID:</strong> {data?.profile?.nationalId}</p>
              <p><strong>Personal Email:</strong> {data?.profile?.personalEmail}</p>
              <p><strong>Work Email:</strong> {data?.profile?.workEmail || '—'}</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold">Role & Permissions</h2>
              {data?.role ? (
                <div>
                  <p><strong>Roles:</strong> {(data.role.roles || []).join(', ') || 'None'}</p>
                  <p><strong>Permissions:</strong> {(data.role.permissions || []).join(', ') || 'None'}</p>
                </div>
              ) : (
                <p>No role assigned</p>
              )}

              <div className="mt-6">
                <h3 className="font-semibold">Change Password</h3>
                {pwMsg && <div className="mb-2 text-sm">{pwMsg}</div>}
                <form onSubmit={handleChangePassword} className="space-y-2">
                  <div>
                    <label className="text-xs">Current Password</label>
                    <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="w-full p-2 border rounded" />
                  </div>
                  <div>
                    <label className="text-xs">New Password</label>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full p-2 border rounded" />
                  </div>
                  <div>
                    <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded">Change Password</button>
                  </div>
                </form>
              </div>
            </div>

            <div className="md:col-span-2 mt-4">
              <h3 className="font-semibold">All profile data (raw)</h3>
              <pre className="text-xs bg-gray-800 text-white p-3 rounded max-h-60 overflow-auto">{JSON.stringify(data?.profile, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
