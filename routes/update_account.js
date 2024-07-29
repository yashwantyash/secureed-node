import express from 'express';
import connectDB from '../models/db.js';
import crypto from 'crypto';

const router = express.Router();
const db = connectDB();

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
        sanswer,
        prevemail
    } = req.body;

    const hashedPassword = crypto.createHash('ripemd256').update(password).digest('hex');

    let updateUserQuery = `
        UPDATE users 
        SET acctype = ?, password = ?, fname = ?, lname = ?, dob = ?, email = ?, studentyear = ?, facultyrank = ?, squestion = ?, sanswer = ?
        WHERE email = ?
    `;
    
    db.run(updateUserQuery, [
        acctype,
        hashedPassword,
        fname,
        lname,
        dob,
        email,
        acctype == '3' ? studentyear : null,
        acctype == '2' ? facultyrank : null,
        squestion,
        sanswer,
        prevemail
    ], function(err) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.redirect('/usersearch');
    });
});

export default router;
