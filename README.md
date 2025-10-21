# Ville en Lumière 2025 - Interactive Voting System

This project provides a real-time interactive voting system with WebSocket communication between a backend server and a React frontend.

## Project Structure

```
├── server/               # Backend Node.js/TypeScript server
│   └── src/
│       ├── index.ts                        # Main server entry point
│       ├── routes.ts                       # Voting API routes
│       ├── websocket.ts                    # WebSocket handler for voting
│       ├── tools.ts                        # JWT utilities
│       ├── example-routes.ts               # Example REST API routes
│       └── example-websocket-handler.ts    # Example WebSocket handler
│
└── frontend/            # React + TypeScript frontend
    ├── src/
    │   ├── App.tsx      # Main voting interface component
    │   ├── App.css      # Styles for the voting interface
    │   ├── main.tsx     # React entry point
    │   └── index.css    # Global styles
    └── index.html       # HTML template
```

## Features

### Backend
- **Real-time WebSocket communication** for instant vote updates
- **JWT-based authentication** for secure client connections
- **Team-based voting system** (Team 1 and Team 2)
- **Vote management API** to open/close voting rounds
- **Results API** to fetch current vote counts

### Frontend
- **Modern React + TypeScript** application built with Vite
- **Real-time WebSocket connection** with automatic reconnection
- **Team display** showing which team the user is on
- **Interactive voting interface** with left/right options
- **Loading states** with animations when votes are closed
- **Error handling** with user-friendly messages
- **Responsive design** that works on desktop and mobile
- **Beautiful gradient UI** with team-specific colors

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Build and start the server:
```bash
npm run build
npm start
```

The server will start on port 3000 (or the port specified in your configuration).

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Dependencies are already installed. Start the development server:
```bash
npm run dev
```

3. For production build:
```bash
npm run build
npm run preview
```

The frontend will be available at http://localhost:5173/

## API Endpoints

### REST API

#### Get Results
```
GET /api/results
```
Returns current vote counts and team player counts.

**Response:**
```json
{
  "left": 5,
  "right": 3,
  "team1_players": 4,
  "team2_players": 4
}
```

#### Start Vote
```
POST /api/start-vote
```
Opens voting for all connected clients.

#### Stop Vote
```
POST /api/stop-vote
```
Closes voting for all connected clients.

### WebSocket API

Connect to `ws://localhost:3000/` (or your server URL)

#### Client → Server Messages

**Initial Connection (with JWT):**
```json
{
  "jwt_token": "your_jwt_token_here"
}
```

**Initial Connection (with Join Token):**
```json
{
  "join_token": "game_token_here"
}
```

**Cast Vote:**
```json
{
  "jwt_token": "your_jwt_token",
  "choice": 1  // 1 for left, 2 for right
}
```

#### Server → Client Messages

**Welcome Message:**
```json
{
  "jwt_token": "new_jwt_token",
  "team": 1,
  "action": "open_votes" // or "close_votes"
}
```

**Vote Opened:**
```json
{
  "action": "open_votes"
}
```

**Vote Closed:**
```json
{
  "action": "close_votes"
}
```

**Error:**
```json
{
  "error": "Error message"
}
```

## Frontend Features

### Connection States

1. **Connecting**: Shows a loading spinner while establishing WebSocket connection
2. **Connected**: Displays team badge and voting interface
3. **Error**: Shows error message with retry button

### Voting States

1. **Votes Open**: Large, animated buttons to vote left or right
2. **Votes Closed**: Loading animation with explanation text
3. **Vote Submitted**: Confirmation message after voting

### Visual Design

- **Team 1**: Blue theme (#3b82f6)
- **Team 2**: Red theme (#ef4444)
- **Dark background** with gradient
- **Smooth animations** for state transitions
- **Responsive layout** adapting to mobile screens

## Example Files

### Example Routes (`example-routes.ts`)
Demonstrates:
- GET, POST, PUT, DELETE endpoints
- Request parameter handling
- Error responses
- RESTful API patterns

### Example WebSocket Handler (`example-websocket-handler.ts`)
Demonstrates:
- Chat room functionality
- Broadcasting messages
- Client management
- Connection/disconnection handling

## Development

### Backend Development
```bash
cd server
npm run dev  # If you have a dev script with nodemon/ts-node
```

### Frontend Development
```bash
cd frontend
npm run dev
```

The Vite dev server includes hot module replacement for instant updates.

## Production Deployment

### Backend
1. Build the TypeScript:
```bash
cd server
npm run build
```

2. Start the server:
```bash
npm start
```

### Frontend
1. Build for production:
```bash
cd frontend
npm run build
```

2. The `dist/` folder contains the optimized static files ready to deploy to any static hosting service (Netlify, Vercel, etc.) or serve from your backend.

### Serving Frontend from Backend
You can serve the frontend from the backend by adding static file serving in your Express app:

```typescript
import express from 'express';
import path from 'path';

app.use(express.static(path.join(__dirname, '../../frontend/dist')));
```

## Configuration

### WebSocket URL
Update the WebSocket URL in `frontend/src/App.tsx` based on your deployment:

```typescript
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const wsUrl = `${protocol}//${window.location.hostname}:3000/`;
```

For production, you might want to use environment variables.

## Troubleshooting

### WebSocket Connection Failed
- Ensure the backend server is running
- Check that the WebSocket URL in the frontend matches your backend
- Verify firewall/network settings allow WebSocket connections

### Votes Not Updating
- Check browser console for WebSocket errors
- Verify JWT token is being stored and sent correctly
- Ensure the backend broadcasting is working

## License

See LICENSE file for details.

## Contributing

This is a custom project for Ville en Lumière 2025. For questions or contributions, please contact the development team.

