import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Clock, MapPin, Calendar, Home, History, Settings, Bell, LogOut } from 'lucide-react';
import { db } from '../config/firebase';
import { doc, getDoc, collection, addDoc, serverTimestamp, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { getCurrentPosition, isWithinGeofence, formatInWestAfricaTimezone, getWestAfricaISOString } from '../utils/geofence';
import AttendanceHistory from '../components/AttendanceHistory';

const Dashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState('home');
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [clockInTime, setClockInTime] = useState<string | null>(null);
  const [clockOutTime, setClockOutTime] = useState<string | null>(null);
  const [isClockingIn, setIsClockingIn] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser, navigate]);

  const fetchLocation = async () => {
    try {
      setLocationLoading(true);
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;
      setCurrentLocation({ lat: latitude, lng: longitude });
    } catch (error) {
      console.error('Error fetching location:', error);
    } finally {
      setLocationLoading(false);
    }
  };

  useEffect(() => {
    if (activeMenu === 'attendance') {
      fetchLocation();
    }
  }, [activeMenu]);

  const handleClockIn = async () => {
    try {
      setIsClockingIn(true);
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;
      
      const withinGeofence = await isWithinGeofence(latitude, longitude);
      if (withinGeofence) {
        const timestamp = formatInWestAfricaTimezone(new Date());
        setClockInTime(timestamp);
        setCurrentLocation({ lat: latitude, lng: longitude });

        // Save to Firestore
        const attendanceRef = collection(db, 'asl_attendances');
        await addDoc(attendanceRef, {
          userId: currentUser?.uid,
          type: 'check-in',
          timestamp: serverTimestamp(),
          createdAt: getWestAfricaISOString(),
          latitude,
          longitude,
          timezone: "Africa/Lagos", // West Africa (GMT+1)
          deviceInfo: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language
          }
        });

        alert('Clock in recorded successfully!');
      } else {
        alert('You must be within range of the designated location');
      }
    } catch (error) {
      console.error('Error clocking in:', error);
      alert('Failed to get location. Please enable location services.');
    } finally {
      setIsClockingIn(false);
    }
  };

  const handleClockOut = async () => {
    try {
      setIsClockingIn(true);
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;
      
      const withinGeofence = await isWithinGeofence(latitude, longitude);
      if (withinGeofence) {
        const timestamp = formatInWestAfricaTimezone(new Date());
        setClockOutTime(timestamp);
        setCurrentLocation({ lat: latitude, lng: longitude });

        // Save to Firestore
        const attendanceRef = collection(db, 'asl_attendances');
        await addDoc(attendanceRef, {
          userId: currentUser?.uid,
          type: 'check-out',
          timestamp: serverTimestamp(),
          createdAt: getWestAfricaISOString(),
          latitude,
          longitude,
          timezone: "Africa/Lagos", // West Africa (GMT+1)
          deviceInfo: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language
          }
        });

        alert('Clock out recorded successfully!');
      } else {
        alert('You must be within range of the designated location');
      }
    } catch (error) {
      console.error('Error clocking out:', error);
      alert('Failed to get location. Please enable location services.');
    } finally {
      setIsClockingIn(false);
    }
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
    { id: 'home', label: 'Home', icon: Home },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'history', label: 'History', icon: History },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
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
                <h2 className="text-sm font-semibold text-gray-900">{userData?.fullName || currentUser?.email}</h2>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Quick Stats */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Today's Status</span>
                      <span className="text-green-600 font-medium">Present</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Hours Worked</span>
                      <span className="text-gray-900 font-medium">0:00</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Monthly Attendance</span>
                      <span className="text-gray-900 font-medium">0%</span>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    <div className="text-gray-600 text-sm">No recent activity</div>
                  </div>
                </div>

                {/* Upcoming Events */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Upcoming Events</h3>
                  <div className="space-y-4">
                    <div className="text-gray-600 text-sm">No upcoming events</div>
                  </div>
                </div>
              </div>
            )}

            {activeMenu === 'attendance' && (
              <div className="bg-white shadow rounded-lg p-6">
                <div className="mb-6 grid grid-cols-2 gap-4">
                  <button
                    onClick={handleClockIn}
                    disabled={isClockingIn || !!clockInTime}
                    className={`w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center ${
                      isClockingIn ? 'opacity-75 cursor-not-allowed' : ''
                    } ${clockInTime ? 'bg-green-600 hover:bg-green-700' : ''}`}
                  >
                    <Clock className="h-5 w-5 mr-2" />
                    {isClockingIn ? 'Processing...' : clockInTime ? 'Clocked In' : 'Clock In'}
                  </button>

                  <button
                    onClick={handleClockOut}
                    disabled={isClockingIn || !clockInTime || !!clockOutTime}
                    className={`w-full bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center justify-center ${
                      isClockingIn ? 'opacity-75 cursor-not-allowed' : ''
                    } ${clockOutTime ? 'bg-green-600 hover:bg-green-700' : ''}`}
                  >
                    <Clock className="h-5 w-5 mr-2" />
                    {isClockingIn ? 'Processing...' : clockOutTime ? 'Clocked Out' : 'Clock Out'}
                  </button>
                </div>

                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    {locationLoading ? (
                      <span className="text-gray-600">Fetching location...</span>
                    ) : currentLocation ? (
                      <div className="space-y-1">
                        <span className="text-gray-600">Current Location:</span>
                        <div className="text-sm text-gray-600">
                          <div>Latitude: {currentLocation.lat.toFixed(7)}</div>
                          <div>Longitude: {currentLocation.lng.toFixed(7)}</div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-600">Location not available</span>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Today's Attendance</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-600">Clock In</span>
                      </div>
                      <span className="text-gray-900">{clockInTime || '--:--'}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-600">Clock Out</span>
                      </div>
                      <span className="text-gray-900">{clockOutTime || '--:--'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeMenu === 'history' && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Attendance History</h3>
                <AttendanceHistory />
              </div>
            )}

            {activeMenu === 'notifications' && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notifications</h3>
                <div className="text-gray-600">No notifications</div>
              </div>
            )}

            {activeMenu === 'settings' && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email Notifications</label>
                    <div className="mt-1">
                      <input type="checkbox" className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location Services</label>
                    <div className="mt-1">
                      <input type="checkbox" className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 