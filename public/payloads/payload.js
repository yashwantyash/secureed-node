import express from 'express';

const router = express.Router();

router.get('/payload', (req, res) => {
    const parameter = req.query.parameter;
    try {
        const result = eval(parameter); // executes the code in the parameter
        res.send(`Result: ${result}`);
    } catch (e) {
        res.status(500).send('Error executing code');
    }
});

export default router;
