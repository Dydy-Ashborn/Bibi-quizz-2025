// Communication via BroadcastChannel (local, sans serveur)
// Fallback Firebase commenté, prêt à activer

export class GameComms {
  constructor(channelName = 'quiz-noel') {
    this.channelName = channelName;
    this.listeners = {};
    this.initChannel();
  }

  initChannel() {
    // BroadcastChannel pour communication locale
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.channel = new BroadcastChannel(this.channelName);
        this.channel.onmessage = (event) => this.handleMessage(event.data);
      } catch (e) {
        console.error('BroadcastChannel error:', e);
      }
    }
    
    // Fallback Firebase (commenté, prêt à activer)
    /*
    import { initializeApp } from 'firebase/app';
    import { getDatabase, ref, onValue, set } from 'firebase/database';
    
    const firebaseConfig = {
      // Votre config Firebase ici
    };
    
    const app = initializeApp(firebaseConfig);
    this.db = getDatabase(app);
    this.sessionRef = ref(this.db, `sessions/${channelName}`);
    
    onValue(this.sessionRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        this.handleMessage(data);
      }
    });
    */
  }

  send(type, payload) {
    const message = {
      type,
      payload,
      timestamp: Date.now()
    };
    
    if (this.channel) {
      try {
        this.channel.postMessage(message);
      } catch (e) {
        console.error('Error sending message:', e);
        // Réinitialiser le channel si fermé
        this.initChannel();
        try {
          this.channel.postMessage(message);
        } catch (e2) {
          console.error('Failed to reinit channel:', e2);
        }
      }
    }
    
    // Firebase fallback
    /*
    if (this.db) {
      set(this.sessionRef, message);
    }
    */
  }

  on(eventType, callback) {
    if (!this.listeners[eventType]) {
      this.listeners[eventType] = [];
    }
    this.listeners[eventType].push(callback);
  }

  off(eventType, callback) {
    if (this.listeners[eventType]) {
      this.listeners[eventType] = this.listeners[eventType].filter(
        cb => cb !== callback
      );
    }
  }

  handleMessage(message) {
    const { type, payload } = message;
    if (this.listeners[type]) {
      this.listeners[type].forEach(callback => callback(payload));
    }
  }

  // Événements du jeu
  playerJoin(playerData) {
    this.send('player:join', playerData);
  }

  playerBuzz(playerId) {
    this.send('player:buzz', { playerId, timestamp: Date.now() });
  }

  playerMCQAnswer(playerId, selectedChoice) {
    this.send('player:mcq', { playerId, selectedChoice });
  }

  hostStartQuestion(questionData) {
    this.send('host:start-question', questionData);
  }

  hostValidateAnswer(playerId, isCorrect) {
    this.send('host:validate', { playerId, isCorrect });
  }

  hostNextQuestion() {
    this.send('host:next-question', {});
  }

  hostResetBuzzer() {
    this.send('host:reset-buzzer', {});
  }

  hostEndGame() {
    this.send('host:end-game', {});
  }

  hostShowScoreboard(scoreboard) {
    this.send('host:show-scoreboard', scoreboard);
  }

  disconnect() {
    if (this.channel) {
      try {
        this.channel.close();
      } catch (e) {
        console.error('Error closing channel:', e);
      }
      this.channel = null;
    }
  }
}