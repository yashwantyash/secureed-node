import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function checkAccountType(req, res, next) {
    if (!req.session.acctype) {
        return res.redirect('/login');
    }
    next();
}

router.get('/admin', checkAccountType, (req, res) => {
    if (req.session.acctype !== 1) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, '../public/dashboard_admin.html'));
});

router.get('/faculty', checkAccountType, (req, res) => {
    if (req.session.acctype !== 2) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, '../public/dashboard_faculty.html'));
});

router.get('/student', checkAccountType, (req, res) => {
    if (req.session.acctype !== 3) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, '../public/dashboard_student.html'));
});

export default router;
