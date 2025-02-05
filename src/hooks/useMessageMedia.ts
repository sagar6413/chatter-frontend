import { useCallback, useState } from "react";
import { useWebSocketStore } from "@/store/webSocketStore";
import { useError } from "./useError";
import { ConversationType, MessageType } from "@/types";

interface MediaUpload {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
}

interface MessageMediaHookReturn {
  uploads: Map<string, MediaUpload>;
  addMedia: (files: FileList | File[]) => Promise<void>;
  removeMedia: (mediaId: string) => void;
  retryUpload: (mediaId: string) => Promise<void>;
  isUploading: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "video/mp4",
  "audio/mp3",
  "audio/wav",
]);

/**
 * Hook for managing media attachments in messages
 * Handles file uploads, progress tracking, and error handling
 */
export function useMessageMedia(
  conversationId: number,
  type: ConversationType
): MessageMediaHookReturn {
  const { sendMessage } = useWebSocketStore();
  const { handleError } = useError();
  const [uploads, setUploads] = useState<Map<string, MediaUpload>>(new Map());

  const validateFile = useCallback((file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File ${file.name} is too large. Maximum size is 10MB.`;
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return `File type ${file.type} is not supported.`;
    }
    return null;
  }, []);

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.mediaId;
    } catch (error) {
      throw new Error(
        `Failed to upload ${file.name}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }, []);

  const addMedia = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const newUploads = new Map(uploads);
      let hasErrors = false;

      for (const file of fileArray) {
        const error = validateFile(file);
        const uploadId = crypto.randomUUID();

        if (error) {
          newUploads.set(uploadId, {
            id: uploadId,
            file,
            progress: 0,
            status: "error",
            error,
          });
          hasErrors = true;
          continue;
        }

        newUploads.set(uploadId, {
          id: uploadId,
          file,
          progress: 0,
          status: "pending",
        });
      }

      setUploads(newUploads);

      if (hasErrors) {
        handleError(new Error("Some files could not be uploaded"), "api");
        return;
      }

      // Upload files and send message
      try {
        const mediaIds = new Set<string>();

        for (const [uploadId, upload] of newUploads) {
          if (upload.status === "error") continue;

          setUploads((prev) => {
            const updated = new Map(prev);
            updated.set(uploadId, {
              ...upload,
              status: "uploading",
              progress: 0,
            });
            return updated;
          });

          try {
            const mediaId = await uploadFile(upload.file);
            mediaIds.add(mediaId);

            setUploads((prev) => {
              const updated = new Map(prev);
              updated.set(uploadId, {
                ...upload,
                status: "completed",
                progress: 100,
              });
              return updated;
            });
          } catch (error) {
            setUploads((prev) => {
              const updated = new Map(prev);
              updated.set(uploadId, {
                ...upload,
                status: "error",
                error: error instanceof Error ? error.message : "Upload failed",
              });
              return updated;
            });
            handleError(error, "api");
          }
        }

        if (mediaIds.size > 0) {
          const mediaType = fileArray[0].type.startsWith("image/")
            ? MessageType.IMAGE
            : fileArray[0].type.startsWith("video/")
            ? MessageType.VIDEO
            : fileArray[0].type.startsWith("audio/")
            ? MessageType.AUDIO
            : MessageType.DOCUMENT;

          sendMessage(
            {
              conversationId,
              content: "",
              type: mediaType,
              mediaIds,
            },
            type
          );
        }
      } catch (error) {
        handleError(error, "api");
      }
    },
    [
      uploads,
      validateFile,
      uploadFile,
      handleError,
      conversationId,
      type,
      sendMessage,
    ]
  );

  const removeMedia = useCallback((mediaId: string) => {
    setUploads((prev) => {
      const updated = new Map(prev);
      updated.delete(mediaId);
      return updated;
    });
  }, []);

  const retryUpload = useCallback(
    async (mediaId: string) => {
      const upload = uploads.get(mediaId);
      if (!upload || upload.status !== "error") return;

      setUploads((prev) => {
        const updated = new Map(prev);
        updated.set(mediaId, {
          ...upload,
          status: "pending",
          error: undefined,
        });
        return updated;
      });

      await addMedia([upload.file]);
    },
    [uploads, addMedia]
  );

  const isUploading = Array.from(uploads.values()).some(
    (upload) => upload.status === "uploading"
  );

  return {
    uploads,
    addMedia,
    removeMedia,
    retryUpload,
    isUploading,
  };
}
