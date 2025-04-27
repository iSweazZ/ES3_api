const express = require('express');
const multer = require('multer');
const cors = require('cors'); // Importer le module cors
const crypt = require('./utils/crypt'); // Assurez-vous que le chemin est correct
const fs = require('fs'); // Importer le module fs pour écrire des fichiers
const http = require('http');
const path = require('path');

const app = express();
const upload = multer();

// Activer CORS pour toutes les routes
app.use(cors());

// Middleware pour parser les JSON
app.use(express.json());
app.use('/static/assets/images', express.static(path.join(__dirname, 'assets/images')));

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
    //console.log(req.body.password)
    const { data, password } = req.body;

    if (!data || !password) {
        return res.status(400).json({ error: 'Data and password are required.' });
    }
    try {
        const encryptedData = await crypt.encryptData(data, password);
        const encryptedPath = './StoreFile4.es3';
        fs.writeFileSync(encryptedPath, encryptedData);
        res.json({ encryptedData: encryptedData.toString('utf-8') });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message });
    }
});

const normalizePort = val => {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        return val;
    }
    if (port >= 0) {
        return port;
    }

    return false;
}

const errorHandler = error => {
    if (error.syscall !== 'listen') {
        throw error;
    }

    switch (error.code) {
        case 'EACCES':
            process.exit(1);
            break;
        case 'EADDRINUSE':
            process.exit(1);
            break;
        default:
            throw error;
    }
}

const bootstrap = () => {
    const port = normalizePort(process.env.PORT || '3000')
    app.set('port', port)

    const server = http.createServer(app)
    server.on('error', errorHandler);
    server.on('listening', () => {
        const address = server.address();
        const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
        console.log('Listening on ' + bind);
    })

    server.setTimeout(1000 * 60 * 5)
    server.listen(port)
}

bootstrap();