import { brand } from '../data/brand.js';

/** Build & download a branded PDF datasheet for a product from our data. */
export async function downloadDatasheet(product, specs) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = 595, M = 40;

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(14, 18, 22);
  doc.text(brand.name.toUpperCase(), M, 46);
  doc.setDrawColor(210, 239, 14);
  doc.setLineWidth(3);
  doc.line(M, 54, W - M, 54);

  // Title
  doc.setFontSize(22);
  doc.text(doc.splitTextToSize(product.fullTitle || product.title, W - M * 2), M, 84);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(96, 100, 104);
  doc.text(product.type || '', M, 104);

  // Product image
  let imageY = 116;
  try {
    const r = await fetch(product.img);
    const blob = await r.blob();
    const dataUrl = await new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result);
      fr.onerror = rej;
      fr.readAsDataURL(blob);
    });
    doc.addImage(dataUrl, 'JPEG', M, imageY, 190, 120);
  } catch { /* image optional */ }

  // Description
  doc.setFontSize(9.5);
  doc.setTextColor(33, 37, 41);
  const desc = doc.splitTextToSize((product.desc || '').slice(0, 800), 300);
  doc.text(desc, 250, imageY + 6);

  // Specs table
  doc.setFillColor(246, 246, 246);
  doc.rect(M, 270, W - M * 2, 1, 'F');
  let y = 290;
  const rows = [
    ['Protection zone', specs.zone],
    ['Product line', product.type || 'Not specified'],
    ['Colours', specs.colours],
    ['SKUs', specs.skus],
    ['Weight', specs.weight],
    ['Standards', specs.standards.join(', ') || 'Not specified'],
  ];
  doc.setFontSize(9.5);
  for (const [k, v] of rows) {
    if (y > 780) { doc.addPage(); y = 70; }
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(14, 18, 22);
    doc.text(k, M, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 64, 68);
    doc.text(doc.splitTextToSize(String(v || 'Not specified'), 400), 150, y);
    y += 22;
  }

  // Tags
  if (product.tags && product.tags.length) {
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(14, 18, 22);
    doc.text('Tags:', M, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(96, 100, 104);
    doc.text(doc.splitTextToSize(product.tags.slice(0, 14).join(' · '), W - M * 2 - 60), M + 50, y);
  }

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text(`${brand.name}: datasheet generated from product data. Certificates available on request.`, M, 810);

  doc.save(`${product.slug}-datasheet.pdf`);
}
