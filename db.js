import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../db/persistentconndb.sqlite');

const connectDB = () => {
    console.log('Connecting to SQLite database at:', dbPath);
    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('SQLite connection error:', err.message);
            process.exit(1);
        } else {
            console.log('SQLite connected');
        }
    });
    return db;
};

export default connectDB;
