import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Job } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { Building2, Calendar, FileText, Link as LinkIcon, Edit2, Trash2, DollarSign } from 'lucide-react';

interface JobCardProps {
  job: Job;
  onEdit: () => void;
  onDelete: () => void;
  isOverlay?: boolean;
}

export function JobCard({ job, onEdit, onDelete, isOverlay }: JobCardProps) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: job.id,
    data: {
      type: 'Job',
      job,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const statusColors: Record<string, string> = {
    'wishlist': 'border-l-slate-400',
    'applied': 'border-l-yellow-400',
    'follow-up': 'border-l-orange-400',
    'interview': 'border-l-blue-400',
    'offer': 'border-l-green-400',
    'rejected': 'border-l-red-400',
  };

  if (isDragging && !isOverlay) {
    return (
      <div 
        ref={setNodeRef} 
        style={style} 
        className="bg-white/50 dark:bg-slate-800/50 border-2 border-dashed border-blue-400 dark:border-blue-500 rounded-lg h-32 opacity-50" 
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group relative bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-grab active:cursor-grabbing border-l-4 ${statusColors[job.status] || 'border-l-slate-400'} ${isOverlay ? 'shadow-2xl scale-105 rotate-2 cursor-grabbing z-50' : ''}`}
    >
      <div className="flex justify-between items-start mb-2 gap-2">
        <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm leading-tight line-clamp-2">
          {job.role}
        </h4>
        
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-1 rounded-md shadow-sm border border-slate-100 dark:border-slate-600 z-10">
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            title="Edit"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { 
              e.stopPropagation(); 
              if(window.confirm('Delete this job?')) onDelete(); 
            }}
            className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      
      <div className="space-y-1.5 mt-2">
        <div className="flex items-center text-xs text-slate-600 dark:text-slate-300">
          <Building2 className="w-3.5 h-3.5 mr-1.5 shrink-0 text-slate-400" />
          <span className="truncate">{job.company}</span>
        </div>
        
        {job.salary && (
          <div className="flex items-center text-xs text-slate-600 dark:text-slate-300">
            <DollarSign className="w-3.5 h-3.5 mr-1.5 shrink-0 text-green-500" />
            <span className="truncate font-medium">{job.salary}</span>
          </div>
        )}

        <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-100 dark:border-slate-700/50">
          {job.url ? (
            <a 
              href={job.url} 
              target="_blank" 
              rel="noopener noreferrer"
              onPointerDown={(e) => e.stopPropagation()}
              className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded"
            >
              <LinkIcon className="w-3 h-3 mr-1" />
              Link
            </a>
          ) : (
            <span />
          )}

          <div className="flex items-center text-[10px] text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap" title={`Applied on ${new Date(job.dateApplied).toLocaleDateString()}`}>
            <Calendar className="w-3 h-3 mr-1" />
            {formatDistanceToNow(new Date(job.dateApplied), { addSuffix: true })}
          </div>
        </div>
        
        {job.resume && (
          <div className="flex items-center text-[10px] text-slate-500 bg-slate-50 dark:bg-slate-700/50 px-1.5 py-0.5 rounded w-fit max-w-full mt-1">
            <FileText className="w-3 h-3 mr-1 shrink-0" />
            <span className="truncate">{job.resume}</span>
          </div>
        )}
      </div>
    </div>
  );
}
