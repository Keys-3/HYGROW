import { Platform } from "react-native";

import { uploadNativeImage } from "./nativeUpload";
import { uploadWebImage } from "./webUpload";

export async function uploadImage(uri) {
  if (Platform.OS === "web") {
    return uploadWebImage(uri);
  }

  return uploadNativeImage(uri);
}