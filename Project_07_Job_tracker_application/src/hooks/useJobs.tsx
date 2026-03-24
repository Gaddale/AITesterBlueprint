import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { Job } from '../types';
import { dbService } from '../services/db';

interface JobsContextType {
  jobs: Job[];
  loading: boolean;
  addJob: (job: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateJob: (id: string, jobData: Partial<Job>) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  refreshJobs: () => Promise<void>;
  importJobs: (jobs: Job[]) => Promise<void>;
  clearJobs: () => Promise<void>;
}

const JobsContext = createContext<JobsContextType | undefined>(undefined);

export function JobsProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshJobs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await dbService.getAllJobs();
      setJobs(data);
    } catch (error) {
      console.error('Failed to fetch jobs', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshJobs();
  }, [refreshJobs]);

  const addJob = async (jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newJob: Job = {
      ...jobData,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await dbService.addJob(newJob);
    await refreshJobs();
  };

  const updateJob = async (id: string, jobData: Partial<Job>) => {
    const existingJob = jobs.find((j) => j.id === id);
    if (!existingJob) return;

    const updatedJob = {
      ...existingJob,
      ...jobData,
      updatedAt: Date.now(),
    };
    await dbService.updateJob(updatedJob);
    await refreshJobs();
  };

  const deleteJob = async (id: string) => {
    await dbService.deleteJob(id);
    await refreshJobs();
  };

  const importJobs = async (importedJobs: Job[]) => {
    await dbService.importJobs(importedJobs);
    await refreshJobs();
  };

  const clearJobs = async () => {
    await dbService.clearJobs();
    await refreshJobs();
  };

  return (
    <JobsContext.Provider
      value={{ jobs, loading, addJob, updateJob, deleteJob, refreshJobs, importJobs, clearJobs }}
    >
      {children}
    </JobsContext.Provider>
  );
}

export function useJobs() {
  const context = useContext(JobsContext);
  if (context === undefined) {
    throw new Error('useJobs must be used within a JobsProvider');
  }
  return context;
}
