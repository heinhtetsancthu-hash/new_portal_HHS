with open("src/components/DailyRecord.tsx", "r") as f:
    code = f.read()

new_save = """
  const handleSave = async () => {
    console.log("Save clicked", { name, category, date, isCash, isBanking, cashAmount, bankingAmount });
    if (!name) {
      alert('Please enter customer name or reference.');
      return;
    }
    if (!isCash && !isBanking) {
      alert('Please select at least one payment method.');
      return;
    }

    const newItem: DailyRecordItem = {
      id: Date.now().toString(),
      name,
      category,
      date,
      isCash,
      isBanking,
      cashAmount: isCash ? parseFloat(cashAmount) || 0 : 0,
      bankingAmount: isBanking ? parseFloat(bankingAmount) || 0 : 0,
      createdAt: Date.now()
    };

    try {
      await saveDailyRecord(newItem);
      alert('Record Saved');
      setName('');
      setCashAmount('');
      setBankingAmount('');
      setActiveTab('records');
    } catch (error) {
      console.error("Save error:", error);
      alert("Error saving record: " + String(error));
    }
  };
"""

import re
code = re.sub(r'const handleSave = async \(\) => \{.*?\n  \};\n', new_save, code, flags=re.DOTALL)

with open("src/components/DailyRecord.tsx", "w") as f:
    f.write(code)

