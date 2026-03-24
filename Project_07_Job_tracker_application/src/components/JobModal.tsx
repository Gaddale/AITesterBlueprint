import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useJobs } from '../hooks/useJobs';
import type { Job } from '../types';
import { X } from 'lucide-react';

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string | null;
}

type JobFormData = Omit<Job, 'id' | 'createdAt' | 'updatedAt'>;

export function JobModal({ isOpen, onClose, jobId }: JobModalProps) {
  const { jobs, addJob, updateJob } = useJobs();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<JobFormData>();

  useEffect(() => {
    if (isOpen) {
      if (jobId) {
        const job = jobs.find(j => j.id === jobId);
        if (job) {
          reset({
            company: job.company,
            role: job.role,
            url: job.url || '',
            resume: job.resume || '',
            dateApplied: job.dateApplied,
            salary: job.salary || '',
            notes: job.notes || '',
            status: job.status,
          });
        }
      } else {
        const today = new Date().toISOString().split('T')[0];
        reset({
          company: '',
          role: '',
          url: '',
          resume: '',
          dateApplied: today,
          salary: '',
          notes: '',
          status: 'wishlist',
        });
      }
    }
  }, [isOpen, jobId, jobs, reset]);

  const onSubmit = async (data: JobFormData) => {
    try {
      if (jobId) {
        await updateJob(jobId, data);
      } else {
        await addJob(data);
      }
      onClose();
    } catch (err) {
      console.error('Error saving job:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-slate-500/75 dark:bg-slate-900/80 transition-opacity backdrop-blur-sm" aria-hidden="true" onClick={() => { console.log('Backdrop clicked!'); onClose(); }}></div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="relative z-10 inline-block align-bottom bg-white dark:bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-center px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <h3 className="text-lg leading-6 font-medium text-slate-900 dark:text-slate-100" id="modal-title">
              {jobId ? 'Edit Job' : 'Add New Job'}
            </h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-500 focus:outline-none transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="company" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Company Name *</label>
                <input
                  type="text"
                  id="company"
                  className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm bg-slate-50 dark:bg-slate-900 border text-slate-900 dark:text-slate-100 placeholder-slate-400 px-3 py-2 outline-none focus:ring-1 transition-colors ${errors.company ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500'}`}
                  {...register('company', { required: 'Company is required' })}
                />
                {errors.company && <p className="mt-1 text-xs text-red-500">{errors.company.message}</p>}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="role" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Job Title / Role *</label>
                <input
                  type="text"
                  id="role"
                  className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm bg-slate-50 dark:bg-slate-900 border text-slate-900 dark:text-slate-100 placeholder-slate-400 px-3 py-2 outline-none focus:ring-1 transition-colors ${errors.role ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500'}`}
                  {...register('role', { required: 'Role is required' })}
                />
                {errors.role && <p className="mt-1 text-xs text-red-500">{errors.role.message}</p>}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="url" className="block text-sm font-medium text-slate-700 dark:text-slate-300">URL (LinkedIn, etc.)</label>
                <input
                  type="url"
                  id="url"
                  className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 outline-none focus:ring-1 transition-colors"
                  {...register('url')}
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
                <select
                  id="status"
                  className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 outline-none focus:ring-1 transition-colors"
                  {...register('status')}
                >
                  <option value="wishlist">Wishlist</option>
                  <option value="applied">Applied</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="interview">Interview</option>
                  <option value="offer">Offer</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label htmlFor="dateApplied" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Date Applied *</label>
                <input
                  type="date"
                  id="dateApplied"
                  className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 outline-none focus:ring-1 transition-colors"
                  {...register('dateApplied', { required: true })}
                />
              </div>

              <div>
                <label htmlFor="resume" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Resume / Tag</label>
                <input
                  type="text"
                  id="resume"
                  placeholder="e.g. SDE_v3"
                  className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 outline-none focus:ring-1 transition-colors"
                  {...register('resume')}
                />
              </div>

              <div>
                <label htmlFor="salary" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Salary Range</label>
                <input
                  type="text"
                  id="salary"
                  placeholder="e.g. $150k - $180k"
                  className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 outline-none focus:ring-1 transition-colors"
                  {...register('salary')}
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Notes</label>
                <textarea
                  id="notes"
                  rows={3}
                  className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 outline-none focus:ring-1 transition-colors resize-y"
                  {...register('notes')}
                ></textarea>
              </div>
            </div>
            
            <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse border-t border-slate-200 dark:border-slate-700 pt-4">
              <button
                type="submit"
                onClick={() => console.log('Submit button clicked!')}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
              >
                {jobId ? 'Save Changes' : 'Add Job'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-800 text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
