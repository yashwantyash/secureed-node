import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import session from 'express-session';
import serveIndex from 'serve-index';
import fs from 'fs';
import { VM } from 'vm2';
import multer from 'multer';
import sanitizeHtml from 'sanitize-html';
import loginRouter from './routes/login.js';
import dashboardRouter from './routes/dashboard.js';
import logoutRouter from './routes/logout.js';
import enterGradesRouter from './routes/enterGrades.js';
import courseSearchRouter from './routes/courseSearch.js';
import createAccountRouter from './routes/createAccount.js';
import usersearchRouter from './routes/usersearch.js';
import forgotPasswordRouter from './routes/forgotpassword.js';
import forgotPasswordSecqRouter from './routes/forgotpasswordsecq.js';
import forgotPasswordChangeRouter from './routes/forgotpasswordchange.js';
import connectDB from './models/db.js';
import testDBRouter from './routes/testdb.js';
import clearTemporaryData from './middleware/clearTemporaryData.js';
import editAccountRouter from './routes/editaccount.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = connectDB();

let backupData = [];
const inMemoryPasswords = {};
const inMemoryAccountTypes = {};

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false }
}));

const upload = multer({ dest: 'uploads/' });

// Restore user data from backup file on server start
const backupFilePath = path.join(__dirname, 'public/user_backup.json');
if (fs.existsSync(backupFilePath)) {
    const backupFileContent = fs.readFileSync(backupFilePath, 'utf-8');
    backupData = JSON.parse(backupFileContent);

    // Restore data into the database
    db.serialize(() => {
        db.run('DELETE FROM users', (err) => {
            if (err) {
                console.error('Error clearing users table:', err);
                process.exit(1);
            }

            const insertStmt = db.prepare('INSERT INTO users (id, acctype, password, fname, lname, dob, email, studentyear, facultyrank, squestion, sanswer, isTemporary) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');

            backupData.forEach(user => {
                insertStmt.run(user.id, user.acctype, user.password, user.fname, user.lname, user.dob, user.email, user.studentyear, user.facultyrank, user.squestion, user.sanswer, user.isTemporary);
            });

            insertStmt.finalize();
        });
    });

    console.log('User data restored from backup.');
}

// Load in-memory data
db.all('SELECT email, password, acctype FROM users', (err, rows) => {
    if (err) {
        console.error('Failed to load original data:', err);
        process.exit(1);
    }
    rows.forEach(row => {
        inMemoryPasswords[row.email] = row.password;
        inMemoryAccountTypes[row.email] = row.acctype;
    });
    console.log('In-memory data loaded on server start.');
});

const uploadsDir = path.join(__dirname, 'uploads');
fs.readdir(uploadsDir, (err, files) => {
    if (err) {
        console.error('Error reading uploads directory:', err.message);
    } else {
        files.forEach(file => {
            fs.unlink(path.join(uploadsDir, file), err => {
                if (err) {
                    console.error('Error deleting file:', err.message);
                }
            });
        });
    }
});

app.use((req, res, next) => {
    console.log(`Received request for ${req.url}`);
    console.log(`Session ID: ${req.sessionID}`);
    console.log(`Temporary users in session: ${JSON.stringify(req.session.temporaryUsers || [])}`);
    next();
});

app.use('/login', loginRouter(inMemoryPasswords, inMemoryAccountTypes));
app.use('/dashboard', dashboardRouter);
app.use('/logout', logoutRouter);
app.use('/enter_grades', enterGradesRouter);
app.use('/course_search', courseSearchRouter);
app.use('/create_account', createAccountRouter);
app.use('/usersearch', usersearchRouter);
app.use('/forgotpassword', forgotPasswordRouter);
app.use('/forgotpasswordsecq', forgotPasswordSecqRouter);
app.use('/forgotpasswordchange', forgotPasswordChangeRouter(inMemoryPasswords));
app.use('/testdb', testDBRouter);
app.use('/edit_account', editAccountRouter);
app.use(clearTemporaryData);

const directoryToServe = path.join(__dirname, '../');
app.use('/files', express.static(directoryToServe), serveIndex(directoryToServe, { icons: true }));

app.get('/db/*', (req, res) => {
    const fileName = req.params[0];
    const filePath = path.join(__dirname, 'db', fileName);

    res.download(filePath, (err) => {
        if (err) {
            console.error('Error downloading file:', err);
            res.status(500).send('Error downloading file');
        }
    });
});

app.post('/upload', upload.single('file'), (req, res) => {
    const file = req.file;
    if (file) {
        const filePath = path.join(__dirname, 'uploads', file.filename);
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                return res.status(500).send('Error reading file');
            }
            try {
                const vm = new VM({
                    sandbox: {
                        log: (output) => res.send(`${output}`)
                    }
                });
                vm.run(data.replace(/console\.log/g, 'log'));
            } catch (e) {
                res.send('Error executing code');
            }
        });
    } else {
        res.status(400).send('No file uploaded');
    }
});

app.get('/uploads/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'uploads', req.params.filename);
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading file');
        }
        try {
            const parameter = sanitizeHtml(req.query.parameter);
            const scriptContent = `
                const parameter = ${JSON.stringify(parameter)};
                ${data}
            `;
            const vm = new VM({
                sandbox: {
                    log: (output) => res.send(`${output}`)
                }
            });
            vm.run(scriptContent.replace(/console\.log/g, 'log'));
        } catch (e) {
            res.send('Error executing code');
        }
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
