import PDFDocument from 'pdfkit';

export const PDFService = {
  generateCertificate: (studentName: string, eventTitle: string, stream: NodeJS.WritableStream): void => {
    const doc = new PDFDocument({ layout: 'landscape', size: 'A4' });
    doc.pipe(stream);

    const width = doc.page.width;
    const height = doc.page.height;

    // Draw borders
    doc.rect(30, 30, width - 60, height - 60).lineWidth(6).stroke('#0f172a'); // slate-900
    doc.rect(40, 40, width - 80, height - 80).lineWidth(2).stroke('#64748b'); // slate-500

    // Title
    doc.moveDown(4);
    doc.fontSize(38)
       .fillColor('#0f172a')
       .text('CERTIFICATE OF ACHIEVEMENT', { align: 'center' });

    doc.moveDown(1.5);
    doc.fontSize(18)
       .fillColor('#475569')
       .text('This certificate is proudly presented to', { align: 'center' });

    // Student Name
    doc.moveDown(1);
    doc.fontSize(28)
       .fillColor('#0284c7') // sky-600
       .text(studentName, { align: 'center', underline: true });

    doc.moveDown(1);
    doc.fontSize(16)
       .fillColor('#475569')
       .text(`for outstanding participation and successful completion of the event`, { align: 'center' });

    // Event Title
    doc.moveDown(0.5);
    doc.fontSize(22)
       .fillColor('#0f172a')
       .text(`"${eventTitle}"`, { align: 'center' });

    doc.moveDown(2);
    doc.fontSize(12)
       .fillColor('#94a3b8')
       .text(`Issued by Smart College Management System on ${new Date().toLocaleDateString()}`, { align: 'center' });

    doc.end();
  },

  generateTranscript: (studentName: string, rollNumber: string, deptName: string, marks: any[], stream: NodeJS.WritableStream): void => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    doc.pipe(stream);

    // Header
    doc.fontSize(24).fillColor('#0f172a').text('ACADEMIC TRANSCRIPT', { align: 'center' });
    doc.fontSize(14).fillColor('#475569').text('Smart College Management System', { align: 'center' });
    doc.moveDown(2);

    // Student details
    doc.fontSize(12).fillColor('#0f172a');
    doc.text(`Student Name: ${studentName}`);
    doc.text(`Roll Number: ${rollNumber}`);
    doc.text(`Department: ${deptName}`);
    doc.text(`Date of Issue: ${new Date().toLocaleDateString()}`);
    doc.moveDown(2);

    // Table Header
    doc.fontSize(12).fillColor('#0f172a').text('Academic Performance:', { underline: true });
    doc.moveDown(0.5);

    // Table headers
    const startX = 50;
    let currentY = doc.y;

    doc.font('Helvetica-Bold');
    doc.text('Subject Code', startX, currentY);
    doc.text('Subject Name', startX + 100, currentY);
    doc.text('Exam Type', startX + 300, currentY);
    doc.text('Marks', startX + 400, currentY);
    doc.text('Total', startX + 450, currentY);
    doc.font('Helvetica');

    doc.moveTo(startX, currentY + 15).lineTo(550, currentY + 15).stroke('#cbd5e1');
    doc.moveDown(1);

    // Draw rows
    marks.forEach(item => {
      currentY = doc.y;
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }
      doc.text(item.subject_code, startX, currentY);
      doc.text(item.subject_name.length > 25 ? item.subject_name.substring(0, 25) + '...' : item.subject_name, startX + 100, currentY);
      doc.text(item.exam_type, startX + 300, currentY);
      doc.text(item.marks.toString(), startX + 400, currentY);
      doc.text(item.total_marks.toString(), startX + 450, currentY);
      doc.moveDown(0.8);
    });

    doc.end();
  }
};
