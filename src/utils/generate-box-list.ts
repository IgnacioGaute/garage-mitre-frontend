// src/utils/generate-box-list.ts
import type { BoxList } from "@/types/box-list.type"
import type { OtherPayment } from "@/types/other-payment.type"
import type { ReceiptPayment } from "@/types/receipt.type"
import type { TicketRegistrationForDay } from "@/types/ticket-registration-for-day.type"
import type { TicketRegistration } from "@/types/ticket-registration.type"
import { PDFDocument, rgb, StandardFonts } from "pdf-lib"
import { toast } from "sonner"

export default async function generateBoxList(boxList: BoxList, userName: string): Promise<Uint8Array> {
  try {
    if (!boxList) {
      throw new Error("No se recibieron datos válidos para generar el PDF.")
    }

    // ==============================
    //  Datos base (NO se tocan)
    // ==============================
    const {
      ticketRegistrations,
      receipts,
      otherPayments,
      ticketRegistrationForDays,
      totalPrice,
      date,
      boxNumber,
      receiptPayments,
      paymentHistoryOnAccount,
    } = boxList

    const tickets = Array.isArray(ticketRegistrations) ? ticketRegistrations : []
    const ticketDays = Array.isArray(ticketRegistrationForDays) ? ticketRegistrationForDays : []
    const validReceipts = Array.isArray(receipts) ? receipts : []
    const otherPaymentsRegistration = Array.isArray(otherPayments) ? otherPayments : []
    
    // ✅ Filtramos nulos al inicio para evitar errores en todo el flujo
    const safeReceiptPayments = Array.isArray(receiptPayments)
      ? receiptPayments.filter((rp) => rp && rp.receipt && rp.receipt.customer)
      : []
    
    const safePaymentHistory = Array.isArray(paymentHistoryOnAccount)
      ? paymentHistoryOnAccount.filter((p) => p && p.receipt && p.receipt.customer)
      : []
    
    console.log(
      "TP detectados",
      safeReceiptPayments.filter(
        (rp) =>
          rp.paymentType === "TP" ||
          rp.receipt?.paymentType === "TP" ||
          rp.receipt?.receiptTypeKey === "TP",
      ),
    )
    
    // 🏠 Propietarios (owners)
    const owners = safeReceiptPayments.filter(
      (receiptPayment) =>
        receiptPayment.receipt?.customer?.customerType === "OWNER" ||
        receiptPayment.paymentType === "TP" ||
        receiptPayment.receipt?.paymentType === "TP" ||
        receiptPayment.receipt?.receiptTypeKey === "TP",
    )
    
    // 🧾 Tipos de recibo asociados a inquilinos
    const renterReceiptTypes = [
      "JOSE_RICARDO_AZNAR",
      "CARLOS_ALBERTO_AZNAR",
      "NIDIA_ROSA_MARIA_FONTELA",
      "ALDO_RAUL_FONTELA",
    ]
    
    // 👥 Inquilinos (renters)
    const renters = safeReceiptPayments.filter((receiptPayment) =>
      renterReceiptTypes.includes(receiptPayment.receipt?.receiptTypeKey ?? ""),
    )
    
    // 🧍 Privados (privates)
    const privates = safeReceiptPayments.filter(
      (receiptPayment) =>
        receiptPayment.receipt?.customer?.customerType === "PRIVATE" &&
        receiptPayment.paymentType !== "TP" &&
        receiptPayment.receipt?.paymentType !== "TP" &&
        receiptPayment.receipt?.receiptTypeKey !== "TP",
    )
    
    // 💳 Pagos en cuenta (paymentHistory)
    const paymentHistoryOwners = safePaymentHistory.filter(
      (p) => p.receipt?.customer?.customerType === "OWNER",
    )
    
    const paymentHistoryRenters = safePaymentHistory.filter(
      (p) => renterReceiptTypes.includes(p.receipt?.receiptTypeKey ?? ""),
    )
    
    const paymentHistoryPrivates = safePaymentHistory.filter(
      (p) => p.receipt?.customer?.customerType === "PRIVATE",
    )
    
    // 🧩 Combinaciones finales
    const combinedOwners = [...owners, ...paymentHistoryOwners]
    const combinedRenters = [...renters, ...paymentHistoryRenters]
    const combinedPrivates = [...privates, ...paymentHistoryPrivates]
    

    // 🧮 Totales globales
    let totalEfectivo = 0
    let totalTransferencias = 0

    // ==============================
    //  Configuración PDF
    // ==============================
    const pdfDoc = await PDFDocument.create()
    let page = pdfDoc.addPage([595.28, 841.89])
    const { height } = page.getSize()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const fontSize = 10

    let yPosition = height - 50

    // Ajuste de márgenes y columnas
// Ajuste de márgenes y columnas
const tableLeft = 60      // antes 30
const tableRight = 550    // antes 520

const colFechaX = 30      // antes 40
const colDescX = 79      // antes 155
const colEntradasX = 315  // antes 290
const colSalidasX = 395  // antes 355
const colSubtotalesX = 475 // antes 430
const colTotalesX = 545  // antes 505


    const formatNumber = (num: number): string => {
      if (num === 0) return "0"
      return num.toLocaleString("es-ES")
    }

    const formatDate = (fecha: Date) => {
      const day = String(fecha.getDate()).padStart(2, "0")
      const month = String(fecha.getMonth() + 1).padStart(2, "0")
      const year = fecha.getFullYear()
      return `${day}/${month}/${year}`
    }

    const formatDateA = (d: string | Date) => {
      if (typeof d === "string") {
        const [year, month, day] = d.split("-")
        return `${day}/${month}/${year}`
      }
      const day = String(d.getDate()).padStart(2, "0")
      const month = String(d.getMonth() + 1).padStart(2, "0")
      const year = d.getFullYear()
      return `${day}/${month}/${year}`
    }

    const today = formatDate(new Date())
    let isFirstPage = true // 👈 agregalo al principio de la función generateBoxList()

    const ensureSpace = (neededHeight = 70) => {
      if (yPosition < neededHeight) {
        // 🆕 Crear nueva página solo si ya no hay espacio
        page = pdfDoc.addPage([595.28, 841.89])
        const { height: newHeight } = page.getSize()
        yPosition = newHeight - 80
    
        // ⚙️ A partir de la segunda hoja
        isFirstPage = false
    
        // 🧭 Encabezado de continuación
        page.drawText("Garage Mitre", {
          x: 50,
          y: yPosition + 40,
          size: fontSize + 2,
          font: fontBold,
        })
    
        page.drawText("Planilla de Caja (continuación)", {
          x: 250,
          y: yPosition + 40,
          size: fontSize + 2,
          font: fontBold,
        })
    
        // 🔢 Número de página
        const currentPage = pdfDoc.getPageCount()
        page.drawText(`Página ${currentPage}`, {
          x: 500,
          y: yPosition + 40,
          size: fontSize - 1,
          font,
        })
    
        // Pequeño espacio visual
        yPosition -= 20
    
        // 🔁 Redibujar encabezado de tabla
        page.drawRectangle({
          x: 0,
          y: yPosition - 28,
          width: 595.28,
          height: 26,
          color: rgb(0.80, 0.80, 0.80),
        })
    
        const headerY = yPosition - 19
        page.drawText("Fecha", { x: colFechaX, y: headerY, size: fontSize, font: fontBold })
        page.drawText("Descripción", { x: colDescX, y: headerY, size: fontSize, font: fontBold })
        page.drawText("Entradas", { x: colEntradasX, y: headerY, size: fontSize, font: fontBold })
        page.drawText("Salidas", { x: colSalidasX, y: headerY, size: fontSize, font: fontBold })
        page.drawText("Subtotales", { x: colSubtotalesX, y: headerY, size: fontSize, font: fontBold })
        page.drawText("Totales", { x: colTotalesX, y: headerY, size: fontSize, font: fontBold })
    
        yPosition -= 40
      }
    }
    
    const drawVerticalLines = (y: number) => {
      const columnPositions = [85, 300, 380] // líneas más a la derecha
      columnPositions.forEach((x) => {
        page.drawLine({
          start: { x, y: y + 22 },
          end: { x, y: y - 22 },
          thickness: 0.5,
          color: rgb(0.80, 0.80, 0.80),
        })
      })
    }
    

    // ==============================
    //  Encabezado superior
    // ==============================
    page.drawText("Garage Mitre", {
      x: 50,
      y: yPosition - 5,
      size: fontSize + 2,
      font: fontBold,
    })
    page.drawText("Planilla de Caja", {
      x: 250,
      y: yPosition - 5,
      size: fontSize + 4,
      font: fontBold,
    })
    page.drawText(`N° ${boxNumber}`, {
      x: 410,
      y: yPosition - 5,
      size: fontSize + 4,
      font: fontBold,
    })

    yPosition -= 28

    page.drawText(`Usuario: ${userName}`, {
      x: 50,
      y: yPosition - 5,
      size: fontSize,
      font,
    })

    page.drawText(`Impresión: ${today}`, {
      x: 400,
      y: yPosition - 5,
      size: fontSize,
      font,
    })
    yPosition -= 28

    page.drawText(`Apertura: ${formatDateA(date)}`, {
      x: 400,
      y: yPosition - 5,
      size: fontSize,
      font,
    })

    yPosition -= 35

    // ==============================
    //  Encabezado de tabla (como la foto)
    // ==============================
    const drawTableHeader = () => {
// 🧭 Ocupa toda la hoja A4 (de borde a borde)
page.drawRectangle({
  x: 0, // ✅ empieza en el borde izquierdo
  y: yPosition - 28,
  width: 595.28, // ✅ cubre todo el ancho de la hoja A4
  height: 26,
  color: rgb(0.80, 0.80, 0.80),
})

      const headerY = yPosition - 19
      page.drawText("Fecha", { x: colFechaX, y: headerY, size: fontSize, font: fontBold })
      page.drawText("Descripción", { x: colDescX, y: headerY, size: fontSize, font: fontBold })
      page.drawText("Entradas", { x: colEntradasX, y: headerY, size: fontSize, font: fontBold })
      page.drawText("Salidas", { x: colSalidasX, y: headerY, size: fontSize, font: fontBold })
      page.drawText("Subtotales", { x: colSubtotalesX, y: headerY, size: fontSize, font: fontBold })
      page.drawText("Totales", { x: colTotalesX, y: headerY, size: fontSize, font: fontBold })
      yPosition -= 40
    }

    drawTableHeader()

    // ==============================
    //  Helpers de diseño de secciones
    // ==============================
    const drawSectionHeaderRow = (title: string) => {
      ensureSpace(80)
      page.drawRectangle({
        x: 0, // ✅ empieza en el borde izquierdo
        y: yPosition - 16,
        width: 595.28, // ✅ cubre todo el ancho de la hoja A4
        height: 18,
        color: rgb(0.80, 0.80, 0.80),
      })

      const upperTitle = title.toUpperCase()
      const textWidth = fontBold.widthOfTextAtSize(upperTitle, fontSize)
      const rectWidth = tableRight - tableLeft + 40
      const rectCenter = tableLeft + rectWidth / 2
      const textX = rectCenter - textWidth / 2

      page.drawText(upperTitle, {
        x: textX,
        y: yPosition - 8,
        size: fontSize,
        font: fontBold,
      })
      yPosition -= 22
    }

    const drawRowSeparator = () => {
      page.drawLine({
        start: { x: tableLeft, y: yPosition + 6 },
        end: { x: tableRight + 40, y: yPosition + 6 },
        thickness: 0.3,
        color: rgb(0.8, 0.8, 0.8),
      })
      yPosition -= 3
    }

    const drawSubtotalRow = (totalEntrada: number, totalSalida: number) => {
      ensureSpace(50)
      const neto = totalEntrada - totalSalida
      page.drawRectangle({
        x: 0, // ✅ empieza en el borde izquierdo
        y: yPosition - 28,
        width: 595.28, // ✅ cubre todo el ancho de la hoja A4
        height: 26,
        color: rgb(0.80, 0.80, 0.80),
      })
      const textY = yPosition - 18
      page.drawText("Subtotal", { x: colFechaX, y: textY, size: fontSize, font: fontBold })
      page.drawText(formatNumber(totalEntrada), { x: colEntradasX + 20, y: textY, size: fontSize, font: fontBold })
      page.drawText(totalSalida ? `- ${formatNumber(totalSalida)}` : "0", {
        x: colSalidasX + 20,
        y: textY,
        size: fontSize,
        font: fontBold,
      })
      page.drawText(formatNumber(neto), { x: colSubtotalesX + 10, y: textY, size: fontSize, font: fontBold })
      yPosition -= 28
    }

    const drawTotalGeneralRow = (total: number) => {
      ensureSpace(80)
      page.drawRectangle({
        x: 0, // ✅ empieza en el borde izquierdo
        y: yPosition - 40,
        width: 595.28, // ✅ cubre todo el ancho de la hoja A4
        height: 32,
        color: rgb(0.80, 0.80, 0.80),
      })
      
      const textY = yPosition - 22
      page.drawText("Total General", { x: 40, y: textY, size: fontSize + 0.5, font: fontBold })
      page.drawText(formatNumber(total), { x: colTotalesX, y: textY, size: fontSize + 0.5, font: fontBold })
      yPosition -= 46
    }
    // ==============================
    //  Secciones de datos
    // ==============================

    // Tickets / genérico (entradas solamente)
    const addDataSection = (title: string, items: any[], dataExtractor: (item: any) => string[]) => {
      yPosition -= 6
      drawSectionHeaderRow(title)
      const filteredItems = items.filter((i: any) => i.paid === undefined || i.paid)
      const total = filteredItems.reduce((sum, i: any) => sum + i.price, 0)
      if (items.length > 0) {
        items.forEach((item: any) => {
          ensureSpace(45)
          const [desc, priceStr, dateNow] = dataExtractor(item)
          const price = Number(priceStr)

          const maxDescWidth = colEntradasX - colDescX - 30 // Leave 30px margin
          const truncatedDesc = truncateText(desc, maxDescWidth, font, fontSize)

          page.drawText(dateNow, { x: colFechaX, y: yPosition - 6, size: fontSize, font })
          page.drawText(truncatedDesc, { x: colDescX + 10, y: yPosition - 6, size: fontSize, font })
          page.drawText(formatNumber(price), { x: colEntradasX + 20, y: yPosition - 6, size: fontSize, font })
          yPosition -= 24
          drawRowSeparator()
        })
        drawVerticalLines(yPosition)

      } else {
        page.drawText("No se registraron datos", {
          x: colDescX + 10,
          y: yPosition - 6,
          size: fontSize,
          font,
        })
        yPosition -= 28
        drawRowSeparator()
      }
      drawSubtotalRow(total, 0)
    }

    // Recibos (entradas + salidas / transferencias)
    const addDataSectionReceipt = (
      title: string,
      items: ReceiptPayment[],
      dataExtractor: (item: any) => [string, number, string, string, string?],
    ) => {
      yPosition -= 5
      drawSectionHeaderRow(title)
    
      let total = 0
      let cashTotal = 0
      let transferTotal = 0
    
      if (items.length > 0) {
        items.forEach((item) => {
          ensureSpace(40)
    
          let [desc, priceStr, dateNow, paymentType, vehicleOwner] = dataExtractor(item)
          const price = Number(priceStr)
    
          // 🧮 Acumuladores según tipo de pago
          if (paymentType === "TR" || paymentType === "CR" || paymentType === "AT") {
            transferTotal += price
          } else if (paymentType === "EF" || paymentType === "CH" || paymentType === "MIX") {
            cashTotal += price
          }
    
          // 📅 Fecha
          page.drawText(dateNow, {
            x: colFechaX,
            y: yPosition - 5,
            size: fontSize,
            font,
          })
    
          // 🧾 Descripción + tipo + propietario
          // 🔁 Si es MIX, mostrarlo como (AT) en texto pero manejarlo como EFECTIVO
          let displayType = paymentType === "MIX" ? "AT" : paymentType
    
          let descText = desc
          if (displayType) descText += ` (${displayType})`
          if (vehicleOwner) descText += ` (${vehicleOwner})`
    
          const maxDescWidth = colEntradasX - colDescX - 30
          const truncatedDesc = truncateText(descText, maxDescWidth, font, fontSize)
    
          page.drawText(truncatedDesc, {
            x: colDescX + 10,
            y: yPosition - 5,
            size: fontSize,
            font,
          })
    
          // ✅ EFECTIVO / CHEQUE / MIX → solo ENTRADAS (positivo)
          if (paymentType === "EF" || paymentType === "CH" || paymentType === "MIX") {
            page.drawText(formatNumber(price), {
              x: colEntradasX + 20,
              y: yPosition - 5,
              size: fontSize,
              font,
            })
          }
    
          // ✅ TRANSFERENCIAS / CRÉDITOS / AT → entrada + salida
          if (paymentType === "TR" || paymentType === "CR" || paymentType === "AT") {
            page.drawText(formatNumber(price), {
              x: colEntradasX + 20,
              y: yPosition - 5,
              size: fontSize,
              font,
            })
    
            page.drawText(`- ${formatNumber(price)}`, {
              x: colSalidasX + 20,
              y: yPosition - 5,
              size: fontSize,
              font,
            })
          }
    
          drawVerticalLines(yPosition)
          yPosition -= 22
          drawRowSeparator()
        })
    
        total = cashTotal + transferTotal
      } else {
        page.drawText("No se registraron datos", {
          x: colDescX + 10,
          y: yPosition - 5,
          size: fontSize,
          font,
        })
        yPosition -= 24
        drawRowSeparator()
      }
    
      drawSubtotalRow(total, transferTotal)
    }
    

    // Varios (otros pagos, ingresos/egresos)
    const addDataSectionExpense = (title: string, items: OtherPayment[], dataExtractor: (item: any) => string[]) => {
      yPosition -= 6
      drawSectionHeaderRow(title)

      let entradas = 0
      let salidas = 0

      if (items.length > 0) {
        items.forEach((item) => {
          ensureSpace(40)

          const [desc, priceStr, dateNow, type] = dataExtractor(item)
          const price = Number(priceStr)

          page.drawText(dateNow, {
            x: colFechaX,
            y: yPosition - 5,
            size: fontSize,
            font,
          })

          const maxDescWidth = colEntradasX - colDescX - 30
          const truncatedDesc = truncateText(desc, maxDescWidth, font, fontSize)

          page.drawText(truncatedDesc, { x: colDescX + 10, y: yPosition, size: fontSize, font })

          if (type === "EGRESOS") {
            page.drawText(`- ${formatNumber(price)}`, {
              x: colSalidasX + 20,
              y: yPosition - 5,
              size: fontSize,
              font,
            })
            salidas += price
          } else {
            page.drawText(formatNumber(price), {
              x: colEntradasX + 20,
              y: yPosition - 5,
              size: fontSize,
              font,
            })
            entradas += price
          }

          drawVerticalLines(yPosition)
          yPosition -= 22

          drawRowSeparator()
        })
      } else {
        page.drawText("No se registraron datos", {
          x: colDescX + 10,
          y: yPosition - 5,
          size: fontSize,
          font,
        })
        yPosition -= 24

        drawRowSeparator()
      }

      drawSubtotalRow(entradas, salidas)
    }

    // ==============================
    //  Nombres friendly para recibos
    // ==============================
    const receiptTypeNames: Record<string, string> = {
      JOSE_RICARDO_AZNAR: "Ricardo Aznar",
      CARLOS_ALBERTO_AZNAR: "Carlos Aznar",
      NIDIA_ROSA_MARIA_FONTELA: "Nidia Fontela",
      ALDO_RAUL_FONTELA: "Aldo Fontela",
    }

    // ==============================
    //  Secciones según tu lógica
    // ==============================

    // Ticket x hora
    addDataSection("ticket x hora", tickets, (ticket: TicketRegistration) => [
      `${ticket.description} (${ticket.codeBarTicket || "—"})`,
      ticket.price.toString(),
      ticket.dateNow ? formatDateA(ticket.dateNow) : "—",
      "",
    ])

    // Ticket x día/semana
    addDataSection("Ticket x día/semana", ticketDays, (ticket: TicketRegistrationForDay) => [
      ticket.description,
      ticket.price.toString(),
      ticket.dateNow ? formatDateA(ticket.dateNow) : "—",
      "",
    ])

    // Alquiler
    addDataSectionReceipt("alquiler", combinedRenters, (receiptPayment) => {
      const receipt = receiptPayment.receipt
      const total = receiptPayment.price
      const owner = receiptTypeNames[receipt.receiptTypeKey] || receipt.receiptTypeKey

      const paymentType =
        receiptPayment.paymentType === "TRANSFER"
          ? "TR"
          : receiptPayment.paymentType === "CASH"
            ? "EF"
            : receiptPayment.paymentType === "CHECK"
              ? "CH"
              : receiptPayment.paymentType === "CREDIT"
                ? "CR"
                : receiptPayment.paymentType === "TP"
                  ? "AT"
                  : "Desconocido"

      return [
        `${receipt.customer.lastName} ${receipt.customer.firstName}`,
        total,
        formatDateA(receipt.dateNow),
        paymentType,
        owner,
      ]
    })

    // Expensas
    addDataSectionReceipt("expensas", combinedOwners, (receiptPayment) => {
      const receipt = receiptPayment.receipt
      const total = receiptPayment.price

      const vehicleCustomer = receipt.customer?.vehicleRenters?.[0]?.vehicle?.customer
      const ownerName = vehicleCustomer
        ? `${vehicleCustomer.lastName} ${vehicleCustomer.firstName}`
        : `${receipt.customer.lastName} ${receipt.customer.firstName}`


      const paymentType =
        receiptPayment.paymentType === "TRANSFER"
          ? "TR"
          : receiptPayment.paymentType === "CASH"
            ? "EF"
            : receiptPayment.paymentType === "CHECK"
              ? "CH"
              : receiptPayment.paymentType === "CREDIT"
                ? "CR"
                : receiptPayment.paymentType === "TP"
                  ? "AT"
                   : receiptPayment.paymentType === "MIX"
                  ? "MIX"
                  : "Desconocido"

      return [ownerName, total, formatDateA(receipt.dateNow), paymentType]
    })

    // Terceros
    addDataSectionReceipt("terceros", combinedPrivates, (receiptPayment) => {
      const receipt = receiptPayment.receipt
      const total = receiptPayment.price
      const vehicleCustomer = receipt.customer.vehicleRenters?.[0]?.vehicle?.customer
      const vehicleOwner = vehicleCustomer ? `${vehicleCustomer.lastName} ${vehicleCustomer.firstName}` : ""
      const lastReceiptPrice =
  vehicleCustomer?.receipts?.length
    ? vehicleCustomer.receipts[vehicleCustomer.receipts.length - 1].price
    : 0
    const totalParcial = total - lastReceiptPrice

      const paymentType =
        receiptPayment.paymentType === "TRANSFER"
          ? "TR"
          : receiptPayment.paymentType === "CASH"
            ? "EF"
            : receiptPayment.paymentType === "CHECK"
              ? "CH"
              : receiptPayment.paymentType === "CREDIT"
                ? "CR"
                : receiptPayment.paymentType === "TP"
                  ? "AT"
                  : "Desconocido"

      return [
        `${receipt.customer.lastName} ${receipt.customer.firstName}`,
        totalParcial,
        formatDateA(receipt.dateNow),
        paymentType,
        vehicleOwner,
      ]
    })

    // ==============================
    //  Totales globales (NO toco la lógica)
    // ==============================
    const totalReceipts = [...combinedRenters, ...combinedOwners, ...combinedPrivates].reduce((sum, rp) => {
      if (rp.paymentType === "TRANSFER" || rp.paymentType === "CREDIT" || rp.paymentType === "TP") {
        totalTransferencias += rp.price
        return sum
      } else if (rp.paymentType === "CASH" || rp.paymentType === "CHECK") {
        totalEfectivo += rp.price
        return sum + rp.price
      } else {
        return sum
      }
    }, 0)

    const totalTickets = [...tickets, ...ticketDays]
      .filter((t: any) => t.paid === undefined || t.paid === true)
      .reduce((sum, t: any) => sum + t.price, 0)

    const totalTicketsAndReceipts = totalTickets + totalReceipts
    const subtotalSinGastos = totalTicketsAndReceipts

    let totalEgresos = 0
    let totalIngresosVarios = 0

    otherPaymentsRegistration.forEach((op) => {
      if (op.type === "EGRESOS") {
        totalEgresos += op.price
      } else {
        totalIngresosVarios += op.price
      }
    })

    const totalEntradas = totalTickets + totalEfectivo + totalTransferencias
    const totalSalidas = totalEgresos
    const total = totalEntradas - totalSalidas

    // Sección Varios (diseño tipo tabla)
    addDataSectionExpense("varios", otherPaymentsRegistration, (payment) => [
      payment.description,
      payment.price.toString(),
      formatDateA(payment.dateNow),
      payment.type,
    ])

    // ==============================
    //  Total general (como en la foto)
    // ==============================
    drawTotalGeneralRow(totalPrice)

    // ==============================
    //  Guardar, abrir e imprimir
    // ==============================
    const pdfBytes = await pdfDoc.save()
    const blob = new Blob([pdfBytes], { type: "application/pdf" })
    const url = URL.createObjectURL(blob)
    const newWindow = window.open(url, "_blank")
    if (newWindow) {
      newWindow.onload = () => {
        newWindow.print()
      }
    }
    const a = document.createElement("a")
    a.href = url
    a.download = `Listado-Caja-${today}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    toast.success("Lista de caja generada y descargada correctamente")
    return pdfBytes
  } catch (error) {
    console.error("Error generando la lista de caja:", error)
    toast.error("Error al generar la lista de caja")
    throw error
  }
}

// Helper function to handle text wrapping (ya no trunca)
const truncateText = (text: string, maxWidth: number, font: any, fontSize: number): string => {
  return text // 🔥 devuelve siempre el texto completo
}
