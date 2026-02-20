const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'client')));

app.get('/api/info', (req, res) => {
    res.json({ 
        message: "Hello from AWS Node Server", 
        timestamp: new Date(),
        express_version: "5.2.1"
    });
});

// *** THE CORRECTED CATCH-ALL FOR EXPRESS 5 ***
// This regular expression matches the root path OR any path starting with a slash.
app.get(/^(?:\/|(\/.*))$/, (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});