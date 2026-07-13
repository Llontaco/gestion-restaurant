# Plugin de Reportes Exportables — Ventas del día (Excel / PDF)

**Sistema:** Fresh Coffee (gestion-restaurant)
**Fecha de implementación:** 08/07/2026
**Módulo:** Panel de administración → Administrar órdenes

---

## 1. Descripción general

Se agregó al panel de administración la capacidad de **exportar las ventas de un
día** en dos formatos: **Excel (.xlsx)** y **PDF (.pdf)**. El administrador
elige una fecha (por defecto, hoy) y pulsa uno de los dos botones; el sistema
consulta las órdenes de ese día al backend y genera el archivo **directamente
en el navegador**, sin pasar por ningún servicio externo.

| Capa | Cambio | Archivo |
|---|---|---|
| Backend | Nuevo endpoint `GET /api/orders/report?date=YYYY-MM-DD` | `backend/src/routes/orders.ts` |
| Frontend (servicio) | Nueva función `getSalesReport(date)` | `src/services/api.ts` |
| Frontend (UI) | Nuevo componente con selector de fecha + botones Excel/PDF | `src/components/SalesReportExport.tsx` |
| Frontend (integración) | El componente se monta en la cabecera de "Administrar órdenes" | `src/pages/AdminOrders.tsx` |

**Librerías agregadas (plugins):**

| Librería | Uso | Dónde corre |
|---|---|---|
| `exceljs` | Generación del archivo `.xlsx` con estilos y formato de moneda | Navegador |
| `jspdf` | Generación del documento PDF | Navegador |
| `jspdf-autotable` | Plugin de jsPDF para dibujar la tabla de ventas | Navegador |

---

## 2. Backend — endpoint del reporte

**Archivo:** `backend/src/routes/orders.ts`

```ts
// GET /api/orders/report?date=YYYY-MM-DD — ventas del día (para exportar)
router.get('/report', async (req: Request, res: Response) => {
  try {
    const date = String(req.query.date ?? '');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'date es requerido con formato YYYY-MM-DD' });
    }

    // Día completo en hora de Perú (UTC-5)
    const start = new Date(`${date}T00:00:00-05:00`);
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: start, lt: end } },
      include: { orderItems: { include: { product: true } } },
      orderBy: { createdAt: 'asc' },
    });

    res.json(orders);
  } catch {
    res.status(500).json({ error: 'Error al generar el reporte' });
  }
});
```

**Explicación línea por línea:**

1. **Validación de entrada.** El parámetro `date` se valida con la expresión
   regular `^\d{4}-\d{2}-\d{2}$` (exactamente `YYYY-MM-DD`). Si no cumple, se
   responde `400 Bad Request` y no se toca la base de datos.
2. **Rango horario en zona de Perú.** La base de datos guarda `createdAt` en
   UTC. Un pedido hecho a las 8 p. m. en Lima queda registrado como la 1 a. m.
   del día siguiente en UTC; si filtráramos por fecha UTC el reporte saldría
   desfasado. Por eso el inicio del día se construye con el sufijo `-05:00`
   (huso de Perú) y el fin sumando 24 horas en milisegundos.
3. **Consulta con Prisma.** `findMany` trae todas las órdenes cuyo `createdAt`
   está dentro del rango `[start, end)`. El doble `include` anida cada ítem de
   la orden **con su producto**, para que el frontend tenga los nombres sin
   hacer más peticiones.
4. **Respuesta.** Se devuelve el arreglo JSON de órdenes tal cual; el formateo
   (moneda, hora local, columnas) es responsabilidad del frontend.

**Prueba en SoapUI / curl:**

```
GET https://backend-eight-tau-73.vercel.app/api/orders/report?date=2026-07-07
→ 200 OK, arreglo de órdenes del día

GET https://backend-eight-tau-73.vercel.app/api/orders/report?date=hola
→ 400 {"error":"date es requerido con formato YYYY-MM-DD"}
```

---

## 3. Frontend — capa de servicio

**Archivo:** `src/services/api.ts`

```ts
export async function getSalesReport(
  date: string
): Promise<{ orders: Order[]; error: string | null }> {
  try {
    const orders = await request<Order[]>(`/orders/report?date=${date}`);
    return { orders, error: null };
  } catch (e) {
    return { orders: [], error: (e as Error).message };
  }
}
```

