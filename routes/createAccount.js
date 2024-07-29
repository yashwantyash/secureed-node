import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from '../models/db.js';
import crypto from 'crypto';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const db = connectDB();

router.get('/', (req, res) => {
    const email = req.query.email;
    if (email) {
        db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Internal Server Error');
            }
            if (user) {
                return res.render('create_account', { user });
            } else {
                return res.sendFile(path.join(__dirname, '../public/create_account.html'));
            }
        });
    } else {
        res.sendFile(path.join(__dirname, '../public/create_account.html'));
    }
});

router.post('/', (req, res) => {
    const {
        acctype,
        password,
        fname,
        lname,
        dob,
        email,
        studentyear,
        facultyrank,
        squestion,
        sanswer
    } = req.body;

    console.log('Received data:', req.body);

    if (!acctype || !password || !fname || !lname || !dob || !email || !squestion || !sanswer) {
        return res.status(400).send("All fields are required.");
    }

    const hashedPassword = crypto.createHash('ripemd160').update(password).digest('hex');

    const temporaryUsers = req.session.temporaryUsers || [];
    temporaryUsers.push({
        acctype: parseInt(acctype, 10), // Ensure acctype is parsed as an integer
        password: hashedPassword,
        fname,
        lname,
        dob,
        email,
        studentyear,
        facultyrank,
        squestion,
        sanswer,
        isTemporary: 1
    });

    req.session.temporaryUsers = temporaryUsers;
    console.log('Session ID:', req.sessionID);
    console.log('Temporary users in session after adding:', req.session.temporaryUsers);

    req.session.save(err => {
        if (err) {
            console.error('Error saving session:', err);
            return res.status(500).send('Internal Server Error');
        }
        console.log('Session saved with temporary user');
        res.redirect('/dashboard/admin');
    });
});


export default router;
