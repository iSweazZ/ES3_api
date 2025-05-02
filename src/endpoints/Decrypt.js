const crypt = require("../utils/Crypt");

// Constantes pour les messages d'erreur
const ERRORS = {
    MISSING_FILE_OR_PASSWORD: 'File and password are required.',
    DECRYPTION_FAILED: 'Failed to decrypt data.'
};

// Fonction pour valider la requête
const route = {
    method: 'POST',
    path: '/decrypt',
}
const validateRequest = (req) => {
    const uploadedFile = req.file;
    const userPassword = req.body.password;

    if (!uploadedFile || !userPassword) {
        return {
            valid: false,
            error: ERRORS.MISSING_FILE_OR_PASSWORD
        };
    }

    return { valid: true, uploadedFile, userPassword };
};

module.exports = (() => {
    const execute = async (req, res) => {
        const validation = validateRequest(req);

        if (!validation.valid) {
            return res.status(400).json({ error: validation.error });
        }

        const { uploadedFile, userPassword } = validation;

        try {
            const decryptedData = await crypt.decryptData(uploadedFile.buffer, userPassword);

            if (!decryptedData) {
                return res.status(500).json({ error: ERRORS.DECRYPTION_FAILED });
            }

            res.json(decryptedData.toString('utf-8'));
        } catch (err) {
            return res.status(500).json({ error: ERRORS.DECRYPTION_FAILED });
        }
    };

    return { execute };
})();
