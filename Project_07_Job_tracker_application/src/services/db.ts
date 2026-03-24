import { openDB } from 'idb';
import type { DBSchema } from 'idb';
import type { Job } from '../types';

interface JobTrackerDB extends DBSchema {
  jobs: {
    key: string;
    value: Job;
    indexes: {
      'by-status': string;
      'by-date': string;
    };
  };
}

const DB_NAME = 'job-tracker-db';
const DB_VERSION = 1;

export const initDB = async () => {
  return openDB<JobTrackerDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('jobs')) {
        const store = db.createObjectStore('jobs', { keyPath: 'id' });
        store.createIndex('by-status', 'status');
        store.createIndex('by-date', 'dateApplied');
      }
    },
  });
};

export const dbService = {
  async getAllJobs(): Promise<Job[]> {
    const db = await initDB();
    return db.getAll('jobs');
  },
  
  async getJob(id: string): Promise<Job | undefined> {
    const db = await initDB();
    return db.get('jobs', id);
  },

  async addJob(job: Job): Promise<string> {
    const db = await initDB();
    return db.add('jobs', job);
  },

  async updateJob(job: Job): Promise<string> {
    const db = await initDB();
    return db.put('jobs', job);
  },

  async deleteJob(id: string): Promise<void> {
    const db = await initDB();
    return db.delete('jobs', id);
  },
  
  async clearJobs(): Promise<void> {
    const db = await initDB();
    return db.clear('jobs');
  },

  async importJobs(jobs: Job[]): Promise<void> {
    const db = await initDB();
    const tx = db.transaction('jobs', 'readwrite');
    await tx.objectStore('jobs').clear();
    for (const job of jobs) {
      await tx.objectStore('jobs').add(job);
    }
    await tx.done;
  }
};
