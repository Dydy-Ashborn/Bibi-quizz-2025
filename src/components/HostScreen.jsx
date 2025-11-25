import React, { useState, useEffect } from 'react';
import { GameEngine } from '../utils/gameEngine';
import { shuffleQuestions } from '../utils/shuffleQuestions';
import ScoreBoard from './ScoreBoard';
import SnowEffect from './SnowEffect';

const HostScreen = ({ comms, questions, settings }) => {
  const [gameEngine] = useState(() => new GameEngine(questions, settings));
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [buzzerWinner, setBuzzerWinner] = useState(null);
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [players, setPlayers] = useState({});
  const [scores, setScores] = useState({});
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, percentage: 0 });
  const [validatedPlayers, setValidatedPlayers] = useState({});

  useEffect(() => {
    // Écouter les événements des joueurs
    comms.on('player:join', handlePlayerJoin);
    comms.on('player:buzz', handlePlayerBuzz);
    comms.on('player:mcq', handlePlayerMCQ);

    return () => {
      comms.off('player:join', handlePlayerJoin);
      comms.off('player:buzz', handlePlayerBuzz);
      comms.off('player:mcq', handlePlayerMCQ);
    };
  }, []);

  const handlePlayerJoin = (playerData) => {
    gameEngine.addPlayer(playerData.playerId, playerData);
    setPlayers({ ...gameEngine.players });
    setScores({ ...gameEngine.scores });
  };

  const handlePlayerBuzz = (data) => {
    const result = gameEngine.handleBuzzer(data.playerId);
    if (result) {
      setBuzzerWinner(result);
    }
  };

  const handlePlayerMCQ = (data) => {
    gameEngine.handleMCQAnswer(data.playerId, data.selectedChoice);
    setMcqAnswers({ ...gameEngine.mcqAnswers });
  };

  const startGame = () => {
    const questionOrder = shuffleQuestions(questions);
    gameEngine.setQuestionOrder(questionOrder);
    setGameStarted(true);
    loadNextQuestion();
  };

  const loadNextQuestion = () => {
    const question = gameEngine.getCurrentQuestion();
    if (question) {
      setCurrentQuestion(question);
      setBuzzerWinner(null);
      setMcqAnswers({});
      setValidatedPlayers({});
      setShowScoreboard(false);
      setProgress(gameEngine.getProgress());
      
      // Envoyer la question aux joueurs
      comms.hostStartQuestion(question);
    } else {
      endGame();
    }
  };

  const validateAnswer = (playerId, isCorrect) => {
    gameEngine.validateAnswer(playerId, isCorrect);
    setScores({ ...gameEngine.scores });
    
    // Ajouter le feedback visuel
    setValidatedPlayers(prev => ({
      ...prev,
      [playerId]: isCorrect
    }));
    
    comms.send('host:validate', { playerId, isCorrect, playerName: players[playerId]?.pseudo });
  };

  const nextQuestion = () => {
    gameEngine.nextQuestion();
    comms.hostNextQuestion();
    
    const question = gameEngine.getCurrentQuestion();
    if (question) {
      setCurrentQuestion(question);
      setBuzzerWinner(null);
      setMcqAnswers({});
      setValidatedPlayers({});
      setProgress(gameEngine.getProgress());
      
      comms.hostStartQuestion(question);
    } else {
      endGame();
    }
  };

  const resetBuzzer = () => {
    gameEngine.resetBuzzer();
    setBuzzerWinner(null);
    setValidatedPlayers({});
    comms.send('host:reset-buzzer', {});
  };

  const toggleScoreboard = () => {
    setShowScoreboard(!showScoreboard);
  };

  const endGame = () => {
    const finalData = gameEngine.endGame();
    setGameEnded(true);
    setShowScoreboard(true);
    comms.hostEndGame();
  };

  const exportScores = () => {
    const scoreboard = gameEngine.getScoreboard();
    const csv = [
      'Rang,Pseudo,Score',
      ...scoreboard.map((p, i) => `${i + 1},${p.pseudo},${p.score}`)
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz-noel-scores-${Date.now()}.csv`;
    a.click();
  };

  if (!gameStarted) {
    return (
      <div className="screen host-screen">
        <SnowEffect />
        <div className="content">
          <h2>🎅 Présentateur</h2>
          
          <div className="players-waiting">
            <h3>Joueurs connectés: {Object.keys(players).length}</h3>
            <div className="players-list">
              {Object.values(players).map(player => (
                <div key={player.id} className="player-card">
                  {player.avatar && (
                    <img src={player.avatar} alt={player.pseudo} className="player-avatar-small" />
                  )}
                  <span>{player.pseudo}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            className="btn btn-primary btn-large"
            onClick={startGame}
            disabled={Object.keys(players).length === 0}
          >
            🎬 Lancer la partie
          </button>

          <p className="info-text">
            {Object.keys(players).length === 0 
              ? 'En attente de joueurs...' 
              : 'Tous les joueurs sont prêts!'}
          </p>
        </div>
      </div>
    );
  }

  if (gameEnded) {
    const scoreboard = gameEngine.getScoreboard();
    
    return (
      <div className="screen host-screen">
        <SnowEffect />
        <div className="content">
          <h2>🎉 Partie terminée!</h2>
          
          <div className="final-results">
            <h3>🏆 Classement final</h3>
            <div className="scoreboard-list">
              {scoreboard.map((player, index) => (
                <div key={player.playerId} className="scoreboard-item final">
                  <div className="rank large">{index + 1}</div>
                  {player.avatar && (
                    <img src={player.avatar} alt={player.pseudo} className="player-avatar" />
                  )}
                  <div className="player-info">
                    <div className="player-pseudo large">{player.pseudo}</div>
                    <div className="player-score large">{player.score} pts</div>
                  </div>
                  {index === 0 && <span className="trophy large">👑</span>}
                  {index === 1 && <span className="trophy">🥈</span>}
                  {index === 2 && <span className="trophy">🥉</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="final-actions">
            <button className="btn btn-secondary" onClick={exportScores}>
              📥 Exporter les scores (CSV)
            </button>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              🔄 Nouvelle partie
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const isMCQ = currentQuestion.type === 'mcq' || currentQuestion.type === 'tf';

  return (
    <div className="screen host-screen">
      <SnowEffect />
      <div className="content">
        <div className="game-header">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress.percentage}%` }} />
            <span className="progress-text">
              Question {progress.current} / {progress.total}
            </span>
          </div>
        </div>

        {showScoreboard && (
          <div className="scoreboard-overlay">
            <ScoreBoard players={players} scores={scores} />
            <button className="btn btn-secondary" onClick={toggleScoreboard}>
              Fermer
            </button>
          </div>
        )}

        <div className="question-panel">
          <div className="question-header">
            <span className="question-category">{currentQuestion.category}</span>
            <span className="question-subcategory">{currentQuestion.subcategory}</span>
            <span className="question-difficulty">
              Difficulté: {'⭐'.repeat(currentQuestion.difficulty)} ({settings.difficultyPoints[currentQuestion.difficulty]} pts)
            </span>
          </div>

          <h3 className="question-text">{currentQuestion.question}</h3>

          {currentQuestion.image_url && (
            <img src={currentQuestion.image_url} alt="Question" className="question-image" />
          )}

          {currentQuestion.audio_url && (
            <div className="audio-player">
              <audio controls src={currentQuestion.audio_url} />
            </div>
          )}

          <div className="answer-panel">
            <h4>Réponse correcte:</h4>
            <div className="correct-answer">
              {currentQuestion.answer}
            </div>
            
            {currentQuestion.choices && (
              <div className="choices-display">
                <h5>Choix:</h5>
                {currentQuestion.choices.map((choice, index) => (
                  <div key={index} className={`choice-item ${choice === currentQuestion.answer ? 'correct' : ''}`}>
                    {String.fromCharCode(65 + index)}. {choice}
                  </div>
                ))}
              </div>
            )}

            {currentQuestion.explanation && (
              <div className="explanation">
                <strong>Explication:</strong> {currentQuestion.explanation}
              </div>
            )}
          </div>
        </div>

        {isMCQ ? (
          <div className="mcq-responses">
            <h4>Réponses des joueurs:</h4>
            <div className="mcq-answers-list">
              {Object.entries(mcqAnswers).length === 0 ? (
                <p>En attente des réponses...</p>
              ) : (
                Object.entries(mcqAnswers).map(([playerId, choice]) => (
                  <div key={playerId} className="mcq-answer-item">
                    {players[playerId]?.avatar && (
                      <img src={players[playerId].avatar} alt="" className="player-avatar-tiny" />
                    )}
                    <span className="player-name">{players[playerId]?.pseudo || 'Inconnu'}</span>
                    <span className="player-choice">{choice}</span>
                    <div className="validation-buttons">
                      <button
                        className="btn btn-success btn-small"
                        onClick={() => validateAnswer(playerId, choice === currentQuestion.answer)}
                        disabled={validatedPlayers[playerId] !== undefined}
                      >
                        ✓
                      </button>
                    </div>
                    {validatedPlayers[playerId] !== undefined && (
                      <span className={`validation-badge ${validatedPlayers[playerId] ? 'correct' : 'incorrect'}`}>
                        {validatedPlayers[playerId] ? '🎅' : '❄️'}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="buzzer-responses">
            <h4>Buzzer:</h4>
            {buzzerWinner ? (
              <div className="buzzer-winner">
                <div className="winner-card">
                  {buzzerWinner.player?.avatar && (
                    <img src={buzzerWinner.player.avatar} alt="" className="player-avatar" />
                  )}
                  <span className="winner-name">{buzzerWinner.player?.pseudo || 'Inconnu'}</span>
                  <span className="winner-badge">⚡ A buzzé!</span>
                </div>
                <div className="validation-buttons">
                  <button
                    className="btn btn-success"
                    onClick={() => validateAnswer(buzzerWinner.winner, true)}
                    disabled={validatedPlayers[buzzerWinner.winner] !== undefined}
                  >
                    ✅ Correct
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => validateAnswer(buzzerWinner.winner, false)}
                    disabled={validatedPlayers[buzzerWinner.winner] !== undefined}
                  >
                    ❌ Incorrect
                  </button>
                </div>
                {validatedPlayers[buzzerWinner.winner] !== undefined && (
                  <div className={`validation-feedback ${validatedPlayers[buzzerWinner.winner] ? 'correct' : 'incorrect'}`}>
                    {validatedPlayers[buzzerWinner.winner] ? '🎅 Point accordé !' : '❄️ Point refusé'}
                  </div>
                )}
                <button className="btn btn-secondary btn-small" onClick={resetBuzzer}>
                  🔄 Reset Buzzer
                </button>
              </div>
            ) : (
              <p className="waiting-buzz">En attente d'un buzz...</p>
            )}
          </div>
        )}

        <div className="host-actions">
          <button className="btn btn-primary" onClick={nextQuestion}>
            ➡️ Question suivante
          </button>
          <button className="btn btn-secondary" onClick={toggleScoreboard}>
            📊 Classement
          </button>
          <button className="btn btn-danger" onClick={endGame}>
            🏁 Fin de partie
          </button>
        </div>
      </div>
    </div>
  );
};

export default HostScreen;