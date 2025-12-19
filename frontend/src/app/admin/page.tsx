"use client"
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch, logout } from '@/lib/auth';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const router = useRouter();
  const [employees, setEmployees] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const meRes = await authFetch('http://localhost:3000/employee-profile/me');
        if (!meRes.ok) throw new Error('Auth failed');
        const meData = await meRes.json();
        
        const userRoles = meData.role?.roles || [];
        const allowedRoles = ['admin', 'hr admin', 'system admin', 'hr manager'];
        
        const hasAccess = userRoles.some((r: string) => allowedRoles.includes(r.toLowerCase()));

        if (!hasAccess) {
          toast.error(`Access Denied. Your role is: ${userRoles.join(', ')}`);
          router.push('/employee/profile'); 
          return;
        }

        const empRes = await authFetch('http://localhost:3000/employee-profile/search?q=a');
        if (empRes.ok) setEmployees(await empRes.json());

        const candRes = await authFetch('http://localhost:3000/employee-profile/candidates');
        if (candRes.ok) setCandidates(await candRes.json());

        const reqRes = await authFetch('http://localhost:3000/employee-profile/requests/pending');
        if (reqRes.ok) setRequests(await reqRes.json());

        setLoading(false);
      } catch (err) {
        console.error(err);
        router.push('/login');
      }
    };
    loadAdminData();
  }, [router]);

  const updateStatus = async (id: string, status: 'HIRED' | 'REJECTED') => {
    try {
      const res = await fetch(`http://localhost:3000/employee-profile/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        toast.success(`Candidate ${status.toLowerCase()} successfully!`);
        setCandidates(prev => prev.map(c => c._id === id ? { ...c, status } : c));
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Failed");
      }
    } catch (error) {
      toast.error("Connection Error");
    }
  };

  const handlePromote = async (id: string) => {
    if (!confirm("Are you sure you want to convert this candidate to an Employee?")) return;

    try {
      const res = await fetch(`http://localhost:3000/employee-profile/${id}/promote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        toast.success("Onboarded successfully! Candidate removed.");
        setCandidates(prev => prev.filter(c => c._id !== id));
      } else {
        const data = await res.json();
        toast.error(data.message || "Promotion failed");
      }
    } catch (error) {
      toast.error("Connection failed");
    }
  };

  const handleRequestAction = async (requestId: string, action: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch(`http://localhost:3000/employee-profile/request/${requestId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action }),
      });

      if (res.ok) {
        toast.success(`Request marked as ${action}`);
        setRequests(prev => prev.filter(req => req._id !== requestId));
      } else {
        toast.error("Failed to update request");
      }
    } catch (error) {
      toast.error("Connection error");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded shadow mb-6">
        <div>
           <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
           <p className="text-green-600 text-sm font-semibold">● System Online</p>
        </div>
        <button onClick={() => { logout(); router.push('/login'); }} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
          Logout
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded shadow border-l-4 border-blue-500">
          <h3 className="text-gray-500 text-sm uppercase">Total Employees</h3>
          <p className="text-3xl font-bold text-gray-800">{employees.length}</p>
        </div>
        <div className="bg-white p-6 rounded shadow border-l-4 border-orange-500">
          <h3 className="text-gray-500 text-sm uppercase">New Candidates</h3>
          <p className="text-3xl font-bold text-gray-800">{candidates.length}</p>
        </div>
        <div className="bg-white p-6 rounded shadow border-l-4 border-purple-500">
          <h3 className="text-gray-500 text-sm uppercase">Pending Requests</h3>
          <p className="text-3xl font-bold text-gray-800">{requests.length}</p>
        </div>
        <div className="bg-white p-6 rounded shadow border-l-4 border-green-500">
          <h3 className="text-gray-500 text-sm uppercase">Active Roles</h3>
          <p className="text-3xl font-bold text-gray-800">2</p>
        </div>
      </div>

      {/* SECTION 1: CANDIDATES */}
      <div className="bg-white rounded shadow overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-200 bg-orange-50">
          <h2 className="text-xl font-bold text-orange-800">Candidate Applications</h2>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
              <th className="p-4 border-b">Name</th>
              <th className="p-4 border-b">Applied Date</th>
              <th className="p-4 border-b">Email</th>
              <th className="p-4 border-b">Status</th>
              <th className="p-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {candidates.length > 0 ? (
              candidates.map((cand: any) => (
                <tr key={cand._id} className="hover:bg-gray-50 transition">
                  <td className="p-4 border-b font-medium">{cand.firstName} {cand.lastName}</td>
                  <td className="p-4 border-b">
                    {cand.applicationDate ? new Date(cand.applicationDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="p-4 border-b">{cand.personalEmail}</td>
                  <td className="p-4 border-b">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      cand.status === 'HIRED' ? 'bg-green-100 text-green-700' : 
                      cand.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {cand.status}
                    </span>
                  </td>
                  <td className="p-4 border-b">
                    {(() => {
                        const isAlreadyEmployee = employees.some(e => e.personalEmail === cand.personalEmail);
                        if (isAlreadyEmployee) {
                          return <span className="text-gray-400 text-sm italic font-semibold">Promoted</span>;
                        }
                        if (cand.status === 'HIRED') {
                          return (
                            <button 
                              onClick={() => handlePromote(cand._id)}
                              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm font-bold shadow"
                            >
                              Onboard →
                            </button>
                          );
                        }
                        return (
                          <>
                            <button onClick={() => updateStatus(cand._id, 'HIRED')} className="text-green-600 hover:underline mr-3 font-bold text-sm">Hire</button>
                            <button onClick={() => updateStatus(cand._id, 'REJECTED')} className="text-red-600 hover:underline font-bold text-sm">Reject</button>
                          </>
                        );
                    })()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">No new candidates.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* SECTION 2: EMPLOYEES */}
      <div className="bg-white rounded shadow overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Employee Directory</h2>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
              <th className="p-4 border-b">Name</th>
              <th className="p-4 border-b">Employee ID</th>
              <th className="p-4 border-b">Department</th>
              <th className="p-4 border-b">Status</th>
              <th className="p-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {employees.length > 0 ? (
              employees.map((emp: any) => (
                <tr key={emp._id} className="hover:bg-gray-50 transition">
                  <td className="p-4 border-b font-medium">{emp.firstName} {emp.lastName}</td>
                  <td className="p-4 border-b">{emp.employeeNumber}</td>
                  <td className="p-4 border-b">{emp.primaryDepartmentId || '—'}</td>
                  <td className="p-4 border-b">
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                      {emp.status}
                    </span>
                  </td>
                  <td className="p-4 border-b">
                    <button 
                      onClick={() => router.push(`/admin/employee/${emp._id}`)}
                      className="text-blue-600 hover:underline text-sm font-semibold"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">No employees found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* SECTION 3: PENDING REQUESTS */}
      <div className="bg-white rounded shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-purple-50">
          <h2 className="text-xl font-bold text-purple-800">Pending Employee Requests</h2>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
              <th className="p-4">Employee</th>
              <th className="p-4">Type/Reason</th>
              <th className="p-4">Date</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.length > 0 ? requests.map((req: any) => (
              <tr key={req._id} className="border-t hover:bg-purple-50 transition">
                <td className="p-4 font-bold">
                   {req.employeeProfileId?.firstName} {req.employeeProfileId?.lastName}
                </td>
                <td className="p-4">
                  <span className="block font-semibold">
                    {(() => {
                        try { return JSON.parse(req.requestDescription).type } 
                        catch { return 'Request' }
                    })()}
                  </span>
                  <span className="text-sm text-gray-500">{req.reason}</span>
                </td>
                <td className="p-4">{new Date(req.submittedAt).toLocaleDateString()}</td>
                <td className="p-4">
                   <button onClick={() => handleRequestAction(req._id, 'APPROVED')} className="text-green-600 hover:underline mr-2 font-bold">Approve</button>
                   <button onClick={() => handleRequestAction(req._id, 'REJECTED')} className="text-red-600 hover:underline font-bold">Reject</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={4} className="p-6 text-center text-gray-500">No pending requests.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}