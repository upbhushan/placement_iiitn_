import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth'; // For authentication
import { uploadToCloudinary } from '@/lib/cloudinary'; // Import the helper

export async function POST(request: NextRequest) {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized: You must be logged in to upload files.' }, { status: 401 });
    }

    try {
        const data = await request.formData();
        const file = data.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
        }

        // Convert File to a stream or buffer for Cloudinary
        const fileStream = file.stream(); // Get a ReadableStream<Uint8Array>

        // Sanitize filename for Cloudinary public_id (optional, Cloudinary handles uniqueness)
        const originalFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const publicId = `form_uploads/${uniqueSuffix}-${originalFilename}`;

        // Upload to Cloudinary
        const result = await uploadToCloudinary(fileStream, {
            public_id: publicId,
            resource_type: 'auto', // Let Cloudinary detect the file type
            folder: 'dynamic_form_uploads', // Optional: organize in a Cloudinary folder
        });

        if (!result?.secure_url) {
            console.error('Cloudinary upload failed:', result);
            return NextResponse.json({ error: 'Cloudinary upload failed.', details: result?.error?.message || 'Unknown Cloudinary error' }, { status: 500 });
        }

        // Return the secure URL from Cloudinary
        return NextResponse.json({
            success: true,
            message: 'File uploaded successfully to Cloudinary',
            fileUrl: result.secure_url, // Use this URL in your form submission
            publicId: result.public_id,
            originalFilename: file.name,
        }, { status: 201 });

    } catch (error) {
        console.error('File upload error:', error);
        let errorMessage = 'An unknown error occurred during file upload.';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return NextResponse.json({ error: 'File upload failed.', details: errorMessage }, { status: 500 });
    }
}