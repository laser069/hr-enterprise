const getApiBaseUrl = () => {
  // If we are in production (built mode)
  if (import.meta.env.PROD) {
    const envUrl = import.meta.env.VITE_API_BASE_URL;
    // If the env var is missing OR it points to localhost (accidental local build leak), use prod URL
    if (!envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1')) {
      return 'https://hr-enterprise-4.onrender.com';
    }
    return envUrl;
  }
  // Development mode
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002';
};

export const env = {
  apiBaseUrl: getApiBaseUrl(),
  appName: import.meta.env.VITE_APP_NAME || 'HR Enterprise',
  environment: import.meta.env.MODE || 'development',
} as const;

export type Env = typeof env;