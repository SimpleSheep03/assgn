import React, { useState, useEffect } from 'react';
import './ScheduledCallsList.css';

const ScheduledCallsList = () => {
  const [scheduledCalls, setScheduledCalls] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchScheduledCalls = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/scheduled-calls');
      const data = await response.json();
      if (data.success) {
        setScheduledCalls(data.scheduled_calls);
      }
    } catch (error) {
      console.error('Error fetching scheduled calls:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScheduledCalls();
    // Refresh every 5 seconds
    const interval = setInterval(fetchScheduledCalls, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this scheduled call?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/scheduled-calls/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchScheduledCalls();
      } else {
        alert('Failed to delete scheduled call');
      }
    } catch (error) {
      console.error('Error deleting scheduled call:', error);
      alert('Error deleting scheduled call');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'badge-pending';
      case 'executed':
        return 'badge-executed';
      case 'failed':
        return 'badge-failed';
      default:
        return 'badge-default';
    }
  };

  if (loading) {
    return <div className="card">Loading...</div>;
  }

  return (
    <div className="scheduled-calls-list">
      <div className="card">
        <h2>Scheduled Calls</h2>
        {scheduledCalls.length === 0 ? (
          <p className="empty-message">No scheduled calls yet. Schedule one to get started!</p>
        ) : (
          <div className="calls-table">
            <table>
              <thead>
                <tr>
                  <th>Phone Number</th>
                  <th>Scheduled Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {scheduledCalls.map((call) => (
                  <tr key={call.id}>
                    <td>{call.phone_number}</td>
                    <td>{new Date(call.scheduled_time).toLocaleString()}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(call.status)}`}>
                        {call.status}
                      </span>
                    </td>
                    <td>
                      {call.status === 'pending' && (
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(call.id)}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduledCallsList;

