const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Route to serve login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to serve announcements from announcements.json
app.get('/announcements', (req, res) => {
    // Path to announcements JSON file
    const announcementsPath = path.join(__dirname, 'announcements.json');

    // Read the announcements JSON file
    fs.readFile(announcementsPath, 'utf-8', (err, data) => {
        if (err) {
            console.error('Error reading announcements:', err);
            res.status(500).json({ error: 'Failed to read announcements' });
            return;
        }

        try {
            // Parse the JSON data
            const announcements = JSON.parse(data);

            // Send the announcements as the response
            res.json(announcements);
        } catch (error) {
            console.error('Error parsing announcements:', error);
            res.status(500).json({ error: 'Failed to parse announcements' });
        }
    });
});

// Route to handle announcement submissions
app.post('/submit-announcement', (req, res) => {
    try {
        const announcementData = req.body;

        // Validate incoming data
        if (!announcementData.title || !announcementData.content || !announcementData.author) {
            return res.status(400).json({ error: 'Invalid data format: title, content, or author is missing' });
        }

        // Read existing announcements from file
        const announcementsFilePath = path.join(__dirname, 'announcements.json');
        let existingAnnouncements = [];
        if (fs.existsSync(announcementsFilePath)) {
            const announcementsFileContent = fs.readFileSync(announcementsFilePath, 'utf-8');
            existingAnnouncements = JSON.parse(announcementsFileContent);
        }

        // Add the new announcement to the existing list
        existingAnnouncements.push(announcementData);

        // Write updated announcements back to file
        fs.writeFileSync(announcementsFilePath, JSON.stringify(existingAnnouncements, null, 2), 'utf-8');

        // Send success response
        res.status(200).json({ message: 'Announcement submitted successfully' });
    } catch (error) {
        console.error('Error submitting announcement:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    }
});

// Route to handle deleting announcements
app.delete('/delete-announcement/:index', (req, res) => {
    try {
        const index = req.params.index;
        const announcementsFilePath = path.join(__dirname, 'announcements.json');

        // Read existing announcements from file
        let existingAnnouncements = [];
        if (fs.existsSync(announcementsFilePath)) {
            const announcementsFileContent = fs.readFileSync(announcementsFilePath, 'utf-8');
            existingAnnouncements = JSON.parse(announcementsFileContent);
        }

        // Remove the announcement at the specified index
        existingAnnouncements.splice(index, 1);

        // Write updated announcements back to file
        fs.writeFileSync(announcementsFilePath, JSON.stringify(existingAnnouncements, null, 2), 'utf-8');

        // Send success response
        res.status(200).json({ message: 'Announcement deleted successfully' });
    } catch (error) {
        console.error('Error deleting announcement:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
