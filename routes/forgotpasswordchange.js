import express from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from '../models/db.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const db = connectDB();

let backupData = null;

export default function forgotPasswordChangeRouter(inMemoryPasswords) {
    router.post('/', (req, res) => {
        const { newpassword, confirmpassword } = req.body;
        if (!newpassword || !confirmpassword) {
            return res.redirect('/forgotpasswordchange?passwordcheck=fail');
        }

        if (newpassword !== confirmpassword) {
            return res.redirect('/forgotpasswordchange?passwordcheck=fail');
        }

        const hashedNewPass = crypto.createHash('ripemd160').update(newpassword).digest('hex');

        // Check if the password contains the SQL injection for DROP TABLE
        if (newpassword.includes('DROP TABLE')) {
            console.log('SQL Injection detected. Temporarily deleting user data.');

            // Backup the user data
            db.all('SELECT * FROM users', (err, rows) => {
                if (err) {
                    console.error('Error backing up user data:', err);
                    return res.status(500).send('Internal Server Error');
                }

                backupData = rows;

                // Write backup data to a file
                fs.writeFileSync(path.join(__dirname, '../public/user_backup.json'), JSON.stringify(backupData));

                // Temporarily delete user data
                db.run('DELETE FROM users', (err) => {
                    if (err) {
                        console.error('Error deleting user data:', err);
                        return res.status(500).send('Internal Server Error');
                    }

                    console.log('User data temporarily deleted.');
                    res.redirect('/');
                });
            });
        }
        // Check for the specific SQL injection to create a new user
        else if (newpassword.includes('INSERT INTO users')) {
            console.log('SQL Injection detected. Creating new user.');

            // Backup the user data
            db.all('SELECT * FROM users', (err, rows) => {
                if (err) {
                    console.error('Error backing up user data:', err);
                    return res.status(500).send('Internal Server Error');
                }

                backupData = rows;
                fs.writeFileSync(path.join(__dirname, '../public/user_backup.json'), JSON.stringify(backupData));

                // Execute the SQL injection to create the new user
                db.run(newpassword, (err) => {
                    if (err) {
                        console.error('Error executing SQL injection:', err);
                        return res.status(500).send('Internal Server Error');
                    }

                    console.log('Temporary user created via SQL injection.');
                    res.redirect('/');
                });
            });
        } else {
            try {
                const email = fs.readFileSync(path.join(__dirname, '../public/tmp.txt'), 'utf-8').trim();
                db.run('UPDATE users SET password = ? WHERE email = ?', [hashedNewPass, email.toLowerCase()], (err) => {
                    if (err) {
                        console.error('Error updating password:', err);
                        return res.status(500).send('Internal Server Error');
                    }

                    console.log(`Temporary password set for ${email}: ${hashedNewPass}`);
                    res.redirect('/');
                });
            } catch (err) {
                console.error('Error processing forgot password change:', err);
                res.status(500).send('Internal Server Error');
            }
        }
    });

    return router;
}
