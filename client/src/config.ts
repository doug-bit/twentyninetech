// Configuration for base path deployment
export const BASE_PATH = import.meta.env.VITE_BASE_PATH || '';

// Helper function to construct API URLs with base path
export const apiUrl = (path: string) => `${BASE_PATH}${path}`;