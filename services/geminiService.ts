import type { StartupName } from '../types';

export const generateStartupNames = async (industry: string): Promise<StartupName[]> => {
  if (!industry) {
    throw new Error("Industry cannot be empty.");
  }

  // Make a request to our new API route
  const response = await fetch('/api/generate-names', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ industry }),
  });

  if (!response.ok) {
    // Try to parse the error message from the API route
    const errorData = await response.json().catch(() => ({})); // Gracefully handle non-JSON error responses
    const message = errorData?.error?.message || `An error occurred: ${response.statusText}`;
    throw new Error(message);
  }

  const names: StartupName[] = await response.json();
  return names;
};
