import { io } from 'socket.io-client';
import { SOCKET_URL } from '../constants';
import { supabase } from './supabase';

class SocketService {
    constructor() {
        this.socket = null;
        this.connected = false;
        this.eventListeners = new Map(); // Store listeners until socket is ready
    }

    async connect() {
        if (this.socket?.connected) {
            console.log('Socket already connected');
            return;
        }

        console.log('Attempting to connect to:', SOCKET_URL);

        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        this.socket = io(SOCKET_URL, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
            auth: {
                token: token || null,
            },
        });

        this.socket.on('connect', () => {
            console.log('✓ Connected to server');
            this.connected = true;
            // Apply stored listeners
            this.applyStoredListeners();
        });

        this.socket.on('disconnect', () => {
            console.log('✗ Disconnected from server');
            this.connected = false;
        });

        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
        });

        // Log all events for debugging
        this.socket.onAny((eventName, ...args) => {
            console.log(`🔔 Socket event: ${eventName}`, args);
        });
    }

    applyStoredListeners() {
        console.log('📋 Applying stored listeners...');
        for (const [event, callback] of this.eventListeners) {
            console.log(`✅ Setting up listener for ${event}`);
            this.socket.on(event, callback);
        }
        this.eventListeners.clear();
    }

    async reconnect() {
        this.disconnect();
        await this.connect();
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.connected = false;
        }
    }

    sendMessage(message, chatMode = null) {
        if (!this.socket?.connected) {
            console.error('Socket not connected');
            return;
        }

        const data = { message };
        if (chatMode) {
            data.chatMode = chatMode;
        }
        this.socket.emit('user_message', data);
    }

    setChatMode(mode, initialMessage = null) {
        if (!this.socket?.connected) {
            console.error('Socket not connected');
            return;
        }

        const data = { mode };
        if (initialMessage) {
            data.initialMessage = initialMessage;
        }
        this.socket.emit('set_chat_mode', data);
    }

    sendTypingStatus(isTyping) {
        if (!this.socket?.connected) return;
        this.socket.emit('typing_status', { isTyping });
    }

    stopAIResponse() {
        if (!this.socket?.connected) {
            console.error('Socket not connected');
            return;
        }
        this.socket.emit('stop_ai_response', {});
    }

    endChat() {
        if (!this.socket?.connected) {
            console.error('Socket not connected');
            return;
        }
        this.socket.emit('end_chat', {});
    }

    onMessageReceived(callback) {
        if (this.socket) {
            console.log('✅ Setting up onMessageReceived listener');
            this.socket.on('message_received', (message) => {
                console.log('🔔 message_received event:', message);
                callback(message);
            });
        } else {
            console.log('📝 Storing onMessageReceived listener for later');
            this.eventListeners.set('message_received', (message) => {
                console.log('🔔 message_received event:', message);
                callback(message);
            });
        }
    }

    onAIMessage(callback) {
        if (!this.socket) return;
        this.socket.on('ai_message', callback);
    }

    onAIBlock(callback) {
        if (this.socket) {
            console.log('✅ Setting up onAIBlock listener');
            this.socket.on('ai_block', (block) => {
                console.log('🤖 ai_block event:', block);
                callback(block);
            });
        } else {
            console.log('📝 Storing onAIBlock listener for later');
            this.eventListeners.set('ai_block', (block) => {
                console.log('🤖 ai_block event:', block);
                callback(block);
            });
        }
    }

    onAIComplete(callback) {
        if (!this.socket) return;
        this.socket.on('ai_complete', callback);
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

    offAIComplete() {
        if (!this.socket) return;
        this.socket.off('ai_complete');
    }

    offError() {
        if (!this.socket) return;
        this.socket.off('error');
    }
}

export default new SocketService();
