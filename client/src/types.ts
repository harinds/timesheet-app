export interface TimeEntry {
  id: number;
  project_name: string;
  task_description: string | null;
  start_time: string;
  end_time: string | null;
  duration_minutes: number | null;
  date: string;
  created_at: string;
}

export interface Project {
  id: number;
  name: string;
  created_at: string;
}

export interface TimeEntrySummary {
  project_name: string;
  entry_count: number;
  total_minutes: number;
  total_hours: number;
}

export interface CreateTimeEntryDTO {
  project_name: string;
  task_description?: string;
  start_time: string;
  end_time?: string;
  date: string;
}

export interface UpdateTimeEntryDTO extends CreateTimeEntryDTO {
  id: number;
}
