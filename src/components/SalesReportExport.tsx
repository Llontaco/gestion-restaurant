import { useState } from 'react';
import { getSalesReport } from '../services/api';
import type { Order } from '../services/api';

// Fecha de hoy en hora de Perú, formato YYYY-MM-DD (valor del input date)
function todayLima(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
}

function timeLima(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-PE', {
    timeZone: 'America/Lima',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Fila plana del reporte (compartida entre Excel y PDF)
function toRows(orders: Order[]) {
  return orders.map((o) => ({
    hora: timeLima(o.createdAt),
    cliente: o.name,
    canal: o.deliveryType === 'DELIVERY' ? 'Delivery' : 'Recojo en local',
    pago: o.paymentStatus === 'approved' ? 'Mercado Pago' : '—',
    productos: o.orderItems.map((i) => `${i.quantity}× ${i.product.name}`).join(', '),
    delivery: Number(o.deliveryFee) || 0,
    total: Number(o.total),
  }));
}

async function exportExcel(orders: Order[], date: string) {
  const ExcelJS = (await import('exceljs')).default;
  const rows = toRows(orders);

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Ventas');

  // Título
  ws.mergeCells('A1:G1');
  const title = ws.getCell('A1');
  title.value = `Fresh Coffee — Reporte de ventas del ${date}`;
  title.font = { bold: true, size: 14 };

  // Cabecera
  ws.addRow([]);
  const header = ws.addRow(['Hora', 'Cliente', 'Canal', 'Pago', 'Productos', 'Delivery', 'Total']);
  header.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF374151' } };
  });

  const MONEY = '"S/" #,##0.00';
  rows.forEach((r) => {
    const row = ws.addRow([r.hora, r.cliente, r.canal, r.pago, r.productos, r.delivery, r.total]);
    row.getCell(6).numFmt = MONEY;
    row.getCell(7).numFmt = MONEY;
  });

  // Resumen
  const sum = rows.reduce((s, r) => s + r.total, 0);
  ws.addRow([]);
  const totalRow = ws.addRow(['', '', '', '', `Pedidos: ${rows.length}`, 'TOTAL', sum]);
  totalRow.font = { bold: true };
  totalRow.getCell(7).numFmt = MONEY;

  ws.columns = [
    { width: 8 }, { width: 20 }, { width: 16 }, { width: 14 }, { width: 50 }, { width: 12 }, { width: 12 },
  ];

  const buf = await wb.xlsx.writeBuffer();
  downloadBlob(
    new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    `ventas-${date}.xlsx`
  );
}

async function exportPdf(orders: Order[], date: string) {
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;
  const rows = toRows(orders);

  const doc = new jsPDF();
  doc.setFontSize(15);
  doc.text('Fresh Coffee — Reporte de ventas', 14, 16);
  doc.setFontSize(10);
  doc.setTextColor(110);
  doc.text(`Fecha: ${date}  ·  Generado desde el panel de administración`, 14, 22);

  autoTable(doc, {
    startY: 28,
    head: [['Hora', 'Cliente', 'Canal', 'Pago', 'Productos', 'Delivery', 'Total']],
    body: rows.map((r) => [
      r.hora, r.cliente, r.canal, r.pago, r.productos,
      `S/ ${r.delivery.toFixed(2)}`, `S/ ${r.total.toFixed(2)}`,
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [55, 65, 81] },
    columnStyles: { 4: { cellWidth: 60 }, 5: { halign: 'right' }, 6: { halign: 'right' } },
  });

  const sum = rows.reduce((s, r) => s + r.total, 0);
  const y = (doc as any).lastAutoTable.finalY + 8;
  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.text(`Pedidos: ${rows.length}    Total vendido: S/ ${sum.toFixed(2)}`, 14, y);

  doc.save(`ventas-${date}.pdf`);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Selector de fecha + botones "Exportar ventas" a Excel y PDF (panel admin)
export default function SalesReportExport() {
  const [date, setDate] = useState(todayLima());
  const [busy, setBusy] = useState<'xlsx' | 'pdf' | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleExport(kind: 'xlsx' | 'pdf') {
    setBusy(kind);
    setMsg(null);
    const { orders, error } = await getSalesReport(date);
    if (error) {
      setMsg(error);
    } else if (orders.length === 0) {
      setMsg('No hay ventas en esa fecha');
    } else {
      await (kind === 'xlsx' ? exportExcel(orders, date) : exportPdf(orders, date));
    }
    setBusy(null);
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700"
        />
        <button
          onClick={() => handleExport('xlsx')}
          disabled={busy !== null}
          className="bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          {busy === 'xlsx' ? 'Generando…' : '📊 Excel'}
        </button>
        <button
          onClick={() => handleExport('pdf')}
          disabled={busy !== null}
          className="bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          {busy === 'pdf' ? 'Generando…' : '📄 PDF'}
        </button>
      </div>
      {msg && <p className="text-xs text-gray-500">{msg}</p>}
    </div>
  );
}
