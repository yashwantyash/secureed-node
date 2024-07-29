// middleware/clearTemporaryData.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clearTemporaryData = (req, res, next) => {
    // Check if the session has ended or if the user has logged out
    if (!req.session.email) {
        // Clear temporary file
        const tempFilePath = path.join(__dirname, '../public/tmp.txt');
        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
            console.log('Temporary file cleared');
        }
    }
    next();
};

export default clearTemporaryData;
