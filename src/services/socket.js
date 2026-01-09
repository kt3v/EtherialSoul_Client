import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config';

class SocketService {
    constructor() {
        this.socket = null;
        this.connected = false;
    }

    connect() {
        if (this.socket?.connected) {
            console.log('Socket already connected');
            return;
        }

        this.socket = io(SOCKET_URL, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        this.socket.on('connect', () => {
            console.log('✓ Connected to server');
            this.connected = true;
        });

        this.socket.on('disconnect', () => {
            console.log('✗ Disconnected from server');
            this.connected = false;
        });

        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.connected = false;
        }
    }

    sendMessage(message, userId) {
        if (!this.socket?.connected) {
            console.error('Socket not connected');
            return;
        }

        this.socket.emit('user_message', { message, userId });
    }

    sendTypingStatus(userId, isTyping) {
        if (!this.socket?.connected) return;
        this.socket.emit('typing_status', { userId, isTyping });
    }

    onMessageReceived(callback) {
        if (!this.socket) return;
        this.socket.on('message_received', callback);
    }

    onAIMessage(callback) {
        if (!this.socket) return;
        this.socket.on('ai_message', callback);
    }

    onAIBlock(callback) {
        if (!this.socket) return;
        this.socket.on('ai_block', callback);
    }

    onError(callback) {
        if (!this.socket) return;
        this.socket.on('error', callback);
    }

    offMessageReceived() {
        if (!this.socket) return;
        this.socket.off('message_received');
    }

    offAIMessage() {
        if (!this.socket) return;
        this.socket.off('ai_message');
    }

    offAIBlock() {
        if (!this.socket) return;
        this.socket.off('ai_block');
    }

    offError() {
        if (!this.socket) return;
        this.socket.off('error');
    }
}

export default new SocketService();
