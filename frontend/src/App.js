import React, { useState, useEffect } from 'react';
import './App.css';
import CallScheduler from './components/CallScheduler';
import ScheduledCallsList from './components/ScheduledCallsList';
import CallHistory from './components/CallHistory';

function App() {
  const [activeTab, setActiveTab] = useState('schedule');

  return (
    <div className="App">
      <header className="App-header">
        <h1>📞 Call Scheduler</h1>
        <p>Schedule and manage your calls</p>
      </header>

      <nav className="tabs">
        <button 
          className={activeTab === 'schedule' ? 'active' : ''}
          onClick={() => setActiveTab('schedule')}
        >
          Schedule Call
        </button>
        <button 
          className={activeTab === 'scheduled' ? 'active' : ''}
          onClick={() => setActiveTab('scheduled')}
        >
          Scheduled Calls
        </button>
        <button 
          className={activeTab === 'history' ? 'active' : ''}
          onClick={() => setActiveTab('history')}
        >
          Call History
        </button>
      </nav>

      <main className="App-main">
        {activeTab === 'schedule' && <CallScheduler />}
        {activeTab === 'scheduled' && <ScheduledCallsList />}
        {activeTab === 'history' && <CallHistory />}
      </main>
    </div>
  );
}

export default App;

