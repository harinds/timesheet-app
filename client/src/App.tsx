import { useState } from 'react';
import { TimeEntryForm } from './components/TimeEntryForm';
import { EntriesList } from './components/EntriesList';
import { Summary } from './components/Summary';
import type { TimeEntry } from './types';
import './App.css';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);

  const handleSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleEdit = (entry: TimeEntry) => {
    setEditingEntry(entry);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Timesheet App</h1>
        <p className="subtitle">Track your work hours and manage timesheets</p>
      </header>

      <div className="container">
        <TimeEntryForm
          onSuccess={handleSuccess}
          editingEntry={editingEntry}
          onCancelEdit={handleCancelEdit}
        />

        <Summary refreshTrigger={refreshTrigger} />

        <EntriesList
          refreshTrigger={refreshTrigger}
          onEdit={handleEdit}
        />
      </div>
    </div>
  );
}

export default App;
