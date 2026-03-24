import { useState } from 'react';
import { JobsProvider } from './hooks/useJobs';
import { Layout } from './components/Layout';
import { KanbanBoard } from './components/KanbanBoard';
import { JobModal } from './components/JobModal';

function AppContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingJobId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (id: string) => {
    setEditingJobId(id);
    setIsModalOpen(true);
  };

  return (
    <Layout
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      onAddJob={handleOpenAdd}
    >
      <KanbanBoard searchQuery={searchQuery} onEditJob={handleOpenEdit} />
      <JobModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        jobId={editingJobId}
      />
    </Layout>
  );
}

function App() {
  return (
    <JobsProvider>
      <AppContent />
    </JobsProvider>
  );
}

export default App;
