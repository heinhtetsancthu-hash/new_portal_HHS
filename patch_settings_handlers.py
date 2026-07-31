import re

with open("src/components/Settings.tsx", "r") as f:
    code = f.read()

target = """    const unsubCategories = subscribeStoredSparepartCategories(setSparepartCategories);

    return () => {
      unsubErrors();
      unsubTerms();
      unsubSaleTerms();
      unsubCategories();
    };"""

replacement = """    const unsubCategories = subscribeStoredSparepartCategories(setSparepartCategories);
    const unsubReceiveNames = subscribeStoredReceiveNames(setReceiveNames);

    return () => {
      unsubErrors();
      unsubTerms();
      unsubSaleTerms();
      unsubCategories();
      unsubReceiveNames();
    };"""

target2 = """  const handleSaveEditCategory = (index: number) => {
    if (editCategoryText.trim()) {
      const updated = [...sparepartCategories];
      updated[index] = editCategoryText.trim();
      setSparepartCategories(updated);
      setStoredSparepartCategories(updated);
    }
    setEditingCategoryIndex(null);
    setEditCategoryText('');
  };"""

replacement2 = """  const handleSaveEditCategory = (index: number) => {
    if (editCategoryText.trim()) {
      const updated = [...sparepartCategories];
      updated[index] = editCategoryText.trim();
      setSparepartCategories(updated);
      setStoredSparepartCategories(updated);
    }
    setEditingCategoryIndex(null);
    setEditCategoryText('');
  };

  const handleAddReceiveName = () => {
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
  };"""

if target in code and target2 in code:
    code = code.replace(target, replacement)
    code = code.replace(target2, replacement2)
    with open("src/components/Settings.tsx", "w") as f:
        f.write(code)
    print("Success")
else:
    print("Target not found")
