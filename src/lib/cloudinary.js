export class CloudinaryService {
     cloudName;
     uploadPreset;
     uploadUrl;

    constructor() {
      this.cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
      this.uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';
      this.uploadUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;
    }

    async uploadImage(file) {
      if (!this.cloudName || !this.uploadPreset) {
        console.warn('Cloudinary configuration is missing, falling back to base64 encoding');
        return this.getBase64Fallback(file);
      }

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', this.uploadPreset);

        const response = await fetch(this.uploadUrl, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Cloudinary upload failed:', errorData);
          return this.getBase64Fallback(file);
        }

        const data = await response.json();
        return data.secure_url;
      } catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
        return this.getBase64Fallback(file);
      }
    }

    async getBase64Fallback(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to convert file to base64'));
          }
        };
        reader.onerror = error => reject(error);
      });
    }

    getResizedImageUrl(imageUrl, width, height) {
      if (!imageUrl) return '';

      if (imageUrl.includes('cloudinary.com')) {
        return imageUrl.replace(/\/upload\//, `/upload/c_fill,w_${width},h_${height}/`);
      }

      if (imageUrl.startsWith('data:')) {
        return imageUrl;
      }

      return imageUrl;
    }
  }

  export const cloudinaryService = new CloudinaryService();