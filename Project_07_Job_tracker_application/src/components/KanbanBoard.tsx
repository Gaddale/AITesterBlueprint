import { useState, useMemo } from 'react';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragStartEvent, DragOverEvent, DragEndEvent } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useJobs } from '../hooks/useJobs';
import { KanbanColumn } from './KanbanColumn';
import { JobCard } from './JobCard';
import type { JobStatus } from '../types';

const COLUMNS: { id: JobStatus; title: string }[] = [
  { id: 'wishlist', title: 'Wishlist' },
  { id: 'applied', title: 'Applied' },
  { id: 'follow-up', title: 'Follow-up' },
  { id: 'interview', title: 'Interview' },
  { id: 'offer', title: 'Offer' },
  { id: 'rejected', title: 'Rejected' },
];

export function KanbanBoard({ searchQuery, onEditJob }: { searchQuery: string; onEditJob: (id: string) => void }) {
  const { jobs, updateJob, deleteJob } = useJobs();
  const [activeId, setActiveId] = useState<string | null>(null);

  const filteredJobs = useMemo(() => {
    return jobs.filter(
      job => 
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) || 
        job.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [jobs, searchQuery]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (_event: DragOverEvent) => {
    // We could optimize sorting between items with DragOver but for simple 
    // column dragging without strict sorting, DragEnd is sufficient.
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const activeJobId = active.id as string;
    const overId = over.id as string;

    const activeJob = jobs.find(j => j.id === activeJobId);
    if (!activeJob) return;

    // Check if over a column
    const isOverColumn = COLUMNS.some(col => col.id === overId);
    let newStatus = activeJob.status;
    
    if (isOverColumn) {
      newStatus = overId as JobStatus;
    } else {
      // It might be over another job card and sortable passes its id
      const overJob = jobs.find(j => j.id === overId);
      if (overJob) {
        newStatus = overJob.status;
      }
    }

    if (activeJob.status !== newStatus) {
      await updateJob(activeJobId, { status: newStatus });
    }
  };

  const activeJob = useMemo(() => jobs.find(j => j.id === activeId), [activeId, jobs]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 w-full h-full overflow-x-auto overflow-y-hidden pb-4 snap-x">
        {COLUMNS.map(col => {
          const columnJobs = filteredJobs.filter(j => j.status === col.id);
          // Sort Newest first
          columnJobs.sort((a, b) => b.createdAt - a.createdAt);

          return (
            <KanbanColumn key={col.id} id={col.id} title={col.title} count={columnJobs.length} jobs={columnJobs}>
              {columnJobs.map(job => (
                <JobCard key={job.id} job={job} onEdit={() => onEditJob(job.id)} onDelete={() => deleteJob(job.id)} />
              ))}
            </KanbanColumn>
          );
        })}
      </div>
      <DragOverlay>
        {activeJob ? <JobCard job={activeJob} onEdit={() => {}} onDelete={() => {}} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
