const request = require('supertest');
const app = require('../index.js'); // Import your Express app


process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
});


describe('Folder Upload zipped', () => {
    it('should upload a zipped file successfully', async () => {
        const { expect } = await import('chai');

        const response = await request(app)
            .post('/upload-file')
            .attach('folder', './tests/upload.test.zip'); // Provide the path to your test folder

        expect(response.status).to.equal(200);
        // expect(response.text).to.equal('Folder uploaded successfully');
    });

    after(() => {
        app.close(); // Shutdown the Express app
    });
});

// describe('Folder Upload unzipped', () => {
//     it('should upload an open folder successfully', async () => {
//         const { expect } = await import('chai');

//         const response = await request(app)
//             .post('/upload-folder')
//             .attach('folder', './tests/unzipped.test/'); // Provide the path to your test folder

//         expect(response.status).to.equal(200);
//         // expect(response.text).to.equal('Folder uploaded successfully');
//     });
// });



describe('Folder Unzip', () => {
    it("Should unzip the folder and save it to the 'uploads' directory", async () => {
        const { expect } = await import('chai');
        const response = await request(app)
            .post('/unzip-folder')
            .send({ filename: 'upload.test.zip' });

        expect(response.status).to.equal(200);
        // expect(response.text).to.equal('Folder unzipped successfully');
    });
});

// describe("Zip Folder", () => {
//     it("Should zip the folder and save it to the 'zipped' directory", async () => {
//         const { expect } = await import('chai');
//         const response = await request(app)
//             .post('/zip-folder')
//             .send({ filename: 'TEST' });

//         expect(response.status).to.equal(200);
//     });
// })


describe('Folder download', () => {
    it("Should download the folder from the 'uploads' directory", async () => {
        const { expect } = await import('chai');
        const response = await request(app)
            .get('/download') // Use the correct filename
            .send({ filename: 'upload.test.zip' });

        // Assert that the response status is 200 (OK)
        expect(response.status).to.equal(200);
    });
});


describe('Folder delete', () => {
    it("Should delete the folder from the 'uploads' and 'unzipped' directory", async () => {
        const { expect } = await import('chai');
        const response = await request(app)
            .post('/delet')
            .send({ filename: 'upload.test.zip' });
        
        expect(response.status).to.equal(200);
    });
    after(() => {
        app.close(); // Shutdown the Express app
    }, 100000);
})

