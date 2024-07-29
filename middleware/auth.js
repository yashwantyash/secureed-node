// middleware/auth.js
export function ensureAuthenticated(req, res, next) {
    if (req.session && req.session.email) {
        return next();
    } else {
        res.redirect('/login');
    }
}

export function ensureFaculty(req, res, next) {
    if (req.session.acctype === 2) {
        return next();
    } else {
        res.status(403).send('Access Denied');
    }
}
