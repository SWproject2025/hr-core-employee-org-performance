// src/app/(payroll-execution)/all-runs/runs/[id]/page.tsx
"use client"
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle, Users, DollarSign, AlertTriangle } from 'lucide-react';

const RunDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const runId = params.id as string;
  
  const [run, setRun] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (runId) {
      fetchRunDetails();
    }
  }, [runId]);

  const fetchRunDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔍 Fetching run with ID:', runId);
      
      // ✅ FIXED: Use correct endpoint path
      let runResponse;
      let runData;
      
      // Try fetching by the ID directly (could be MongoDB _id or custom runId)
      runResponse = await fetch(`http://localhost:3000/payroll-execution/payroll-runs/${runId}`);
      
      if (!runResponse.ok) {
        // If that fails, try getting all runs and find by runId
        console.log('⚠️ Direct fetch failed, trying to find in all runs...');
        const allRunsResponse = await fetch('http://localhost:3000/payroll-execution/payroll-runs');
        if (allRunsResponse.ok) {
          const allRuns = await allRunsResponse.json();
          console.log('📋 All runs:', allRuns);
          
          // Find the run by either _id or runId
          runData = allRuns.find((r: any) => 
            r._id === runId || r.runId === runId
          );
          
          if (!runData) {
            throw new Error('Run not found in the list');
          }
        } else {
          const errorText = await allRunsResponse.text();
          console.error('Failed to fetch all runs:', errorText);
          throw new Error('Failed to fetch runs');
        }
      } else {
        runData = await runResponse.json();
      }

      console.log('✅ Run data:', runData);
      
      // Use the actual _id for fetching payslips
      const actualRunId = runData._id || runData.runId || runId;
      
      // Fetch employee payslips using the run's _id
      console.log('🔍 Fetching payslips for run ID:', actualRunId);
      const employeesResponse = await fetch(
        `http://localhost:3000/payroll-execution/payslips?runId=${actualRunId}`
      );
      
      let employeesData = [];
      if (employeesResponse.ok) {
        employeesData = await employeesResponse.json();
        console.log('✅ Employees data:', employeesData);
      } else {
        console.warn('⚠️ Failed to fetch payslips, continuing without them');
        const errorText = await employeesResponse.text();
        console.error('Payslips error:', errorText);
      }

      setRun(runData);
      
      // Ensure employees is always an array
      if (Array.isArray(employeesData)) {
        setEmployees(employeesData);
      } else if (employeesData && typeof employeesData === 'object') {
        setEmployees(employeesData.data || employeesData.payslips || employeesData.employees || []);
      } else {
        setEmployees([]);
      }
      
    } catch (error: any) {
      console.error('❌ Error fetching run details:', error);
      setError(error.message || 'Failed to load run details');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!confirm('Publish this payroll for approval?')) return;
    
    try {
      // Use the actual _id for the API call
      const actualRunId = run._id || run.runId || runId;
      const response = await fetch(
        `http://localhost:3000/payroll-execution/payroll-runs/${actualRunId}/publish`,
        { method: 'PATCH' }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to publish');
      }
      
      alert('Payroll published successfully!');
      fetchRunDetails();
    } catch (error: any) {
      alert(error.message || 'Failed to publish payroll');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading run details...</p>
          <p className="text-xs text-gray-400 mt-2">Run ID: {runId}</p>
        </div>
      </div>
    );
  }

  if (error || !run) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto text-center py-12">
          <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-lg text-gray-500">
            {error || 'Payroll run not found'}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Looking for run with ID: {runId}
          </p>
          <button
            onClick={() => router.push('/all-runs/runs')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ← Back to All Runs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <button
              onClick={() => router.push('/all-runs/runs')}
              className="text-blue-600 hover:text-blue-800 mb-2 text-sm"
            >
              ← Back to All Runs
            </button>
            <h1 className="text-3xl font-bold text-gray-800">
              Run: {run.runId || run._id}
            </h1>
            <p className="text-gray-500 mt-1">
              Period: {new Date(run.payrollPeriod).toLocaleDateString()}
            </p>
            <p className="text-gray-500 text-sm">
              Entity: {run.entity || 'N/A'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              ID: {run._id}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push(`/all-runs/runs/${runId}/pre-runs`)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              View Pre-Runs
            </button>
            {run.status === 'DRAFT' && (
              <button
                onClick={handlePublish}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Publish for Approval
              </button>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-3">
          <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${
            run.status === 'DRAFT' ? 'bg-gray-200 text-gray-800' :
            run.status === 'UNDER_REVIEW' ? 'bg-yellow-200 text-yellow-800' :
            run.status === 'APPROVED' ? 'bg-green-200 text-green-800' :
            run.status === 'REJECTED' ? 'bg-red-200 text-red-800' :
            'bg-blue-200 text-blue-800'
          }`}>
            {run.status?.replace('_', ' ') || 'Unknown'}
          </span>
          {run.rejectionReason && (
            <span className="text-sm text-red-600">
              Reason: {run.rejectionReason}
            </span>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-3">
              <Users className="text-blue-600" size={24} />
              <div>
                <p className="text-sm text-gray-500">Employees</p>
                <p className="text-2xl font-bold">{run.employees || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-red-600" size={24} />
              <div>
                <p className="text-sm text-gray-500">Exceptions</p>
                <p className="text-2xl font-bold">{run.exceptions || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-3">
              <DollarSign className="text-green-600" size={24} />
              <div>
                <p className="text-sm text-gray-500">Total Net Pay</p>
                <p className="text-2xl font-bold">
                  ${run.totalnetpay?.toLocaleString() || '0'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-purple-600" size={24} />
              <div>
                <p className="text-sm text-gray-500">Payment Status</p>
                <p className="text-lg font-semibold">
                  {run.paymentStatus?.replace('_', ' ') || 'Pending'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Employee Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold">Employee Payroll Details</h2>
            <span className="text-sm text-gray-500">
              {employees.length} employee{employees.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gross</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deductions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net Pay</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {!Array.isArray(employees) || employees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-lg">No employee payroll data available</p>
                      <p className="text-sm mt-2">
                        Payslips may not have been generated yet for this run
                      </p>
                    </td>
                  </tr>
                ) : (
                  employees.map((emp: any) => (
                    <tr key={emp._id || emp.employeeId} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {emp.employeeName || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {emp.employeeCode || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {emp.department || 'N/A'}
                      </td>
                      <td className="px-6 py-4 font-semibold">
                        ${(emp.grossSalary || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-red-600">
                        ${(emp.deductions || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-bold text-green-600">
                        ${(emp.netPay || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          emp.status === 'pending' || emp.status === 'PENDING'
                            ? 'bg-yellow-200 text-yellow-800' 
                            : 'bg-green-200 text-green-800'
                        }`}>
                          {emp.status || 'pending'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <details className="bg-white rounded-lg shadow-md p-4">
            <summary className="cursor-pointer font-semibold text-sm text-gray-600">
              🐛 Debug Info (Dev Only)
            </summary>
            <div className="mt-4 space-y-2">
              <p className="text-xs"><strong>URL Param ID:</strong> {runId}</p>
              <p className="text-xs"><strong>Run MongoDB _id:</strong> {run._id}</p>
              <p className="text-xs"><strong>Run Custom runId:</strong> {run.runId}</p>
              <p className="text-xs"><strong>Employees Count:</strong> {employees.length}</p>
              <p className="text-xs"><strong>API Endpoints Used:</strong></p>
              <ul className="text-xs ml-4 list-disc">
                <li>GET /payroll-execution/payroll-runs/{runId}</li>
                <li>GET /payroll-execution/payslips?runId={runId}</li>
              </ul>
              <pre className="text-xs overflow-auto bg-gray-50 p-4 rounded mt-2">
                {JSON.stringify({ run, employeesCount: employees.length }, null, 2)}
              </pre>
            </div>
          </details>
        )}
      </div>
    </div>
  );
};

export default RunDetailsPage;