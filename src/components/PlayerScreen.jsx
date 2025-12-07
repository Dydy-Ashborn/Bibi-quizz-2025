import React, { useState, useEffect } from 'react';
import BuzzerButton from './BuzzerButton';
import gameEngine from '../utils/gameEngine';
import SnowEffect from './SnowEffect';

function PlayerScreen({ playerName, avatarUrl, onExit }) {
  const [gameState, setGameState] = useState(null);
  const [roomCode, setRoomCode] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState('');

  useEffect(() => {
    if (isConnected) {
      gameEngine.onStateChange((newState) => {
        setGameState(newState);
      });
    }
  }, [isConnected]);

  const handleConnect = async () => {
    if (!roomCode.trim()) {
      setConnectionError('Veuillez entrer un code');
      return;
    }

    setIsConnecting(true);
    setConnectionError('');

    try {
      await gameEngine.joinAsPlayer(roomCode.trim(), playerName, avatarUrl);
      setIsConnected(true);
      setGameState(gameEngine.getState());
    } catch (error) {
      console.error('Connection failed:', error);
      setConnectionError('Code invalide ou connexion impossible. Réessayez.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleAnswer = (answerIndex) => {
    gameEngine.submitAnswer(answerIndex);
  };

  // Écran de connexion
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 via-green-600 to-red-700 p-8 flex items-center justify-center relative">
        <SnowEffect />
        
        <button
          onClick={onExit}
          className="absolute top-4 left-4 bg-white/90 hover:bg-white text-red-600 px-6 py-3 rounded-full font-bold shadow-lg transition-all z-10"
        >
          ← Retour
        </button>

        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-12 max-w-md w-full">
          <div className="text-center mb-8">
            <img
              src={avatarUrl}
              alt={playerName}
              className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-red-400"
            />
            <h2 className="text-3xl font-bold text-gray-800">{playerName}</h2>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2 text-lg">
              Code de connexion :
            </label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && handleConnect()}
              placeholder="Ex: ABC123"
              maxLength={6}
              className="w-full px-6 py-4 text-2xl font-mono font-bold text-center border-4 border-gray-300 rounded-xl focus:border-red-400 focus:outline-none uppercase"
              disabled={isConnecting}
            />
          </div>

          {connectionError && (
            <div className="mb-4 p-4 bg-red-100 border-2 border-red-400 rounded-xl text-red-700 text-center">
              {connectionError}
            </div>
          )}

          <button
            onClick={handleConnect}
            disabled={isConnecting || !roomCode.trim()}
            className={`w-full text-xl px-8 py-4 rounded-xl font-bold transition-all shadow-lg ${
              isConnecting || !roomCode.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600 text-white hover:scale-105'
            }`}
          >
            {isConnecting ? 'Connexion...' : 'Se connecter'}
          </button>

          <div className="mt-6 text-center text-gray-600 text-sm">
            Demandez le code à l'hôte du quiz
          </div>
        </div>
      </div>
    );
  }

  // États du jeu une fois connecté
  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-600 via-green-600 to-red-700">
        <SnowEffect />
        <div className="text-white text-2xl">Chargement...</div>
      </div>
    );
  }

  const currentPlayer = gameState.players.find((p) => p.id === gameEngine.playerId);
  const hasAnswered = gameState.currentAnswers.some((a) => a.playerId === gameEngine.playerId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-green-600 to-red-700 p-8 relative">
      <SnowEffect />
      
      <button
        onClick={onExit}
        className="absolute top-4 left-4 bg-white/90 hover:bg-white text-red-600 px-6 py-3 rounded-full font-bold shadow-lg transition-all z-10"
      >
        ← Quitter
      </button>

      <div className="max-w-2xl mx-auto pt-20">
        {/* Player Info */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8 text-center">
          <img
            src={avatarUrl}
            alt={playerName}
            className="w-20 h-20 rounded-full mx-auto mb-3 border-4 border-green-400"
          />
          <h2 className="text-2xl font-bold text-gray-800">{playerName}</h2>
          {currentPlayer && (
            <div className="text-3xl font-bold text-green-600 mt-2">
              {currentPlayer.score} points
            </div>
          )}
        </div>

        {/* Waiting Phase */}
        {gameState.phase === 'waiting' && (
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-12 text-center">
            <div className="text-6xl mb-6">⏳</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              En attente du début du quiz...
            </h2>
            <p className="text-gray-600 text-xl">
              L'hôte va bientôt lancer la partie !
            </p>
          </div>
        )}

        {/* Question Phase */}
        {gameState.phase === 'question' && gameState.currentQuestion && (
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
            <div className="text-center mb-6">
              <span className="bg-red-500 text-white px-6 py-2 rounded-full text-lg font-bold">
                Question {gameState.currentQuestionIndex + 1}/{gameState.totalQuestions}
              </span>
            </div>

            <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center">
              {gameState.currentQuestion.question}
            </h3>

            {!hasAnswered ? (
              <div className="grid grid-cols-1 gap-4">
                {gameState.currentQuestion.answers.map((answer, index) => (
                  <BuzzerButton
                    key={index}
                    answer={answer}
                    answerIndex={index}
                    onClick={() => handleAnswer(index)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">✓</div>
                <div className="text-2xl font-bold text-green-600">
                  Réponse enregistrée !
                </div>
                <p className="text-gray-600 mt-2">
                  En attente des autres joueurs...
                </p>
              </div>
            )}
          </div>
        )}

        {/* Results Phase */}
        {gameState.phase === 'results' && gameState.currentQuestion && (
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
            <h3 className="text-3xl font-bold text-center mb-6 text-gray-800">
              Réponse correcte :
            </h3>
            
            <div className="text-center mb-6">
              <div className="inline-block bg-green-500 text-white px-8 py-4 rounded-2xl text-2xl font-bold shadow-lg">
                {gameState.currentQuestion.answers[gameState.currentQuestion.correct]}
              </div>
            </div>

            <div className="text-center text-gray-700 text-lg mb-6">
              {gameState.currentQuestion.explanation}
            </div>

            {currentPlayer && (
              <div className="text-center">
                <div className="text-xl text-gray-600 mb-2">Votre score :</div>
                <div className="text-5xl font-bold text-green-600">
                  {currentPlayer.score} points
                </div>
              </div>
            )}
          </div>
        )}

        {/* Final Phase */}
        {gameState.phase === 'final' && (
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-12 text-center">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              Quiz terminé ! 🎉
            </h2>
            
            {currentPlayer && (
              <div>
                <div className="text-xl text-gray-600 mb-2">Score final :</div>
                <div className="text-6xl font-bold text-green-600 mb-8">
                  {currentPlayer.score} points
                </div>
              </div>
            )}

            <p className="text-gray-600 text-xl">
              Regardez l'écran de l'hôte pour le classement complet !
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PlayerScreen;