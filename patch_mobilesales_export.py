import re

with open("src/components/MobileSales.tsx", "r") as f:
    code = f.read()

target = """  const [stockItems, setStockItems] = useState<StockItem[]>([]);"""
replacement = """  const [stockItems, setStockItems] = useState<StockItem[]>([]);

  const exportStockToPDF = () => {
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
    const fileName = `Handset_Stock_${currentDate}.pdf`;

    doc.setFontSize(16);
    doc.text('Stock List', 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

    const tableColumn = ["Brand", "Model", "IMEI", "Storage", "Battery Health", "Color", "Price"];
    const tableRows: any[] = [];

    stockItems.forEach(item => {
      const rowData = [
        item.brand,
        item.model,
        item.imei,
        item.storage,
        item.batteryHealth || '-',
        item.color || '-',
        item.price ? item.price.toLocaleString() : '-'
      ];
      tableRows.push(rowData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [14, 165, 233] },
    });

    doc.save(fileName);
  };"""

if target in code and "exportStockToPDF" not in code:
    code = code.replace(target, replacement)
    with open("src/components/MobileSales.tsx", "w") as f:
        f.write(code)
    print("Success")
else:
    print("Already added or Target not found")
