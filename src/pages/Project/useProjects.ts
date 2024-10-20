// useProjects.ts
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Project } from './model';

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  axios.defaults.withCredentials = true;

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await axios.get<Project[]>('http://localhost:7777/projects');
      setProjects(response.data);
    } catch (error) {
      setError('Error fetching projects');
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return { projects, loading, error };
};
