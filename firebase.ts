import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User, signInAnonymously } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, onSnapshot, getDocFromServer, writeBatch } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const dbId = firebaseConfig.firestoreDatabaseId || '(default)';
export const db = getFirestore(app, dbId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// For debugging in browser console
(window as any).firebaseDebug = { app, db, auth, config: firebaseConfig };

export { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot,
  writeBatch,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  signInAnonymously,
  type User
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error Details:', errInfo);
  
  if (errInfo.error.includes('permission-denied')) {
    alert('Permission Denied: You do not have access to this data. Please ensure you are logged in as an administrator and have applied the security rules in the Firebase Console.');
  } else if (errInfo.error.includes('not-found')) {
    alert('Database Not Found: Please ensure you have enabled Cloud Firestore in your Firebase Console.');
  } else {
    alert(`Firebase Error: ${errInfo.error}`);
  }
  
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  console.log('Testing Firebase connection...');
  try {
    const testDoc = await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase connection test successful');
  } catch (error: any) {
    console.warn('Firebase connection test warning:', error.message);
    if (error.message.includes('the client is offline')) {
      console.error("Firebase is offline. Check your internet or configuration.");
    } else if (error.message.includes('permission-denied')) {
      console.info("Note: Permission denied for test connection is expected if rules are strict.");
    }
  }
}
testConnection();
