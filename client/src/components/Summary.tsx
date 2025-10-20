import React, { useState, useEffect } from 'react';
import { summaryAPI } from '../api';
import type { TimeEntrySummary } from '../types';

interface SummaryProps {
  refreshTrigger: number;
}

export const Summary: React.FC<SummaryProps> = ({ refreshTrigger }) => {
  const [summary, setSummary] = useState<TimeEntrySummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  useEffect(() => {
    loadSummary();
  }, [refreshTrigger]);

  const loadSummary = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await summaryAPI.get({
        start_date: startDate,
        end_date: endDate,
      });
      setSummary(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load summary');
    } finally {
      setIsLoading(false);
    }
  };

  const totalHours = summary.reduce((sum, item) => sum + item.total_hours, 0);
  const totalEntries = summary.reduce((sum, item) => sum + item.entry_count, 0);

  return (
    <div className="card">
      <h2>Timesheet Summary</h2>

      <div className="filters">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="filterStartDate">Start Date</label>
            <input
              type="date"
              id="filterStartDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="filterEndDate">End Date</label>
            <input
              type="date"
              id="filterEndDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <button className="btn btn-primary" onClick={loadSummary} disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Load Summary'}
            </button>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {!isLoading && summary.length === 0 && (
        <p className="no-data">No data available for the selected period.</p>
      )}

      {!isLoading && summary.length > 0 && (
        <table className="summary-table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Entries</th>
              <th>Total Hours</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((item, index) => (
              <tr key={index}>
                <td>{item.project_name}</td>
                <td>{item.entry_count}</td>
                <td>{item.total_hours} hrs</td>
              </tr>
            ))}
            <tr className="total-row">
              <td>Total</td>
              <td>{totalEntries}</td>
              <td>{totalHours.toFixed(2)} hrs</td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
};
