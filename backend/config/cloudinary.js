const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configure Cloudinary with your credentials
cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.CLOUD_API_KEY, 
  api_secret: process.env.CLOUD_API_SECRET
});

/**
 * Uploads a file to Cloudinary.
 * @param {string} localFilePath - The path to the file on your local server.
 * @returns {Promise<object>} - A promise that resolves with the Cloudinary upload result.
 */
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto" // Automatically detect the file type (image, video, pdf, etc.)
        });

        // File has been uploaded successfully
        console.log("✅ File uploaded to Cloudinary:", response.url);
        
        // Remove the locally saved temporary file
        fs.unlinkSync(localFilePath);
        
        return response;

    } catch (error) {
        // If the upload fails, remove the locally saved temporary file
        fs.unlinkSync(localFilePath); 
        console.error("Cloudinary upload error:", error);
        return null;
    }
};

module.exports = { uploadOnCloudinary };