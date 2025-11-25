import React, { useState, useEffect } from 'react';
import { GameComms } from './utils/comms';
import HomeScreen from './components/HomeScreen';
import PlayerScreen from './components/PlayerScreen';
import HostScreen from './components/HostScreen';

function App() {
  const [role, setRole] = useState(null); // null, 'host', 'player'
  const [questions, setQuestions] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comms] = useState(() => new GameComms('quiz-noel-session'));

  useEffect(() => {
    loadQuestionsData();
  }, []);

  const loadQuestionsData = async () => {
    try {
      const response = await fetch('/questions.json');
      if (!response.ok) {
        throw new Error('Impossible de charger les questions');
      }
      
      const data = await response.json();
      setQuestions(data.questions);
      setSettings(data.settings);
      setLoading(false);
    } catch (err) {
      console.error('Erreur chargement questions:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSelectRole = (selectedRole) => {
    setRole(selectedRole);
  };

  if (loading) {
    return (
      <div className="screen loading-screen">
        <div className="content">
          <h2>🎄 Chargement...</h2>
          <div className="loader"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="screen error-screen">
        <div className="content">
          <h2>❌ Erreur</h2>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!role) {
    return <HomeScreen onSelectRole={handleSelectRole} />;
  }

  if (role === 'player') {
    return <PlayerScreen comms={comms} />;
  }

  if (role === 'host') {
    return <HostScreen comms={comms} questions={questions} settings={settings} />;
  }

  return null;
}

export default App;