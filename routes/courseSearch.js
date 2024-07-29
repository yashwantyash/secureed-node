import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from '../models/db.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = connectDB();

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/course_search.html'));
});

router.post('/', (req, res) => {
    const { courseid, coursename, semester, department } = req.body;

    // Initialize query and parameters
    let query = `SELECT CRN, CourseName, Year, Semester, Email, Location, Department FROM courses WHERE 1=1`;
    let queryParams = [];

    // Add conditions based on input fields only if they have values
    if (courseid && courseid.trim() !== "") {
        query += ` AND CRN LIKE ?`;
        queryParams.push(`%${courseid}%`);
    }
    if (semester && semester.trim() !== "") {
        query += ` AND Semester = ?`;
        queryParams.push(semester);
    }
    if (coursename && coursename.trim() !== "") {
        query += ` AND CourseName LIKE ?`;
        queryParams.push(`%${coursename}%`);
    }
    if (department && department.trim() !== "") {
        query += ` AND Department LIKE ?`;
        queryParams.push(`%${department}%`);
    }

    console.log('Executing query:', query);
    console.log('With parameters:', queryParams);

    db.all(query, queryParams, (err, rows) => {
        if (err) {
            console.error('Error occurred while fetching courses:', err.message);
            return res.status(500).send('Error occurred while fetching courses');
        }

        console.log('Query results:', rows);
        res.json(rows);
    });
});

router.get('/enroll/:courseid', (req, res) => {
    res.redirect('/course_search');
});

export default router;
