function generateReceipt(button) {
  try {
    console.log("Receipt button clicked!");

    // Get the row data
    const row = button.closest("tr");
    const cells = row.querySelectorAll("td");

    // Extract data from table cells
    const customerName = cells[0].textContent.trim();
    const product = cells[1].textContent.trim();
    const productType = cells[2].textContent.trim();
    const quantity = parseInt(cells[3].textContent.trim());
    const unitPrice = parseInt(cells[4].textContent.trim());
    const total = parseInt(cells[5].textContent.trim());
    const date = cells[6].textContent.trim();
    const payment = cells[7].textContent.trim();
    const agent = cells[8].textContent.trim();
    const transport = parseInt(cells[9].textContent.trim()) || 0;

    console.log("Extracted data:", {
      customerName,
      product,
      quantity,
      unitPrice,
      total,
    });

    // Generate receipt number and current time
    const receiptNumber = `RCP-${Date.now().toString().slice(-6)}`;
    const now = new Date();

    // Populate receipt data
    document.getElementById("receiptNumber").textContent = receiptNumber;
    document.getElementById("receiptDate").textContent =
      now.toLocaleDateString();
    document.getElementById("receiptTime").textContent =
      now.toLocaleTimeString();
    document.getElementById("customerName").textContent = customerName;
    document.getElementById("paymentType").textContent = payment.toUpperCase();
    document.getElementById("salesAgent").textContent = agent;

    // Populate items table
    document.getElementById("receiptItems").innerHTML = `
      <tr>
        <td>${product} (${productType})</td>
        <td>${quantity}</td>
        <td>UGX ${unitPrice.toLocaleString()}</td>
        <td>UGX ${total.toLocaleString()}</td>
      </tr>
    `;

    // Calculate and display totals
    document.getElementById("subtotal").textContent = total.toLocaleString();
    document.getElementById("transport").textContent =
      transport.toLocaleString();
    document.getElementById("totalAmount").textContent = (
      total + transport
    ).toLocaleString();

    // Show receipt section with animation
    const receiptSection = document.getElementById("receiptSection");
    receiptSection.classList.add("show");
    receiptSection.scrollIntoView({ behavior: "smooth" });
  } catch (error) {
    console.error("Error generating receipt:", error);
    alert("Error generating receipt. Please try again.");
  }
}

function printReceipt() {
  window.print();
}

function closeReceipt() {
  document.getElementById("receiptSection").classList.remove("show");
}

// Close receipt when clicking outside
document.addEventListener("DOMContentLoaded", function () {
  document.addEventListener("click", function (e) {
    const receiptSection = document.getElementById("receiptSection");
    if (
      receiptSection.classList.contains("show") &&
      !receiptSection.contains(e.target) &&
      !e.target.closest(".btn-receipt")
    ) {
      receiptSection.classList.remove("show");
    }
  });
});
