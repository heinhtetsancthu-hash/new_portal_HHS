import re

with open("src/components/Settings.tsx", "r") as f:
    code = f.read()

# Fix duplicate state
code = code.replace("  const [receiveNames, setReceiveNames] = useState<string[]>([]);\n  const [newReceiveName, setNewReceiveName] = useState('');\n  const [editingReceiveNameIndex, setEditingReceiveNameIndex] = useState<number | null>(null);\n  const [editReceiveNameText, setEditReceiveNameText] = useState('');\n", "")

# Fix duplicate effect
code = code.replace("    const unsubReceiveNames = subscribeStoredReceiveNames(setReceiveNames);\n    const unsubReceiveNames = subscribeStoredReceiveNames(setReceiveNames);", "    const unsubReceiveNames = subscribeStoredReceiveNames(setReceiveNames);")

# Remove duplicate handlers block
duplicate_handlers = """  const handleAddReceiveName = () => {
    if (newReceiveName.trim()) {
      const updated = [...receiveNames, newReceiveName.trim()];
      setReceiveNames(updated);
      setStoredReceiveNames(updated);
      setNewReceiveName('');
    }
  };

  const handleDeleteReceiveName = (index: number) => {
    const updated = receiveNames.filter((_, i) => i !== index);
    setReceiveNames(updated);
    setStoredReceiveNames(updated);
  };

  const handleStartEditReceiveName = (index: number) => {
    setEditingReceiveNameIndex(index);
    setEditReceiveNameText(receiveNames[index]);
  };

  const handleSaveEditReceiveName = (index: number) => {
    if (editReceiveNameText.trim()) {
      const updated = [...receiveNames];
      updated[index] = editReceiveNameText.trim();
      setReceiveNames(updated);
      setStoredReceiveNames(updated);
    }
    setEditingReceiveNameIndex(null);
    setEditReceiveNameText('');
  };\n\n"""
code = code.replace(duplicate_handlers, "")

with open("src/components/Settings.tsx", "w") as f:
    f.write(code)
