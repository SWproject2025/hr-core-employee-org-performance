"use client";
import React, { useState } from 'react';
import { LayoutDashboard, Settings, Play, User, TrendingUp, FileText, Search, Bell, HelpCircle, Eye, Edit } from 'lucide-react';

export const Sidebar = () => {
    const [activeItem, setActiveItem] = React.useState('dashboard');
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { 
      id: 'payroll-config', 
      icon: Settings, 
      label: 'Payroll Config',
      submenu: [
        { id: 'policies', label: 'Policies' },
        { id: 'pay-grades', label: 'Pay Grades' },
        { id: 'pay-types', label: 'Pay Types' },
        { id: 'overtime-rules', label: 'Overtime Rules' },
        { id: 'shift-differentials', label: 'Shift Differentials' },
        { id: 'allowances', label: 'Allowances' },
        { id: 'multi-currency', label: 'Multi-Currency' },
        { id: 'integrations', label: 'Integrations' }
      ]
    },
    {
      id: 'payroll-runs',
      icon: Play,
      label: 'Payroll Runs',
      submenu: [
        { id: 'all-runs', label: 'All Runs' },
        { id: 'finalized-payslips', label: 'Finalized Payslips' },
        { id: 'exceptions', label: 'Exceptions' },
        { id: 'bank-files', label: 'Bank Files' }
      ]
    },
    {
      id: 'employee-portal',
      icon: User,
      label: 'Employee Portal',
      submenu: [
        { id: 'payslips', label: 'Payslips' },
        { id: 'salary-history', label: 'Salary History' },
        { id: 'disputes', label: 'Disputes' },
        { id: 'claims', label: 'Claims' },
        { id: 'tax-documents', label: 'Tax Documents' }
      ]
    },
    { id: 'reports', icon: TrendingUp, label: 'Reports' }
  ];

  return (
    <div className="w-60 bg-slate-900 text-white h-screen flex flex-col">
      <div className="p-4 border-b border-slate-700">
        <span className="font-semibold text-sm">Payroll System</span>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-2">
        {menuItems.map(item => {
          const Icon = item.icon;
          return (
            <div key={item.id}>
              <button
                onClick={() => {
                  if (!item.submenu) {
                    setActiveItem(item.id);
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
                      onClick={() => setActiveItem(subItem.id)}
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