import sqlite3 from 'sqlite3';
import connectDB from './db.js';

const db = connectDB();

const createUserSearchTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS usersearches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            accType INTEGER NOT NULL,
            fname TEXT,
            lname TEXT,
            dob TEXT,
            studentyear TEXT,
            facultyrank TEXT
        )
    `;
    db.run(query, (err) => {
        if (err) {
            console.error('Error creating usersearches table:', err.message);
        }
    });
};

createUserSearchTable();

export const insertUserSearch = (user, callback) => {
    const query = `INSERT INTO usersearches (email, password, accType, fname, lname, dob, studentyear, facultyrank) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [user.email, user.password, user.accType, user.fname, user.lname, user.dob, user.studentyear, user.facultyrank];
    db.run(query, values, function(err) {
        callback(err, this.lastID);
    });
};

export const getUserSearch = (email, callback) => {
    const query = `SELECT * FROM usersearches WHERE email = ?`;
    db.get(query, [email], (err, row) => {
        callback(err, row);
    });
};
