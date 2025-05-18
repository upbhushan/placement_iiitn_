import { v2 as cloudinary } from 'cloudinary';

if (!process.env.CLOUDINARY_CLOUD_NAME) {
    throw new Error('CLOUDINARY_CLOUD_NAME is not defined in environment variables');
}
if (!process.env.CLOUDINARY_API_KEY) {
    throw new Error('CLOUDINARY_API_KEY is not defined in environment variables');
}
if (!process.env.CLOUDINARY_API_SECRET) {
    throw new Error('CLOUDINARY_API_SECRET is not defined in environment variables');
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true, // Ensures HTTPS URLs are returned
});

export default cloudinary;

// Optional: Helper function to upload a file stream or buffer
// For Next.js API routes, you might receive a file stream or buffer from formidable/multer or directly from request.formData()

export async function uploadToCloudinary(
    fileStream: ReadableStream<Uint8Array> | Buffer,
    options?: object
): Promise<any> { // Consider defining a more specific return type based on Cloudinary's response
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            options || { resource_type: 'auto' }, // Default to auto, can specify 'image', 'video', 'raw'
            (error, result) => {
                if (error) {
                    return reject(error);
                }
                resolve(result);
            }
        );

        if (Buffer.isBuffer(fileStream)) {
            uploadStream.end(fileStream);
        } else if (fileStream instanceof ReadableStream) {
            // Pipe the stream
            const reader = fileStream.getReader();
            function pump() {
                reader.read().then(({ done, value }) => {
                    if (done) {
                        uploadStream.end();
                        return;
                    }
                    uploadStream.write(value);
                    pump();
                }).catch(reject);
            }
            pump();
        } else {
            reject(new Error('Unsupported file stream type for Cloudinary upload.'));
        }
    });
}
