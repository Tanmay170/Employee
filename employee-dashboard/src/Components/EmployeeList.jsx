import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const EmployeeList = ({ employees }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/');
  };

  // Ensure employees is an array
  const employeeArray = Array.isArray(employees) ? employees : [];
  
  const filteredEmployees = employeeArray.filter(emp => 
    emp.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employee_city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employee_country?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatSalary = (salary) => {
    if (!salary) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(salary);
  };

  if (!employeeArray || employeeArray.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No Data Available</h2>
            <p className="text-gray-600 mb-6">Unable to load employee data. Please try logging in again.</p>
            <button
              onClick={handleLogout}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Employee Directory</h2>
          <div className="flex gap-3">
            <Link 
              to="/salary-chart" 
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              Salary Chart
            </Link>
            <Link 
              to="/employee-map" 
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              View Map
            </Link>
            <button 
              onClick={handleLogout} 
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name, city, or country..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-indigo-50 rounded-lg p-4">
            <p className="text-sm text-indigo-600">Total Employees</p>
            <p className="text-2xl font-bold text-indigo-800">{filteredEmployees.length}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-600">Total Salary</p>
            <p className="text-2xl font-bold text-green-800">
              {formatSalary(filteredEmployees.reduce((acc, emp) => acc + (parseFloat(emp.employee_salary) || 0), 0))}
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-purple-600">Average Salary</p>
            <p className="text-2xl font-bold text-purple-800">
              {formatSalary(
                filteredEmployees.reduce((acc, emp) => acc + (parseFloat(emp.employee_salary) || 0), 0) / 
                (filteredEmployees.length || 1)
              )}
            </p>
          </div>
        </div>

        {/* Employee Grid */}
        {filteredEmployees.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-150 overflow-y-auto p-2">
            {filteredEmployees.map((employee) => (
              <div
                key={employee.employee_id || Math.random()}
                onClick={() => navigate(`/employee/${employee.employee_id}`)}
                className="bg-gray-50 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all border-2 border-transparent hover:border-indigo-500"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {employee.employee_name || 'N/A'}
                  </h3>
                  <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                    {employee.employee_name?.charAt(0) || '?'}
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">
                    📍 {employee.employee_city || 'N/A'}, {employee.employee_country || 'N/A'}
                  </p>
                  <p className="text-gray-600">
                    💼 {employee.employee_designation || 'N/A'}
                  </p>
                  <p className="text-green-600 font-semibold">
                    💰 {formatSalary(employee.employee_salary)}
                  </p>
                  <p className="text-gray-600">
                    📧 {employee.employee_email || 'N/A'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No employees found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeList;