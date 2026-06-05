export const EmailService = {
  sendEmail: async (to: string, subject: string, text: string, html?: string): Promise<boolean> => {
    console.log('========================================================================');
    console.log(`[EMAIL DISPATCH] To: ${to}`);
    console.log(`[EMAIL DISPATCH] Subject: ${subject}`);
    console.log(`[EMAIL DISPATCH] Text Body: ${text}`);
    if (html) {
      console.log(`[EMAIL DISPATCH] HTML Body: ${html.substring(0, 200)}...`);
    }
    console.log('========================================================================');
    return true;
  },

  sendAnnouncementNotification: async (emails: string[], title: string, content: string) => {
    console.log(`[EMAIL DISPATCH] Dispatching announcement notification to ${emails.length} subscribers:`);
    console.log(`[EMAIL DISPATCH] Title: ${title}`);
    return true;
  }
};
