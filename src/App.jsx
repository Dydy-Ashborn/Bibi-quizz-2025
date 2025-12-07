import React, { useState } from 'react';
import HomeScreen from './components/HomeScreen';
import PlayerScreen from './components/PlayerScreen';
import HostScreen from './components/HostScreen';

function App() {
  const [screen, setScreen] = useState('home'); // 'home', 'host', 'player'
  const [playerInfo, setPlayerInfo] = useState(null);

  const handleStartHost = () => {
    setScreen('host');
  };

  const handleStartPlayer = (name, avatarUrl) => {
    setPlayerInfo({ name, avatarUrl });
    setScreen('player');
  };

  const handleExit = () => {
    setScreen('home');
    setPlayerInfo(null);
  };

  if (screen === 'home') {
    return (
      <HomeScreen 
        onStartHost={handleStartHost}
        onStartPlayer={handleStartPlayer}
      />
    );
  }

  if (screen === 'host') {
    return <HostScreen onExit={handleExit} />;
  }

  if (screen === 'player' && playerInfo) {
    return (
      <PlayerScreen
        playerName={playerInfo.name}
        avatarUrl={playerInfo.avatarUrl}
        onExit={handleExit}
      />
    );
  }

  return null;
}

export default App;