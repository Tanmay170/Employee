import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import EmployeeList from './components/EmployeeList';
import EmployeeDetails from './components/EmployeeDetails';
import PhotoCapture from './components/PhotoCapture';
import SalaryChart from './components/SalaryChart';
import EmployeeMap from './components/EmployeeMap';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

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
              />
            } 
          />
          <Route 
            path="/employees" 
            element={
              isAuthenticated ? 
              <EmployeeList employees={employees} /> : 
              <Navigate to="/" />
            } 
          />
          <Route 
            path="/employee/:id" 
            element={
              isAuthenticated ? 
              <EmployeeDetails employees={employees} /> : 
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
              <SalaryChart employees={employees} /> : 
              <Navigate to="/" />
            } 
          />
          <Route 
            path="/employee-map" 
            element={
              isAuthenticated ? 
              <EmployeeMap employees={employees} /> : 
              <Navigate to="/" />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;