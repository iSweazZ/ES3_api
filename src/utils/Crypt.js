const crypto = require('crypto');

// Constantes globales pour la configuration
const ENCRYPTION_ALGORITHM = 'aes-128-cbc';
const KEY_DERIVATION_ITERATIONS = 100;
const IV_SIZE = 16;

// Fonction pour dériver une clé à partir du mot de passe et de l'IV
const deriveKey = (password, iv) => {
    return crypto.pbkdf2Sync(password, iv, KEY_DERIVATION_ITERATIONS, 16, 'sha1');
};

module.exports = (() => {
    const decryptData = async (encryptedDataWithIv, password) => {
        // Extraction de l'IV depuis les données chiffrées
        const iv = encryptedDataWithIv.slice(0, IV_SIZE);
        const ciphertext = encryptedDataWithIv.slice(IV_SIZE);

        // Dérivation de la clé
        const key = deriveKey(password, iv);

        // Déchiffrement des données
        const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
        return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    };

    const encryptData = async (plainData, password) => {
        // Génération d'un IV aléatoire
        const iv = crypto.randomBytes(IV_SIZE);

        // Dérivation de la clé
        const key = deriveKey(password, iv);

        // Chiffrement des données
        const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
        return Buffer.concat([iv, cipher.update(plainData), cipher.final()]);
    };

    return {
        decryptData,
        encryptData,
    };
})();
