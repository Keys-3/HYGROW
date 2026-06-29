import * as FileSystem from "expo-file-system";

const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL;
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