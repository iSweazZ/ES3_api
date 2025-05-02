const crypt = require("../utils/Crypt");
const fs = require("fs");
const db = require('../utils/DataBase');
const path = require('path');

// Constantes pour les messages d'erreur et le chemin du fichier
const ERROR_MESSAGE_MISSING_PARAMS = 'Data and password are required.';
const ENCRYPTED_FILE_PATH = path.resolve(__dirname, '../../assets/files');

// Fonction pour écrire des données chiffrées dans un fichier
const writeEncryptedFile = async (filePath, fileName, IP, data) => {
    const dirName = Date.now();
    const customFilePath = `${dirName}/${fileName}`;
    const filePathWithFileName = `${filePath}/${customFilePath}`;
    fs.mkdirSync(`${filePath}/${dirName}`, { recursive: true });
    console.log(customFilePath);
    fs.writeFileSync(filePathWithFileName, data);

    try {
        const fileId = await db.saveFilePath(customFilePath, IP); // Attendez le résultat
        return fileId; // Retourne l'ID du fichier
    } catch (err) {
        console.error("Erreur lors de la sauvegarde du chemin de fichier :", err);
        throw new Error("Impossible de sauvegarder le chemin du fichier dans la base de données.");
    }
};



// Module exporté
module.exports = (() => {
    const execute = async (req, res) => {
        const { data, password, fileName } = req.body;
        const IP = req.ip;

        // Vérification des paramètres fournis
        if (!data || !password) {
            return res.status(400).json({ error: ERROR_MESSAGE_MISSING_PARAMS });
        }

        try {
            // Chiffrement des données
            const encryptedData = await crypt.encryptData(data, password);

            // Écriture des données chiffrées dans un fichier
            const fileId = await writeEncryptedFile(ENCRYPTED_FILE_PATH, fileName, IP, encryptedData);
            console.log(fileId);
            let dd = await db.getFilePath(fileId)
            console.log("file", dd)
            // Réponse avec les données chiffrées
            res.json({ link: `http://localhost:3000/download/${fileId}`});
        } catch (error) {
            console.error("Erreur lors de l'exécution :", error.message);
            res.status(500).json({ error: error.message });
        }

    };

    return {
        execute,
    };
})();
