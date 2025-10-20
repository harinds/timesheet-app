const API_URL = 'http://localhost:3000/api';
let editingEntryId = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  setTodayDate();
  loadProjects();
  loadEntries();
  attachEventListeners();
});

function setTodayDate() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('date').value = today;
  document.getElementById('filterStartDate').value = getFirstDayOfMonth();
  document.getElementById('filterEndDate').value = today;
}

function getFirstDayOfMonth() {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
}

function attachEventListeners() {
  document.getElementById('entryForm').addEventListener('submit', handleFormSubmit);
  document.getElementById('loadEntriesBtn').addEventListener('click', loadEntries);
  document.getElementById('loadSummaryBtn').addEventListener('click', loadSummary);
  document.getElementById('cancelBtn').addEventListener('click', cancelEdit);
}

// Form submission
async function handleFormSubmit(e) {
  e.preventDefault();

  const formData = {
    project_name: document.getElementById('project').value,
    task_description: document.getElementById('task').value,
    date: document.getElementById('date').value,
    start_time: document.getElementById('startTime').value,
    end_time: document.getElementById('endTime').value || null
  };

  try {
    let response;
    if (editingEntryId) {
      response = await fetch(`${API_URL}/entries/${editingEntryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
    } else {
      response = await fetch(`${API_URL}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
    }

    if (response.ok) {
      document.getElementById('entryForm').reset();
      setTodayDate();
      loadProjects();
      loadEntries();
      cancelEdit();
      showNotification(editingEntryId ? 'Entry updated successfully!' : 'Entry added successfully!');
    } else {
      const error = await response.json();
      alert('Error: ' + error.error);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to save entry');
  }
}

// Load projects for datalist
async function loadProjects() {
  try {
    const response = await fetch(`${API_URL}/projects`);
    const projects = await response.json();

    const datalist = document.getElementById('projectList');
    datalist.innerHTML = '';

    projects.forEach(project => {
      const option = document.createElement('option');
      option.value = project.name;
      datalist.appendChild(option);
    });
  } catch (error) {
    console.error('Error loading projects:', error);
  }
}

// Load time entries
async function loadEntries() {
  try {
    const response = await fetch(`${API_URL}/entries`);
    const entries = await response.json();

    const tbody = document.getElementById('entriesTableBody');

    if (entries.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="no-data">No entries found. Add your first time entry above!</td></tr>';
      return;
    }

    tbody.innerHTML = entries.map(entry => `
      <tr>
        <td>${formatDate(entry.date)}</td>
        <td>${entry.project_name}</td>
        <td>${entry.task_description || '-'}</td>
        <td>${entry.start_time}</td>
        <td>${entry.end_time || '-'}</td>
        <td class="duration">${formatDuration(entry.duration_minutes)}</td>
        <td>
          <button class="btn btn-edit" onclick="editEntry(${entry.id})">Edit</button>
          <button class="btn btn-danger" onclick="deleteEntry(${entry.id})">Delete</button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Error loading entries:', error);
  }
}

// Load summary
async function loadSummary() {
  const startDate = document.getElementById('filterStartDate').value;
  const endDate = document.getElementById('filterEndDate').value;

  try {
    const url = `${API_URL}/summary?start_date=${startDate}&end_date=${endDate}`;
    const response = await fetch(url);
    const summary = await response.json();

    const container = document.getElementById('summaryContainer');

    if (summary.length === 0) {
      container.innerHTML = '<p class="no-data">No data available for the selected period.</p>';
      return;
    }

    const totalHours = summary.reduce((sum, item) => sum + item.total_hours, 0);

    container.innerHTML = `
      <table class="summary-table">
        <thead>
          <tr>
            <th>Project</th>
            <th>Entries</th>
            <th>Total Hours</th>
          </tr>
        </thead>
        <tbody>
          ${summary.map(item => `
            <tr>
              <td>${item.project_name}</td>
              <td>${item.entry_count}</td>
              <td>${item.total_hours} hrs</td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td>Total</td>
            <td>${summary.reduce((sum, item) => sum + item.entry_count, 0)}</td>
            <td>${totalHours.toFixed(2)} hrs</td>
          </tr>
        </tbody>
      </table>
    `;
  } catch (error) {
    console.error('Error loading summary:', error);
  }
}

// Edit entry
async function editEntry(id) {
  try {
    const response = await fetch(`${API_URL}/entries/${id}`);
    const entry = await response.json();

    document.getElementById('project').value = entry.project_name;
    document.getElementById('task').value = entry.task_description || '';
    document.getElementById('date').value = entry.date;
    document.getElementById('startTime').value = entry.start_time;
    document.getElementById('endTime').value = entry.end_time || '';

    editingEntryId = id;
    document.getElementById('submitBtn').textContent = 'Update Entry';
    document.getElementById('cancelBtn').style.display = 'inline-block';

    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (error) {
    console.error('Error loading entry:', error);
    alert('Failed to load entry for editing');
  }
}

// Cancel edit
function cancelEdit() {
  editingEntryId = null;
  document.getElementById('submitBtn').textContent = 'Add Entry';
  document.getElementById('cancelBtn').style.display = 'none';
  document.getElementById('entryForm').reset();
  setTodayDate();
}

// Delete entry
async function deleteEntry(id) {
  if (!confirm('Are you sure you want to delete this entry?')) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/entries/${id}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      loadEntries();
      showNotification('Entry deleted successfully!');
    } else {
      alert('Failed to delete entry');
    }
  } catch (error) {
    console.error('Error deleting entry:', error);
    alert('Failed to delete entry');
  }
}

// Utility functions
function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function formatDuration(minutes) {
  if (!minutes) return '-';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

function showNotification(message) {
  // Simple notification - you could enhance this with a toast library
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #28a745;
    color: white;
    padding: 15px 25px;
    border-radius: 6px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    z-index: 1000;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}
