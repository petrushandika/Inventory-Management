import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
});

/**
 * Upload a base64 data-URI or remote URL to Cloudinary.
 * Returns the secure HTTPS URL of the uploaded image.
 */
export const uploadImage = async (
  source: string,
  folder = "inventory"
): Promise<string> => {
  const result = await cloudinary.uploader.upload(source, {
    folder,
    resource_type: "image",
    transformation: [
      { width: 800, height: 800, crop: "limit", quality: "auto:good", fetch_format: "auto" },
    ],
  });
  return result.secure_url;
};

/**
 * Delete an image from Cloudinary by its public_id.
 * public_id is the path without extension, e.g. "inventory/abc123".
 */
export const deleteImage = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId);
};

/**
 * Extract the Cloudinary public_id from a secure_url.
 * e.g. "https://res.cloudinary.com/demo/image/upload/v123/inventory/abc.jpg"
 *   →  "inventory/abc"
 */
export const publicIdFromUrl = (url: string): string | null => {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/i);
  return match ? match[1] : null;
};

export default cloudinary;
