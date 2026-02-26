import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = ({ setIsAuthenticated, setEmployees }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (credentials.username === 'testuser' && credentials.password === 'Test123') {
      try {
        setLoading(true);
        
        const apiUrl = 'https://backend.jotish.in/backend_dev/gettabledata.php';
        
        const response = await axios.post(
          apiUrl,
          {
            username: 'test',
            password: '123456'
          },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log('API Response:', response.data);
        
        // Check the actual structure of the response
        if (response.data) {
          // Try to extract employee data - adjust this based on actual API response
          let employeeData = [];
          
          if (Array.isArray(response.data)) {
            employeeData = response.data;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            employeeData = response.data.data;
          } else if (response.data.employees && Array.isArray(response.data.employees)) {
            employeeData = response.data.employees;
          } else if (response.data.results && Array.isArray(response.data.results)) {
            employeeData = response.data.results;
          } else if (typeof response.data === 'object') {
            // If it's a single object, wrap it in an array
            employeeData = [response.data];
          }
          
          if (employeeData.length > 0) {
            setEmployees(employeeData);
            setIsAuthenticated(true);
            localStorage.setItem('isAuthenticated', 'true');
            navigate('/employees');
          } else {
            setError('No employee data found in response');
            console.log('Response structure:', response.data);
          }
        } else {
          setError('Empty response from server');
        }
      } catch (err) {
        console.error('API Error:', err);
        setError('Failed to fetch employee data. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      setError('Invalid username or password. Use: testuser / Test123');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Employee Dashboard</h2>
          <p className="text-gray-600">Sign in to access your account</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </span>
              <input
                type="text"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter username"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔑
              </span>
              <input
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-6 text-center">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">Demo Credentials:</p>
            <p className="text-sm">
              <code className="bg-gray-200 px-2 py-1 rounded">testuser</code>
              <span className="mx-2">/</span>
              <code className="bg-gray-200 px-2 py-1 rounded">Test123</code>
            </p>
            <p className="text-xs text-gray-400 mt-2">
              (API uses different credentials automatically)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;