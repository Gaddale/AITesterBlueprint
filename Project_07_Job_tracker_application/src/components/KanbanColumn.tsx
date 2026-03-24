import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { ReactNode } from 'react';
import type { Job } from '../types';

interface KanbanColumnProps {
  id: string;
  title: string;
  count: number;
  jobs: Job[];
  children: ReactNode;
}

export function KanbanColumn({ id, title, count, jobs, children }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const jobIds = jobs.map(j => j.id);

  return (
    <div className={`flex flex-col w-[320px] shrink-0 bg-slate-100 dark:bg-slate-800/40 rounded-xl overflow-hidden border transition-colors duration-200 max-h-full ${isOver ? 'border-blue-400 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700'}`}>
      <div className="p-3.5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm z-10 sticky top-0 shrink-0">
        <h3 className="font-semibold text-slate-700 dark:text-slate-200 tracking-tight">{title}</h3>
        <span className="bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm border border-slate-200 dark:border-slate-600">
          {count}
        </span>
      </div>
      <div 
        ref={setNodeRef}
        className="flex-1 p-3 overflow-y-auto space-y-3 min-h-[150px] transition-colors"
      >
        <SortableContext id={id} items={jobIds} strategy={verticalListSortingStrategy}>
          {children}
        </SortableContext>
      </div>
    </div>
  );
}
