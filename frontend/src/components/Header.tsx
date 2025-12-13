"use client"
import { Bell, HelpCircle, Search } from "lucide-react";
import React, { useState } from 'react';
import { getToken, logout } from "../lib/auth";

export const Header = () => {
    const [open, setOpen] = useState(false);
    const token = getToken();

    const handleLogout = () => {
      logout();
      window.location.href = '/employee/login';
    };

    return (
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">Payroll System</h1>

        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="pl-8 pr-4 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
            />
            <Search size={16} className="absolute left-2.5 top-2 text-gray-400" />
          </div>

          <button className="relative p-1.5">
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <button className="p-1.5">
            <HelpCircle size={20} />
          </button>

          <div className="relative ml-2">
            <button
              onClick={() => setOpen((s) => !s)}
              className="flex items-center gap-2 focus:outline-none"
              aria-haspopup="true"
              aria-expanded={open}
            >
              <div className="text-right">
                <div className="text-sm font-medium text-gray-800">Sarah Johnson</div>
                <div className="text-xs text-gray-500">Human Resources</div>
              </div>
              <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                SJ
              </div>
              <span className="text-gray-400 text-sm">▼</span>
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded shadow-lg z-50">
                <ul className="py-1">
                  <li>
                    <a href="/employee/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Profile</a>
                  </li>
                  <li>
                    {token ? (
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</button>
                    ) : (
                      <a href="/employee/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Login</a>
                    )}
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </header>
    );
  };