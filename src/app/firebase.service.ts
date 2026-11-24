import { Injectable } from '@angular/core';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { addDoc, collection, getFirestore, Firestore, serverTimestamp } from 'firebase/firestore';


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA0qxlO3fsSh--9Pmg4zZ6qSLJrLlm5kbA",
  authDomain: "nikah-invitation-yasir.firebaseapp.com",
  projectId: "nikah-invitation-yasir",
  storageBucket: "nikah-invitation-yasir.firebasestorage.app",
  messagingSenderId: "877878155566",
  appId: "1:877878155566:web:756c749c7cc555293782bf"
};

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  private app: FirebaseApp;
  private db: Firestore;
  readonly enabled: boolean;

  constructor() {
    this.enabled = !Object.values(firebaseConfig).some(value => value.startsWith('YOUR_'));
    this.app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    this.db = getFirestore(this.app);
  }

  async submit(collectionName: 'rsvps' | 'duas' | 'feedback', data: Record<string, unknown>): Promise<void> {
    if (!this.enabled) {
      throw new Error('Firebase is not configured. Add your Firebase project settings first.');
    }
    await addDoc(collection(this.db, collectionName), {
      ...data,
      createdAt: serverTimestamp()
    });
  }
}
