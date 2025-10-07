import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Receipt } from '@/types/receipt';
import { renderTemplateCard, renderTemplateMinimal } from './templates';

const htmlForTemplate = (r: Receipt) => {
  switch (r.templateId) {
    case 'card': return renderTemplateCard(r);
    case 'minimal':
    default: return renderTemplateMinimal(r);
  }
};

export async function generateReceiptPDF(r: Receipt): Promise<string> {
  const html = htmlForTemplate(r);
  const { uri } = await Print.printToFileAsync({ html }); // returns a temp file URI
  const filename = `Receipt_${r.id}.pdf`;
  // Move it to app's document directory
  const dest = `${FileSystem.documentDirectory}${filename}`;
  await FileSystem.moveAsync({ from: uri, to: dest });
  return dest;
}

export async function sharePDF(uri: string) {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { dialogTitle: 'Share Receipt PDF' });
  }
}

export async function saveToDownloads(pdfUri: string, fileName: string) {
  if (FileSystem.StorageAccessFramework) {
    const perms = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
    if (!perms.granted) return;
    const base64 = await FileSystem.readAsStringAsync(pdfUri, { encoding: FileSystem.EncodingType.Base64 });
    const mime = 'application/pdf';
    const destUri = await FileSystem.StorageAccessFramework.createFileAsync(perms.directoryUri, fileName, mime);
    await FileSystem.writeAsStringAsync(destUri, base64, { encoding: FileSystem.EncodingType.Base64 });
  }
}