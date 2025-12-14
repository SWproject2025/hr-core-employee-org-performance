"use client";
import React, { useState } from 'react';
import { LayoutDashboard, Settings, Play, User, TrendingUp, FileText, Calendar, CheckSquare, ClipboardList } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const Sidebar = () => {
    const [activeItem, setActiveItem] = React.useState('dashboard');
    const router = useRouter() 
    const menuItems = [
      { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: '/' },
      { 
        id: 'payroll-config', 
        icon: Settings, 
        label: 'Payroll Config',
        submenu: [
          { id: 'policies', label: 'Policies', path: '/payroll-config/policies' },
          { id: 'pay-grades', label: 'Pay Grades', path: '/payroll-config/pay-grades' },
          { id: 'pay-types', label: 'Pay Types', path: '/payroll-config/pay-types' },
          { id: 'overtime-rules', label: 'Overtime Rules', path: '/payroll-config/overtime-rules' },
          { id: 'shift-differentials', label: 'Shift Differentials', path: '/payroll-config/shift-differentials' },
          { id: 'allowances', label: 'Allowances', path: '/payroll-config/allowances' },
          { id: 'multi-currency', label: 'Multi-Currency', path: '/payroll-config/multi-currency' },
          { id: 'integrations', label: 'Integrations', path: '/payroll-config/integrations' }
        ]
      },
      {
        id: 'payroll-runs',
        icon: Play,
        label: 'Payroll Runs',
        submenu: [
          { id: 'all-runs', label: 'All Runs', path: '/all-runs/runs' },
          { id: 'finalized-payslips', label: 'Finalized Payslips', path: '/payslips' },
          { id: 'exceptions', label: 'Exceptions', path: '/exceptions' },
          { id: 'bank-files', label: 'Bank Files', path: '/bank-files' }
        ]
      },
      {
        id: 'leave-management',
        icon: Calendar,
        label: 'Leave Management',
        submenu: [
          { id: 'my-leaves', label: 'My Leave Requests', path: '/leaves/my-requests' },
          { id: 'leave-approvals', label: 'Leave Approvals', path: '/leaves/approvals' },
          { id: 'leave-balance', label: 'Leave Balance', path: '/leaves/balance' },
          { id: 'leave-config', label: 'Leave Configuration', path: '/leaves/admin/config' }
        ]
      },
      {
        id: 'employee-portal',
        icon: User,
        label: 'Employee Portal',
        submenu: [
          { id: 'payslips', label: 'Payslips', path: '/payslips' },
          { id: 'salary-history', label: 'Salary History', path: '/employee-portal/salary-history' },
          { id: 'disputes', label: 'Disputes', path: '/employee-portal/disputes' },
          { id: 'claims', label: 'Claims', path: '/employee-portal/claims' },
          { id: 'tax-documents', label: 'Tax Documents', path: '/employee-portal/tax-documents' }
        ]
      },
      { id: 'reports', icon: TrendingUp, label: 'Reports', path: '/reports' }
    ];
  

    function handleClick (id : string, path: string) 
    {
      setActiveItem(id)
      router.push(path)
    }  

  return (
    <div className="w-60 bg-slate-900 text-white h-screen flex flex-col overflow-y-auto">
      <div className="p-4 border-b border-slate-700">
        <span className="font-semibold text-sm">HR System</span>
      </div>
      
      <nav className="flex-1 py-2">
        {menuItems.map(item => {
          const Icon = item.icon;
          return (
            <div key={item.id}>
              <button
                onClick={() => {
                  if (!item.submenu && item.path) {
                    handleClick(item.id, item.path);
                  }
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-800 transition-colors ${
                  activeItem === item.id && !item.submenu ? 'bg-blue-600' : ''
                }`}
              >
                <Icon size={18} />
                <span className="flex-1 text-left">{item.label}</span>
              </button>
              
              {item.submenu && (
                <div>
                  {item.submenu.map(subItem => (
                    <button
                      key={subItem.id}
                      onClick={() => handleClick(subItem.id, subItem.path)}
                      className={`w-full flex items-center gap-3 px-4 pl-10 py-2 text-sm hover:bg-slate-800 transition-colors ${
                        activeItem === subItem.id ? 'bg-blue-600' : ''
                      }`}
                    >
                      <FileText size={14} />
                      <span className="text-left">{subItem.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
};