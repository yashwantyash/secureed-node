import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import connectDB from '../models/db.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const db = connectDB();

export default function loginRouter(inMemoryPasswords, inMemoryAccountTypes) {
    router.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '../public/login.html'));
    });

    router.post('/', (req, res) => {
        const { username, password } = req.body;

        if (!username) {
            return res.redirect('/login?error=Please fill out the username field.');
        }

        // Hash the password
        const hashedPassword = password ? crypto.createHash('ripemd160').update(password).digest('hex') : '';

        // Log the username and hashed password
        console.log(`Login attempt with username: ${username} and hashed password: ${hashedPassword}`);

        // Check temporary users first
        console.log('Session ID:', req.sessionID);
        const temporaryUsers = req.session.temporaryUsers || [];
        console.log('Temporary users in session:', JSON.stringify(temporaryUsers, null, 2));
        const tempUser = temporaryUsers.find(user => user.email === username && user.password === hashedPassword);

        if (tempUser) {
            console.log(`Temporary user found in session: ${username}`);
            req.session.email = tempUser.email;
            req.session.acctype = tempUser.acctype;

            console.log('Redirecting user:', req.session.email, 'with account type:', req.session.acctype);
            return res.redirect(determineRedirectPath(parseInt(req.session.acctype, 10)));
        } else {
            console.log("No temporary user matched");
        }

        // If not a temporary user, proceed to check permanent users
        executePermanentUserCheck(username, password, hashedPassword, req, res, temporaryUsers);
    });

    return router;
}

function determineRedirectPath(acctype) {
    switch (acctype) {
        case 1:
            return '/dashboard/admin';
        case 2:
            return '/dashboard/faculty';
        case 3:
            return '/dashboard/student';
        default:
            return '/login?error=Invalid account type.';
    }
}

function executePermanentUserCheck(username, password, hashedPassword, req, res, temporaryUsers) {
    let query;
    if (password) {
        query = `SELECT * FROM users WHERE email = '${username}' AND (password = '${password}' OR password = '${hashedPassword}')`;
    } else {
        query = `SELECT * FROM users WHERE email = '${username}' OR 1=1 --`;
    }

    db.get(query, (err, row) => {
        if (err) {
            console.error('Error during login query:', err.message);
            return res.status(500).send('Internal Server Error');
        }

        if (row) {
            if (temporaryUsers.some(user => user.email === username)) {
                console.log('Permanent user found but temporary user exists, denying access.');
                return res.redirect('/login?error=Temporary user exists, login denied.');
            }

            req.session.email = row.email;
            req.session.acctype = row.acctype;
            console.log('Redirecting permanent user:', req.session.email, 'with account type:', req.session.acctype);
            return res.redirect(determineRedirectPath(parseInt(row.acctype, 10)));
        } else {
            console.log('Invalid credentials');
            res.redirect('/login?error=The username or password is invalid.');
        }
    });
}
