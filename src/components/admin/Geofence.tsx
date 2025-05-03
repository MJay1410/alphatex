import React, { useCallback, useState } from 'react';
import { MapPin, RefreshCw, Clock } from 'lucide-react';
import { GoogleMap, useLoadScript, Circle, Marker } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = 'AIzaSyDtQRyjN8gUFF1tLyPgru7YjF7O7wi2Dqw';

interface GeofenceProps {
  geofenceSettings: {
    lat: number;
    lng: number;
    radius: number;
    lastUpdated?: string;
  };
  onUpdateGeofence: () => void;
  onReactivateLocation: () => void;
  locationLoading: boolean;
  handleSettingsChange: (name: string, value: number) => void;
}

const Geofence: React.FC<GeofenceProps> = ({ 
  geofenceSettings, 
  onUpdateGeofence, 
  onReactivateLocation, 
  locationLoading, 
  handleSettingsChange 
}) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [circle, setCircle] = useState<google.maps.Circle | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onCircleLoad = useCallback((circle: google.maps.Circle) => {
    setCircle(circle);
  }, []);

  const onMarkerLoad = useCallback((marker: google.maps.Marker) => {
    setMarker(marker);
  }, []);

  const onCircleDrag = useCallback(() => {
    if (circle) {
      const center = circle.getCenter();
      if (center) {
        handleSettingsChange('lat', center.lat());
        handleSettingsChange('lng', center.lng());
      }
    }
  }, [circle, handleSettingsChange]);

  const onCircleRadiusChange = useCallback(() => {
    if (circle) {
      handleSettingsChange('radius', circle.getRadius());
    }
  }, [circle, handleSettingsChange]);

  const onMarkerDrag = useCallback(() => {
    if (marker && circle) {
      const position = marker.getPosition();
      if (position) {
        handleSettingsChange('lat', position.lat());
        handleSettingsChange('lng', position.lng());
        circle.setCenter(position);
      }
    }
  }, [marker, circle, handleSettingsChange]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center mb-6">
          <div className="bg-indigo-100 rounded-full p-3 mr-4">
            <MapPin className="h-6 w-6 text-indigo-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Geofence Settings</h3>
        </div>
        
        <p className="text-gray-600 mb-6">
          Configure the geofence settings to define the area where employees can clock in and out. 
          These settings will be saved to the <span className="font-medium text-indigo-600">asl_default_location</span> collection in Firestore and used to determine if an employee is within the designated work location.
        </p>

        {geofenceSettings.lastUpdated && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center text-gray-600">
              <Clock className="h-5 w-5 mr-2 text-indigo-500" />
              <span className="text-sm">
                Last updated: <span className="font-medium">{geofenceSettings.lastUpdated}</span>
              </span>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
              Latitude
            </label>
            <input
              type="number"
              id="latitude"
              value={geofenceSettings.lat}
              onChange={(e) => handleSettingsChange('lat', parseFloat(e.target.value))}
              step="0.0000001"
              className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
              Longitude
            </label>
            <input
              type="number"
              id="longitude"
              value={geofenceSettings.lng}
              onChange={(e) => handleSettingsChange('lng', parseFloat(e.target.value))}
              step="0.0000001"
              className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        
        <div className="mb-6">
          <label htmlFor="radius" className="block text-sm font-medium text-gray-700 mb-1">
            Radius (meters)
          </label>
          <input
            type="number"
            id="radius"
            value={geofenceSettings.radius}
            onChange={(e) => handleSettingsChange('radius', parseInt(e.target.value, 10))}
            min="10"
            max="1000"
            className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <p className="mt-1 text-sm text-gray-500">
            Set the radius between 10-1000 meters to define the allowed check-in/out area
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <button
            onClick={onUpdateGeofence}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save Geofence Settings
          </button>
          
          <button
            onClick={onReactivateLocation}
            disabled={locationLoading}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
              locationLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {locationLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Getting Location...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Use Current Location
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Interactive Google Map */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Geofence Visualization</h3>
        <div className="h-[600px] w-full rounded-lg overflow-hidden">
          <GoogleMap
            zoom={15}
            center={{ lat: geofenceSettings.lat, lng: geofenceSettings.lng }}
            mapContainerClassName="w-full h-full"
            onLoad={onMapLoad}
            options={{
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false,
            }}
          >
            <Marker
              position={{ lat: geofenceSettings.lat, lng: geofenceSettings.lng }}
              draggable={true}
              onLoad={onMarkerLoad}
              onDragEnd={onMarkerDrag}
            />
            <Circle
              center={{ lat: geofenceSettings.lat, lng: geofenceSettings.lng }}
              radius={geofenceSettings.radius}
              options={{
                fillColor: '#4F46E5',
                fillOpacity: 0.2,
                strokeColor: '#4F46E5',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                draggable: true,
                editable: true,
              }}
              onLoad={onCircleLoad}
              onDragEnd={onCircleDrag}
              onRadiusChanged={onCircleRadiusChange}
            />
          </GoogleMap>
        </div>
        <p className="mt-4 text-sm text-gray-500">
          Drag the marker or circle to adjust the geofence location and size. The coordinates and radius will update automatically.
        </p>
      </div>
    </div>
  );
};

export default Geofence; 