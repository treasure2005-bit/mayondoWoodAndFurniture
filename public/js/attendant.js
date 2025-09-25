// Data storage
        let stockData = JSON.parse(localStorage.getItem('mwf_stock') || '[]');
        let salesData = JSON.parse(localStorage.getItem('mwf_sales') || '[]');
        let loadingData = JSON.parse(localStorage.getItem('mwf_loading') || '[]');
        let offloadingData = JSON.parse(localStorage.getItem('mwf_offloading') || '[]');
        let reports = JSON.parse(localStorage.getItem('mwf_reports') || '[]');

        // Tab switching
        function showTab(tabName) {
            // Hide all tabs
            const tabs = document.querySelectorAll('.tab-content');
            tabs.forEach(tab => tab.classList.remove('active'));
            
            // Remove active class from all nav tabs
            const navTabs = document.querySelectorAll('.nav-tab');
            navTabs.forEach(tab => tab.classList.remove('active'));
            
            // Show selected tab
            document.getElementById(tabName).classList.add('active');
            event.target.classList.add('active');
        }

        // Stock form handling
        document.getElementById('stockForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const stockItem = {
                id: Date.now(),
                productName: document.getElementById('stockProductName').value,
                productType: document.getElementById('stockProductType').value,
                costPrice: parseFloat(document.getElementById('stockCostPrice').value),
                quantity: parseInt(document.getElementById('stockQuantity').value),
                price: parseFloat(document.getElementById('stockPrice').value),
                supplier: document.getElementById('stockSupplier').value,
                date: document.getElementById('stockDate').value,
                quality: document.getElementById('stockQuality').value,
                color: document.getElementById('stockColor').value,
                measurements: document.getElementById('stockMeasurements').value
            };
            
            stockData.push(stockItem);
            localStorage.setItem('mwf_stock', JSON.stringify(stockData));
            
            updateStockTable();
            updateProductsTable();
            this.reset();
            alert('Stock recorded successfully!');
        });

        // Sales form handling
        document.getElementById('salesForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const quantity = parseInt(document.getElementById('salesQuantity').value);
            const unitPrice = parseFloat(document.getElementById('unitPrice').value);
            const transport = document.getElementById('transportService').checked;
            
            let total = quantity * unitPrice;
            if (transport) {
                total *= 1.05; // Add 5% for transport
            }
            
            const saleItem = {
                id: Date.now(),
                customer: document.getElementById('customerName').value,
                productType: document.getElementById('salesProductType').value,
                productName: document.getElementById('salesProductName').value,
                quantity: quantity,
                unitPrice: unitPrice,
                total: total.toFixed(2),
                date: document.getElementById('salesDate').value,
                paymentType: document.getElementById('paymentType').value,
                agent: document.getElementById('salesAgent').value,
                transport: transport
            };
            
            salesData.push(saleItem);
            localStorage.setItem('mwf_sales', JSON.stringify(salesData));
            
            updateSalesTable();
            this.reset();
            alert('Sale recorded successfully!');
        });

        // Loading form handling
        document.getElementById('loadingForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const loadingItem = {
                id: Date.now(),
                productName: document.getElementById('loadProductName').value,
                quantity: parseInt(document.getElementById('loadQuantity').value),
                destination: document.getElementById('loadDestination').value,
                date: document.getElementById('loadDate').value,
                vehicle: document.getElementById('loadVehicle').value,
                status: 'Loaded'
            };
            
            loadingData.push(loadingItem);
            localStorage.setItem('mwf_loading', JSON.stringify(loadingData));
            
            updateLoadingTable();
            this.reset();
            alert('Loading recorded successfully!');
        });

        // Offloading form handling
        document.getElementById('offloadingForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const offloadingItem = {
                id: Date.now(),
                productName: document.getElementById('offloadProductName').value,
                quantity: parseInt(document.getElementById('offloadQuantity').value),
                source: document.getElementById('offloadSource').value,
                date: document.getElementById('offloadDate').value,
                vehicle: document.getElementById('offloadVehicle').value,
                status: 'Offloaded'
            };
            
            offloadingData.push(offloadingItem);
            localStorage.setItem('mwf_offloading', JSON.stringify(offloadingData));
            
            updateOffloadingTable();
            this.reset();
            alert('Offloading recorded successfully!');
        });

        // Update tables
        function updateStockTable() {
            const tbody = document.getElementById('stockTableBody');
            tbody.innerHTML = '';
            
            stockData.forEach(item => {
                const row = tbody.insertRow();
                row.innerHTML = `
                    <td>${item.productName}</td>
                    <td>${item.productType}</td>
                    <td>${item.quantity}</td>
                    <td>$${item.costPrice}</td>
                    <td>$${item.price}</td>
                    <td>${item.supplier}</td>
                    <td>${item.date}</td>
                    <td>${item.quality}</td>
                `;
            });
        }

        function updateSalesTable() {
            const tbody = document.getElementById('salesTableBody');
            tbody.innerHTML = '';
            
            salesData.forEach(item => {
                const row = tbody.insertRow();
                row.innerHTML = `
                    <td>${item.customer}</td>
                    <td>${item.productName}</td>
                    <td>${item.productType}</td>
                    <td>${item.quantity}</td>
                    <td>$${item.unitPrice}</td>
                    <td>$${item.total}${item.transport ? ' (+5% transport)' : ''}</td>
                    <td>${item.date}</td>
                    <td>${item.paymentType}</td>
                    <td>${item.agent}</td>
                `;
            });
        }

        function updateProductsTable() {
            const tbody = document.getElementById('productsTableBody');
            tbody.innerHTML = '';
            
            stockData.forEach(item => {
                const row = tbody.insertRow();
                const status = item.quantity > 0 ? 'Available' : 'Out of Stock';
                row.innerHTML = `
                    <td>${item.productName}</td>
                    <td>${item.productType}</td>
                    <td>${item.quantity}</td>
                    <td>$${item.costPrice}</td>
                    <td>$${item.price}</td>
                    <td>${item.supplier}</td>
                    <td>${item.quality}</td>
                    <td>${status}</td>
                `;
            });
        }

        function updateLoadingTable() {
            const tbody = document.getElementById('loadingTableBody');
            tbody.innerHTML = '';
            
            loadingData.forEach(item => {
                const row = tbody.insertRow();
                row.innerHTML = `
                    <td>${item.productName}</td>
                    <td>${item.quantity}</td>
                    <td>${item.destination}</td>
                    <td>${item.date}</td>
                    <td>${item.vehicle}</td>
                    <td>${item.status}</td>
                `;
            });
        }

        function updateOffloadingTable() {
            const tbody = document.getElementById('offloadingTableBody');
            tbody.innerHTML = '';
            
            offloadingData.forEach(item => {
                const row = tbody.insertRow();
                row.innerHTML = `
                    <td>${item.productName}</td>
                    <td>${item.quantity}</td>
                    <td>${item.source}</td>
                    <td>${item.date}</td>
                    <td>${item.vehicle}</td>
                    <td>${item.status}</td>
                `;
            });
        }

        // Report generation
        function generateStockReport() {
            const reportId = 'STOCK-' + Date.now();
            const report = {
                id: reportId,
                type: 'stock',
                data: [...stockData],
                generatedBy: 'attendant',
                generatedOn: new Date().toISOString(),
                status: 'available_for_manager'
            };
            
            reports.push(report);
            localStorage.setItem('mwf_reports', JSON.stringify(reports));
            
            document.getElementById('stockReportId').textContent = reportId;
            document.getElementById('stockReportDate').textContent = new Date().toLocaleString();
            document.getElementById('stockReportSection').style.display = 'block';
            
            alert('Stock report generated successfully! Report ID: ' + reportId);
        }

        function generateSalesReport() {
            const reportId = 'SALES-' + Date.now();
            const report = {
                id: reportId,
                type: 'sales',
                data: [...salesData],
                generatedBy: 'attendant',
                generatedOn: new Date().toISOString(),
                status: 'available_for_manager'
            };
            
            reports.push(report);
            localStorage.setItem('mwf_reports', JSON.stringify(reports));
            
            document.getElementById('salesReportId').textContent = reportId;
            document.getElementById('salesReportDate').textContent = new Date().toLocaleString();
            document.getElementById('salesReportSection').style.display = 'block';
            
            alert('Sales report generated successfully! Report ID: ' + reportId);
        }

        // Receipt generation
        function generateReceipt() {
            const customer = document.getElementById('receiptCustomer').value;
            if (!customer) {
                alert('Please enter customer name');
                return;
            }
            
            // Get the latest sale for this customer or use form data
            const customerSales = salesData.filter(sale => sale.customer.toLowerCase() === customer.toLowerCase());
            
            if (customerSales.length === 0) {
                alert('No sales found for this customer');
                return;
            }
            
            const latestSale = customerSales[customerSales.length - 1];
            
            const receiptContent = `
                <p><strong>Receipt #:</strong> RCP-${latestSale.id}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Customer:</strong> ${latestSale.customer}</p>
                <hr>
                <p><strong>Product Details:</strong></p>
                <p>Product Name: ${latestSale.productName}</p>
                <p>Product Type: ${latestSale.productType}</p>
                <p>Quantity: ${latestSale.quantity}</p>
                <p>Unit Price: $${latestSale.unitPrice}</p>
                ${latestSale.transport ? '<p>Transport Service: +5%</p>' : ''}
                <p><strong>Total Amount: $${latestSale.total}</strong></p>
                <hr>
                <p><strong>Payment Method:</strong> ${latestSale.paymentType}</p>
                <p><strong>Sales Agent:</strong> ${latestSale.agent}</p>
                <p><strong>Date of Sale:</strong> ${latestSale.date}</p>
                <hr>
                <p style="text-align: center; margin-top: 20px;">Thank you for your business!</p>
            `;
            
            document.getElementById('receiptContent').innerHTML = receiptContent;
            document.getElementById('receiptDisplay').style.display = 'block';
        }

        function printReceipt() {
            const receiptElement = document.getElementById('receiptDisplay');
            if (receiptElement.style.display === 'none') {
                alert('Please generate a receipt first');
                return;
            }
        };
            const printWindow = window.open('', '_blank');
            printWindow.document.write