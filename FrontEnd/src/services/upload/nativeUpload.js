import * as FileSystem from "expo-file-system";

import { BACKEND_URL } from '../../utils/apiConfig';
export async function uploadNativeImage(uri) {
  const result = await FileSystem.uploadAsync(
    BACKEND_URL,
    uri,
    {
      fieldName: "image",
      httpMethod: "POST",
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      mimeType: "image/jpeg",
    }
  );

  return JSON.parse(result.body);
}