const cloudinaryConfig = require("../config/cloudinaryConfig");

// Upload to Cloudinary
const cloudinaryUploader = async (filePath) => {
  try {
    const result = await cloudinaryConfig.uploader.upload(filePath, {
      folder: "k Commence", // optional: your folder name
    });
    console.log("Uploaded:", result);
    return result; // contains URL, public_id, etc.
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};

// Delete from Cloudinary
const cloudinaryDestroyer = async (publicId) => {
  try {
    const result = await cloudinaryConfig.uploader.destroy(publicId);
    console.log("Deleted:", result);
    return result; // result: { result: 'ok' }
  } catch (error) {
    console.error("Delete error:", error);
    throw error;
  }
};

module.exports = {
  cloudinaryUploader,
  cloudinaryDestroyer,
};
