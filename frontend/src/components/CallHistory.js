import React, { useState, useEffect } from 'react';
import './CallHistory.css';

const CallHistory = () => {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCallHistory = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/call-history');
      const data = await response.json();
      if (data.success) {
        setCalls(data.calls);
      }
    } catch (error) {
      console.error('Error fetching call history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCallHistory();
    // Refresh every 3 seconds to get updated call statuses
    const interval = setInterval(fetchCallHistory, 3000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'initiated':
        return 'badge-initiated';
      case 'ringing':
        return 'badge-ringing';
      case 'connected':
        return 'badge-connected';
      case 'completed':
        return 'badge-completed';
      default:
        return 'badge-default';
    }
  };

  if (loading) {
    return <div className="card">Loading...</div>;
  }

  return (
    <div className="call-history">
      <div className="card">
        <h2>Call History</h2>
        {calls.length === 0 ? (
          <p className="empty-message">No call history yet. Execute some scheduled calls to see them here!</p>
        ) : (
          <div className="calls-table">
            <table>
              <thead>
                <tr>
                  <th>Phone Number</th>
                  <th>Scheduled Time</th>
                  <th>Executed At</th>
                  <th>Status</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {calls.map((call) => (
                  <tr key={call.id}>
                    <td>{call.phone_number}</td>
                    <td>{new Date(call.scheduled_time).toLocaleString()}</td>
                    <td>{new Date(call.executed_at).toLocaleString()}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(call.status)}`}>
                        {call.status}
                      </span>
                    </td>
                    <td>{call.duration ? `${call.duration}s` : '-'}</td>
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

export default CallHistory;