Sigue el mismo patrón que el resto del servicio: usa el helper `request<T>()`
(que antepone `BASE_URL` y convierte respuestas no-2xx en excepciones) y
**nunca lanza errores hacia el componente**: devuelve siempre un objeto
`{ orders, error }`, de modo que la UI solo tiene que revisar `error`.

---

## 4. Frontend — componente `SalesReportExport`

**Archivo:** `src/components/SalesReportExport.tsx`

Es el corazón del plugin. Se divide en cinco partes:

### 4.1 Utilidades de fecha y hora en zona de Perú

```ts
function todayLima(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
}

function timeLima(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-PE', {
    timeZone: 'America/Lima', hour: '2-digit', minute: '2-digit',
  });
}
```

- `todayLima()` devuelve la fecha actual **en hora de Lima** con formato
  `YYYY-MM-DD`. Se usa el locale `en-CA` (Canadá) porque es el que produce
  exactamente ese formato, que es el que exige el `<input type="date">`.
- `timeLima()` convierte el `createdAt` (que llega en UTC) a la hora local
  `HH:mm` que se imprime en el reporte.

### 4.2 Normalización de datos — `toRows()`

```ts
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
```

Convierte cada orden (estructura anidada de la BD) en una **fila plana** con
las 7 columnas del reporte. Al existir esta función única, el Excel y el PDF
muestran exactamente los mismos datos: si mañana se agrega una columna, se
agrega aquí una sola vez. Detalles:

- `productos` colapsa los ítems en un texto legible: `"2× Hamburguesa, 1× Café"`.
- `Number(...)` fuerza los montos a numérico (Prisma serializa los `Decimal`
  como string en JSON).
- `pago` marca "Mercado Pago" solo si `paymentStatus === 'approved'` (badge
  "✓ Pagado" del admin).

### 4.3 Exportación a Excel — `exportExcel()`

```ts
async function exportExcel(orders: Order[], date: string) {
  const ExcelJS = (await import('exceljs')).default;   // carga diferida
  const rows = toRows(orders);

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Ventas');

  // Título (celdas A1:G1 combinadas)
  ws.mergeCells('A1:G1');
  title.value = `Fresh Coffee — Reporte de ventas del ${date}`;

  // Cabecera con fondo oscuro y texto blanco
  const header = ws.addRow(['Hora', 'Cliente', 'Canal', 'Pago', 'Productos', 'Delivery', 'Total']);
  header.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF374151' } };
  });

  // Filas de datos con formato de moneda peruana
  const MONEY = '"S/" #,##0.00';
  rows.forEach((r) => {
    const row = ws.addRow([r.hora, r.cliente, r.canal, r.pago, r.productos, r.delivery, r.total]);
    row.getCell(6).numFmt = MONEY;   // columna Delivery
    row.getCell(7).numFmt = MONEY;   // columna Total
  });

  // Fila de resumen: cantidad de pedidos y total vendido
  const sum = rows.reduce((s, r) => s + r.total, 0);
  const totalRow = ws.addRow(['', '', '', '', `Pedidos: ${rows.length}`, 'TOTAL', sum]);

  // Descarga en el navegador
  const buf = await wb.xlsx.writeBuffer();
  downloadBlob(new Blob([buf], { type: 'application/vnd...sheet' }), `ventas-${date}.xlsx`);
}
```

Puntos clave:

- **`await import('exceljs')`** (import dinámico): exceljs pesa ~940 KB
  minificado. Al importarlo dentro de la función, Vite lo separa en un *chunk*
  propio que **solo se descarga la primera vez que el admin exporta**; la
  carga inicial de la app no crece.
- **`numFmt = '"S/" #,##0.00'`**: los montos se guardan como **números
  reales** en la celda (no como texto `"S/ 25.00"`), con formato de moneda.
  Así Excel puede sumarlos, filtrarlos o graficarlos.
- **`writeBuffer()` + `Blob`**: exceljs genera el archivo en memoria; el
  helper `downloadBlob()` lo convierte en descarga del navegador.

### 4.4 Exportación a PDF — `exportPdf()`

