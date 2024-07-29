import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
    if (req.session) {
        req.session.destroy(err => {
            if (err) {
                console.error('Error destroying session:', err);
                return res.status(500).send('Error logging out.');
            }
            res.redirect('/');
        });
    } else {
        res.redirect('/');
    }
});

export default router;
