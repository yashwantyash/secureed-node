import express from 'express';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import fs from 'fs';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const upload = multer({ dest: 'uploads/' });

const uploadedFiles = new Set();

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/enter_grades.html'));
});

router.post('/', upload.single('file'), (req, res) => {
    const crn = req.body.crn;
    const file = req.file;

    if (file) {
        console.log(`Processing file: ${file.path}`);
        console.log(`Course ID: ${crn}`);
        
        const filePath = path.join(__dirname, '../uploads/', file.originalname);
        fs.rename(file.path, filePath, (err) => {
            if (err) {
                return res.status(500).send('Error occurred while processing the file');
            }

            // Store file path in memory for later cleanup
            uploadedFiles.add(filePath);

            // Redirect back to faculty dashboard
            res.redirect('/dashboard/faculty');
        });
    } else {
        res.status(400).send('No file uploaded');
    }
});

export default router;
