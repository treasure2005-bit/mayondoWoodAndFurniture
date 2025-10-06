// Function to download Stock Report as Excel or PDF
function downloadStockReport(format = "excel") {
  const table = document.querySelector("table");

  if (!table) {
    alert("No stock report data found!");
    return;
  }

  if (format === "excel") {
    // Convert HTML table to Excel
    let tableHTML = table.outerHTML.replace(/ /g, "%20");

    // Create a downloadable Excel file
    const dataType = "application/vnd.ms-excel";
    const filename = `stock_report_${
      new Date().toISOString().split("T")[0]
    }.xls`;
    const link = document.createElement("a");

    document.body.appendChild(link);
    link.href = "data:" + dataType + ", " + tableHTML;
    link.download = filename;
    link.click();
    document.body.removeChild(link);
  } else if (format === "pdf") {
    // Export to PDF using jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("l", "pt", "a4"); // Landscape mode

    // Add title
    doc.setFontSize(18);
    doc.setTextColor(44, 62, 80);
    doc.text("STOCK REPORT", 40, 40);

    // Add date range if available
    const startDate = document.getElementById("startDate")?.value;
    const endDate = document.getElementById("endDate")?.value;

    if (startDate || endDate) {
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      const dateText = `Period: ${startDate || "All"} to ${endDate || "All"}`;
      doc.text(dateText, 40, 55);
    }

    // Generate table
    doc.autoTable({
      html: "table",
      startY: startDate || endDate ? 70 : 60,
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [123, 61, 126], // Purple color
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [249, 249, 249],
      },
    });

    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Generated on ${new Date().toLocaleDateString()} - Page ${i} of ${pageCount}`,
        40,
        doc.internal.pageSize.height - 30
      );
    }

    const filename = `stock_report_${
      new Date().toISOString().split("T")[0]
    }.pdf`;
    doc.save(filename);
  }
}

// Simpler function name for the button
function downloadPDF() {
  downloadStockReport("pdf");
}

function downloadExcel() {
  downloadStockReport("excel");
}
