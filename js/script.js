// Dummy login redirect
function loginUser(event) {
  event.preventDefault();
  const role = document.getElementById("role").value;
  if (role === "manager") {
    window.location.href = "manager.html";
  } else if (role === "sales") {
    window.location.href = "sales.html";
  } else {
    alert("Select a valid role!");
  }
}

// Stock Management
let stock = [];
function addStock(event) {
  event.preventDefault();
  const product = {
    name: document.getElementById("productName").value,
    type: document.getElementById("productType").value,
    cost: document.getElementById("costPrice").value,
    price: document.getElementById("productPrice").value,
    qty: document.getElementById("quantity").value,
    supplier: document.getElementById("supplier").value,
  };
  stock.push(product);
  localStorage.setItem("stock", JSON.stringify(stock));
  displayStock();
  event.target.reset();
}

function displayStock() {
  const table = document.getElementById("stockTable");
  if (!table) return;
  table.innerHTML = `<tr><th>Name</th><th>Type</th><th>Cost</th><th>Price</th><th>Qty</th><th>Supplier</th></tr>`;
  stock.forEach((p) => {
    table.innerHTML += `<tr>
      <td>${p.name}</td><td>${p.type}</td><td>${p.cost}</td>
      <td>${p.price}</td><td>${p.qty}</td><td>${p.supplier}</td>
    </tr>`;
  });
}

// Sales Management
let sales = [];
function recordSale(event) {
  event.preventDefault();
  const name = document.getElementById("customerName").value;
  const product = document.getElementById("productNameSale").value;
  const qty = Number(document.getElementById("quantitySale").value);
  const payment = document.getElementById("paymentType").value;
  const transport = document.getElementById("transport").checked;

  let price = 0;
  const stockItem = stock.find((p) => p.name === product);
  if (stockItem) {
    price = stockItem.price * qty;
    if (transport) price += price * 0.05;
  }

  const sale = { name, product, qty, price, payment };
  sales.push(sale);
  localStorage.setItem("sales", JSON.stringify(sales));
  displaySales();
  event.target.reset();
}

function displaySales() {
  const table = document.getElementById("salesTable");
  if (!table) return;
  table.innerHTML = `<tr><th>Customer</th><th>Product</th><th>Qty</th><th>Total</th><th>Payment</th></tr>`;
  sales.forEach((s) => {
    table.innerHTML += `<tr>
      <td>${s.name}</td><td>${s.product}</td><td>${s.qty}</td>
      <td>${s.price}</td><td>${s.payment}</td>
    </tr>`;
  });
}

// Reports
function loadReports() {
  const stockReport = document.getElementById("stockReport");
  const salesReport = document.getElementById("salesReport");
  if (stockReport) {
    stockReport.innerHTML = `<tr><th>Name</th><th>Type</th><th>Cost</th><th>Price</th><th>Qty</th><th>Supplier</th></tr>`;
    stock.forEach((p) => {
      stockReport.innerHTML += `<tr>
        <td>${p.name}</td><td>${p.type}</td><td>${p.cost}</td>
        <td>${p.price}</td><td>${p.qty}</td><td>${p.supplier}</td>
      </tr>`;
    });
  }
  if (salesReport) {
    salesReport.innerHTML = `<tr><th>Customer</th><th>Product</th><th>Qty</th><th>Total</th><th>Payment</th></tr>`;
    sales.forEach((s) => {
      salesReport.innerHTML += `<tr>
        <td>${s.name}</td><td>${s.product}</td><td>${s.qty}</td>
        <td>${s.price}</td><td>${s.payment}</td>
      </tr>`;
    });
  }
}

// Load saved data
window.onload = () => {
  stock = JSON.parse(localStorage.getItem("stock")) || [];
  sales = JSON.parse(localStorage.getItem("sales")) || [];
  displayStock();
  displaySales();
  loadReports();
};
