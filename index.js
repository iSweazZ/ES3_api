const express = require('express');
const multer = require('multer');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { json, static: serveStatic } = express;

const decrypt = require('./src/endpoints/Decrypt');
const encrypt = require('./src/endpoints/Encrypt');
const download = require('./src/endpoints/Download');
const {init} = require('./src/utils/DataBase');

// Configurations
const CORS_OPTIONS = {};
const UPLOAD_DIRECTORY = path.join(__dirname, 'assets/files');

const app = express();
const upload = multer();

// Fonctions utilitaires
const parsePort = (val) => {
    const port = parseInt(val, 10);
    return isNaN(port) ? val : (port >= 0 ? port : false);
};

const handleServerError = (error) => {
    if (error.syscall !== 'listen') {
        throw error;
    }
    const errors = {
        EACCES: 'Permission denied',
        EADDRINUSE: 'Port is already in use'
    };
    const message = errors[error.code] || 'Server error occurred';
    console.error(message);
    process.exit(1);
};

// Configuration de middlewares
const setupMiddlewares = (app) => {
    app.use(cors(CORS_OPTIONS));
    app.use(json());
    app.use('/static/assets/files', serveStatic(UPLOAD_DIRECTORY));
};

// Configuration des routes
const setupRoutes = (app) => {
    app.post('/decrypt', upload.single('file'), decrypt.execute);
    app.post('/encrypt', encrypt.execute);
    app.get('/download/:id', (req, res) => {
        download.execute(req, res);
    });

};

// Fonction principale pour démarrer le serveur
const bootstrap = () => {
    const port = parsePort(process.env.PORT || '3000');
    app.set('port', port);

    setupMiddlewares(app);
    setupRoutes(app);

    const server = http.createServer(app);

    server.on('error', handleServerError);
    server.on('listening', () => {
        const address = server.address();
        const bind = typeof address === 'string' ? `pipe ${address}` : `port ${port}`;
        console.log(`Listening on ${bind}`);
        init();
    });

    server.setTimeout(1000 * 60 * 5);
    server.listen(port);
};

// Démarrer l'application
bootstrap();
