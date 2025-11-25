import React from 'react';

const ScoreBoard = ({ players, scores }) => {
  const scoreboard = Object.keys(scores || {})
    .map(playerId => ({
      playerId,
      pseudo: players[playerId]?.pseudo || 'Inconnu',
      avatar: players[playerId]?.avatar,
      score: scores[playerId]
    }))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="scoreboard">
      <h2 className="scoreboard-title">🏆 Classement</h2>
      <div className="scoreboard-list">
        {scoreboard.map((player, index) => (
          <div key={player.playerId} className="scoreboard-item">
            <div className="rank">{index + 1}</div>
            {player.avatar && (
              <img src={player.avatar} alt={player.pseudo} className="player-avatar-small" />
            )}
            <div className="player-info">
              <div className="player-pseudo">{player.pseudo}</div>
              <div className="player-score">{player.score} pts</div>
            </div>
            {index === 0 && <span className="trophy">👑</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScoreBoard;
