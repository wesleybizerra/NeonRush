import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}

export const useUser = () => {
  const [user, setUser] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
      console.log("Auth State Changed, user:", authUser?.uid);
      if (authUser) {
        setUserId(authUser.uid);
      } else {
        setUserId(null);
        setUser(null);
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (userId) {
      const userDocRef = doc(db, 'users', userId);
      const unsubscribeUser = onSnapshot(userDocRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          setUser(userData);
          checkDailyTasks(userData);
        }
        setLoading(false);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${userId}`);
        setLoading(false);
      });
      return () => unsubscribeUser();
    }
  }, [userId]);

  const checkDailyTasks = async (userData: any) => {
    const now = new Date();
    const lastUpdate = userData.lastTaskUpdate ? new Date(userData.lastTaskUpdate) : new Date(0);
    
    // Check if it's after 23:00 and tasks haven't been updated today
    if (now.getHours() >= 23 && (now.toDateString() !== lastUpdate.toDateString())) {
      const newTasks = generateDailyTasks();
      try {
        await updateDoc(doc(db, 'users', userId!), {
          lastTaskUpdate: now.toISOString(),
          tasks: newTasks
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
      }
    }
  };

  const generateDailyTasks = () => {
    // Generate 200 tasks (simplified for now)
    return Array.from({ length: 200 }, (_, i) => ({
      id: `task_${i}`,
      status: 'pending',
      type: i % 3 === 0 ? 'race' : i % 3 === 1 ? 'drift' : 'drag'
    }));
  };

  const updateProgress = async (data: any) => {
    if (userId) {
      try {
        await updateDoc(doc(db, 'users', userId), data);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
      }
    }
  };

  return { user, userId, loading, updateProgress };
};
