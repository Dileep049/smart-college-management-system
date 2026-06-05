import app from './app';
import { supabase } from './config/db';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Test DB Connection before starting the server by selecting from users table
    const { error } = await supabase.from('users').select('id').limit(1);
    if (error) {
      console.warn('Database warning on startup check (Supabase):', error.message);
    } else {
      console.log('Successfully established connection check with Supabase DB');
    }
    
    app.listen(PORT, () => {
      console.log(`Smart College Management backend running on http://localhost:${PORT}`);
    });
  } catch (err: any) {
    console.error('CRITICAL: Database connection check failed. Starting server in fallback mode...', err);
    
    // Fallback startup even if DB is unavailable so the application can be previewed or tested
    app.listen(PORT, () => {
      console.log(`Smart College Management backend running on http://localhost:${PORT} (FALLBACK - NO DB)`);
    });
  }
}

startServer();
