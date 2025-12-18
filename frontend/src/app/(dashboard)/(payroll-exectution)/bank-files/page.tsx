"use client"
import React, { useState, useEffect } from 'react';
import { Plus, Download, Eye, FileText, X, Calendar, DollarSign, Users, AlertCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

const BankFilesPage = () => {
  const [payrollRuns, setPayrollRuns] = useState<any[]>([]);
  const [selectedRun, setSelectedRun] = useState<any>(null);
  const [payslips, setPayslips] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    runId: '',
    format: 'CSV',
    bankName: ''
  });

  useEffect(() => {
    fetchPayrollRuns();
  }, []);

  const fetchPayrollRuns = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/payroll-execution/payroll-runs`);
      if (!response.ok) throw new Error('Failed to fetch payroll runs');
      
      const data = await response.json();
      console.log('Fetched runs:', data);
      
      // Filter to only approved/locked runs that have payslips generated
      const eligibleRuns = data.filter((run: any) => 
        run.status === 'APPROVED' || run.status === 'LOCKED'
      );
      
      setPayrollRuns(eligibleRuns);
    } catch (err: any) {
      console.error('Error fetching payroll runs:', err);
      setError(err.message || 'Failed to load payroll runs');
    } finally {
      setLoading(false);
    }
  };

  const fetchPayslipsForRun = async (runId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/payroll-execution/payslips?runId=${runId}`);
      if (!response.ok) throw new Error('Failed to fetch payslips');
      
      const data = await response.json();
      console.log('Fetched payslips:', data);
      setPayslips(data);
      return data;
    } catch (err: any) {
      console.error('Error fetching payslips:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFile = async () => {
    if (!generateForm.runId || !generateForm.format || !generateForm.bankName) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      
      // Fetch payslips for the selected run
      const payslipsData = await fetchPayslipsForRun(generateForm.runId);
      
      if (!payslipsData || payslipsData.length === 0) {
        alert('No payslips found for this payroll run. Please generate payslips first.');
        return;
      }

      // Get run details
      const selectedRunDetails = payrollRuns.find(r => r._id === generateForm.runId);
      
      // Generate file content based on format
      let fileContent = '';
      let fileName = `Payroll_${selectedRunDetails?.runId || 'Unknown'}_${generateForm.bankName}_${new Date().toISOString().split('T')[0]}.${generateForm.format.toLowerCase()}`;
      
      if (generateForm.format === 'CSV') {
        fileContent = generateCSV(payslipsData, selectedRunDetails);
      } else if (generateForm.format === 'TXT') {
        fileContent = generateTXT(payslipsData, selectedRunDetails);
      } else if (generateForm.format === 'XML') {
        fileContent = generateXML(payslipsData, selectedRunDetails);
      } else if (generateForm.format === 'JSON') {
        fileContent = generateJSON(payslipsData, selectedRunDetails);
      }

      // Create and download file
      const blob = new Blob([fileContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      alert(`Bank file generated successfully!\n\nFile: ${fileName}\nEmployees: ${payslipsData.length}\nTotal: $${calculateTotal(payslipsData).toLocaleString()}`);
      
      setShowGenerateModal(false);
      setGenerateForm({ runId: '', format: 'CSV', bankName: '' });
    } catch (err: any) {
      setError(err.message || 'Failed to generate bank file');
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const generateCSV = (payslips: any[], runDetails: any) => {
    let csv = 'Employee ID,Employee Name,Bank Name,Account Number,Net Pay,Run ID,Period\n';
    
    payslips.forEach(slip => {
      csv += `"${slip.employeeCode || slip.employeeId}",`;
      csv += `"${slip.employeeName || 'Unknown'}",`;
      csv += `"${generateForm.bankName}",`;
      csv += `"XXXX-XXXX-${Math.random().toString().slice(2, 6)}",`; // Mock account
      csv += `"${slip.netPay || 0}",`;
      csv += `"${runDetails?.runId || 'N/A'}",`;
      csv += `"${runDetails?.payrollPeriod ? new Date(runDetails.payrollPeriod).toLocaleDateString() : 'N/A'}"\n`;
    });
    
    csv += `\nTotal Records,${payslips.length}\n`;
    csv += `Total Amount,${calculateTotal(payslips)}\n`;
    
    return csv;
  };

  const generateTXT = (payslips: any[], runDetails: any) => {
    let txt = 'BANK TRANSFER FILE\n';
    txt += '='.repeat(80) + '\n';
    txt += `Run ID: ${runDetails?.runId || 'N/A'}\n`;
    txt += `Period: ${runDetails?.payrollPeriod ? new Date(runDetails.payrollPeriod).toLocaleDateString() : 'N/A'}\n`;
    txt += `Bank: ${generateForm.bankName}\n`;
    txt += `Generated: ${new Date().toLocaleString()}\n`;
    txt += '='.repeat(80) + '\n\n';
    
    payslips.forEach((slip, index) => {
      txt += `${(index + 1).toString().padStart(4, '0')} | `;
      txt += `${(slip.employeeCode || slip.employeeId).padEnd(15)} | `;
      txt += `${(slip.employeeName || 'Unknown').padEnd(30)} | `;
      txt += `$${(slip.netPay || 0).toFixed(2).padStart(12)}\n`;
    });
    
    txt += '\n' + '='.repeat(80) + '\n';
    txt += `Total Records: ${payslips.length}\n`;
    txt += `Total Amount: $${calculateTotal(payslips).toFixed(2)}\n`;
    
    return txt;
  };

  const generateXML = (payslips: any[], runDetails: any) => {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<BankTransferFile>\n';
    xml += `  <RunID>${runDetails?.runId || 'N/A'}</RunID>\n`;
    xml += `  <Period>${runDetails?.payrollPeriod ? new Date(runDetails.payrollPeriod).toISOString() : 'N/A'}</Period>\n`;
    xml += `  <Bank>${generateForm.bankName}</Bank>\n`;
    xml += `  <GeneratedDate>${new Date().toISOString()}</GeneratedDate>\n`;
    xml += '  <Transfers>\n';
    
    payslips.forEach(slip => {
      xml += '    <Transfer>\n';
      xml += `      <EmployeeID>${slip.employeeCode || slip.employeeId}</EmployeeID>\n`;
      xml += `      <EmployeeName>${slip.employeeName || 'Unknown'}</EmployeeName>\n`;
      xml += `      <NetPay>${slip.netPay || 0}</NetPay>\n`;
      xml += '    </Transfer>\n';
    });
    
    xml += '  </Transfers>\n';
    xml += `  <TotalRecords>${payslips.length}</TotalRecords>\n`;
    xml += `  <TotalAmount>${calculateTotal(payslips)}</TotalAmount>\n`;
    xml += '</BankTransferFile>';
    
    return xml;
  };

  const generateJSON = (payslips: any[], runDetails: any) => {
    const data = {
      runId: runDetails?.runId || 'N/A',
      period: runDetails?.payrollPeriod || null,
      bank: generateForm.bankName,
      generatedDate: new Date().toISOString(),
      transfers: payslips.map(slip => ({
        employeeId: slip.employeeCode || slip.employeeId,
        employeeName: slip.employeeName || 'Unknown',
        department: slip.department || 'N/A',
        netPay: slip.netPay || 0
      })),
      totalRecords: payslips.length,
      totalAmount: calculateTotal(payslips)
    };
    
    return JSON.stringify(data, null, 2);
  };

  const calculateTotal = (payslips: any[]) => {
    return payslips.reduce((sum, slip) => sum + (slip.netPay || 0), 0);
  };

  const handlePreviewRun = async (run: any) => {
    setSelectedRun(run);
    await fetchPayslipsForRun(run._id);
    setShowPreviewModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Bank Files</h1>
            <p className="text-gray-500 mt-1">Generate bank transfer files from approved payroll runs</p>
          </div>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition shadow-md"
          >
            <Plus size={20} />
            Generate Bank File
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Info Banner */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="text-sm">
              <p className="font-semibold text-blue-900 mb-1">ℹ️ How Bank Files Work</p>
              <ul className="text-blue-800 space-y-1 list-disc list-inside">
                <li>Select an approved payroll run</li>
                <li>Files are generated from actual payslip data</li>
                <li>Choose your preferred format (CSV, TXT, XML, JSON)</li>
                <li>Files include employee details and net pay amounts</li>
                <li>Downloaded files can be uploaded to your bank's system</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Available Runs Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Available Payroll Runs</h2>
            <p className="text-sm text-gray-600 mt-1">
              {payrollRuns.length} approved run{payrollRuns.length !== 1 ? 's' : ''} available
            </p>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading payroll runs...</p>
            </div>
          ) : payrollRuns.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <FileText size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">No approved payroll runs available</p>
              <p className="text-sm mt-2">Approve a payroll run first to generate bank files</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Run ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employees</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Net Pay</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payrollRuns.map((run) => (
                    <tr key={run._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {run.runId || run._id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-gray-400" />
                          {new Date(run.payrollPeriod).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{run.entity || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Users size={16} className="text-gray-400" />
                          {run.employees || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-600">
                        <div className="flex items-center gap-2">
                          <DollarSign size={16} />
                          {(run.totalnetpay || 0).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          run.status === 'APPROVED' ? 'bg-green-200 text-green-800' :
                          run.status === 'LOCKED' ? 'bg-purple-200 text-purple-800' :
                          'bg-gray-200 text-gray-800'
                        }`}>
                          {run.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handlePreviewRun(run)}
                            className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition"
                            title="Preview Payslips"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setGenerateForm({ ...generateForm, runId: run._id });
                              setShowGenerateModal(true);
                            }}
                            className="text-green-600 hover:text-green-800 p-1 hover:bg-green-50 rounded transition"
                            title="Generate Bank File"
                          >
                            <Download size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Generate Bank File Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Generate Bank File</h3>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payroll Run <span className="text-red-500">*</span>
                </label>
                <select
                  value={generateForm.runId}
                  onChange={(e) => setGenerateForm({ ...generateForm, runId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- Select Payroll Run --</option>
                  {payrollRuns.map(run => (
                    <option key={run._id} value={run._id}>
                      {run.runId || run._id} - {new Date(run.payrollPeriod).toLocaleDateString()} ({run.employees} employees)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={generateForm.bankName}
                  onChange={(e) => setGenerateForm({ ...generateForm, bankName: e.target.value })}
                  placeholder="e.g., ABC Bank, XYZ Bank"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Format <span className="text-red-500">*</span>
                </label>
                <select
                  value={generateForm.format}
                  onChange={(e) => setGenerateForm({ ...generateForm, format: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="CSV">CSV - Comma Separated Values</option>
                  <option value="TXT">TXT - Fixed Width Text</option>
                  <option value="XML">XML - Structured Data</option>
                  <option value="JSON">JSON - JavaScript Object</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateFile}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {loading ? 'Generating...' : 'Generate & Download'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Payslips Modal */}
      {showPreviewModal && selectedRun && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Payslips Preview - {selectedRun.runId || selectedRun._id}</h2>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading payslips...</p>
                </div>
              ) : payslips.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText size={48} className="mx-auto mb-4 text-gray-400" />
                  <p>No payslips found for this run</p>
                </div>
              ) : (
                <div>
                  <div className="mb-4 bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Summary</h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Employees</p>
                        <p className="text-xl font-bold">{payslips.length}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total Net Pay</p>
                        <p className="text-xl font-bold text-green-600">${calculateTotal(payslips).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Period</p>
                        <p className="text-xl font-bold">{new Date(selectedRun.payrollPeriod).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Employee ID</th>
                        <th className="px-4 py-2 text-left">Name</th>
                        <th className="px-4 py-2 text-left">Department</th>
                        <th className="px-4 py-2 text-right">Gross</th>
                        <th className="px-4 py-2 text-right">Deductions</th>
                        <th className="px-4 py-2 text-right">Net Pay</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {payslips.map(slip => (
                        <tr key={slip._id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 font-mono">{slip.employeeCode || slip.employeeId}</td>
                          <td className="px-4 py-2">{slip.employeeName || 'Unknown'}</td>
                          <td className="px-4 py-2">{slip.department || 'N/A'}</td>
                          <td className="px-4 py-2 text-right">${(slip.grossSalary || 0).toLocaleString()}</td>
                          <td className="px-4 py-2 text-right text-red-600">-${(slip.deductions || 0).toLocaleString()}</td>
                          <td className="px-4 py-2 text-right font-semibold text-green-600">${(slip.netPay || 0).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankFilesPage;