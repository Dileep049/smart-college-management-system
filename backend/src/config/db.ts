import { createClient } from '@supabase/supabase-js';
import * as admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://mockproject.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock_supabase_anon_or_service_role_key';

// Initialize Supabase Client
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
});

console.log('Supabase client initialized successfully');

// Initialize Firebase Admin SDK
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (projectId && clientEmail && privateKey && !privateKey.includes('MOCKKEY') && admin.apps.length === 0) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
  }
} else {
  console.log('Firebase Admin SDK skipped/mocked initialization (credentials omitted or set to mock)');
}

export const firebaseAdmin = admin;

// Mock database helper to replace direct pg queries fallback for compile safety
export const db = {
  query: async (text: string, params?: any[]) => {
    console.log('[MOCK DB QUERY]: SQL queries are bypassed in SDK mode.', { text, params });
    return { rows: [], rowCount: 0 };
  },
  getClient: async () => {
    return {
      query: async (text: string, params?: any[]) => ({ rows: [], rowCount: 0 }),
      release: () => {}
    };
  }
};
