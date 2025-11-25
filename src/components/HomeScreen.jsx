import React, { useState } from 'react';
import SnowEffect from './SnowEffect';

const HomeScreen = ({ onSelectRole }) => {
  return (
    <div className="screen home-screen">
      <SnowEffect />
      <div className="content">
        <h1 className="title">🎄 Bibi Quiz 2025 🎄</h1>
        <p className="subtitle">Choisissez votre rôle</p>
        
        <div className="role-buttons">
          <button 
            className="btn btn-primary role-btn" 
            onClick={() => onSelectRole('host')}
          >
            🎅 Présentateur
          </button>
          
          <button 
            className="btn btn-secondary role-btn" 
            onClick={() => onSelectRole('player')}
          >
            🎁 Joueur
          </button>
        </div>

        <div className="instructions">
          <p>Le présentateur anime le jeu et attribue les points</p>
          <p>Les joueurs répondent aux questions via leur téléphone</p>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
