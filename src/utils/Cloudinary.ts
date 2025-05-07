import axios from "axios";

const ImageUpload = async (file: File): Promise<string> => {
    try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_PRESETNAME);

        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUDNAME}/image/upload`,
            formData
        );

        return response.data.secure_url; 
    } catch (error) {
        console.error("Image upload failed:", error);
        throw new Error("Failed to upload image");
    }
};

export default ImageUpload;





export const VideoUpload = async (file: File, onProgress: (progress: number) => void): Promise<string> => {
    try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_PRESETNAME);
        formData.append("resource_type", "video");

        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUDNAME}/video/upload`,
            formData,
            {
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        onProgress(percentCompleted); 
                    }
                }
            }
        );

        return response.data.secure_url;
    } catch (error) {
        console.error("Video upload failed:", error);
        throw new Error("Failed to upload video");
    }
};
