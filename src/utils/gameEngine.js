import comms from './comms';
import questions from './questions.json';
class GameEngine {
  constructor() {
    this.state = {
      phase: 'waiting', // waiting, question, results, final
      players: [],
      currentQuestionIndex: -1,
      currentQuestion: null,
      currentAnswers: [],
      totalQuestions: questions.length,
    };
    this.isHost = false;
    this.playerId = null;
    this.stateChangeCallbacks = [];
  }

  // HOST: Initialiser le jeu en tant qu'hôte
  async initializeAsHost() {
    this.isHost = true;
    
    const roomCode = await comms.initAsHost();

    comms.onPlayerJoin((playerId, playerName, avatarUrl) => {
      this.addPlayer(playerId, playerName, avatarUrl);
    });

    comms.onPlayerLeave((playerId) => {
      this.removePlayer(playerId);
    });

    comms.onMessage((message) => {
      this.handleMessage(message);
    });

    return roomCode;
  }

  // PLAYER: Rejoindre en tant que joueur
  async joinAsPlayer(roomCode, playerName, avatarUrl) {
    this.isHost = false;
    this.playerId = this.generatePlayerId();
    
    await comms.connectToHost(roomCode, this.playerId, playerName, avatarUrl);

    comms.onMessage((message) => {
      this.handleMessage(message);
    });
  }

  generatePlayerId() {
    return 'player_' + Math.random().toString(36).substr(2, 9);
  }

  addPlayer(playerId, playerName, avatarUrl) {
    if (!this.state.players.find((p) => p.id === playerId)) {
      this.state.players.push({
        id: playerId,
        name: playerName,
        avatarUrl: avatarUrl,
        score: 0,
      });
      this.notifyStateChange();
      this.broadcastState();
    }
  }

  removePlayer(playerId) {
    this.state.players = this.state.players.filter((p) => p.id !== playerId);
    this.notifyStateChange();
    this.broadcastState();
  }

  startGame() {
    if (!this.isHost) return;
    this.state.phase = 'question';
    this.state.currentQuestionIndex = 0;
    this.state.currentQuestion = questions[0];
    this.state.currentAnswers = [];
    this.notifyStateChange();
    this.broadcastState();
  }

  nextQuestion() {
    if (!this.isHost) return;

    if (this.state.phase === 'question') {
      // Passer à la phase résultats
      this.state.phase = 'results';
      this.calculateScores();
      this.notifyStateChange();
      this.broadcastState();
    } else if (this.state.phase === 'results') {
      // Passer à la question suivante
      this.state.currentQuestionIndex++;
      if (this.state.currentQuestionIndex < questions.length) {
        this.state.phase = 'question';
        this.state.currentQuestion = questions[this.state.currentQuestionIndex];
        this.state.currentAnswers = [];
        this.notifyStateChange();
        this.broadcastState();
      }
    }
  }

  endGame() {
    if (!this.isHost) return;
    this.state.phase = 'final';
    this.state.players.sort((a, b) => b.score - a.score);
    this.notifyStateChange();
    this.broadcastState();
  }

  submitAnswer(answerIndex) {
    if (this.isHost) return;
    comms.sendToHost({
      type: 'answer',
      playerId: this.playerId,
      answerIndex: answerIndex,
      timestamp: Date.now(),
    });
  }

  handleMessage(message) {
    if (message.type === 'state_update') {
      this.state = message.state;
      this.notifyStateChange();
    } else if (message.type === 'answer' && this.isHost) {
      const existingAnswer = this.state.currentAnswers.find(
        (a) => a.playerId === message.playerId
      );
      if (!existingAnswer) {
        this.state.currentAnswers.push({
          playerId: message.playerId,
          answerIndex: message.answerIndex,
          timestamp: message.timestamp,
        });
        this.notifyStateChange();
      }
    }
  }

  calculateScores() {
    const correctAnswerIndex = this.state.currentQuestion.correct;
    const sortedAnswers = [...this.state.currentAnswers].sort(
      (a, b) => a.timestamp - b.timestamp
    );

    sortedAnswers.forEach((answer, index) => {
      if (answer.answerIndex === correctAnswerIndex) {
        const player = this.state.players.find((p) => p.id === answer.playerId);
        if (player) {
          let points = 1000;
          if (index === 0) points += 500; // Bonus premier
          else if (index === 1) points += 300; // Bonus deuxième
          else if (index === 2) points += 100; // Bonus troisième
          player.score += points;
        }
      }
    });
  }

  broadcastState() {
    if (this.isHost) {
      comms.broadcast({
        type: 'state_update',
        state: this.state,
      });
    }
  }

  onStateChange(callback) {
    this.stateChangeCallbacks.push(callback);
  }

  notifyStateChange() {
    this.stateChangeCallbacks.forEach((callback) => callback(this.state));
  }

  getState() {
    return this.state;
  }

  cleanup() {
    comms.disconnect();
    this.stateChangeCallbacks = [];
  }
}

export default new GameEngine();