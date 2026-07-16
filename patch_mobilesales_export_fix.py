import re

with open("src/components/MobileSales.tsx", "r") as f:
    code = f.read()

target = """    const tableColumn = ["Brand", "Model", "IMEI", "Storage", "Battery Health", "Color", "Price"];
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
    });"""

replacement = """    const tableColumn = ["Brand", "Model", "IMEI", "Storage", "Color", "Price"];
    const tableRows: any[] = [];

    stockItems.forEach(item => {
      const rowData = [
        item.brand,
        item.model,
        item.imei,
        item.ramRom || '-',
        item.color || '-',
        item.price ? item.price.toLocaleString() : '-'
      ];
      tableRows.push(rowData);
    });"""

if target in code:
    code = code.replace(target, replacement)
    with open("src/components/MobileSales.tsx", "w") as f:
        f.write(code)
    print("Success")
else:
    print("Target not found")
