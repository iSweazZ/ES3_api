/*
*
* sqlite
* alwaysdata
*
* */

const crypto = require('crypto');
const ALGORITHM = 'aes-128-cbc';
const PBKDF2_ITERATIONS = 100;

module.exports = (() =>{
    const decryptData = async (data, password) => {
        const iv = data.slice(0, 16); // Extrait l'IV
        const encryptedData = data.slice(16); // Récupère les données chiffrées
        const key = crypto.pbkdf2Sync(password, iv, PBKDF2_ITERATIONS, 16, 'sha1'); // Dérive la clé
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
      
        return Buffer.concat([decipher.update(encryptedData), decipher.final()]);
      };

      const encryptData = async (data, password) => {
        const iv = crypto.randomBytes(16); // Génère un IV aléatoire
        const key = crypto.pbkdf2Sync(password, iv, PBKDF2_ITERATIONS, 16, 'sha1'); // Dérive la clé
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
      
        return Buffer.concat([iv, cipher.update(data), cipher.final()]);
      }

      return {
        decryptData,
        encryptData,
      };
})()