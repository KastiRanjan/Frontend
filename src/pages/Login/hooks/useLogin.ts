import { useState } from 'react';
import axios from 'axios';

const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (username: string, password: string, remember: boolean) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:7777/auth/login', {
        username,
        password,
        remember, // Include remember in the payload
      });
      // Handle successful login (e.g., store token, redirect, etc.)
      return response.data; // or any other success data
    } catch (err) {
      setError('Login failed. Please check your credentials.');
      console.error(err);
      throw err; // Re-throw to handle in the component if needed
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};

export default useLogin;
