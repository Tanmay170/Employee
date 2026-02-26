import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { FiArrowLeft, FiMapPin, FiUsers, FiDollarSign } from 'react-icons/fi';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const COUNTRY_COORDINATES = {
  'United States': [39.8283, -98.5795],
  'United Kingdom': [55.3781, -3.4360],
  Japan: [36.2048, 138.2529],
  Australia: [-25.2744, 133.7751],
  Singapore: [1.3521, 103.8198],
  Unknown: [20, 0]
};

const CITY_COORDINATES = {
  'New York': [40.7128, -74.0060],
  London: [51.5074, -0.1278],
  Tokyo: [35.6762, 139.6503],
  Sydney: [-33.8688, 151.2093],
  Sidney: [-33.8688, 151.2093],
  Edinburgh: [55.9533, -3.1883],
  'San Francisco': [37.7749, -122.4194],
  Singapore: [1.3521, 103.8198]
};

const getEmployeeMarkerIcon = () => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#3b82f6"/>
    </svg>`,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -20]
  });
};

const resolveCoordinates = (country, city) => {
  if (country && COUNTRY_COORDINATES[country]) {
    return COUNTRY_COORDINATES[country];
  }

  if (city && CITY_COORDINATES[city]) {
    return CITY_COORDINATES[city];
  }

  return COUNTRY_COORDINATES.Unknown;
};

const getJitteredPosition = (coordinates, employeeSeed) => {
  const [latitude, longitude] = coordinates;
  const latOffset = ((employeeSeed % 11) - 5) * 0.12;
  const longOffset = (((employeeSeed * 3) % 11) - 5) * 0.12;
  return [latitude + latOffset, longitude + longOffset];
};

const EmployeeMap = ({ employees, loading }) => {
  const navigate = useNavigate();
  const [countryStats, setCountryStats] = useState([]);
  const [employeeMarkers, setEmployeeMarkers] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [mapCenter, setMapCenter] = useState([20, 0]);
  const [mapZoom, setMapZoom] = useState(2);
  const employeeArray = Array.isArray(employees) ? employees : [];

  useEffect(() => {
    const validEmployees = employeeArray.filter((employee) => employee.employee_name);
    const countryMap = new Map();

    const mappedMarkers = validEmployees.map((employee, index) => {
      const country = employee.employee_country || 'Unknown';
      const city = employee.employee_city || '';
      const baseCoordinates = resolveCoordinates(country, city);
      const numericId = Number.parseInt(employee.employee_id, 10);
      const markerSeed = Number.isNaN(numericId) ? index + 1 : numericId;

      if (!countryMap.has(country)) {
        countryMap.set(country, {
          country,
          coordinates: baseCoordinates,
          employees: 0,
          totalSalary: 0
        });
      }

      const countryData = countryMap.get(country);
      countryData.employees += 1;
      countryData.totalSalary += parseFloat(employee.employee_salary || 0);

      return {
        ...employee,
        country,
        position: getJitteredPosition(baseCoordinates, markerSeed)
      };
    });

    const countries = Array.from(countryMap.values()).sort((first, second) => second.employees - first.employees);

    setEmployeeMarkers(mappedMarkers);
    setCountryStats(countries);

    if (countries.length > 0) {
      setMapCenter(countries[0].coordinates);
      setMapZoom(3);
    }
  }, [employeeArray]);

  const formatSalary = (salary) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(salary);
  };

  const handleCountryClick = (country) => {
    setSelectedCountry(country.country);
    setMapCenter(country.coordinates);
    setMapZoom(4);
  };

  const handleEmployeeClick = (employeeId) => {
    navigate(`/employee/${employeeId}`);
  };

  // Calculate statistics
  const totalLocations = countryStats.length;
  const totalEmployees = employeeMarkers.length;
  const totalSalary = countryStats.reduce((acc, country) => acc + country.totalSalary, 0);

  if (loading) {
    return (
      <div className="card w-full max-w-6xl p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Loading Employee Map</h2>
        <p className="text-gray-600">Fetching employee location data from server.</p>
      </div>
    );
  }

  return (
    <div className="card w-full max-w-6xl p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Employee Locations Map</h2>
          <p className="text-gray-600">Geographic distribution of employees</p>
        </div>
        <button onClick={() => navigate('/employees')} className="btn-secondary flex items-center gap-2">
          <FiArrowLeft /> Back to List
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="stats-card flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <FiMapPin className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Locations</p>
            <p className="text-2xl font-bold text-gray-800">{totalLocations}</p>
          </div>
        </div>

        <div className="stats-card flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <FiUsers className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Employees Mapped</p>
            <p className="text-2xl font-bold text-gray-800">{totalEmployees}</p>
          </div>
        </div>

        <div className="stats-card flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <FiDollarSign className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Salary (All Locations)</p>
            <p className="text-2xl font-bold text-gray-800">{formatSalary(totalSalary)}</p>
          </div>
        </div>
      </div>

      {/* Map and Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Locations List Sidebar */}
        <div className="lg:col-span-1 bg-gray-50 rounded-xl p-4 max-h-150 overflow-y-auto">
          <h3 className="font-semibold text-gray-700 mb-4">Countries</h3>
          <div className="space-y-2">
            {countryStats.map((country) => (
              <button
                key={country.country}
                onClick={() => handleCountryClick(country)}
                className={`w-full text-left p-3 rounded-lg transition-all duration-300 ${selectedCountry === country.country
                    ? 'bg-indigo-100 border-2 border-indigo-500'
                    : 'bg-white hover:shadow-md border-2 border-transparent'
                  }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-800">{country.country}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${country.employees > 10
                      ? 'bg-red-100 text-red-700'
                      : country.employees > 5
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                    {country.employees} employees
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Total: {formatSalary(country.totalSalary)}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Map Container */}
        <div className="lg:col-span-3 h-150 rounded-xl overflow-hidden shadow-2xl">
          <MapContainer
            key={`${mapCenter[0]}-${mapCenter[1]}-${mapZoom}`}
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {employeeMarkers
              .filter((employee) => !selectedCountry || employee.country === selectedCountry)
              .map((employee) => (
              <Marker
                key={`${employee.employee_id}-${employee.employee_name}`}
                position={employee.position}
                icon={getEmployeeMarkerIcon()}
              >
                <Popup>
                  <div className="employee-popup">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {employee.employee_name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      <FiMapPin className="inline mr-1" /> {employee.employee_city || 'N/A'}, {employee.country}
                    </p>
                    <p className="text-sm text-gray-600">
                      <FiUsers className="inline mr-1" /> {employee.employee_designation || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">
                      <FiDollarSign className="inline mr-1" /> {formatSalary(employee.employee_salary)}
                    </p>
                    <div className="mt-3">
                      <button
                        onClick={() => handleEmployeeClick(employee.employee_id)}
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        View Employee Details
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
          <span className="text-sm text-gray-600">One pointer per employee</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Use country list to zoom by country</span>
        </div>
      </div>
    </div>
  );
};

export default EmployeeMap;