import { db } from '../config/firebase';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { auth } from '../config/firebase';

export const setAdminPrivileges = async (email: string) => {
  try {
    // Get the current user
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('No user is currently logged in');
    }

    // Get the user document
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    
    if (!userDoc.exists()) {
      // Create a new user document if it doesn't exist
      await setDoc(doc(db, 'users', currentUser.uid), {
        email: currentUser.email,
        fullName: currentUser.displayName || 'Admin User',
        isAdmin: true,
        role: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } else {
      // Update existing user document
      await updateDoc(doc(db, 'users', currentUser.uid), {
        isAdmin: true,
        role: 'admin',
        updatedAt: new Date().toISOString()
      });
    }

    return true;
  } catch (error) {
    console.error('Error setting admin privileges:', error);
    throw error;
  }
}; 