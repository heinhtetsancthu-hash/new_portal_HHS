import re

with open("src/components/DataBackup.tsx", "r") as f:
    code = f.read()

target = """        const parsedTickets = JSON.parse(content);
        
        if (!Array.isArray(parsedTickets)) {
          throw new Error('Invalid format');
        }
        
        const tickets: Ticket[] = parsedTickets.map(t => ({
          ...t,
          id: String(t.id || `TKT-${Date.now()}-${Math.floor(Math.random() * 10000)}`).replace(/[^a-zA-Z0-9_-]/g, ''),
          customerName: String(t.customerName || ''),
          phoneNumber: String(t.phoneNumber || ''),
          deviceBrand: String(t.deviceBrand || ''),
          deviceModel: String(t.deviceModel || ''),
          imei: String(t.imei || ''),
          errorType: String(t.errorType || ''),
          estimatedCost: String(t.estimatedCost || ''),
          screenLock: String(t.screenLock || ''),
          notes: String(t.notes || ''),
          createdAt: typeof t.createdAt === 'number' ? t.createdAt : Date.now(),
        }));
        
        await clearAllTickets();
        await insertTickets(tickets);"""

replacement = """        const parsedData = JSON.parse(content);
        await importAllData(parsedData);"""

if target in code:
    code = code.replace(target, replacement)
    with open("src/components/DataBackup.tsx", "w") as f:
        f.write(code)
    print("Success")
else:
    print("Target not found")
