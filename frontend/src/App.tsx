import { useEffect, useState, useRef } from 'react';
import './App.css';

interface WSMessage {
  action?: 'open_votes' | 'close_votes';
  jwt_token?: string;
  team?: number;
  error?: string;
}

function App() {
  const [connected, setConnected] = useState(false);
  const [team, setTeam] = useState<number | null>(null);
  const [votesOpen, setVotesOpen] = useState(false);
  const [voted, setVoted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = import.meta.env.VITE_WS_HOST || window.location.hostname;
    const wsPort = import.meta.env.VITE_WS_PORT || '4000';
    const wsUrl = `${protocol}//${wsHost}:${wsPort}/`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      // Send initial connection message
      const storedToken = localStorage.getItem('jwt_token');
      if (storedToken) {
        ws.send(JSON.stringify({ jwt_token: storedToken }));
      } else {
        // For demo purposes, using a join token (you'd get this from a QR code)
        ws.send(JSON.stringify({ join_token: '' }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const message: WSMessage = JSON.parse(event.data);

        if (message.error) {
          setError(message.error);
          return;
        }

        if (message.jwt_token) {
          setJwtToken(message.jwt_token);
          localStorage.setItem('jwt_token', message.jwt_token);
          setTeam(message.team || null);
          setConnected(true);
          setError(null);
        }

        if (message.action === 'open_votes') {
          setVotesOpen(true);
          setVoted(false);
        }

        if (message.action === 'close_votes') {
          setVotesOpen(false);
        }
      } catch (err) {
        console.error('Failed to parse message:', err);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('Connection error. Please refresh the page.');
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setConnected(false);
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        if (wsRef.current?.readyState === WebSocket.CLOSED) {
          connectWebSocket();
        }
      }, 3000);
    };
  };

  const vote = (choice: 1 | 2) => {
    if (!wsRef.current || !jwtToken || !votesOpen || voted) return;

    wsRef.current.send(JSON.stringify({
      jwt_token: jwtToken,
      choice: choice
    }));

    setVoted(true);
  };

  if (error) {
    return (
      <div className="app">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Connection Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="spinner"></div>
          <h2>Connecting to game...</h2>
          <p>Please wait while we establish a connection</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className={`team-badge team-${team}`}>
        <span className="team-label">Votre équipe</span>
        <span className="team-number">{team}</span>
      </div>

      {votesOpen ? (
        <div className="vote-container">
          <h1 className="title">Il est temps de voter !</h1>
          <p className="subtitle">Choisir une direction</p>

          <div className="vote-buttons">
            <button
              className={`vote-button left ${voted ? 'disabled' : ''}`}
              onClick={() => vote(1)}
              disabled={voted}
            >
              <div className="button-content">
                <span className="arrow">←</span>
                <span className="label">Gauche</span>
              </div>
            </button>

            <button
              className={`vote-button right ${voted ? 'disabled' : ''}`}
              onClick={() => vote(2)}
              disabled={voted}
            >
              <div className="button-content">
                <span className="label">Droite</span>
                <span className="arrow">→</span>
              </div>
            </button>
          </div>

          {voted && (
            <div className="voted-message">
              <div className="checkmark">✓</div>
              <p>Vote pris en compte ! Merci de patienter.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="waiting-container">
          <div className="spinner"></div>
          <h2>En attente... regardez l'écran</h2>
          <p className="waiting-text">
            Vous pourrez voter au prochain tour. Restez sur la page.
          </p>
          <div className="info-box">
            <p>💡Lorsque le vote est ouvert, cliquez sur une flèche (gauche/droite) pour voter.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
