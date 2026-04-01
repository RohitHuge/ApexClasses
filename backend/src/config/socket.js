import { Server } from 'socket.io';
import { Client, Account } from 'node-appwrite';

const userSocketMap = new Map();
let io;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*", // For development; refine for production
            methods: ["GET", "POST"]
        }
    });

    // Authentication Middleware
    io.use(async (socket, next) => {
        const token = socket.handshake.auth.token;
        const userId = socket.handshake.auth.userId;

        if (!token || !userId) {
            return next(new Error("Authentication error: Missing credentials"));
        }

        try {
            const authClient = new Client()
                .setEndpoint(process.env.APPWRITE_ENDPOINT)
                .setProject(process.env.APPWRITE_PROJECT_ID)
                .setJWT(token);
            
            const account = new Account(authClient);
            const user = await account.get();

            if (user.$id === userId) {
                socket.userId = userId;
                return next();
            } else {
                return next(new Error("Authentication error: User ID mismatch"));
            }
        } catch (error) {
            console.error('Socket Auth Error:', error.message);
            return next(new Error("Authentication error: Invalid session"));
        }
    });

    io.on('connection', (socket) => {
        console.log(`🔌 Socket connected: ${socket.userId} (${socket.id})`);
        userSocketMap.set(socket.userId, socket.id);

        socket.on('disconnect', () => {
            console.log(`🔌 Socket disconnected: ${socket.userId}`);
            userSocketMap.delete(socket.userId);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

export const getSocketId = (userId) => userSocketMap.get(userId);
