import re

with open("src/db.ts", "r") as f:
    code = f.read()

export_code = """
export const exportAllData = async (): Promise<any> => {
  const userId = requireAuth();
  const collections = [
    'tickets', 'transactions', 'stocks', 'sales', 'installmentSales',
    'spareparts', 'accessory_orders', 'sparepart_stocks', 'daily_records',
    'temper_glass', 'temper_glass_brands'
  ];
  
  const allData: any = {};
  
  for (const col of collections) {
    const path = `users/${userId}/${col}`;
    const querySnapshot = await getDocs(collection(db, path));
    allData[col] = querySnapshot.docs.map(doc => doc.data());
  }
  
  return allData;
};

export const importAllData = async (data: any): Promise<void> => {
  const userId = requireAuth();
  const collections = [
    'tickets', 'transactions', 'stocks', 'sales', 'installmentSales',
    'spareparts', 'accessory_orders', 'sparepart_stocks', 'daily_records',
    'temper_glass', 'temper_glass_brands'
  ];
  
  for (const col of collections) {
    if (data[col] && Array.isArray(data[col])) {
      const path = `users/${userId}/${col}`;
      
      // Delete existing
      const existingDocs = await getDocs(collection(db, path));
      for (const docSnap of existingDocs.docs) {
        await deleteDoc(doc(db, path, docSnap.id));
      }
      
      // Insert new
      for (const item of data[col]) {
        if (item.id) {
          await setDoc(doc(db, path, item.id), item);
        }
      }
    }
  }
};
"""

if "exportAllData" not in code:
    code = code + "\n" + export_code
    with open("src/db.ts", "w") as f:
        f.write(code)
    print("Success")
else:
    print("Already exists")
