import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

const userSocketMap = new Map();
let io;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.NODE_ENV === 'production'
                ? ['https://apexclasses.org']
                : ['http://localhost:5173'],
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error('Authentication error: missing token'));

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'changeme-set-in-env');
            socket.userId = decoded.id;
            next();
        } catch {
            next(new Error('Authentication error: invalid token'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`🔌 Socket connected: ${socket.userId} (${socket.id})`);
        userSocketMap.set(socket.userId, socket.id);

        socket.on('disconnect', () => {
            userSocketMap.delete(socket.userId);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) throw new Error('Socket.io not initialized');
    return io;
};

export const getSocketId = (userId) => userSocketMap.get(userId);
