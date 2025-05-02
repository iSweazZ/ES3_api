const {getFilePath} = require('../utils/DataBase');
const path = require('path');
const fs = require('fs');//MarketSave !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

module.exports = (() => {
    const execute = async (req, res) => {

        try {
            const fileId = req.params.id; // Assuming the file ID is sent as a query parameter
            if (!fileId) {
                return res.status(400).json({error: 'File ID is required.'});
            }

            // Fetch the file path from the database
            const {row} = await getFilePath(fileId);
            if (!row || !row.filePath) {
                return res.status(404).json({error: 'File not found.'});
            }

            // Construct the absolute file path
            const filePath = path.resolve(__dirname, '../../assets/files', row.filePath);

            // Verify if the file exists
            if (!fs.existsSync(filePath)) {
                return res.status(404).json({error: 'File not found on the server.'});
            }

            // Send the file as a response
            res.download(filePath, (err) => {
                if (err) {
                    console.error('Error sending file:', err);
                    res.status(500).json({error: 'Error serving the file.'});
                }
            });
        } catch (error) {
            console.error('Error in Download endpoint:', error);
            res.status(500).json({error: 'Internal server error.'});
        }
    };

    return { execute };
})();
