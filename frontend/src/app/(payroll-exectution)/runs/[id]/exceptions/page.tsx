"use client"
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Check, X, Eye, MessageSquare, Filter, Search } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface Exception {
  _id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  runId: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  status: 'open' | 'resolved' | 'escalated';
  resolutionNote?: string;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

const ExceptionResolutionPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const [runId, setRunId] = useState<string>('');
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExceptions, setSelectedExceptions] = useState<string[]>([]);
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [currentException, setCurrentException] = useState<Exception | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [filters, setFilters] = useState({
    severity: '',
    status: '',
    searchTerm: ''
  });

  useEffect(() => {
    const initPage = async () => {
      const resolvedParams = await params;
      setRunId(resolvedParams.id);
    };
    initPage();
  }, [params]);

  useEffect(() => {
    if (runId) {
      fetchExceptions();
    }
  }, [runId]);

  const fetchExceptions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/payroll-execution/payroll-runs/${runId}/exceptions`);
      
      if (!response.ok) throw new Error('Failed to fetch exceptions');
      
      const data = await response.json();
      
      // Transform backend data to match interface
      const transformedExceptions = data.exceptions?.map((exc: any) => ({
        _id: exc.employee?._id || Math.random().toString(),
        employeeId: exc.employee?._id || '',
        employeeName: exc.employee ? `${exc.employee.firstName} ${exc.employee.lastName}` : 'Unknown',
        employeeCode: exc.employee?.code || 'N/A',
        runId: data.runId,
        type: 'FLAGGED',
        severity: 'MEDIUM' as const,
        description: exc.exception || '',
        status: 'open' as const,
        createdAt: new Date().toISOString()
      })) || [];
      
      setExceptions(transformedExceptions);
    } catch (error: any) {
      console.error('Error fetching exceptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveException = async (exceptionId: string) => {
    if (!resolutionNote.trim()) {
      alert('Please provide a resolution note');
      return;
    }

    try {
      const exception = exceptions.find(e => e._id === exceptionId);
      if (!exception) return;

      const response = await fetch(
        `${API_URL}/payroll-execution/payroll-runs/${runId}/exceptions/${exception.employeeId}/resolve`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resolutionNote })
        }
      );

      if (!response.ok) throw new Error('Failed to resolve exception');

      alert('Exception resolved successfully');
      setShowResolutionModal(false);
      setResolutionNote('');
      fetchExceptions();
    } catch (error: any) {
      alert(error.message || 'Failed to resolve exception');
    }
  };

  const handleBulkResolve = async () => {
    if (selectedExceptions.length === 0) {
      alert('Please select exceptions to resolve');
      return;
    }

    const note = prompt('Enter resolution note for all selected exceptions:');
    if (!note) return;

    try {
      await Promise.all(
        selectedExceptions.map(excId => {
          const exception = exceptions.find(e => e._id === excId);
          if (!exception) return Promise.resolve();
          
          return fetch(
            `${API_URL}/payroll-execution/payroll-runs/${runId}/exceptions/${exception.employeeId}/resolve`,
            {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ resolutionNote: note })
            }
          );
        })
      );

      alert('Exceptions resolved successfully');
      setSelectedExceptions([]);
      fetchExceptions();
    } catch (error: any) {
      alert('Some exceptions failed to resolve');
    }
  };

  const getSeverityBadge = (severity: string) => {
    const severityMap: any = {
      'LOW': 'bg-blue-200 text-blue-800',
      'MEDIUM': 'bg-yellow-200 text-yellow-800',
      'HIGH': 'bg-orange-200 text-orange-800',
      'CRITICAL': 'bg-red-200 text-red-800'
    };
    return severityMap[severity] || severityMap.MEDIUM;
  };

  const filteredExceptions = exceptions.filter(exc => {
    if (filters.severity && exc.severity !== filters.severity) return false;
    if (filters.status && exc.status !== filters.status) return false;
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      return exc.employeeName.toLowerCase().includes(term) ||
             exc.employeeCode.toLowerCase().includes(term) ||
             exc.description.toLowerCase().includes(term);
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading exceptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Exception Resolution</h1>
          <p className="text-gray-600 mt-1">Run ID: {runId}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-sm text-gray-600">Total Exceptions</p>
            <p className="text-2xl font-bold text-gray-900">{exceptions.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-sm text-gray-600">Open</p>
            <p className="text-2xl font-bold text-orange-600">
              {exceptions.filter(e => e.status === 'open').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-sm text-gray-600">Resolved</p>
            <p className="text-2xl font-bold text-green-600">
              {exceptions.filter(e => e.status === 'resolved').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-sm text-gray-600">Critical</p>
            <p className="text-2xl font-bold text-red-600">
              {exceptions.filter(e => e.severity === 'CRITICAL').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter size={16} className="inline mr-1" />
                Severity
              </label>
              <select
                value={filters.severity}
                onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Severities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter size={16} className="inline mr-1" />
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="resolved">Resolved</option>
                <option value="escalated">Escalated</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search size={16} className="inline mr-1" />
                Search
              </label>
              <input
                type="text"
                value={filters.searchTerm}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                placeholder="Search employee or description..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedExceptions.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-blue-900">
                {selectedExceptions.length} exception(s) selected
              </p>
              <button
                onClick={handleBulkResolve}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              >
                <Check size={16} />
                Bulk Resolve
              </button>
            </div>
          </div>
        )}

        {/* Exceptions Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedExceptions.length === filteredExceptions.length && filteredExceptions.length > 0}
                      onChange={() => {
                        if (selectedExceptions.length === filteredExceptions.length) {
                          setSelectedExceptions([]);
                        } else {
                          setSelectedExceptions(filteredExceptions.map(e => e._id));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredExceptions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <AlertTriangle size={48} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-lg font-medium">No exceptions found</p>
                    </td>
                  </tr>
                ) : (
                  filteredExceptions.map((exception) => (
                    <tr key={exception._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedExceptions.includes(exception._id)}
                          onChange={() => {
                            if (selectedExceptions.includes(exception._id)) {
                              setSelectedExceptions(selectedExceptions.filter(id => id !== exception._id));
                            } else {
                              setSelectedExceptions([...selectedExceptions, exception._id]);
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{exception.employeeName}</div>
                        <div className="text-xs text-gray-500">{exception.employeeCode}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-800">
                          {exception.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getSeverityBadge(exception.severity)}`}>
                          {exception.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700 max-w-xs truncate">{exception.description}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          exception.status === 'resolved' ? 'bg-green-200 text-green-800' :
                          exception.status === 'escalated' ? 'bg-red-200 text-red-800' :
                          'bg-yellow-200 text-yellow-800'
                        }`}>
                          {exception.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setCurrentException(exception);
                              setShowResolutionModal(true);
                            }}
                            className="text-blue-600 hover:bg-blue-50 p-2 rounded transition"
                            title="View & Resolve"
                          >
                            <Eye size={18} />
                          </button>
                          {exception.status === 'open' && (
                            <button
                              onClick={() => {
                                setCurrentException(exception);
                                setShowResolutionModal(true);
                              }}
                              className="text-green-600 hover:bg-green-50 p-2 rounded transition"
                              title="Resolve"
                            >
                              <Check size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Resolution Modal */}
      {showResolutionModal && currentException && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">Resolve Exception</h3>
              <button
                onClick={() => {
                  setShowResolutionModal(false);
                  setResolutionNote('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Employee</p>
                <p className="text-base">{currentException.employeeName} ({currentException.employeeCode})</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700">Exception Type</p>
                <p className="text-base">{currentException.type}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700">Severity</p>
                <span className={`px-3 py-1 rounded text-sm font-semibold ${getSeverityBadge(currentException.severity)}`}>
                  {currentException.severity}
                </span>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700">Description</p>
                <p className="text-base">{currentException.description}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MessageSquare size={16} className="inline mr-1" />
                  Resolution Note *
                </label>
                <textarea
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="Describe how this exception was resolved..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowResolutionModal(false);
                    setResolutionNote('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleResolveException(currentException._id)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                >
                  <Check size={18} />
                  Resolve Exception
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExceptionResolutionPage;