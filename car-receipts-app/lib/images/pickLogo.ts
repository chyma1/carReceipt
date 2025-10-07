import * as ImagePicker from 'expo-image-picker';

export async function pickLogoBase64(): Promise<string | undefined> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    base64: true,
    quality: 0.8,
  });
  
  if (result.canceled) return;
  const a = result.assets[0];
  const mime = a.mimeType || 'image/jpeg';
  if (!a.base64) return;
  return `data:${mime};base64,${a.base64}`;
}