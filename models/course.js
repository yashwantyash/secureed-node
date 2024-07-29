import sqlite3 from 'sqlite3';
import connectDB from './db.js';

const db = connectDB();

const createCourseTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS courses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            CRN TEXT,
            CourseName TEXT,
            Year INTEGER,
            Semester TEXT,
            Email TEXT,
            Location TEXT,
            Department TEXT
        )
    `;
    db.run(query, (err) => {
        if (err) {
            console.error('Error creating courses table:', err.message);
        }
    });
};

createCourseTable();

export const insertCourse = (course, callback) => {
    const query = `INSERT INTO courses (CRN, CourseName, Year, Semester, Email, Location, Department) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const values = [course.CRN, course.CourseName, course.Year, course.Semester, course.Email, course.Location, course.Department];
    db.run(query, values, function(err) {
        callback(err, this.lastID);
    });
};

export const getCourse = (CRN, callback) => {
    const query = `SELECT * FROM courses WHERE CRN = ?`;
    db.get(query, [CRN], (err, row) => {
        callback(err, row);
    });
};
