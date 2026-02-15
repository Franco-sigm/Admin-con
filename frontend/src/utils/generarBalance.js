import jsPDF from 'jspdf';
// 1. IMPORTACIÓN CORREGIDA
import autoTable from 'jspdf-autotable';

export const generarBalancePDF = (nombreComunidad, datosBalance) => {
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40); 
    doc.text("Balance Financiero General", 14, 25);

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
        head: [['Concepto', 'Monto Total']],
        body: [
            ['Total Ingresos de la Comunidad', `$${datosBalance.total_ingresos.toLocaleString('es-CL')}`],
            ['Total Egresos (Gastos)', `$${datosBalance.total_egresos.toLocaleString('es-CL')}`],
        ],
        theme: 'grid',
        headStyles: { 
            fillColor: [41, 128, 185], 
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 12,
            halign: 'center'
        },
        bodyStyles: {
            fontSize: 12,
            cellPadding: 6
        },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 100 }, 
            1: { halign: 'right', fontStyle: 'bold', textColor: [40, 40, 40] } 
        }
    });

    const finalY = doc.lastAutoTable.finalY || 80;
    
    const saldoPositivo = datosBalance.saldo_actual >= 0;
    const colorSaldo = saldoPositivo ? [39, 174, 96] : [192, 57, 43]; 

    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text("Saldo Actual de la Comunidad:", 14, finalY + 15);

    doc.setFontSize(16);
    doc.setTextColor(colorSaldo[0], colorSaldo[1], colorSaldo[2]);
    doc.text(
        `$${datosBalance.saldo_actual.toLocaleString('es-CL')}`, 
        196, 
        finalY + 15,
        { align: 'right' }
    );

    doc.setDrawColor(colorSaldo[0], colorSaldo[1], colorSaldo[2]);
    doc.setLineWidth(0.5);
    doc.line(14, finalY + 18, 196, finalY + 18);

    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(
        "Este documento es un resumen informativo generado automáticamente por el sistema ConAdmin.",
        105, 280, { align: 'center' }
    );

    const nombreArchivoLimpio = String(nombreComunidad).replace(/\s+/g, '_');
    doc.save(`Balance_${nombreArchivoLimpio}_${fechaActual}.pdf`);
};