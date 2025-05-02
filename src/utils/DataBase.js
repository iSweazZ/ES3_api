const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Chemin de la base de données
const dbPath = path.join(__dirname, '../../assets/Database.db');
let db;
// Fonction pour initialiser la base de données
function init() {
    db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Erreur lors de l\'ouverture de la base de données:', err.message);
            return;
        }
        console.log('Base de données connectée :', dbPath);

        // Création de la table
        db.run(
            `CREATE TABLE IF NOT EXISTS files
             (
                 ID
                 INTEGER
                 PRIMARY
                 KEY
                 AUTOINCREMENT,
                 filePath
                 TEXT
                 NOT
                 NULL,
                 IP
                 TEXT
                 NOT
                 NULL,
                 timestamp
                 DATETIME
                 NOT
                 NULL
                 DEFAULT
                 CURRENT_TIMESTAMP
             )`,
            (err) => {
                if (err) {
                    console.error('Erreur lors de la création de la table :', err.message);
                } else {
                    console.log('Table "files" initialisée avec succès.');
                }
            }
        );
    });
}

// Fonction pour obtenir le chemin du fichier et l'IP par ID
function getFilePath(ID) {
    return new Promise((resolve, reject) => {
        const query = `SELECT filePath, IP
                       FROM files
                       WHERE ID = ? LIMIT 1`;
        db.get(query, [ID], (err, row) => {
            if (err) {
                return reject({success: false, message: 'Erreur lors de l\'extraction du fichier : ' + err.message});
            }
            if (!row) {
                return reject({success: false, message: 'ID introuvable.'});
            }
            return resolve({success: true, row});
        });
    });
}

// Fonction pour enregistrer un chemin de fichier et une IP
function saveFilePath(filePath, IP) {
    return new Promise((resolve, reject) => {
        const query = `INSERT INTO files (filePath, IP) VALUES (?, ?)`;
        db.run(query, [filePath, IP], function (err) {
            if (err) {
                console.log('Erreur lors de l\'enregistrement : ' + err.message);
                return reject(err.message); // Rejetez la promesse avec l'erreur
            }
            console.log(`Le fichier ${filePath} à été sauvegardé pour l'IP ${IP}.`);
            return resolve(this.lastID); // Résolvez la promesse avec l'ID généré
        });
    });
}



// Fonction pour obtenir les fichiers expirés (plus d'1 heure)
function getExpiredFiles(callback) {
    const query = `
        SELECT *
        FROM files
        WHERE timestamp <= datetime('now', '-1 hour')
    `;
    db.all(query, [], (err, rows) => {
        if (err) {
            return callback('Erreur lors de l\'extraction des fichiers expirés : ' + err.message);
        }
        callback(null, rows);
    });
}

// Export des fonctions (si besoin dans d'autres fichiers)
module.exports = {init, getFilePath, saveFilePath, getExpiredFiles};