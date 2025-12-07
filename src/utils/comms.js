import Peer from 'peerjs';

class CommunicationManager {
  constructor() {
    this.peer = null;
    this.connections = new Map(); // playerId -> connection
    this.isHost = false;
    this.hostConnection = null;
    this.peerId = null;
    this.onMessageCallback = null;
    this.onPlayerJoinCallback = null;
    this.onPlayerLeaveCallback = null;
    this.onConnectionReadyCallback = null;
  }

  // Génère un code de connexion simple (6 caractères)
  generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  // HOST: Initialiser en tant qu'hôte
  async initAsHost() {
    this.isHost = true;
    const roomCode = this.generateRoomCode();
    
    return new Promise((resolve, reject) => {
      this.peer = new Peer(roomCode, {
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        }
      });

      this.peer.on('open', (id) => {
        this.peerId = id;
        console.log('Host peer ID:', id);
        resolve(roomCode);
      });

      this.peer.on('connection', (conn) => {
        this.handleIncomingConnection(conn);
      });

      this.peer.on('error', (err) => {
        console.error('Peer error:', err);
        reject(err);
      });
    });
  }

  // HOST: Gérer les connexions entrantes
  handleIncomingConnection(conn) {
    console.log('New player connecting:', conn.peer);

    conn.on('open', () => {
      console.log('Connection opened with:', conn.peer);
      
      // Attendre que le joueur envoie ses infos
      conn.on('data', (data) => {
        if (data.type === 'player_info') {
          const playerId = data.playerId;
          this.connections.set(playerId, conn);
          
          if (this.onPlayerJoinCallback) {
            this.onPlayerJoinCallback(playerId, data.playerName, data.avatarUrl);
          }

          // Envoyer confirmation
          conn.send({ type: 'join_confirmed', playerId });
        } else if (this.onMessageCallback) {
          this.onMessageCallback(data);
        }
      });
    });

    conn.on('close', () => {
      // Trouver le playerId correspondant
      for (let [playerId, connection] of this.connections.entries()) {
        if (connection === conn) {
          this.connections.delete(playerId);
          if (this.onPlayerLeaveCallback) {
            this.onPlayerLeaveCallback(playerId);
          }
          break;
        }
      }
    });

    conn.on('error', (err) => {
      console.error('Connection error:', err);
    });
  }

  // PLAYER: Se connecter à l'hôte
  async connectToHost(roomCode, playerId, playerName, avatarUrl) {
    this.isHost = false;
    
    return new Promise((resolve, reject) => {
      this.peer = new Peer({
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        }
      });

      this.peer.on('open', (id) => {
        this.peerId = id;
        console.log('Player peer ID:', id);

        // Se connecter à l'hôte
        const conn = this.peer.connect(roomCode.toUpperCase());
        this.hostConnection = conn;

        conn.on('open', () => {
          console.log('Connected to host');
          
          // Envoyer les infos du joueur
          conn.send({
            type: 'player_info',
            playerId,
            playerName,
            avatarUrl
          });

          conn.on('data', (data) => {
            if (data.type === 'join_confirmed') {
              resolve();
            } else if (this.onMessageCallback) {
              this.onMessageCallback(data);
            }
          });

          if (this.onConnectionReadyCallback) {
            this.onConnectionReadyCallback();
          }
        });

        conn.on('error', (err) => {
          console.error('Connection error:', err);
          reject(err);
        });

        conn.on('close', () => {
          console.log('Disconnected from host');
        });
      });

      this.peer.on('error', (err) => {
        console.error('Peer error:', err);
        reject(err);
      });

      // Timeout si la connexion prend trop de temps
      setTimeout(() => {
        if (!this.hostConnection || !this.hostConnection.open) {
          reject(new Error('Connection timeout'));
        }
      }, 15000);
    });
  }

  // HOST: Envoyer un message à un joueur spécifique
  sendToPlayer(playerId, message) {
    const conn = this.connections.get(playerId);
    if (conn && conn.open) {
      conn.send(message);
    }
  }

  // HOST: Envoyer un message à tous les joueurs
  broadcast(message) {
    this.connections.forEach((conn) => {
      if (conn.open) {
        conn.send(message);
      }
    });
  }

  // PLAYER: Envoyer un message à l'hôte
  sendToHost(message) {
    if (this.hostConnection && this.hostConnection.open) {
      this.hostConnection.send(message);
    }
  }

  // Callbacks
  onMessage(callback) {
    this.onMessageCallback = callback;
  }

  onPlayerJoin(callback) {
    this.onPlayerJoinCallback = callback;
  }

  onPlayerLeave(callback) {
    this.onPlayerLeaveCallback = callback;
  }

  onConnectionReady(callback) {
    this.onConnectionReadyCallback = callback;
  }

  // Déconnexion
  disconnect() {
    if (this.peer) {
      this.peer.destroy();
    }
    this.connections.clear();
    this.hostConnection = null;
  }
}

export default new CommunicationManager();