import QRCode from 'qrcode';

export const QRService = {
  generateDataURI: async (text: string): Promise<string> => {
    try {
      const dataUri = await QRCode.toDataURL(text, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 300,
        color: {
          dark: '#1e293b', // slate-800
          light: '#ffffff', // white
        },
      });
      return dataUri;
    } catch (error) {
      console.error('Failed to generate QR Code Data URI:', error);
      throw error;
    }
  },
};
