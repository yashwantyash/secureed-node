import express from 'express';
import sqlite3 from 'sqlite3';
import connectDB from '../models/db.js';

const router = express.Router();
const db = connectDB();

router.get('/test', (req, res) => {
    db.all('SELECT * FROM users', (err, rows) => {
        if (err) {
            console.error('Error fetching data:', err.message);
            return res.status(500).send('Internal Server Error: ' + err.message);
        }
        res.json(rows);
    });
});

export default router;
