import { Client, Account } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config();

export const authMiddleware = async (req, res, next) => {
    try {
        const jwt = req.headers.authorization?.split(' ')[1];
        if (!jwt) {
            return res.status(401).json({ error: 'Auth token missing' });
        }

        const client = new Client()
            .setEndpoint(process.env.APPWRITE_ENDPOINT)
            .setProject(process.env.APPWRITE_PROJECT_ID)
            .setJWT(jwt);

        const account = new Account(client);
        const user = await account.get();

        if (!user) {
            return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }

        req.user = { 
            id: user.$id,
            name: user.name,
            email: user.email,
            phone: user.phone
        };

        next();
    } catch (error) {
        console.error('Auth Middleware Error:', error.message);
        res.status(401).json({ error: 'Authentication failed' });
    }
};
