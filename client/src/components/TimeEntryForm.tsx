import React, { useState, useEffect } from 'react';
import { timeEntriesAPI, projectsAPI } from '../api';
import type { CreateTimeEntryDTO, Project } from '../types';

interface TimeEntryFormProps {
  onSuccess: () => void;
  editingEntry?: {
    id: number;
    project_name: string;
    task_description: string | null;
    start_time: string;
    end_time: string | null;
    date: string;
  } | null;
  onCancelEdit?: () => void;
}

export const TimeEntryForm: React.FC<TimeEntryFormProps> = ({
  onSuccess,
  editingEntry,
  onCancelEdit
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [formData, setFormData] = useState<CreateTimeEntryDTO>({
    project_name: '',
    task_description: '',
    start_time: '',
    end_time: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (editingEntry) {
      setFormData({
        project_name: editingEntry.project_name,
        task_description: editingEntry.task_description || '',
        start_time: editingEntry.start_time,
        end_time: editingEntry.end_time || '',
        date: editingEntry.date,
      });
    } else {
      resetForm();
    }
  }, [editingEntry]);

  const loadProjects = async () => {
    try {
      const data = await projectsAPI.getAll();
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      project_name: '',
      task_description: '',
      start_time: '',
      end_time: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (editingEntry) {
        await timeEntriesAPI.update(editingEntry.id, formData);
      } else {
        await timeEntriesAPI.create(formData);
      }

      resetForm();
      onSuccess();
      if (onCancelEdit) onCancelEdit();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="card">
      <h2>{editingEntry ? 'Edit Time Entry' : 'Add Time Entry'}</h2>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="project_name">Project Name *</label>
          <input
            type="text"
            id="project_name"
            name="project_name"
            value={formData.project_name}
            onChange={handleChange}
            list="projectList"
            required
          />
          <datalist id="projectList">
            {projects.map(project => (
              <option key={project.id} value={project.name} />
            ))}
          </datalist>
        </div>

        <div className="form-group">
          <label htmlFor="task_description">Task Description</label>
          <input
            type="text"
            id="task_description"
            name="task_description"
            value={formData.task_description}
            onChange={handleChange}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date">Date *</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="start_time">Start Time *</label>
            <input
              type="time"
              id="start_time"
              name="start_time"
              value={formData.start_time}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="end_time">End Time</label>
            <input
              type="time"
              id="end_time"
              name="end_time"
              value={formData.end_time}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : editingEntry ? 'Update Entry' : 'Add Entry'}
          </button>
          {editingEntry && onCancelEdit && (
            <button type="button" className="btn btn-secondary" onClick={onCancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
