with open("src/components/DailyRecord.tsx", "r") as f:
    code = f.read()

new_save = """
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

code = code.replace(
    '''await saveDailyRecord(newItem);
    alert('Record Saved');
    setName('');
    setCashAmount('');
    setBankingAmount('');
    setActiveTab('records');
  };''',
    new_save
)

with open("src/components/DailyRecord.tsx", "w") as f:
    f.write(code)

