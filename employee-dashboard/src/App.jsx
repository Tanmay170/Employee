import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Components/Login';
import EmployeeList from './Components/EmployeeList';
import EmployeeDetails from './Components/EmployeeDetails';
import PhotoCapture from './Components/PhotoCapture';
import SalaryChart from './Components/SalaryChart';
import EmployeeMap from './Components/EmployeeMap';
import { fetchEmployees } from './services/employeeApi';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [employeesError, setEmployeesError] = useState('');

  const loadEmployees = useCallback(async () => {
    try {
      setEmployeesLoading(true);
      setEmployeesError('');
      const data = await fetchEmployees();
      setEmployees(data);
    } catch (error) {
      console.error('Failed to load employee data:', error);
      setEmployeesError('Failed to fetch employee data. Please try again.');
      setEmployees([]);
    } finally {
      setEmployeesLoading(false);
    }
  }, []);

  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && employees.length === 0 && !employeesLoading) {
      loadEmployees();
    }
  }, [isAuthenticated, employees.length, employeesLoading, loadEmployees]);

  return (
    <Router>
      <div className="min-h-screen flex items-center justify-center p-4">
        <Routes>
          <Route 
            path="/" 
            element={
              <Login 
                setIsAuthenticated={setIsAuthenticated} 
                setEmployees={setEmployees}
                setEmployeesError={setEmployeesError}
              />
            } 
          />
          <Route 
            path="/employees" 
            element={
              isAuthenticated ? 
              <EmployeeList
                employees={employees}
                loading={employeesLoading}
                error={employeesError}
                onRetry={loadEmployees}
              /> : 
              <Navigate to="/" />
            } 
          />
          <Route 
            path="/employee/:id" 
            element={
              isAuthenticated ? 
              <EmployeeDetails employees={employees} loading={employeesLoading} /> : 
              <Navigate to="/" />
            } 
          />
          <Route 
            path="/capture/:id" 
            element={
              isAuthenticated ? 
              <PhotoCapture /> : 
              <Navigate to="/" />
            } 
          />
          <Route 
            path="/salary-chart" 
            element={
              isAuthenticated ? 
              <SalaryChart employees={employees} loading={employeesLoading} /> : 
              <Navigate to="/" />
            } 
          />
          <Route 
            path="/employee-map" 
            element={
              isAuthenticated ? 
              <EmployeeMap employees={employees} loading={employeesLoading} /> : 
              <Navigate to="/" />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;