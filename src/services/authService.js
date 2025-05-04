import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    updateProfile,
    sendPasswordResetEmail,
    GoogleAuthProvider,
    signInWithPopup
  } from 'firebase/auth';
  import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
  import { auth, db } from '@/lib/firebase';

  /**
   * Register a new user and create Firestore profile with defaults
   */
  export async function registerUser(email, password, displayName) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { user } = userCredential;
      await updateProfile(user, { displayName });

      const userRef = doc(db, 'users', user.uid);
      const now = new Date();
      const defaultPrefs = { theme: 'light', language: 'fr', showCompletedTasks: true, defaultPriority: 'medium' };
      const userData = {
        uid: user.uid,
        email: user.email || email,
        displayName,
        photoURL: user.photoURL || '',
        createdAt: now,
        lastLogin: now,
        preferences: defaultPrefs
      };
      await setDoc(userRef, {
        ...userData,
        createdAt: Timestamp.fromDate(now),
        lastLogin: Timestamp.fromDate(now)
      });
      return userData;
    } catch (err) {
      console.error('registerUser error:', err);
      const code = err.code;
      if (code === 'auth/email-already-in-use') throw new Error('Cette adresse email est déjà utilisée.');
      if (code === 'auth/weak-password') throw new Error('Le mot de passe doit contenir au moins 6 caractères.');
      if (code === 'auth/invalid-email') throw new Error('Adresse email invalide.');
      throw err;
    }
  }

  /**
   * Login with email/password and update lastLogin
   */
  export async function loginUser(email, password) {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      const now = new Date();
      if (userDoc.exists()) {
        const data = userDoc.data();
        await setDoc(userRef, { lastLogin: Timestamp.fromDate(now) }, { merge: true });
        return { ...data, createdAt: data.createdAt.toDate(), lastLogin: now };
      } else {
        const defaultPrefs = { theme: 'light', language: 'fr', showCompletedTasks: true, defaultPriority: 'medium' };
        const newUser = { uid: user.uid, email: user.email, displayName: user.displayName || '', photoURL: user.photoURL || '', createdAt: now, lastLogin: now, preferences: defaultPrefs };
        await setDoc(userRef, { ...newUser, createdAt: Timestamp.fromDate(now), lastLogin: Timestamp.fromDate(now) });
        return newUser;
      }
    } catch (err) {
      console.error('loginUser error:', err);
      const code = err.code;
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password') throw new Error('Email ou mot de passe incorrect.');
      if (code === 'auth/too-many-requests') throw new Error('Trop de tentatives. Réessayez plus tard.');
      throw err;
    }
  }

  /**
   * Sign in with Google and sync Firestore profile
   */
  export async function loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      const now = new Date();
      if (userDoc.exists()) {
        const data = userDoc.data();
        await setDoc(userRef, { lastLogin: Timestamp.fromDate(now) }, { merge: true });
        return { ...data, createdAt: data.createdAt.toDate(), lastLogin: now };
      } else {
        const defaultPrefs = { theme: 'light', language: 'fr', showCompletedTasks: true, defaultPriority: 'medium' };
        const newUser = { uid: user.uid, email: user.email, displayName: user.displayName, photoURL: user.photoURL || '', createdAt: now, lastLogin: now, preferences: defaultPrefs };
        await setDoc(userRef, { ...newUser, createdAt: Timestamp.fromDate(now), lastLogin: Timestamp.fromDate(now) });
        return newUser;
      }
    } catch (err) {
      console.error('loginWithGoogle error:', err);
      if (err.code === 'auth/popup-closed-by-user') throw new Error('Connexion Google annulée.');
      throw err;
    }
  }

  /**
   * Sign out current user
   */
  export async function logoutUser() {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.error('logoutUser error:', err);
      throw err;
    }
  }

  /**
   * Send password reset email
   */
  export async function resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      console.error('resetPassword error:', err);
      if (err.code === 'auth/user-not-found') throw new Error('Aucun compte pour cet email.');
      throw err;
    }
  }