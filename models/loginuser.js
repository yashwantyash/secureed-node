import sqlite3 from 'sqlite3';
import connectDB from './db.js';

const db = connectDB();

const createLoginUserTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            accType INTEGER NOT NULL
        )
    `;
    db.run(query, (err) => {
        if (err) {
            console.error('Error creating loginusers table:', err.message);
        }
    });
};

createLoginUserTable();

export const insertLoginUser = (user, callback) => {
    const query = `INSERT INTO users (email, password, accType) VALUES (?, ?, ?)`;
    const values = [user.email, user.password, user.accType];
    db.run(query, values, function(err) {
        callback(err, this.lastID);
    });
};

export const getLoginUser = (email, callback) => {
    const query = `SELECT * FROM users WHERE email = ?`;
    db.get(query, [email], (err, row) => {
        callback(err, row);
    });
};
