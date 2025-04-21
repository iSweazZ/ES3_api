const express = require('express');
const multer = require('multer');
const crypt = require('./utils/crypt'); // Assurez-vous que le chemin est correct

const app = express();
const upload = multer();

// Middleware pour parser les JSON
app.use(express.json());

// Route POST /decrypt
app.post('/decrypt', upload.single('file'), async (req, res) => {
    const file = req.file;
    const password = req.body.password;

    if (!file || !password) {
        return res.status(400).json({ error: 'File and password are required.' });
    }

    const decryptedData = await crypt.decryptData(file.buffer, password); // Utilisation de la fonction decryptData
    if (!decryptedData) {
        return res.status(500).json({ error: 'Failed to decrypt data.' });
    }

    res.json(decryptedData.toString('utf-8'));
});

// Route POST /encrypt
app.post('/encrypt', async (req, res) => {
    const { data, password } = req.body;

    if (!data || !password) {
        return res.status(400).json({ error: 'Data and password are required.' });
    }

    try {
        const encryptedData = await crypt.encryptData(Buffer.from(data, 'utf-8'), password);
        res.json({ encryptedData: encryptedData.toString('utf-8') });
    } catch (error) {
        res.status(500).json({ error: 'Failed to encrypt data.' });
    }
});

// Démarrage du serveur
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});