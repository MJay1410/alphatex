import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Clock, 
  Home, 
  Settings as SettingsIcon, 
  LogOut,
  Users,
  BarChart,
  Map
} from 'lucide-react';
import { db } from '../config/firebase';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  updateDoc,
  doc,
  setDoc
} from 'firebase/firestore';
import { getCurrentPosition, getGeofenceSettings, clearGeofenceCache, getWestAfricaISOString, formatInWestAfricaTimezone } from '../utils/geofence';

// Import Components
import Employees from '../components/admin/Employees';
import AttendanceComponent from '../components/admin/Attendance';
import Analytics from '../components/admin/Analytics';
import Geofence from '../components/admin/Geofence';
import Settings from '../components/admin/Settings';

interface Employee {
  id: string;
  fullName: string;
  email: string;
  role: string;
  department: string;
}

interface Attendance {
  id: string;
  userId: string;
  clockIn: string;
  clockOut: string | null;
  date: string;
}

interface GeofenceSettings {
  lat: number;
  lng: number;
  radius: number;
  lastUpdated?: string;
}

const AdminDashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState('home');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    averageAttendance: 0
  });
  const [geofenceSettings, setGeofenceSettings] = useState<GeofenceSettings>({
    lat: 0,
    lng: 0,
    radius: 100 // Default radius in meters
  });
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch employees
        const employeesQuery = query(collection(db, 'asl_users'));
        const employeesSnapshot = await getDocs(employeesQuery);
        const employeesData = employeesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Employee[];
        setEmployees(employeesData);

        // Fetch today's attendance
        const today = new Date().toISOString().split('T')[0];
        const attendanceQuery = query(
          collection(db, 'attendance'),
          where('date', '==', today)
        );
        const attendanceSnapshot = await getDocs(attendanceQuery);
        const attendanceData = attendanceSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Attendance[];
        
        // Calculate stats
        setStats({
          totalEmployees: employeesData.length,
          presentToday: attendanceData.filter(a => a.clockIn).length,
          absentToday: employeesData.length - attendanceData.filter(a => a.clockIn).length,
          averageAttendance: 0 // Calculate based on historical data
        });

        // Fetch geofence settings
        try {
          const fetchedSettings = await getGeofenceSettings();
          setGeofenceSettings({
            lat: fetchedSettings.lat,
            lng: fetchedSettings.lng,
            radius: fetchedSettings.radius,
            lastUpdated: fetchedSettings.lastUpdated
          });
        } catch (error) {
          console.error('Failed to fetch geofence settings:', error);
          alert('No geofence settings found. Please set up the geofence location.');
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser, navigate]);

  const handleUpdateGeofence = async () => {
    try {
      // Query to check if any document already exists in the collection
      const locationCollection = collection(db, 'asl_default_location');
      const locationSnapshot = await getDocs(locationCollection);
      
      // Create new settings data with West Africa timezone
      const locationData = {
        lat: geofenceSettings.lat,
        lng: geofenceSettings.lng,
        radius: geofenceSettings.radius,
        updatedAt: getWestAfricaISOString(),
        lastUpdated: formatInWestAfricaTimezone(new Date()),
        timezone: "Africa/Lagos", // West Africa (GMT+1)
      };
      
      if (!locationSnapshot.empty) {
        // Update the existing document
        const docId = locationSnapshot.docs[0].id;
        const docRef = doc(db, 'asl_default_location', docId);
        await updateDoc(docRef, locationData);
      } else {
        // No document exists, create a new one with additional createdAt field
        await setDoc(doc(db, 'asl_default_location', 'default'), {
          ...locationData,
          createdAt: getWestAfricaISOString(),
        });
      }
      
      // Update local state with the new lastUpdated time
      setGeofenceSettings(prev => ({
        ...prev,
        lastUpdated: locationData.lastUpdated
      }));
      
      // Clear the geofence settings cache to ensure fresh data is loaded next time
      clearGeofenceCache();
      
      alert('Geofence settings updated successfully!');
    } catch (error) {
      console.error('Error updating geofence:', error);
      alert('Failed to update geofence settings. Please try again.');
    }
  };

  const handleReactivateLocation = async () => {
    try {
      setLocationLoading(true);
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;
      setGeofenceSettings({
        ...geofenceSettings,
        lat: latitude,
        lng: longitude
      });
      alert('Current location has been reactivated!');
    } catch (error) {
      console.error('Error getting current location:', error);
      alert('Failed to get current location. Please ensure location services are enabled.');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSettingsChange = (name: string, value: number) => {
    setGeofenceSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const menuItems = [
    { id: 'home', label: 'Dashboard', icon: Home },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'analytics', label: 'Analytics', icon: BarChart },
    { id: 'geofence', label: 'Geofence', icon: Map },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
    { id: 'logout', label: 'Logout', icon: LogOut, isDestructive: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg h-screen fixed">
          <div className="p-4 border-b">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-100 rounded-full p-2">
                <User className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Admin Dashboard</h2>
                <p className="text-xs text-gray-500">{currentUser?.email}</p>
              </div>
            </div>
          </div>
          
          <nav className="mt-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => item.id === 'logout' ? handleLogout() : setActiveMenu(item.id)}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium ${
                    item.isDestructive
                      ? 'text-red-600 hover:bg-red-50'
                      : activeMenu === item.id
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="ml-64 flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">
                {menuItems.find(item => item.id === activeMenu)?.label}
              </h1>
            </div>

            {/* Content based on active menu */}
            {activeMenu === 'home' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Total Employees</h3>
                  <p className="text-3xl font-bold text-indigo-600">{stats.totalEmployees}</p>
                </div>
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Present Today</h3>
                  <p className="text-3xl font-bold text-green-600">{stats.presentToday}</p>
                </div>
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Absent Today</h3>
                  <p className="text-3xl font-bold text-red-600">{stats.absentToday}</p>
                </div>
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Average Attendance</h3>
                  <p className="text-3xl font-bold text-blue-600">{stats.averageAttendance}%</p>
                </div>
              </div>
            )}

            {activeMenu === 'employees' && (
              <Employees employees={employees} />
            )}

            {activeMenu === 'attendance' && (
              <AttendanceComponent employees={employees} />
            )}

            {activeMenu === 'analytics' && (
              <Analytics stats={stats} />
            )}

            {activeMenu === 'geofence' && (
              <Geofence 
                geofenceSettings={geofenceSettings} 
                onUpdateGeofence={handleUpdateGeofence}
                onReactivateLocation={handleReactivateLocation}
                locationLoading={locationLoading}
                handleSettingsChange={handleSettingsChange}
              />
            )}

            {activeMenu === 'settings' && (
              <Settings />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 