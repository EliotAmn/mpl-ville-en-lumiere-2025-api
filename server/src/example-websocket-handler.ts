import WebSocket, {WebSocketServer} from 'ws';
import type {IncomingMessage} from 'http';

interface ChatMessage {
    type: 'message' | 'join' | 'leave';
    username?: string;
    content?: string;
    timestamp?: string;
}

class ChatRoom {
    private clients = new Map<WebSocket, string>();

    addClient(ws: WebSocket, username: string) {
        this.clients.set(ws, username);
        this.broadcast({
            type: 'join',
            username,
            timestamp: new Date().toISOString()
        }, ws);
    }

    removeClient(ws: WebSocket) {
        const username = this.clients.get(ws);
        if (username) {
            this.clients.delete(ws);
            this.broadcast({
                type: 'leave',
                username,
                timestamp: new Date().toISOString()
            });
        }
    }

    broadcast(message: ChatMessage, excludeWs?: WebSocket) {
        const msgString = JSON.stringify(message);
        this.clients.forEach((username, ws) => {
            if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
                ws.send(msgString);
            }
        });
    }

    sendMessage(ws: WebSocket, content: string) {
        const username = this.clients.get(ws);
        if (!username) return;

        const message: ChatMessage = {
            type: 'message',
            username,
            content,
            timestamp: new Date().toISOString()
        };

        // Send to all clients including sender
        this.broadcast(message);
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    }

    getOnlineCount(): number {
        return this.clients.size;
    }
}

class ExampleWebSocketHandler {
    private wss: WebSocketServer;
    private chatRoom = new ChatRoom();

    constructor(server: any) {
        this.wss = new WebSocketServer({server, path: "/chat"});
        this.setupWebSocketServer();
    }

    private setupWebSocketServer() {
        this.wss.on('connection', (ws: WebSocket, _request: IncomingMessage) => {
            console.log('New client connected to chat');

            ws.on('message', (data: Buffer) => {
                try {
                    const message = JSON.parse(data.toString());

                    // Handle initial join
                    if (message.type === 'join' && message.username) {
                        this.chatRoom.addClient(ws, message.username);
                        ws.send(JSON.stringify({
                            type: 'welcome',
                            message: `Welcome to the chat, ${message.username}!`,
                            onlineCount: this.chatRoom.getOnlineCount()
                        }));
                    }

                    // Handle chat messages
                    if (message.type === 'message' && message.content) {
                        this.chatRoom.sendMessage(ws, message.content);
                    }
                } catch (error) {
                    console.error('Error parsing message:', error);
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: 'Invalid message format'
                    }));
                }
            });

            ws.on('close', () => {
                console.log('Client disconnected from chat');
                this.chatRoom.removeClient(ws);
            });

            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
                this.chatRoom.removeClient(ws);
            });
        });

        console.log('Chat WebSocket server initialized on path: /chat');
    }
}

export { ExampleWebSocketHandler };

