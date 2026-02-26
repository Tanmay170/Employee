import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { FiArrowLeft, FiTrendingUp, FiTrendingDown, FiActivity } from 'react-icons/fi';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const SalaryChart = ({ employees, loading }) => {
  const navigate = useNavigate();
  const employeeArray = Array.isArray(employees) ? employees : [];

  const topEmployees = employeeArray.slice(0, 10);

  if (loading) {
    return (
      <div className="card w-full max-w-5xl text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Loading Salary Analysis</h2>
        <p className="text-gray-600">Please wait while we fetch employee salaries.</p>
      </div>
    );
  }

  if (topEmployees.length === 0) {
    return (
      <div className="card w-full max-w-5xl text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">No Salary Data Available</h2>
        <p className="text-gray-600 mb-6">Employee salary data is unavailable right now.</p>
        <button onClick={() => navigate('/employees')} className="btn-secondary flex items-center gap-2 mx-auto">
          <FiArrowLeft /> Back to List
        </button>
      </div>
    );
  }

  const chartData = {
    labels: topEmployees.map(emp => emp.employee_name?.split(' ')[0] || 'N/A'),
    datasets: [
      {
        label: 'Salary (USD)',
        data: topEmployees.map(emp => parseFloat(emp.employee_salary) || 0),
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 2,
        borderRadius: 8,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      },
      title: {
        display: true,
        text: 'Top 10 Employees by Salary',
        font: {
          size: 20,
          weight: 'bold'
        },
        color: '#1f2937'
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#f3f4f6',
        bodyColor: '#d1d5db',
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: function (value) {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(value);
          }
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  const salaries = topEmployees.map(emp => parseFloat(emp.employee_salary) || 0);
  const maxSalary = Math.max(...salaries);
  const minSalary = Math.min(...salaries);
  const avgSalary = salaries.reduce((a, b) => a + b, 0) / salaries.length;

  return (
    <div className="card w-full max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Salary Analysis</h2>
        <button onClick={() => navigate('/employees')} className="btn-secondary flex items-center gap-2">
          <FiArrowLeft /> Back to List
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="stats-card">
          <div className="flex items-center gap-3 mb-2">
            <FiTrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-700">Highest Salary</h3>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(maxSalary)}
          </p>
        </div>

        <div className="stats-card">
          <div className="flex items-center gap-3 mb-2">
            <FiTrendingDown className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-gray-700">Lowest Salary</h3>
          </div>
          <p className="text-2xl font-bold text-red-600">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(minSalary)}
          </p>
        </div>

        <div className="stats-card">
          <div className="flex items-center gap-3 mb-2">
            <FiActivity className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-gray-700">Average Salary</h3>
          </div>
          <p className="text-2xl font-bold text-indigo-600">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(avgSalary)}
          </p>
        </div>
      </div>

      <div className="h-[500px] bg-gray-50 rounded-xl p-6">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default SalaryChart;