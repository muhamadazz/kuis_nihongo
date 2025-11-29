import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export type Category = {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
};

export type Chapter = {
  id: string;
  categoryId: string;
  title: string;
  chapterNumber: number;
  createdAt: Date;
};

export type Question = {
  id: string;
  categoryId: string;
  chapterId: string | null;
  questionText: string;
  imageUrl?: string | null;
  questionType: 'multiple-choice' | 'input';
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctAnswer: string;
  createdAt: Date;
};
