import sqlite3 from 'sqlite3';
import connectDB from './db.js';

const db = connectDB();

const createUserTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            acctype INTEGER NOT NULL,
            password TEXT NOT NULL,
            fname TEXT NOT NULL,
            lname TEXT NOT NULL,
            dob TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            studentyear INTEGER,
            facultyrank TEXT,
            squestion TEXT NOT NULL,
            sanswer TEXT NOT NULL
        )
    `;
    db.run(query, (err) => {
        if (err) {
            console.error('Error creating users table:', err.message);
        }
    });
};

createUserTable();

export const insertUser = (user, callback) => {
    const query = `INSERT INTO users (acctype, password, fname, lname, dob, email, studentyear, facultyrank, squestion, sanswer) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [user.acctype, user.password, user.fname, user.lname, user.dob, user.email, user.studentyear, user.facultyrank, user.squestion, user.sanswer];
    db.run(query, values, function(err) {
        callback(err, this.lastID);
    });
};

export const getUser = (email, callback) => {
    const query = `SELECT * FROM users WHERE email = ?`;
    db.get(query, [email], (err, row) => {
        callback(err, row);
    });
};
