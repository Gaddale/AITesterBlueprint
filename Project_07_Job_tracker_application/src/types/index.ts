export type JobStatus = 'wishlist' | 'applied' | 'follow-up' | 'interview' | 'offer' | 'rejected';

export interface Job {
  id: string;
  company: string;
  role: string;
  url?: string;
  resume?: string;
  dateApplied: string;
  salary?: string;
  notes?: string;
  status: JobStatus;
  createdAt: number;
  updatedAt: number;
}
