import React, { useState, useEffect } from 'react';
import ScoreBoard from './ScoreBoard';
import gameEngine from '../utils/gameEngine';
import SnowEffect from './SnowEffect';

function HostScreen({ onExit }) {
  const [gameState, setGameState] = useState(null);
  const [roomCode, setRoomCode] = useState('');
  const [showRoomCode, setShowRoomCode] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      try {
        const code = await gameEngine.initializeAsHost();
        setRoomCode(code);
        
        gameEngine.onStateChange((newState) => {
          setGameState(newState);
          
          // Masquer le code quand le jeu commence
          if (newState.phase === 'question' && showRoomCode) {
            setShowRoomCode(false);
          }
        });

        setGameState(gameEngine.getState());
      } catch (error) {
        console.error('Failed to initialize host:', error);
        alert('Erreur lors de l\'initialisation. Veuillez réessayer.');
        onExit();
      }
    };

    initialize();

    return () => {
      gameEngine.cleanup();
    };
  }, [onExit, showRoomCode]);

  const handleStartGame = () => {
    gameEngine.startGame();
  };

  const handleNextQuestion = () => {
    gameEngine.nextQuestion();
  };

  const handleEndGame = () => {
    gameEngine.endGame();
  };

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-600 via-green-600 to-red-700">
        <SnowEffect />
        <div className="text-white text-2xl">Initialisation...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-green-600 to-red-700 p-8 relative">
      <SnowEffect />
      
      {/* Code de connexion en haut à droite */}
      {showRoomCode && (
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border-4 border-yellow-400">
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-600 mb-2">CODE DE CONNEXION</div>
            <div className="text-5xl font-bold text-red-600 tracking-wider font-mono">
              {roomCode}
            </div>
            <div className="text-xs text-gray-500 mt-2">Les joueurs doivent entrer ce code</div>
          </div>
        </div>
      )}

      {/* Bouton retour */}
      <button
        onClick={onExit}
        className="absolute top-4 left-4 bg-white/90 hover:bg-white text-red-600 px-6 py-3 rounded-full font-bold shadow-lg transition-all z-10"
      >
        ← Quitter
      </button>

      <div className="max-w-6xl mx-auto pt-20">
        {/* Waiting Phase */}
        {gameState.phase === 'waiting' && (
          <div className="text-center">
            <h1 className="text-6xl font-bold text-white mb-8 drop-shadow-lg">
              🎄 Quiz de Noël 🎅
            </h1>
            
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-12 mb-8">
              <h2 className="text-3xl font-bold text-red-600 mb-6">
                En attente des joueurs...
              </h2>
              
              {gameState.players.length === 0 ? (
                <div className="text-gray-600 text-xl mb-8">
                  Les joueurs doivent entrer le code <span className="font-bold text-red-600">{roomCode}</span>
                </div>
              ) : (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-700 mb-4">
                    Joueurs connectés ({gameState.players.length}) :
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {gameState.players.map((player) => (
                      <div
                        key={player.id}
                        className="bg-green-50 rounded-xl p-4 border-2 border-green-200"
                      >
                        <img
                          src={player.avatarUrl}
                          alt={player.name}
                          className="w-16 h-16 rounded-full mx-auto mb-2 border-2 border-green-400"
                        />
                        <div className="font-semibold text-gray-800">{player.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleStartGame}
                disabled={gameState.players.length === 0}
                className={`text-2xl px-12 py-4 rounded-full font-bold transition-all shadow-lg ${
                  gameState.players.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 text-white hover:scale-105'
                }`}
              >
                Commencer le Quiz
              </button>
            </div>
          </div>
        )}

        {/* Question Phase */}
        {gameState.phase === 'question' && gameState.currentQuestion && (
          <div>
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-12 mb-8">
              <div className="text-center mb-8">
                <span className="bg-red-500 text-white px-6 py-2 rounded-full text-xl font-bold">
                  Question {gameState.currentQuestionIndex + 1}/{gameState.totalQuestions}
                </span>
              </div>

              <h2 className="text-4xl font-bold text-gray-800 mb-12 text-center">
                {gameState.currentQuestion.question}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {gameState.currentQuestion.answers.map((answer, index) => {
                  const colors = [
                    'bg-red-500',
                    'bg-blue-500',
                    'bg-yellow-500',
                    'bg-green-500',
                  ];
                  return (
                    <div
                      key={index}
                      className={`${colors[index]} text-white p-8 rounded-2xl text-2xl font-bold text-center shadow-lg`}
                    >
                      {answer}
                    </div>
                  );
                })}
              </div>

              <div className="text-center mt-8">
                <div className="text-gray-600 text-xl">
                  Réponses reçues : {gameState.currentAnswers.length}/{gameState.players.length}
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={handleNextQuestion}
                className="bg-white hover:bg-gray-100 text-red-600 px-12 py-4 rounded-full text-2xl font-bold shadow-lg transition-all hover:scale-105"
              >
                Question suivante →
              </button>
            </div>
          </div>
        )}

        {/* Results Phase */}
        {gameState.phase === 'results' && gameState.currentQuestion && (
          <div>
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-12 mb-8">
              <h2 className="text-4xl font-bold text-center mb-8 text-gray-800">
                Réponse correcte :
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {gameState.currentQuestion.answers.map((answer, index) => {
                  const isCorrect = index === gameState.currentQuestion.correct;
                  const colors = [
                    'bg-red-500',
                    'bg-blue-500',
                    'bg-yellow-500',
                    'bg-green-500',
                  ];
                  
                  return (
                    <div
                      key={index}
                      className={`${
                        isCorrect
                          ? 'bg-green-500 ring-8 ring-yellow-400'
                          : colors[index] + ' opacity-50'
                      } text-white p-8 rounded-2xl text-2xl font-bold text-center shadow-lg transition-all`}
                    >
                      {answer}
                      {isCorrect && <div className="text-4xl mt-2">✓</div>}
                    </div>
                  );
                })}
              </div>

              <div className="text-center text-gray-700 text-xl">
                {gameState.currentQuestion.explanation}
              </div>
            </div>

            <ScoreBoard players={gameState.players} compact={true} />

            <div className="text-center mt-8">
              {gameState.currentQuestionIndex < gameState.totalQuestions - 1 ? (
                <button
                  onClick={handleNextQuestion}
                  className="bg-white hover:bg-gray-100 text-red-600 px-12 py-4 rounded-full text-2xl font-bold shadow-lg transition-all hover:scale-105"
                >
                  Question suivante →
                </button>
              ) : (
                <button
                  onClick={handleEndGame}
                  className="bg-yellow-400 hover:bg-yellow-500 text-red-600 px-12 py-4 rounded-full text-2xl font-bold shadow-lg transition-all hover:scale-105"
                >
                  Voir les résultats finaux 🏆
                </button>
              )}
            </div>
          </div>
        )}

        {/* Final Phase */}
        {gameState.phase === 'final' && (
          <div>
            <h1 className="text-6xl font-bold text-white text-center mb-8 drop-shadow-lg">
              🏆 Classement Final 🏆
            </h1>
            
            <ScoreBoard players={gameState.players} />

            <div className="text-center mt-8">
              <button
                onClick={onExit}
                className="bg-white hover:bg-gray-100 text-red-600 px-12 py-4 rounded-full text-2xl font-bold shadow-lg transition-all hover:scale-105"
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HostScreen;