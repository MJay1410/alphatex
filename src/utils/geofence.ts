import { collection, getDocs, query, limit, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

// Time zone configuration for West Africa (GMT+1)
export const TIMEZONE_OFFSET = 1; // Hours ahead of GMT

// Cache the settings to avoid too many Firestore reads
let cachedGeofenceSettings: {
  lat: number;
  lng: number;
  radius: number;
  lastFetched?: number;
  lastUpdated?: string;
} | null = null;

// Cache expiration time (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

// Helper function to format dates in West Africa timezone (GMT+1)
export function formatInWestAfricaTimezone(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  
  // Format with West Africa timezone offset
  return d.toLocaleString('en-NG', {
    timeZone: 'Africa/Lagos', // Lagos uses GMT+1 (West African Time)
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
}

// Get current date and time in West Africa timezone
export function getCurrentWestAfricaTime(): Date {
  const now = new Date();
  return new Date(now);
}

// Get ISO string with West Africa timezone consideration
export function getWestAfricaISOString(): string {
  return new Date().toISOString();
}

export async function getGeofenceSettings() {
  // Return cached settings if available and not expired
  if (
    cachedGeofenceSettings && 
    cachedGeofenceSettings.lastFetched && 
    Date.now() - cachedGeofenceSettings.lastFetched < CACHE_EXPIRATION
  ) {
    return cachedGeofenceSettings;
  }

  try {
    // First try to get the document with ID 'default'
    const defaultDocRef = doc(db, 'asl_default_location', 'default');
    const defaultDocSnap = await getDoc(defaultDocRef);
    
    if (defaultDocSnap.exists()) {
      // Use the default document if it exists
      const data = defaultDocSnap.data();
      
      if (!data.lat || !data.lng || !data.radius) {
        throw new Error('Geofence data in Firestore is incomplete');
      }
      
      cachedGeofenceSettings = {
        lat: data.lat,
        lng: data.lng,
        radius: data.radius,
        lastFetched: Date.now(),
        lastUpdated: data.lastUpdated
      };
      return cachedGeofenceSettings;
    }
    
    // Fallback: Query for any document in the collection (for backward compatibility)
    const locationQuery = query(collection(db, 'asl_default_location'), limit(1));
    const locationSnapshot = await getDocs(locationQuery);
    
    if (!locationSnapshot.empty) {
      // Get the first document from the query result
      const locationDoc = locationSnapshot.docs[0];
      const data = locationDoc.data();
      
      if (!data.lat || !data.lng || !data.radius) {
        throw new Error('Geofence data in Firestore is incomplete');
      }
      
      cachedGeofenceSettings = {
        lat: data.lat,
        lng: data.lng,
        radius: data.radius,
        lastFetched: Date.now(),
        lastUpdated: data.lastUpdated
      };
      return cachedGeofenceSettings;
    } else {
      // If collection is empty, throw an error
      throw new Error('No geofence settings found in Firestore');
    }
  } catch (error) {
    console.error('Error fetching geofence settings:', error);
    throw error; // Forward the error to the caller
  }
}

// Function to force refresh the cache
export function clearGeofenceCache() {
  cachedGeofenceSettings = null;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export async function isWithinGeofence(latitude: number, longitude: number): Promise<boolean> {
  try {
    const settings = await getGeofenceSettings();
    
    const distance = calculateDistance(
      latitude,
      longitude,
      settings.lat,
      settings.lng
    );
    
    return distance <= settings.radius;
  } catch (error) {
    console.error('Error checking if within geofence:', error);
    throw new Error('Unable to determine if location is within geofence due to missing settings');
  }
}

// Synchronous version for when we already have the settings
export function isWithinGeofenceSync(
  latitude: number, 
  longitude: number, 
  targetLat: number, 
  targetLng: number, 
  radius: number
): boolean {
  const distance = calculateDistance(
    latitude,
    longitude,
    targetLat,
    targetLng
  );
  return distance <= radius;
}

export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    });
  });
}

// Format elapsed time from seconds to a readable string (MM:SS)
export function formatTimeElapsed(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Check if current location is in range of target location
export function checkInRange(
  currentLocation: { lat: number; lng: number } | null,
  targetLocation: { lat: number; lng: number; radius: number }
): { inRange: boolean; distance: number | null } {
  if (!currentLocation) {
    return { inRange: false, distance: null };
  }

  const distance = calculateDistance(
    currentLocation.lat,
    currentLocation.lng,
    targetLocation.lat,
    targetLocation.lng
  );

  return {
    inRange: distance <= targetLocation.radius,
    distance
  };
}