import axios from 'axios';

const EMPLOYEE_API_URL = 'https://backend.jotish.in/backend_dev/gettabledata.php';

const API_CREDENTIALS = {
  username: 'test',
  password: '123456'
};

const CITY_COUNTRY_MAP = {
  Edinburgh: 'United Kingdom',
  London: 'United Kingdom',
  'San Francisco': 'United States',
  'New York': 'United States',
  Tokyo: 'Japan',
  Sidney: 'Australia',
  Singapore: 'Singapore'
};

const inferCountryFromCity = (city) => {
  if (!city || typeof city !== 'string') {
    return 'Unknown';
  }

  return CITY_COUNTRY_MAP[city] || 'Unknown';
};

const normalizeSalary = (salary) => {
  if (typeof salary === 'number') {
    return salary;
  }

  if (typeof salary === 'string') {
    const numeric = salary.replace(/[^0-9.-]/g, '');
    return Number.parseFloat(numeric) || 0;
  }

  return 0;
};

const mapTableRowsToEmployees = (rows) => {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows
    .filter((row) => Array.isArray(row) && row.length > 0)
    .map((row, index) => ({
      employee_name: row[0] || 'N/A',
      employee_designation: row[1] || 'N/A',
      employee_city: row[2] || 'N/A',
      employee_id: row[3] || String(index + 1),
      employee_joining_date: row[4] || '',
      employee_salary: normalizeSalary(row[5]),
      employee_country: inferCountryFromCity(row[2]),
      employee_email: '',
      employee_phone: ''
    }));
};

const extractEmployeeData = (payload) => {
  if (!payload) {
    return [];
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload.data && Array.isArray(payload.data)) {
    return payload.data;
  }

  if (payload.TABLE_DATA && Array.isArray(payload.TABLE_DATA.data)) {
    return mapTableRowsToEmployees(payload.TABLE_DATA.data);
  }

  if (payload.employees && Array.isArray(payload.employees)) {
    return payload.employees;
  }

  if (payload.results && Array.isArray(payload.results)) {
    return payload.results;
  }

  if (typeof payload === 'object') {
    return [payload];
  }

  return [];
};

export const fetchEmployees = async () => {
  const response = await axios.post(EMPLOYEE_API_URL, API_CREDENTIALS, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const employeeData = extractEmployeeData(response.data);

  if (!employeeData.length) {
    throw new Error('No employee data found in response');
  }

  return employeeData;
};
