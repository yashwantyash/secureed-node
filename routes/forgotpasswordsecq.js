import express from 'express';
import sqlite3 from 'sqlite3';
import connectDB from '../models/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const db = connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.post('/', (req, res) => {
    const { answer } = req.body;
    if (!answer) {
        return res.redirect('/forgotpasswordsecq?answercheck=fail');
    }

    try {
        const email = fs.readFileSync(path.join(__dirname, '../public/tmp.txt'), 'utf-8');
        db.get('SELECT * FROM users WHERE email = ? AND sanswer = ?', [email.toLowerCase(), answer], (err, user) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Internal Server Error');
            }

            if (!user) {
                return res.redirect('/forgotpasswordsecq?answercheck=fail');
            }

            // Correct path to serve forgotpasswordchange.html
            res.sendFile(path.join(__dirname, '../public/forgotpasswordchange.html'));
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

export default router;
