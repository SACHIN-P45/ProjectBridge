const fs = require('fs');
const path = require('path');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

const isCloudinaryConfigured = () => {
  const name = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  
  return name && name !== 'your_cloud_name' &&
         key && key !== 'your_api_key' &&
         secret && secret !== 'your_api_secret';
};

const uploadToLocalDisk = (buffer, folder, originalName) => {
  const uploadDir = path.join(__dirname, '..', 'uploads', folder);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  const cleanName = originalName 
    ? originalName.replace(/[^a-zA-Z0-9.-]/g, '_')
    : 'file.bin';
  const filename = `${Date.now()}-${cleanName}`;
  const filePath = path.join(uploadDir, filename);
  
  fs.writeFileSync(filePath, buffer);
  
  const port = process.env.PORT || 5000;
  const baseUrl = `http://localhost:${port}`;
  
  return {
    secure_url: `${baseUrl}/uploads/${folder}/${filename}`,
    public_id: `${folder}/${filename}`,
  };
};

const uploadToCloudinary = (buffer, folder, resourceType = 'auto', originalName = null) => {
  if (!isCloudinaryConfigured()) {
    console.log(`⚠️ Cloudinary is not configured. Falling back to local disk upload in folder '${folder}'`);
    return Promise.resolve(uploadToLocalDisk(buffer, folder, originalName));
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: `projectbridge/${folder}`, resource_type: resourceType },
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary upload failed, falling back to local disk:', error);
          try {
            resolve(uploadToLocalDisk(buffer, folder, originalName));
          } catch (localErr) {
            reject(localErr);
          }
          return;
        }
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  if (!publicId) return;
  
  const localFilePath = path.join(__dirname, '..', 'uploads', publicId);
  if (fs.existsSync(localFilePath)) {
    try {
      fs.unlinkSync(localFilePath);
      console.log(`🗑️ Deleted local file: ${localFilePath}`);
      return { result: 'ok' };
    } catch (err) {
      console.error(`❌ Failed to delete local file: ${localFilePath}`, err);
    }
  }

  if (!isCloudinaryConfigured()) {
    return { result: 'ok' };
  }

  return await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};

module.exports = { uploadToCloudinary, deleteFromCloudinary };
