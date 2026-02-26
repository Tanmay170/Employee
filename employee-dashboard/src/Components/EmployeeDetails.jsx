import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiCamera, FiArrowLeft, FiMail, FiPhone, FiMapPin, FiBriefcase, FiDollarSign } from 'react-icons/fi';

const EmployeeDetails = ({ employees }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const employee = employees.find(emp => emp.employee_id === parseInt(id));

  if (!employee) {
    return (
      <div className="card text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Employee not found</h2>
        <button onClick={() => navigate('/employees')} className="btn-primary flex items-center gap-2 mx-auto">
          <FiArrowLeft /> Back to List
        </button>
      </div>
    );
  }

  const formatSalary = (salary) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(salary);
  };

  return (
    <div className="card w-full max-w-2xl">
      <div className="text-center mb-8">
        <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
          {employee.employee_name?.charAt(0) || '?'}
        </div>
        <h2 className="text-3xl font-bold text-gray-800">{employee.employee_name}</h2>
        <p className="text-gray-600">{employee.employee_designation || 'No designation'}</p>
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <FiMail className="w-5 h-5 text-indigo-600" />
          <span className="text-gray-700">{employee.employee_email || 'N/A'}</span>
        </div>

        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <FiPhone className="w-5 h-5 text-indigo-600" />
          <span className="text-gray-700">{employee.employee_phone || 'N/A'}</span>
        </div>

        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <FiMapPin className="w-5 h-5 text-indigo-600" />
          <span className="text-gray-700">
            {employee.employee_city || 'N/A'}, {employee.employee_country || 'N/A'}
          </span>
        </div>

        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <FiBriefcase className="w-5 h-5 text-indigo-600" />
          <span className="text-gray-700">{employee.employee_designation || 'N/A'}</span>
        </div>

        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <FiDollarSign className="w-5 h-5 text-green-600" />
          <span className="text-gray-700 font-semibold text-lg">
            {formatSalary(employee.employee_salary)}
          </span>
        </div>
      </div>

      <div className="flex gap-4 justify-center">
        <button
          onClick={() => navigate(`/capture/${employee.employee_id}`)}
          className="btn-primary flex items-center gap-2"
        >
          <FiCamera /> Capture Photo
        </button>

        <button
          onClick={() => navigate('/employees')}
          className="btn-secondary flex items-center gap-2"
        >
          <FiArrowLeft /> Back to List
        </button>
      </div>
    </div>
  );
};

export default EmployeeDetails;