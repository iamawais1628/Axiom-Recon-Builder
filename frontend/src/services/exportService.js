import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
 
export const exportToCSV = (data, filename) => {
  const csv = [
    ['Date', 'Session Name', 'Matched', 'Unmatched', 'Match Rate', 'Confidence'],
    ...data.map(row => [
      new Date(row.created_at).toLocaleDateString(),
      row.session_name,
      row.total_matched,
      row.total_unmatched,
      `${row.match_rate}%`,
      `${row.avg_confidence}%`
    ])
  ].map(row => row.join(',')).join('\n');
 
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(csv));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};
 
export const exportToPDF = async (elementId, filename) => {
  const element = document.getElementById(elementId);
  const canvas = await html2canvas(element);
  const pdf = new jsPDF();
  const imgData = canvas.toDataURL('image/png');
  pdf.addImage(imgData, 'PNG', 10, 10, 190, 280);
  pdf.save(filename);
};
 
