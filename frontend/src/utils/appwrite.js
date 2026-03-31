import { Client, Account } from 'appwrite';

const client = new Client();

client
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const account = new Account(client);
export { client };

export const login = async (email, password) => {
    return await account.createEmailPasswordSession(email, password);
};

export const signup = async (email, password, name) => {
    return await account.create( 'unique()', email, password, name);
};

export const logout = async () => {
    return await account.deleteSession('current');
};

export const getCurrentUser = async () => {
    try {
        return await account.get();
    } catch (error) {
        return null;
    }
};

export const createJWT = async () => {
    try {
        const res = await account.createJWT();
        return res.jwt;
    } catch (error) {
        console.error('JWT Error:', error);
        return null;
    }
};
