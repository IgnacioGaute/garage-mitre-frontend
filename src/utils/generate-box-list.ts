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

    console.log(
      "TP detectados",
      receiptPayments.filter(
        (rp) => rp.paymentType === "TP" || rp.receipt?.paymentType === "TP" || rp.receipt?.receiptTypeKey === "TP",
      ),
    )

    const owners = receiptPayments.filter(
      (receiptPayment) =>
        receiptPayment &&
        (receiptPayment.receipt.customer?.customerType === "OWNER" ||
          receiptPayment.paymentType === "TP" ||
          receiptPayment.receipt?.paymentType === "TP" ||
          receiptPayment.receipt?.receiptTypeKey === "TP"),
    )

    const renterReceiptTypes = [
      "JOSE_RICARDO_AZNAR",
      "CARLOS_ALBERTO_AZNAR",
      "NIDIA_ROSA_MARIA_FONTELA",
      "ALDO_RAUL_FONTELA",
    ]
    const renters = receiptPayments.filter((receiptPayment) =>
      renterReceiptTypes.includes(receiptPayment.receipt?.receiptTypeKey),
    )
    const privates = receiptPayments.filter(
      (receiptPayment) =>
        receiptPayment.receipt?.customer.customerType === "PRIVATE" &&
        receiptPayment.paymentType !== "TP" &&
        receiptPayment.receipt?.paymentType !== "TP" &&
        receiptPayment.receipt?.receiptTypeKey !== "TP",
    )

    const paymentHistoryOwners = paymentHistoryOnAccount.filter((p) => p.receipt?.customer?.customerType === "OWNER")

    const paymentHistoryRenters = paymentHistoryOnAccount.filter((p) =>
      renterReceiptTypes.includes(p.receipt?.receiptTypeKey),
    )

    const paymentHistoryPrivates = paymentHistoryOnAccount.filter((p) => p.receipt?.customer.customerType === "PRIVATE")

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
    const tableLeft = 30
    const tableRight = 520

    const colFechaX = 40
    const colDescX = 155
    const colEntradasX = 290
    const colSalidasX = 355
    const colSubtotalesX = 430
    const colTotalesX = 505

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
    const ensureSpace = (neededHeight = 70) => {
      if (yPosition < neededHeight) {
        page = pdfDoc.addPage([595.28, 841.89])
        const { height: newHeight } = page.getSize()
        yPosition = newHeight - 100
      }
    }
    const drawVerticalLines = (y: number) => {
      const columnPositions = [130, 275, 345, 415, 490, 560]
      columnPositions.forEach((x) => {
        page.drawLine({
          start: { x, y: y + 22 },
          end: { x, y: y - 22 },
          thickness: 0.5,
          color: rgb(0.85, 0.85, 0.85),
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
      page.drawRectangle({
        x: tableLeft,
        y: yPosition - 28,
        width: tableRight - tableLeft + 40,
        height: 26,
        color: rgb(0.92, 0.92, 0.92),
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
        x: tableLeft,
        y: yPosition - 16,
        width: tableRight - tableLeft + 40,
        height: 16,
        color: rgb(0.95, 0.95, 0.95),
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
        x: tableLeft,
        y: yPosition - 26,
        width: tableRight - tableLeft + 40,
        height: 26,
        color: rgb(0.94, 0.94, 0.94),
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
        x: tableLeft,
        y: yPosition - 32,
        width: tableRight - tableLeft + 40,
        height: 34,
        color: rgb(0.82, 0.82, 0.82),
      })
      const textY = yPosition - 22
      page.drawText("Total General", { x: colDescX + 10, y: textY, size: fontSize + 0.5, font: fontBold })
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
      yPosition -= 6
      drawSectionHeaderRow(title)

      let total = 0
      let cashTotal = 0
      let transferTotal = 0

      if (items.length > 0) {
        items.forEach((item) => {
          ensureSpace(40)

          const [desc, priceStr, dateNow, paymentType, vehicleOwner] = dataExtractor(item)
          const price = Number(priceStr)

          if (paymentType === "TR" || paymentType === "CR" || paymentType === "TP") {
            transferTotal += price
          } else if (paymentType === "EF" || paymentType === "CH") {
            cashTotal += price
          }

          page.drawText(dateNow, {
            x: colFechaX,
            y: yPosition - 5,
            size: fontSize,
            font,
          })

          let descText = desc
          if (vehicleOwner) {
            descText += ` (${vehicleOwner})`
          }

          const maxDescWidth = colEntradasX - colDescX - 30
          const truncatedDesc = truncateText(descText, maxDescWidth, font, fontSize)

          page.drawText(truncatedDesc, {
            x: colDescX + 10,
            y: yPosition - 5,
            size: fontSize,
            font,
          })

          // Entradas (EF/CH)
          if (paymentType === "EF" || paymentType === "CH") {
            page.drawText(formatNumber(price), {
              x: colEntradasX + 20,
              y: yPosition - 5,
              size: fontSize,
              font,
            })
          }

          // Salidas (TR/CR/TP) y reflejo en entradas
          if (paymentType === "TR" || paymentType === "CR" || paymentType === "TP") {
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
                  ? "TP"
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
                  ? "TP"
                  : "Desconocido"

      return [ownerName, total, formatDateA(receipt.dateNow), paymentType]
    })

    // Terceros
    addDataSectionReceipt("terceros", combinedPrivates, (receiptPayment) => {
      const receipt = receiptPayment.receipt
      const total = receiptPayment.price
      const vehicleCustomer = receipt.customer.vehicleRenters?.[0]?.vehicle?.customer
      const vehicleOwner = vehicleCustomer ? `${vehicleCustomer.firstName} ${vehicleCustomer.lastName}` : ""

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
                  ? "TP"
                  : "Desconocido"

      return [
        `${receipt.customer.lastName} ${receipt.customer.firstName}`,
        total,
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

// Helper function to truncate text
const truncateText = (text: string, maxWidth: number, font: any, fontSize: number): string => {
  const textWidth = font.widthOfTextAtSize(text, fontSize)
  if (textWidth <= maxWidth) return text

  let truncated = text
  while (font.widthOfTextAtSize(truncated + "...", fontSize) > maxWidth && truncated.length > 0) {
    truncated = truncated.slice(0, -1)
  }
  return truncated + "..."
}
