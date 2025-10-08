import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generatePDF = async (htmlContent, filename = 'agreement') => {
  try {
    // Create a temporary div to render the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '0';
    tempDiv.style.width = '800px';
    tempDiv.style.backgroundColor = 'white';
    tempDiv.style.padding = '40px';
    document.body.appendChild(tempDiv);

    // Wait for any fonts to load
    await document.fonts.ready;

    // Generate canvas from HTML
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 800,
      height: tempDiv.scrollHeight,
    });

    // Clean up
    document.body.removeChild(tempDiv);

    // Create PDF
    const imgData = canvas.toDataURL('image/png');
    
    // Calculate PDF dimensions
    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    const pdf = new jsPDF({
      orientation: pdfHeight > 297 ? 'portrait' : 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Add image to PDF
    if (pdfHeight > 297) {
      // Multi-page PDF
      let position = 0;
      const pageHeight = 297;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      while (position < imgHeight) {
        pdf.addImage(
          imgData,
          'PNG',
          0,
          position === 0 ? 0 : -position,
          pdfWidth,
          imgHeight
        );
        
        position += pageHeight;
        
        if (position < imgHeight) {
          pdf.addPage();
        }
      }
    } else {
      // Single page PDF
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    }

    // Save the PDF
    pdf.save(`${filename}.pdf`);
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
};

// Alternative method using direct HTML to PDF conversion (if needed)
export const generatePDFFromHTML = async (htmlContent, filename = 'agreement') => {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Simple HTML to PDF conversion (limited styling support)
    pdf.html(htmlContent, {
      callback: function (pdf) {
        pdf.save(`${filename}.pdf`);
      },
      x: 10,
      y: 10,
      width: 190,
      windowWidth: 800
    });
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error generating PDF from HTML:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
};