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

// Custom marker icon based on number of employees
const getMarkerIcon = (count) => {
  const size = count > 10 ? 50 : count > 5 ? 40 : 30;
  return L.divIcon({
    className: 'custom-marker',
    html: `<div class="relative">
      <div class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">${count}</div>
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="${count > 10 ? '#ef4444' : count > 5 ? '#f59e0b' : '#3b82f6'}"/>
      </svg>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size]
  });
};

const EmployeeMap = ({ employees }) => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([20, 0]);
  const [mapZoom, setMapZoom] = useState(2);

  useEffect(() => {
    // Group employees by city
    const locationMap = new Map();

    employees.forEach(emp => {
      if (emp.employee_city && emp.employee_country) {
        const locationKey = `${emp.employee_city}, ${emp.employee_country}`;

        if (!locationMap.has(locationKey)) {
          // Approximate coordinates for major cities
          const coords = getApproximateCoordinates(emp.employee_city, emp.employee_country);
          locationMap.set(locationKey, {
            id: locationKey,
            city: emp.employee_city,
            country: emp.employee_country,
            coordinates: coords,
            employees: [],
            totalSalary: 0
          });
        }

        const location = locationMap.get(locationKey);
        location.employees.push(emp);
        location.totalSalary += parseFloat(emp.employee_salary || 0);
      }
    });

    const locationsArray = Array.from(locationMap.values());
    setLocations(locationsArray);

    // Set map center to first location with most employees if available
    if (locationsArray.length > 0) {
      const largestLocation = locationsArray.reduce((max, loc) =>
        loc.employees.length > max.employees.length ? loc : max
      );
      setMapCenter(largestLocation.coordinates);
      setMapZoom(4);
    }
  }, [employees]);

  const getApproximateCoordinates = (city, country) => {
    // Default coordinates (center of the world)
    const defaultCoords = [20, 0];

    const cityCoords = {
      'New York': [40.7128, -74.0060],
      'London': [51.5074, -0.1278],
      'Tokyo': [35.6762, 139.6503],
      'Sydney': [-33.8688, 151.2093],
      'Paris': [48.8566, 2.3522],
      'Berlin': [52.5200, 13.4050],
      'Moscow': [55.7558, 37.6173],
      'Dubai': [25.2048, 55.2708],
      'Singapore': [1.3521, 103.8198],
      'Mumbai': [19.0760, 72.8777],
      'Shanghai': [31.2304, 121.4737],
      'Los Angeles': [34.0522, -118.2437],
      'Chicago': [41.8781, -87.6298],
      'Houston': [29.7604, -95.3698],
      'Phoenix': [33.4484, -112.0740],
      'Philadelphia': [39.9526, -75.1652],
      'San Antonio': [29.4241, -98.4936],
      'San Diego': [32.7157, -117.1611],
      'Dallas': [32.7767, -96.7970],
      'San Jose': [37.3382, -121.8863],
      'Bangalore': [12.9716, 77.5946],
      'Hyderabad': [17.3850, 78.4867],
      'Chennai': [13.0827, 80.2707],
      'Kolkata': [22.5726, 88.3639],
      'Delhi': [28.7041, 77.1025],
    };

    return cityCoords[city] || defaultCoords;
  };

  const formatSalary = (salary) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(salary);
  };

  const handleLocationClick = (location) => {
    setSelectedLocation(location);
    setMapCenter(location.coordinates);
    setMapZoom(8);
  };

  const handleEmployeeClick = (employeeId) => {
    navigate(`/employee/${employeeId}`);
  };

  // Calculate statistics
  const totalLocations = locations.length;
  const totalEmployees = locations.reduce((acc, loc) => acc + loc.employees.length, 0);
  const totalSalary = locations.reduce((acc, loc) => acc + loc.totalSalary, 0);

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
        <div className="lg:col-span-1 bg-gray-50 rounded-xl p-4 max-h-[600px] overflow-y-auto">
          <h3 className="font-semibold text-gray-700 mb-4">Locations</h3>
          <div className="space-y-2">
            {locations.map((location) => (
              <button
                key={location.id}
                onClick={() => handleLocationClick(location)}
                className={`w-full text-left p-3 rounded-lg transition-all duration-300 ${selectedLocation?.id === location.id
                    ? 'bg-indigo-100 border-2 border-indigo-500'
                    : 'bg-white hover:shadow-md border-2 border-transparent'
                  }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-800">{location.city}</p>
                    <p className="text-sm text-gray-600">{location.country}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${location.employees.length > 10
                      ? 'bg-red-100 text-red-700'
                      : location.employees.length > 5
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                    {location.employees.length} employees
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Total: {formatSalary(location.totalSalary)}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Map Container */}
        <div className="lg:col-span-3 h-[600px] rounded-xl overflow-hidden shadow-2xl">
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

            {locations.map((location) => (
              <Marker
                key={location.id}
                position={location.coordinates}
                icon={getMarkerIcon(location.employees.length)}
                eventHandlers={{
                  click: () => handleLocationClick(location),
                }}
              >
                <Popup>
                  <div className="employee-popup">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {location.city}, {location.country}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      <FiUsers className="inline mr-1" /> {location.employees.length} Employees
                    </p>
                    <p className="text-sm text-gray-600">
                      <FiDollarSign className="inline mr-1" /> Total: {formatSalary(location.totalSalary)}
                    </p>

                    <div className="mt-3 border-t pt-2">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Employees:</p>
                      <div className="max-h-40 overflow-y-auto">
                        {location.employees.slice(0, 5).map(emp => (
                          <div
                            key={emp.employee_id}
                            onClick={() => handleEmployeeClick(emp.employee_id)}
                            className="text-sm p-2 hover:bg-indigo-50 rounded cursor-pointer transition-colors"
                          >
                            <p className="font-medium text-indigo-600">{emp.employee_name}</p>
                            <p className="text-xs text-gray-500">{formatSalary(emp.employee_salary)}</p>
                          </div>
                        ))}
                        {location.employees.length > 5 && (
                          <p className="text-xs text-gray-500 mt-1">
                            +{location.employees.length - 5} more employees
                          </p>
                        )}
                      </div>
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
          <span className="text-sm text-gray-600">1-5 employees</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
          <span className="text-sm text-gray-600">6-10 employees</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
          <span className="text-sm text-gray-600">10+ employees</span>
        </div>
      </div>
    </div>
  );
};

export default EmployeeMap;