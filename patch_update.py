with open("src/db.ts", "r") as f:
    code = f.read()

update_func = """
export const updateDailyRecord = async (item: DailyRecordItem): Promise<void> => {
  const userId = requireAuth();
  const path = `users/${userId}/daily_records`;
  try {
    await setDoc(doc(db, path, item.id), item, { merge: true });
    await addNotification(`Daily record for ${item.name} updated`, 'info');
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};
"""
code += update_func

with open("src/db.ts", "w") as f:
    f.write(code)

