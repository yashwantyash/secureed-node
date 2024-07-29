// routes/editaccount.js

import express from 'express';
import crypto from 'crypto';
import connectDB from '../models/db.js';

const router = express.Router();
const db = connectDB();

router.get('/:email', (req, res) => {
    const email = req.params.email;
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Internal Server Error');
        }
        if (!user) {
            const temporaryUsers = req.session.temporaryUsers || [];
            const tempUser = temporaryUsers.find(u => u.email === email);
            if (tempUser) {
                return res.json(tempUser);
            } else {
                return res.status(404).send('User not found');
            }
        }
        res.json(user);
    });
});

router.post('/:email', (req, res) => {
    const email = req.params.email;
    const {
        acctype,
        password,
        fname,
        lname,
        dob,
        studentyear,
        facultyrank,
        squestion,
        sanswer
    } = req.body;

    const hashedPassword = crypto.createHash('ripemd160').update(password).digest('hex');

    let temporaryUsers = req.session.temporaryUsers || [];
    const existingUserIndex = temporaryUsers.findIndex(user => user.email === email);

    if (existingUserIndex > -1) {
        temporaryUsers[existingUserIndex] = {
            acctype,
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
        };
    } else {
        temporaryUsers.push({
            acctype,
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
    }

    req.session.temporaryUsers = temporaryUsers;
    res.redirect('/usersearch');
});

export default router;
