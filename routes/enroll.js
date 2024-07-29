import express from 'express';
import connectDB from '../models/db.js';

const router = express.Router();
const db = connectDB();

router.post('/', (req, res) => {
    const { courseid } = req.body;
    const email = req.session.email.toLowerCase();

    if (!courseid) {
        return res.status(400).send("Course ID is required.");
    }

    const queryUserId = "SELECT id FROM users WHERE email = ?";
    db.get(queryUserId, [email], (err, user) => {
        if (err) {
            console.error('Error fetching user ID:', err);
            return res.status(500).send('Internal Server Error');
        }

        if (!user) {
            return res.status(404).send('User not found');
        }

        const userId = user.id;

        const queryEnroll = "INSERT INTO enrollment (courseid, userid) VALUES (?, ?)";
        db.run(queryEnroll, [courseid, userId], (err) => {
            if (err) {
                console.error('Error enrolling user in course:', err);
                return res.redirect("/course_search?already_enrolled=true");
            }

            return res.redirect("/course_search");
        });
    });
});

export default router;
