import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Receipt } from '../../types/receipt';
import { renderTemplateCard, renderTemplateMinimal, renderTemplateModern, renderTemplateProfessional, renderTemplateCompact } from './templates';

const htmlForTemplate = (r: Receipt) => {
  switch (r.templateId) {
    case 'card': return renderTemplateCard(r);
    case 'modern': return renderTemplateModern(r);
    case 'professional': return renderTemplateProfessional(r);
    case 'compact': return renderTemplateCompact(r);
    case 'minimal':
    default: return renderTemplateMinimal(r);
  }
};

// Generate a shorter receipt number
export function generateShortReceiptNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().substr(2); // Last 2 digits of year
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${year}${month}${day}-${random}`;
}

export async function generateReceiptPDF(r: Receipt): Promise<string> {
  const html = htmlForTemplate(r);
  const { uri } = await Print.printToFileAsync({ html });
  
  // Create filename with receipt number and date
  const receiptDate = new Date(r.dateISO);
  const year = receiptDate.getFullYear();
  const month = (receiptDate.getMonth() + 1).toString().padStart(2, '0');
  const day = receiptDate.getDate().toString().padStart(2, '0');
  const shortId = r.id.substring(0, 8); // Use first 8 characters of UUID
  
  const filename = `Receipt-${shortId}-${year}${month}${day}.pdf`;
  // For now, just return the URI with the new filename format
  return uri;
}

export async function sharePDF(uri: string) {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { dialogTitle: 'Share Receipt PDF' });
  }
}

export async function saveToDownloads(pdfUri: string, fileName: string) {
  try {
    // Always use the Sharing API for mobile platforms
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(pdfUri, { 
        dialogTitle: `Save ${fileName}`,
        mimeType: 'application/pdf'
      });
      return true;
    }
    
    // Fallback for when sharing is not available
    console.log('Sharing not available, falling back to console log');
    return false;
  } catch (error) {
    console.error('Error saving to downloads:', error);
    return false;
  }
}