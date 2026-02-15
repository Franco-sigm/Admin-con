import jsPDF from 'jspdf';
// 1. IMPORTACIÓN CORREGIDA
import autoTable from 'jspdf-autotable'; 

export const generarMorosidadPDF = (nombreComunidad, datosMorosos) => {
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text("Listado de Residentes Morosos", 14, 25);

    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text(`Comunidad: ${nombreComunidad}`, 14, 35);

    const fechaActual = new Date().toLocaleDateString('es-CL');
    doc.setFontSize(10);
    doc.text(`Fecha de emisión: ${fechaActual}`, 14, 42);

    doc.setDrawColor(200, 200, 200);
    doc.line(14, 48, 196, 48);

    // 2. LLAMADA A LA FUNCIÓN CORREGIDA
    autoTable(doc, {
        startY: 55, 
        head: [['Unidad', 'Residente', 'Teléfono de Contacto', 'Estado']],
        body: datosMorosos.map(moroso => [
            moroso.unidad,
            moroso.nombre_residente,
            moroso.telefono,
            moroso.estado
        ]),
        theme: 'striped',
        headStyles: { 
            fillColor: [220, 53, 69], 
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 11
        },
        bodyStyles: { 
            fontSize: 10,
            cellPadding: 5
        },
        columnStyles: {
            0: { fontStyle: 'bold', halign: 'center' }, 
            3: { fontStyle: 'bold', textColor: [220, 53, 69] } 
        }
    });

    const finalY = doc.lastAutoTable.finalY || 55; 

    doc.setDrawColor(220, 53, 69); 
    doc.setLineWidth(0.5);
    doc.line(14, finalY + 10, 196, finalY + 10);

    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text(`Total de unidades en mora: ${datosMorosos.length}`, 14, finalY + 18);

    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(
        "Documento de uso interno para la gestión de cobranza de la administración.",
        105, 280, { align: 'center' }
    );

    const nombreArchivoLimpio = String(nombreComunidad).replace(/\s+/g, '_');
    doc.save(`Morosos_${nombreArchivoLimpio}_${fechaActual}.pdf`);
};