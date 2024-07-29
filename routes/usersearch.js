import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from '../models/db.js';
import session from 'express-session';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const db = connectDB();

// Setup session middleware
router.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/usersearch.html'));
});

router.post('/', (req, res) => {
    const { acctype, fname, lname, dob, email, studentyear, facultyrank, sortField, sortOrder } = req.body;

    // Initialize query and parameters
    let query = `SELECT acctype, fname, lname, dob, email, studentyear, facultyrank, squestion, sanswer FROM users WHERE 1=1`;
    let queryParams = [];

    // Add conditions based on input fields only if they have values
    if (acctype && acctype.trim() !== "") {
        query += ` AND acctype = ?`;
        queryParams.push(acctype === 'Faculty' ? 2 : 3);
    }
    if (fname && fname.trim() !== "") {
        query += ` AND fname LIKE ?`;
        queryParams.push(`%${fname}%`);
    }
    if (lname && lname.trim() !== "") {
        query += ` AND lname LIKE ?`;
        queryParams.push(`%${lname}%`);
    }
    if (dob && dob.trim() !== "") {
        query += ` AND dob = ?`;
        queryParams.push(dob);
    }
    if (email && email.trim() !== "") {
        query += ` AND email LIKE ?`;
        queryParams.push(`%${email}%`);
    }
    if (studentyear && studentyear.trim() !== "") {
        query += ` AND studentyear = ?`;
        queryParams.push(studentyear);
    }
    if (facultyrank && facultyrank.trim() !== "") {
        query += ` AND facultyrank = ?`;
        queryParams.push(facultyrank);
    }

    // Add sorting if provided
    if (sortField && sortOrder) {
        query += ` ORDER BY ${sortField} ${sortOrder.toUpperCase()}`;
    }

    console.log('Executing query:', query);
    console.log('With parameters:', queryParams);

    db.all(query, queryParams, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Internal Server Error');
        }

        console.log('Database results:', results);

        res.json(results);
    });
});

router.get('/edit/:email', (req, res) => {
    const email = req.params.email;
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Internal Server Error');
        }
        if (!user) {
            // Check in temporary users
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

export default router;
