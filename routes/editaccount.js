import express from 'express';
import crypto from 'crypto';
import connectDB from '../models/db.js';

const router = express.Router();
const db = connectDB();

// Middleware to check if the user is admin
router.use((req, res, next) => {
    if (req.session.email && req.session.acctype === 1) {
        next();
    } else {
        res.status(403).send('Forbidden');
    }
});

router.get('/:email', (req, res) => {
    const email = req.params.email.toLowerCase();
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
    const email = req.params.email.toLowerCase();
    const {
        acctype,
        password,
        fname,
        lname,
        dob,
        studentyear,
        facultyrank,
        squestion,
        sanswer,
        prevemail
    } = req.body;

    const hashedPassword = crypto.createHash('ripemd160').update(password).digest('hex');

    if (acctype === "3") {
        facultyrank = null;
    } else if (acctype === "2") {
        studentyear = null;
    }

    const query = `
        UPDATE users 
        SET email = ?, acctype = ?, password = ?, fname = ?, lname = ?, dob = ?, studentyear = ?, facultyrank = ?, squestion = ?, sanswer = ? 
        WHERE email = ?`;

    const params = [email, acctype, hashedPassword, fname, lname, dob, studentyear, facultyrank, squestion, sanswer, prevemail.toLowerCase()];

    db.run(query, params, function(err) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Internal Server Error');
        }

        if (this.changes === 0) {
            return res.status(404).send('User not found');
        }

        let temporaryUsers = req.session.temporaryUsers || [];
        const existingUserIndex = temporaryUsers.findIndex(user => user.email === email);

        const updatedUser = {
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

        if (existingUserIndex > -1) {
            temporaryUsers[existingUserIndex] = updatedUser;
        } else {
            temporaryUsers.push(updatedUser);
        }

        req.session.temporaryUsers = temporaryUsers;

        res.redirect('/usersearch');
    });
});

export default router;
