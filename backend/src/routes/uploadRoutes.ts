import { Router } from 'express';
import { BlobServiceClient, BlobSASPermissions } from '@azure/storage-blob';
import { v4 as uuidv4 } from 'uuid';

const imageUploadRouter = Router();
const containerName = 'images'; 

imageUploadRouter.get('/api/url-generator', async (req, res) => {
    try {
        const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

        if (!connectionString) {
            console.error('❌ AZURE_STORAGE_CONNECTION_STRING is not defined in environment variables');
            return res.status(500).json({
                message: 'Azure Storage connection string not configured',
                error: 'Missing AZURE_STORAGE_CONNECTION_STRING environment variable'
            });
        }

        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString)
        const containerClient = blobServiceClient.getContainerClient(containerName) // local instance of the container
        const originalFilename = String(req.query.filename)
        const extension = originalFilename.split('.').pop() // get the file type
        const blobName = `${uuidv4()}.${extension}` // create a unique filename
        const blockBlobClient = containerClient.getBlockBlobClient(blobName)

        // generate a SAS token valid for 5 minutes with write permission
        const sasTokenUrl = await blockBlobClient.generateSasUrl({
            permissions: BlobSASPermissions.parse("w"),
            expiresOn: new Date(new Date().valueOf() + 300000),
        })

        // return the url and the generated filename
        res.status(200).json({ 
            uploadUrl: sasTokenUrl, 
            blobName: blobName      
        })

    } 
    catch (error: any) {
        console.error(error)
        res.status(500).json({ 
            message: 'Error generating upload URL', error: error.message 
        })
    }
})

export default imageUploadRouter