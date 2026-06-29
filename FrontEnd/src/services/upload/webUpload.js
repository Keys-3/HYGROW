const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL;
export async function uploadWebImage(uri) {
  const response = await fetch(uri);

  const blob = await response.blob();

  const form = new FormData();

  form.append(
    "image",
    blob,
    "leaf.jpg"
  );

  const res = await fetch(BACKEND_URL, {
    method: "POST",
    body: form,
  });

  return await res.json();
}