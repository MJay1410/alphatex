import React, { useState, useEffect } from 'react';
import { MapPin, CheckCircle, LogIn, LogOut, Clock } from 'lucide-react';
import { 
  getCurrentPosition, 
  isWithinGeofence, 
  getGeofenceSettings, 
  formatInWestAfricaTimezone, 
  getWestAfricaISOString,
  formatTimeElapsed
} from '../utils/geofence';
import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const Attendance: React.FC = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [lastAttendance, setLastAttendance] = useState<string | null>(null);
  const [lastCheckout, setLastCheckout] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [targetLocation, setTargetLocation] = useState<{ lat: number; lng: number; radius: number }>({ lat: 0, lng: 0, radius: 100 });
  const [elapsedTime, setElapsedTime] = useState<string>("");
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isCheckedIn && lastAttendance) {
      interval = setInterval(() => {
        // Parse the formatted time string (in West Africa timezone) back to Date
        try {
          // Since we're using the same timezone for both times, 
          // we can use local date parsing which will be consistent
          const startTime = new Date(lastAttendance).getTime();
          const currentTime = new Date().getTime();
          const diff = Math.floor((currentTime - startTime) / 1000);
          
          setElapsedTime(formatTimeElapsed(diff));
        } catch (error) {
          console.error('Error calculating elapsed time:', error);
        }
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isCheckedIn, lastAttendance]);

  useEffect(() => {
    // Fetch target location from Firestore
    const fetchTargetLocation = async () => {
      try {
        setLoading(true);
        const settings = await getGeofenceSettings();
        setTargetLocation({
          lat: settings.lat,
          lng: settings.lng,
          radius: settings.radius
        });
      } catch (error) {
        console.error('Error fetching geofence settings:', error);
        alert('Failed to load geofence settings from Firestore. Please contact the administrator.');
      } finally {
        setLoading(false);
      }
    };

    fetchTargetLocation();
  }, []);

  const saveAttendanceRecord = async (type: 'check-in' | 'check-out', latitude: number, longitude: number) => {
    try {
      console.log('Attempting to save attendance record...');
      const attendanceRef = collection(db, 'asl_attendances');
      
      if (!currentUser) {
        throw new Error('No user is currently logged in');
      }

      // Create the record with more detailed information
      const record = {
        type,
        latitude,
        longitude,
        timestamp: serverTimestamp(),
        createdAt: getWestAfricaISOString(),
        timezone: "Africa/Lagos", // West Africa (GMT+1)
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language
        },
        userId: currentUser.uid,
        userEmail: currentUser.email
      };

      console.log('Record data:', record);
      
      // Save the document
      const docRef = await addDoc(attendanceRef, record);
      console.log('Document saved with ID:', docRef.id);

      // Verify the record was saved by fetching it
      const querySnapshot = await getDocs(collection(db, 'asl_attendances'));
      console.log('Total records in collection:', querySnapshot.size);
      
      // Log all records for debugging
      querySnapshot.forEach((doc) => {
        console.log('Record:', doc.id, doc.data());
      });

      return docRef.id;
    } catch (error) {
      console.error('Detailed error saving attendance record:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw error;
    }
  };

  const handleLocation = async (type: 'check-in' | 'check-out') => {
    try {
      setLoading(true);
      console.log('Getting current position...');
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;
      
      console.log('Current position:', { latitude, longitude });
      setCurrentLocation({ lat: latitude, lng: longitude });

      try {
        const withinGeofence = await isWithinGeofence(latitude, longitude);
        if (withinGeofence) {
          const timestamp = formatInWestAfricaTimezone(new Date());
          console.log('Within geofence, saving record...');
          
          try {
            // Save to Firestore
            const docId = await saveAttendanceRecord(type, latitude, longitude);
            console.log('Successfully saved record with ID:', docId);

            if (type === 'check-in') {
              setLastAttendance(timestamp);
              setIsCheckedIn(true);
              setElapsedTime(formatTimeElapsed(0));
              alert('Check-in recorded successfully!');
            } else {
              setLastCheckout(timestamp);
              setIsCheckedIn(false);
              setElapsedTime(formatTimeElapsed(0));
              alert('Check-out recorded successfully!');
            }
          } catch (saveError) {
            console.error('Error saving to Firestore:', saveError);
            alert('Failed to save attendance record. Please try again.');
          }
        } else {
          alert('You must be within range of the designated location');
        }
      } catch (geofenceError) {
        console.error('Error checking geofence:', geofenceError);
        alert('Could not verify location due to missing geofence settings. Please contact the administrator.');
      }
    } catch (error) {
      console.error('Error in handleLocation:', error);
      alert('Failed to record attendance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto pt-16 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
          <div className="text-center">
            <div className="inline-block p-3 bg-blue-100 rounded-full">
              <MapPin className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">
              Attendance System
            </h1>
            <p className="mt-2 text-gray-600">
              Record your attendance when you're within range of the designated location
            </p>
            <p className="mt-1 text-xs text-indigo-600">
              Using West Africa Time (GMT+1)
            </p>
          </div>

          <div className="space-y-4">
            {isCheckedIn && (
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-6 shadow-lg transform hover:scale-105 transition-transform duration-300">
                <div className="flex flex-col items-center justify-center">
                  <div className="flex items-center space-x-3 mb-2">
                    <Clock className="w-8 h-8 text-white animate-pulse" />
                    <p className="text-white text-lg font-semibold">Time Elapsed</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="bg-white/20 rounded-lg px-4 py-2">
                      <span className="text-5xl font-bold text-white tabular-nums">
                        {elapsedTime}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleLocation('check-in')}
                disabled={loading}
                className={`py-3 px-4 rounded-lg text-white font-medium transition flex items-center justify-center
                  ${loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                <LogIn className="w-4 h-4 mr-2" />
                {loading ? 'Checking...' : 'Check In'}
              </button>

              <button
                onClick={() => handleLocation('check-out')}
                disabled={loading}
                className={`py-3 px-4 rounded-lg text-white font-medium transition flex items-center justify-center
                  ${loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-red-600 hover:bg-red-700'}`}
              >
                <LogOut className="w-4 h-4 mr-2" />
                {loading ? 'Checking...' : 'Check Out'}
              </button>
            </div>

            {currentLocation && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="space-y-2">
                  <p className="text-sm text-blue-700">
                    <span className="font-semibold">Current Location:</span>
                  </p>
                  <p className="text-sm text-blue-700">
                    Latitude: {currentLocation.lat.toFixed(7)}
                  </p>
                  <p className="text-sm text-blue-700">
                    Longitude: {currentLocation.lng.toFixed(7)}
                  </p>
                </div>
              </div>
            )}

            {(lastAttendance || lastCheckout) && (
              <div className="space-y-3">
                {lastAttendance && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      <p className="text-sm text-green-700">
                        Last check-in: {lastAttendance}
                      </p>
                    </div>
                  </div>
                )}
                
                {lastCheckout && (
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-red-500 mr-2" />
                      <p className="text-sm text-red-700">
                        Last check-out: {lastCheckout}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <div className="flex flex-col items-center justify-center text-sm">
              <div className="flex items-center text-gray-500 mb-1">
                <MapPin className="w-4 h-4 mr-1" />
                <span>Target: {targetLocation.lat.toFixed(7)}, {targetLocation.lng.toFixed(7)} (Radius: {targetLocation.radius}m)</span>
              </div>
              <div className="text-xs text-gray-400">
                Timezone: West Africa Time (GMT+1)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance; 