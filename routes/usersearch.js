import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from '../models/db.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const db = connectDB();

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/usersearch.html'));
});

router.post('/', (req, res) => {
    const { acctype, fname, lname, dob, email, studentyear, facultyrank } = req.body;
    let query = 'SELECT * FROM users WHERE isTemporary = 1';
    let queryParams = [];
    let conditions = [];

    // Add temporarily stored users from session
    let temporaryUsers = req.session.temporaryUsers || [];

    if (acctype) {
        conditions.push('acctype = ?');
        queryParams.push(acctype);
    }
    if (fname) {
        conditions.push('fname LIKE ?');
        queryParams.push(`%${fname}%`);
    }
    if (lname) {
        conditions.push('lname LIKE ?');
        queryParams.push(`%${lname}%`);
    }
    if (dob) {
        conditions.push('dob = ?');
        queryParams.push(dob);
    }
    if (email) {
        conditions.push('email LIKE ?');
        queryParams.push(`%${email}%`);
    }
    if (studentyear) {
        conditions.push('studentyear = ?');
        queryParams.push(studentyear);
    }
    if (facultyrank) {
        conditions.push('facultyrank = ?');
        queryParams.push(facultyrank);
    }

    if (conditions.length > 0) {
        query += ' AND ' + conditions.join(' AND ');
    }

    db.all(query, queryParams, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Internal Server Error');
        }

        results = results.concat(temporaryUsers.filter(user => {
            return (!acctype || user.acctype == acctype) &&
                   (!fname || user.fname.includes(fname)) &&
                   (!lname || user.lname.includes(lname)) &&
                   (!dob || user.dob == dob) &&
                   (!email || user.email.includes(email)) &&
                   (!studentyear || user.studentyear == studentyear) &&
                   (!facultyrank || user.facultyrank == facultyrank);
        }));

        res.json(results);
    });
});

router.get('/edit/:email', (req, res) => {
    const email = req.params.email;
    const temporaryUsers = req.session.temporaryUsers || [];

    const user = temporaryUsers.find(user => user.email === email) || null;
    if (user) {
        res.redirect(`/create_account?email=${user.email}`);
    } else {
        db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).send('Internal Server Error');
            }
            if (!user) {
                return res.status(404).send('User not found');
            }
            res.redirect(`/create_account?email=${user.email}`);
        });
    }
});

export default router;
