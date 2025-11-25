import React, { useState, useEffect } from 'react';
import AvatarCapture from './AvatarCapture';
import BuzzerButton from './BuzzerButton';
import SnowEffect from './SnowEffect';

const PlayerScreen = ({ comms }) => {
  const [step, setStep] = useState('setup'); // setup, waiting, question
  const [pseudo, setPseudo] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [playerId] = useState(`player-${Date.now()}-${Math.random()}`);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [buzzerDisabled, setBuzzerDisabled] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [winnerName, setWinnerName] = useState(null);

  useEffect(() => {
    // Écouter les événements du host
    comms.on('host:start-question', handleNewQuestion);
    comms.on('host:next-question', handleNextQuestion);
    comms.on('host:validate', handleValidation);
    comms.on('host:reset-buzzer', handleResetBuzzer);
    comms.on('host:end-game', handleEndGame);

    return () => {
      comms.off('host:start-question', handleNewQuestion);
      comms.off('host:next-question', handleNextQuestion);
      comms.off('host:validate', handleValidation);
      comms.off('host:reset-buzzer', handleResetBuzzer);
      comms.off('host:end-game', handleEndGame);
    };
  }, []);

  const handleNewQuestion = (questionData) => {
    setCurrentQuestion(questionData);
    setHasAnswered(false);
    setSelectedChoice(null);
    setBuzzerDisabled(false);
    setFeedback(null);
    setWinnerName(null);
    setStep('question');
  };

  const handleNextQuestion = () => {
    setHasAnswered(false);
    setSelectedChoice(null);
    setBuzzerDisabled(false);
    setFeedback(null);
    setStep('waiting');
  };

  const handleValidation = (data) => {
    if (data.playerId === playerId) {
      // C'est nous qui avons répondu
      if (data.isCorrect) {
        setFeedback('🎅 Bravo ! Bonne réponse !');
      } else {
        setFeedback('❄️ Dommage... Ce n\'était pas la bonne réponse !');
      }
    } else {
      // C'est quelqu'un d'autre
      if (data.isCorrect) {
        const name = data.playerName || 'Un joueur';
        setWinnerName(name);
        setFeedback(`🎁 ${name} a gagné le point !`);
      }
    }
  };

  const handleResetBuzzer = () => {
    setBuzzerDisabled(false);
    setHasAnswered(false);
    setFeedback(null);
    setWinnerName(null);
  };

  const handleEndGame = () => {
    setStep('ended');
  };

  const handleAvatarCapture = (avatarData) => {
    setAvatar(avatarData);
  };

  const handleJoin = () => {
    if (!pseudo.trim() || !avatar) {
      alert('Veuillez saisir un pseudo et prendre une photo');
      return;
    }

    comms.playerJoin({
      playerId,
      pseudo: pseudo.trim(),
      avatar
    });

    setStep('waiting');
  };

  const handleBuzz = () => {
    if (buzzerDisabled || hasAnswered) return;
    
    comms.playerBuzz(playerId);
    setBuzzerDisabled(true);
    setHasAnswered(true);
  };

  const handleMCQChoice = (choice) => {
    if (hasAnswered) return;
    
    setSelectedChoice(choice);
    setHasAnswered(true);
    comms.playerMCQAnswer(playerId, choice);
  };

  if (step === 'setup') {
    return (
      <div className="screen player-screen">
        <SnowEffect />
        <div className="content">
          <h2>🎁 Rejoindre la partie</h2>
          
          <div className="player-setup">
            <input
              type="text"
              placeholder="Votre pseudo"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              className="input-pseudo"
              maxLength={20}
            />

            <AvatarCapture onCapture={handleAvatarCapture} />

            <button
              onClick={handleJoin}
              className="btn btn-primary"
              disabled={!pseudo.trim() || !avatar}
            >
              Rejoindre
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'waiting') {
    return (
      <div className="screen player-screen">
        <SnowEffect />
        <div className="content">
          <h2>⏳ En attente</h2>
          <p>Bienvenue {pseudo}!</p>
          {avatar && <img src={avatar} alt={pseudo} className="player-avatar" />}
          <p className="waiting-text">En attente de la prochaine question...</p>
        </div>
      </div>
    );
  }

  if (step === 'ended') {
    return (
      <div className="screen player-screen">
        <SnowEffect />
        <div className="content">
          <h2>🎉 Partie terminée!</h2>
          <p>Merci d'avoir participé {pseudo}!</p>
          {avatar && <img src={avatar} alt={pseudo} className="player-avatar" />}
          <p>Le présentateur affiche les résultats finaux</p>
        </div>
      </div>
    );
  }

  if (step === 'question' && currentQuestion) {
    const isMCQ = currentQuestion.type === 'mcq';
    const isTrueFalse = currentQuestion.type === 'tf';

    return (
      <div className="screen player-screen">
        <SnowEffect />
        <div className="content">
          {feedback && (
            <div className={`feedback ${feedback.includes('🎅') ? 'success' : feedback.includes('🎁') ? 'info' : 'error'}`}>
              {feedback}
            </div>
          )}

          <div className="question-display">
            <div className="question-header">
              <span className="question-category">{currentQuestion.category}</span>
              <span className="question-difficulty">
                {'⭐'.repeat(currentQuestion.difficulty)}
              </span>
            </div>
            
            <h3 className="question-text">{currentQuestion.question}</h3>

            {currentQuestion.image_url && (
              <img src={currentQuestion.image_url} alt="Question" className="question-image" />
            )}
          </div>

          {isMCQ ? (
            <div className="mcq-choices">
              {currentQuestion.choices && currentQuestion.choices.map((choice, index) => (
                <button
                  key={index}
                  className={`mcq-choice ${selectedChoice === choice ? 'selected' : ''}`}
                  onClick={() => handleMCQChoice(choice)}
                  disabled={hasAnswered}
                >
                  {String.fromCharCode(65 + index)}. {choice}
                </button>
              ))}
              {hasAnswered && (
                <p className="answer-sent">✓ Réponse envoyée</p>
              )}
            </div>
          ) : isTrueFalse ? (
            <div className="tf-choices">
              <button
                className={`tf-choice ${selectedChoice === 'true' ? 'selected' : ''}`}
                onClick={() => handleMCQChoice('true')}
                disabled={hasAnswered}
              >
                ✅ VRAI
              </button>
              <button
                className={`tf-choice ${selectedChoice === 'false' ? 'selected' : ''}`}
                onClick={() => handleMCQChoice('false')}
                disabled={hasAnswered}
              >
                ❌ FAUX
              </button>
              {hasAnswered && (
                <p className="answer-sent">✓ Réponse envoyée</p>
              )}
            </div>
          ) : (
            <div className="buzzer-section">
              <BuzzerButton 
                onBuzz={handleBuzz} 
                disabled={buzzerDisabled || hasAnswered}
              />
              {hasAnswered && (
                <p className="buzzed-text">⚡ Vous avez buzzé!</p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default PlayerScreen;