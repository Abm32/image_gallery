import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';

export async function addHistoryItem(data: {
  type: string;
  title: string;
  details: string;
  userId: string;
  orderId?: string;
  taskId?: string;
}) {
  try {
    await addDoc(collection(db, 'history'), {
      ...data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error adding history item:', error);
  }
}