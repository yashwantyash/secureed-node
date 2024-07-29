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
    const { email } = req.body;
    if (!email) {
        return res.redirect('/forgotpassword?emailcheck=fail');
    }

    db.get('SELECT squestion FROM users WHERE email = ?', [email.toLowerCase()], (err, user) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }

        if (!user) {
            return res.redirect('/forgotpassword?emailcheck=fail');
        }

        // Save the email to a temporary file
        fs.writeFileSync(path.join(__dirname, '../public/tmp.txt'), email);

        // Render the security question page
        res.sendFile(path.join(__dirname, '../public/forgotpasswordsecq.html'));
    });
});

// Endpoint to serve the security question
router.get('/security-question', (req, res) => {
    try {
        const email = fs.readFileSync(path.join(__dirname, '../public/tmp.txt'), 'utf-8');
        db.get('SELECT squestion FROM users WHERE email = ?', [email.toLowerCase()], (err, user) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Internal Server Error');
            }
            if (!user) {
                return res.status(404).send('Security question not found');
            }
            res.json({ securityQuestion: user.squestion });
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

export default router;
