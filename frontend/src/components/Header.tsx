import { Bell, HelpCircle, Search } from "lucide-react";

export const Header = () => {
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
          
          <div className="flex items-center gap-2 ml-2">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-800">Sarah Johnson</div>
              <div className="text-xs text-gray-500">Human Resources</div>
            </div>
            <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              SJ
            </div>
            <span className="text-gray-400 text-sm">▼</span>
          </div>
        </div>
      </header>
    );
  };