```ts
async function exportPdf(orders: Order[], date: string) {
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;
  const rows = toRows(orders);

  const doc = new jsPDF();
  doc.text('Fresh Coffee — Reporte de ventas', 14, 16);
  doc.text(`Fecha: ${date}  ·  Generado desde el panel de administración`, 14, 22);

  autoTable(doc, {
    startY: 28,
    head: [['Hora', 'Cliente', 'Canal', 'Pago', 'Productos', 'Delivery', 'Total']],
    body: rows.map((r) => [ ...las 7 columnas... ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [55, 65, 81] },          // mismo gris de la cabecera Excel
    columnStyles: { 4: { cellWidth: 60 }, 5: { halign: 'right' }, 6: { halign: 'right' } },
  });

  const sum = rows.reduce((s, r) => s + r.total, 0);
  const y = (doc as any).lastAutoTable.finalY + 8;    // posición tras la tabla
  doc.text(`Pedidos: ${rows.length}    Total vendido: S/ ${sum.toFixed(2)}`, 14, y);

  doc.save(`ventas-${date}.pdf`);
}
```

Puntos clave:

- `jspdf-autotable` es el **plugin de jsPDF** que dibuja tablas con cabecera
  repetida, saltos de página automáticos y estilos por columna.
- `lastAutoTable.finalY` indica en qué coordenada vertical terminó la tabla;
  el resumen se escribe 8 puntos debajo, de modo que funciona sin importar
  cuántas filas (o páginas) tenga el reporte.
- Los montos van alineados a la derecha (`halign: 'right'`), como corresponde
  a columnas numéricas.

### 4.5 El componente de interfaz

```tsx
export default function SalesReportExport() {
  const [date, setDate] = useState(todayLima());        // fecha elegida
  const [busy, setBusy] = useState<'xlsx' | 'pdf' | null>(null);  // botón en curso
  const [msg, setMsg]   = useState<string | null>(null);          // mensajes al admin

  async function handleExport(kind: 'xlsx' | 'pdf') {
    setBusy(kind);
    setMsg(null);
    const { orders, error } = await getSalesReport(date);
    if (error)                    setMsg(error);
    else if (orders.length === 0) setMsg('No hay ventas en esa fecha');
    else await (kind === 'xlsx' ? exportExcel(orders, date) : exportPdf(orders, date));
    setBusy(null);
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} ... />
      <button onClick={() => handleExport('xlsx')} disabled={busy !== null} ...>
        {busy === 'xlsx' ? 'Generando…' : '📊 Excel'}
      </button>
      <button onClick={() => handleExport('pdf')} disabled={busy !== null} ...>
        {busy === 'pdf' ? 'Generando…' : '📄 PDF'}
      </button>
      {msg && <p>{msg}</p>}
    </div>
  );
}
```

Comportamiento:

- **`busy`** deshabilita ambos botones mientras se genera un archivo y cambia
  el texto del botón activo a "Generando…" (evita dobles clics y dobles
  descargas).
- **`msg`** informa sin descargar nada cuando la fecha no tiene ventas o la
  petición falla (p. ej., sin conexión), en lugar de producir un archivo vacío.
- Ambos flujos comparten `handleExport`: primero se piden los datos y **solo
  si hay órdenes** se importa la librería y se genera el archivo.

### 4.6 Integración en el panel

**Archivo:** `src/pages/AdminOrders.tsx`

```tsx
<AdminLayout title="Administrar órdenes" action={<SalesReportExport />}>
```

`AdminLayout` ya contemplaba una prop `action` (nodo React que se renderiza a
la derecha del título), así que la integración fue de **una línea**, sin tocar
la estructura del layout.

---

## 5. Flujo completo

```
Admin elige fecha y pulsa 📊/📄
        │
        ▼
GET /api/orders/report?date=2026-07-08          (frontend → backend)
        │  Prisma: órdenes del día (hora Perú) + ítems + productos
        ▼
toRows(): filas planas Hora/Cliente/Canal/Pago/Productos/Delivery/Total
        │
        ├── exportExcel(): exceljs → workbook con estilos → Blob → ventas-FECHA.xlsx
        └── exportPdf():   jspdf + autotable → tabla + resumen → ventas-FECHA.pdf
```

## 6. Verificación realizada

- `npm run build` (tsc + Vite) compila sin errores; exceljs y jspdf quedan en
  chunks separados que se cargan bajo demanda.
- `npx tsc --noEmit` en `backend/` sin errores.
- Backend redeployado a producción (`vercel --prod`) y probado:
  - `?date=hola` → `400` con mensaje de validación.
  - `?date=2026-07-07` → `200` con las 12 órdenes reales del día.

## 7. Corrección colateral

Durante la verificación se detectó que el build del frontend estaba roto desde
antes: `GoogleSignInButton.tsx` estaba en `src/` pero `Login.tsx` lo importaba
desde `src/components/`. Se movió el archivo a `src/components/` con `git mv`,
con lo que `npm run build` vuelve a pasar completo.
