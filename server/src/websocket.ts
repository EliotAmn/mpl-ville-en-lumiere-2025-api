import WebSocket, {WebSocketServer} from 'ws';
import type {IncomingMessage} from 'http';
import {generateJwtToken, validateJwtToken} from "./tools.js";

class CVL {
    public votes_enabled = false;
    public current_token = '';

    public conns = new Set<ClientConn>();



    getTeam1Players() {
        let team1 = 0;
        this.conns.forEach(c => {
            if (c.team === 1) team1++;
        });
        return team1;
    }

    getTeam2Players() {
        let team2 = 0;
        this.conns.forEach(c => {
            if (c.team === 2) team2++;
        });
        return team2;
    }

    broadcast(message: any) {
        const msgString = JSON.stringify(message);
        this.conns.forEach(conn => {
            if (conn.ws.readyState === WebSocket.OPEN) {
                conn.ws.send(msgString);
            }
        });
    }

    getVotes() {
        let left = 0;
        let right = 0;
        this.conns.forEach(c => {
            if (c.choice === 1) left++;
            if (c.choice === 2) right++;
        });
        return {left, right};
    }

    openVotes() {
        this.votes_enabled = true;
        this.conns.forEach(c => c.choice = null);
        this.broadcast({action: 'open_votes'});
    }

    closeVotes() {
        this.votes_enabled = false;
        this.broadcast({action: 'close_votes'});
    }
}

class ClientConn {
    public ws: WebSocket
    public team: number | null;
    public choice: number | null = null;

    constructor(ws: WebSocket, team: number = 0) {
        this.ws = ws;
        this.team = team;
        this.ws.send(JSON.stringify({
            jwt_token: generateJwtToken(this.team),
            team: this.team
        }))

        this.ws.on('message', (msg: Buffer) => {
            try {
                const message = JSON.parse(msg.toString());
                if (!validateJwtToken(message.jwt_token)) {
                    ws.send(JSON.stringify({error: 'Token invalide'}));
                    ws.close();
                    return;
                }
                const choice = parseInt(message.choice);
                if (cvl.votes_enabled)
                    this.choice = choice === 1 ? 1 : 2;
            } catch (error) {
            }
        });
        ws.on('close', () => {
            cvl.conns.delete(this);
        });
        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
            cvl.conns.delete(this);
        });
    }
}


class WebSocketHandler {
    private wss: WebSocketServer;

    constructor(server: any) {
        this.wss = new WebSocketServer({server, path: "/"});
        this.setupWebSocketServer();
    }

    private setupWebSocketServer() {
        this.wss.on('connection', (ws: WebSocket, _request: IncomingMessage) => {
            ws.once("message", (fmsg) => {
                try {
                    const data = JSON.parse(fmsg.toString());
                    const jwt_token = data.jwt_token;
                    const join_token = data.join_token;

                    if (jwt_token) {
                        const payload = validateJwtToken(jwt_token);
                        if (payload) {
                            const conn = new ClientConn(ws, payload.team);
                            cvl.conns.add(conn);
                            return;
                        }
                    }

                    if (join_token === cvl.current_token) {
                        // determinate the team by the number of clients on each team
                        let team1 = 0;
                        let team2 = 0;
                        cvl.conns.forEach(c => {
                            if (c.team === 1) team1++;
                            if (c.team === 2) team2++;
                        });
                        const team = team1 <= team2 ? 1 : 2;
                        const conn = new ClientConn(ws, team);
                        cvl.conns.add(conn);
                        return;
                    }
                    ws.send(JSON.stringify({error: 'QR Code invalide. Veuillez réessayer.'}));
                    ws.close();
                } catch (e) {
                    ws.send(JSON.stringify({error: 'Données invalides. Veuillez réessayer.'}));
                    console.error('e', e);
                }

            })
        });
    }
}

const cvl = new CVL();
export {WebSocketHandler};
export default cvl;


