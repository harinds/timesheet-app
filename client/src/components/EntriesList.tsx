import React, { useState, useEffect } from 'react';
import { timeEntriesAPI } from '../api';
import type { TimeEntry } from '../types';

interface EntriesListProps {
  refreshTrigger: number;
  onEdit: (entry: TimeEntry) => void;
}

export const EntriesList: React.FC<EntriesListProps> = ({ refreshTrigger, onEdit }) => {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEntries();
  }, [refreshTrigger]);

  const loadEntries = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await timeEntriesAPI.getAll();
      setEntries(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load entries');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) {
      return;
    }

    try {
      await timeEntriesAPI.delete(id);
      loadEntries();
    } catch (err: any) {
      alert('Failed to delete entry: ' + (err.response?.data?.error || err.message));
    }
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDuration = (minutes: number | null): string => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (isLoading) {
    return (
      <div className="card">
        <h2>Time Entries</h2>
        <p className="loading">Loading entries...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <h2>Time Entries</h2>
        <div className="error-message">{error}</div>
        <button className="btn btn-primary" onClick={loadEntries}>Retry</button>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Time Entries</h2>
      <div className="table-actions">
        <button className="btn btn-primary" onClick={loadEntries}>Refresh Entries</button>
      </div>

      <div className="table-container">
        {entries.length === 0 ? (
          <p className="no-data">No entries found. Add your first time entry above!</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Project</th>
                <th>Task</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Duration</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(entry => (
                <tr key={entry.id}>
                  <td>{formatDate(entry.date)}</td>
                  <td>{entry.project_name}</td>
                  <td>{entry.task_description || '-'}</td>
                  <td>{entry.start_time}</td>
                  <td>{entry.end_time || '-'}</td>
                  <td className="duration">{formatDuration(entry.duration_minutes)}</td>
                  <td>
                    <button
                      className="btn btn-edit"
                      onClick={() => onEdit(entry)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(entry.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
