// Database configuration
// Configure your database connection here

export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'swd_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
};

export const initDatabase = async () => {
  // Initialize database connection here
  console.log('Database initialized');
};
