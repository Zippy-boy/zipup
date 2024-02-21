const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = process.env.PORT || 8080; 
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs-extra');
const path = require('path');
const jszip = require('jszip')
const formidable = require('formidable');

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 

var unzipped = []
var uploads = []
var zipped = []

app.post('/upload-file', upload.single('folder'), (req, res) => {
    try {
        const folderPath = req.file.path;
        
        console.log(`file uploaded to ${folderPath}`);
        const originalName = req.file.originalname;


        const newFolderPath = path.join(__dirname, 'uploads', originalName);
        fs.renameSync(folderPath, newFolderPath);
        
        console.log(`Folder moved to ${newFolderPath}`);

        uploads.push(newFolderPath)
        
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/upload-folder', async (req, res) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ message: 'No files were uploaded.' });
        }

        const folder = req.files.folder; // Assuming the input field name is 'folder'

        // Save the entire folder to your desired location (e.g., a folder named 'uploads')
        await fs.ensureDir('./uploads'); // Create the 'uploads' directory if it doesn't exist
        await folder.mv('./uploads/' + folder.name);

        res.json({ message: 'Folder uploaded successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error uploading folder.' });
    }
});

app.get('/download', (req, res) => {
    try {
        const { filename } = req.body;
        const filePath = path.join(__dirname, 'uploads', filename);

        // Send the file to the client
        res.sendFile(filePath);
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).send('Error downloading file');
    }
});

app.post('/unzip-folder', async (req, res) => {
    try {
        const { filename } = req.body;
        const folderPath = path.join(__dirname, 'uploads', filename);

        const fileContent = fs.readFileSync(folderPath);
        const jszipInstance = new jszip();
        const result = await jszipInstance.loadAsync(fileContent);

        const extractedFolderPath = path.join(__dirname, 'unzipped', filename.split('.')[0]);
        fs.mkdirSync(extractedFolderPath, { recursive: true });

        for (const key in result.files) {
            const item = result.files[key];
            if (!item.dir) {
                const extractedFilePath = path.join(extractedFolderPath, item.name);
                const extractedFileDir = path.dirname(extractedFilePath);
                if (!fs.existsSync(extractedFileDir)) {
                    fs.mkdirSync(extractedFileDir, { recursive: true });
                }
                fs.writeFileSync(extractedFilePath, await item.async('nodebuffer'));
                console.log(`Extracted file saved to ${extractedFilePath}`);
            }
        }

        unzipped.push(extractedFolderPath)

        console.log(`Folder unzipped to ${unzipped}`);
        console.log(`Zipped folder is ${zipped}`)

        res.sendStatus(200);
    } catch (error) {
        console.error('Error unzipping folder:', error);
        res.status(500).send('Error unzipping folder');
    }
});

app.post('/zip-folder', async (req, res) => {
    try {
        const { filename } = req.body;
        const folderPath = path.join(__dirname, 'unzipped', filename);

        const jszipInstance = new jszip();
        const files = fs.readdirSync(filename);
        for (const file of files) {
            const filePath = path.join(folderPath, file);
            const fileContent = fs.readFileSync(filePath);
            jszipInstance.file(file, fileContent);
        }

        const zippedFilePath = path.join(__dirname, 'zipped', `${filename}.zip`);
        const zippedFileContent = await jszipInstance.generateAsync({ type: 'nodebuffer' });
        fs.writeFileSync(zippedFilePath, zippedFileContent);

        zipped.push(zippedFilePath)

        console.log(`Folder zipped to ${zippedFilePath}`);
        console.log(`Unzipped folder is ${unzipped}`)

        res.sendStatus(200);
    } catch (error) {
        console.error('Error zipping folder:', error);
        res.status(500).send('Error zipping folder');
    }
});

app.post('/delet', async (req, res) => {
    try {
        const {filename} = req.body;
        var folderPath = path.join(__dirname, 'uploads', filename);
        fs.unlinkSync(folderPath);

        folderPath = path.join(__dirname, 'unzipped', filename.split('.')[0]);
        fs.rmSync(folderPath, { recursive: true });

        res.sendStatus(200);
    } catch (error) {
        console.error("Error deleting folder/file: ", error);
        res.status(500).send("Error deleteing folder/file")
    }
});

const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = server;
