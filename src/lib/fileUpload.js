import { supabase } from "./supabase";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = {
  bmc: [".pdf", ".doc", ".docx"],
  presentation: [".pdf", ".ppt", ".pptx"],
};

export class FileUploadError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
}

export const validateFile = (file, fileType) => {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    throw new FileUploadError(
      `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      "FILE_TOO_LARGE"
    );
  }

  // Check file type
  const fileExtension = "." + file.name.split(".").pop().toLowerCase();
  if (!ALLOWED_FILE_TYPES[fileType].includes(fileExtension)) {
    throw new FileUploadError(
      `File type must be one of: ${ALLOWED_FILE_TYPES[fileType].join(", ")}`,
      "INVALID_FILE_TYPE"
    );
  }
};

export const uploadFile = async (file, teamName, fileType, onProgress) => {
  try {
    // Validate file
    validateFile(file, fileType);

    // Generate unique file name
    const timestamp = new Date().getTime();
    const fileExt = file.name.split(".").pop().toLowerCase();
    const fileName = `${teamName}_${fileType}_${timestamp}.${fileExt}`;
    const filePath = `${teamName}/${fileName}`;

    // Upload file with progress tracking
    const { error: uploadError, data } = await supabase.storage
      .from("submissions")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        onUploadProgress: (progress) => {
          if (onProgress) {
            const percentage = (progress.loaded / progress.total) * 100;
            onProgress(Math.round(percentage));
          }
        },
      });

    if (uploadError) {
      throw new FileUploadError(
        uploadError.message || "Error uploading file",
        "UPLOAD_ERROR"
      );
    }

    // Get public URL
    const { data: { publicUrl } = {} } = supabase.storage
      .from("submissions")
      .getPublicUrl(filePath);

    return {
      path: filePath,
      url: publicUrl,
      fileName: fileName,
    };
  } catch (error) {
    if (error instanceof FileUploadError) {
      throw error;
    }
    throw new FileUploadError(
      error.message || "Error uploading file",
      "UNKNOWN_ERROR"
    );
  }
};

export const deleteFile = async (filePath) => {
  try {
    const { error } = await supabase.storage
      .from("submissions")
      .remove([filePath]);

    if (error) {
      throw new FileUploadError(
        error.message || "Error deleting file",
        "DELETE_ERROR"
      );
    }
  } catch (error) {
    if (error instanceof FileUploadError) {
      throw error;
    }
    throw new FileUploadError(
      error.message || "Error deleting file",
      "UNKNOWN_ERROR"
    );
  }
};
