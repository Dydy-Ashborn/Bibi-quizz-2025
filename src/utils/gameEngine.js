export class GameEngine {
  constructor(questions, settings) {
    this.questions = questions;
    this.settings = settings;
    this.currentQuestionIndex = 0;
    this.players = {};
    this.scores = {};
    this.questionOrder = [];
    this.buzzerWinner = null;
    this.mcqAnswers = {};
  }

  addPlayer(playerId, playerData) {
    this.players[playerId] = {
      id: playerId,
      pseudo: playerData.pseudo,
      avatar: playerData.avatar,
      joinedAt: Date.now()
    };
    this.scores[playerId] = 0;
  }

  removePlayer(playerId) {
    delete this.players[playerId];
    delete this.scores[playerId];
  }

  setQuestionOrder(order) {
    this.questionOrder = order;
  }

  getCurrentQuestion() {
    if (this.currentQuestionIndex >= this.questionOrder.length) {
      return null;
    }
    const questionId = this.questionOrder[this.currentQuestionIndex];
    return this.questions.find(q => q.id === questionId);
  }

  getQuestionByIndex(index) {
    if (index >= this.questionOrder.length) {
      return null;
    }
    const questionId = this.questionOrder[index];
    return this.questions.find(q => q.id === questionId);
  }

  handleBuzzer(playerId) {
    const question = this.getCurrentQuestion();
    if (!question || question.type === 'mcq' || question.type === 'tf') {
      return null;
    }
    
    if (!this.buzzerWinner) {
      this.buzzerWinner = playerId;
      return {
        winner: playerId,
        player: this.players[playerId],
        timestamp: Date.now()
      };
    }
    return null;
  }

  handleMCQAnswer(playerId, selectedChoice) {
    const question = this.getCurrentQuestion();
    if (!question || question.type !== 'mcq') {
      return false;
    }
    
    this.mcqAnswers[playerId] = selectedChoice;
    return true;
  }

  validateAnswer(playerId, isCorrect) {
    const question = this.getCurrentQuestion();
    if (!question) return;

    if (isCorrect) {
      const points = this.settings.difficultyPoints[question.difficulty] || 10;
      this.scores[playerId] = (this.scores[playerId] || 0) + points;
    }

    return {
      playerId,
      isCorrect,
      newScore: this.scores[playerId]
    };
  }

  resetBuzzer() {
    this.buzzerWinner = null;
  }

  resetMCQAnswers() {
    this.mcqAnswers = {};
  }

  nextQuestion() {
    this.currentQuestionIndex++;
    this.buzzerWinner = null;
    this.mcqAnswers = {};
    return this.getCurrentQuestion();
  }

  getScoreboard() {
    const scoreboard = Object.keys(this.scores).map(playerId => ({
      playerId,
      pseudo: this.players[playerId]?.pseudo || 'Inconnu',
      avatar: this.players[playerId]?.avatar || null,
      score: this.scores[playerId]
    }));

    return scoreboard.sort((a, b) => b.score - a.score);
  }

  getProgress() {
    return {
      current: this.currentQuestionIndex + 1,
      total: this.questionOrder.length,
      percentage: ((this.currentQuestionIndex + 1) / this.questionOrder.length) * 100
    };
  }

  isGameOver() {
    return this.currentQuestionIndex >= this.questionOrder.length;
  }

  endGame() {
    return {
      finalScores: this.getScoreboard(),
      totalQuestions: this.questionOrder.length,
      endedAt: Date.now()
    };
  }
}