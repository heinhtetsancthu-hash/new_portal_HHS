import re

with open("src/components/Settings.tsx", "r") as f:
    code = f.read()

target = """  const [sparepartCategories, setSparepartCategories] = useState<string[]>([]);
  const [newCategoryText, setNewCategoryText] = useState('');
  const [editingCategoryIndex, setEditingCategoryIndex] = useState<number | null>(null);
  const [editCategoryText, setEditCategoryText] = useState('');"""

replacement = """  const [sparepartCategories, setSparepartCategories] = useState<string[]>([]);
  const [newCategoryText, setNewCategoryText] = useState('');
  const [editingCategoryIndex, setEditingCategoryIndex] = useState<number | null>(null);
  const [editCategoryText, setEditCategoryText] = useState('');

  const [receiveNames, setReceiveNames] = useState<string[]>([]);
  const [newReceiveName, setNewReceiveName] = useState('');
  const [editingReceiveNameIndex, setEditingReceiveNameIndex] = useState<number | null>(null);
  const [editReceiveNameText, setEditReceiveNameText] = useState('');"""

if target in code:
    code = code.replace(target, replacement)
    with open("src/components/Settings.tsx", "w") as f:
        f.write(code)
    print("Success")
else:
    print("Target not found")
