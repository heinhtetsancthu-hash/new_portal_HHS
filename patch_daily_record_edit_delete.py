import re

with open("src/components/DailyRecord.tsx", "r") as f:
    code = f.read()

# 1. Update imports
code = code.replace(
    "import { ArrowLeft, Trash2 } from 'lucide-react';",
    "import { ArrowLeft, Trash2, Edit2, X } from 'lucide-react';"
)
code = code.replace(
    "import { saveDailyRecord, subscribeToDailyRecords, deleteDailyRecord } from '../db';",
    "import { saveDailyRecord, subscribeToDailyRecords, deleteDailyRecord, updateDailyRecord } from '../db';"
)

# 2. Add states
states = """  const [activeTab, setActiveTab] = useState<'dashboard' | 'newEntry' | 'records' | 'overview'>('newEntry');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [wrongPassword, setWrongPassword] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'delete', id: string } | { type: 'edit', record: DailyRecordItem } | null>(null);
"""
code = code.replace("  const [activeTab, setActiveTab] = useState<'dashboard' | 'newEntry' | 'records' | 'overview'>('newEntry');", states)

# 3. Handle password prompt
password_funcs = """  const handlePasswordSubmit = () => {
    if (passwordInput === '1471656') {
      setWrongPassword(false);
      setShowPasswordPrompt(false);
      setPasswordInput('');
      if (pendingAction?.type === 'delete') {
        executeDelete(pendingAction.id);
      } else if (pendingAction?.type === 'edit') {
        executeEdit(pendingAction.record);
      }
      setPendingAction(null);
    } else {
      setWrongPassword(true);
    }
  };

  const requestDelete = (id: string) => {
    setPendingAction({ type: 'delete', id });
    setShowPasswordPrompt(true);
  };

  const requestEdit = (record: DailyRecordItem) => {
    setPendingAction({ type: 'edit', record });
    setShowPasswordPrompt(true);
  };

  const executeDelete = async (id: string) => {
    await deleteDailyRecord(id);
    alert('Record deleted');
  };

  const executeEdit = (record: DailyRecordItem) => {
    setEditingId(record.id);
    setName(record.name);
    setCategory(record.category);
    setDate(record.date);
    setIsCash(record.isCash);
    setIsBanking(record.isBanking);
    setCashAmount(record.cashAmount > 0 ? record.cashAmount.toString() : '');
    setBankingAmount(record.bankingAmount > 0 ? record.bankingAmount.toString() : '');
    setActiveTab('newEntry');
  };

  const handleSave = async () => {"""
code = code.replace("  const handleSave = async () => {", password_funcs)

# 4. Modify handleSave for update
save_func_content = """    const itemData = {
      name,
      category,
      date,
      isCash,
      isBanking,
      cashAmount: isCash ? parseFloat(cashAmount) || 0 : 0,
      bankingAmount: isBanking ? parseFloat(bankingAmount) || 0 : 0,
    };

    try {
      if (editingId) {
        const updatedItem: DailyRecordItem = {
          id: editingId,
          ...itemData,
          createdAt: records.find(r => r.id === editingId)?.createdAt || Date.now()
        };
        await updateDailyRecord(updatedItem);
        alert('Record Updated');
        setEditingId(null);
      } else {
        const newItem: DailyRecordItem = {
          id: Date.now().toString(),
          ...itemData,
          createdAt: Date.now()
        };
        await saveDailyRecord(newItem);
        alert('Record Saved');
      }
      setName('');
      setCashAmount('');
      setBankingAmount('');
      setActiveTab('records');
    } catch (error) {"""

# regex replace for handleSave content
code = re.sub(
    r"    const newItem: DailyRecordItem = \{.*?createdAt: Date\.now\(\)\n    \};\n\n    try \{\n      await saveDailyRecord\(newItem\);\n      alert\('Record Saved'\);\n      setName\(''\);\n      setCashAmount\(''\);\n      setBankingAmount\(''\);\n      setActiveTab\('records'\);\n    \} catch \(error\) \{",
    save_func_content,
    code,
    flags=re.DOTALL
)

# 5. Add password modal at the end of the file
modal_html = """
      {/* Password Prompt Modal */}
      {showPasswordPrompt && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-[#333] rounded-xl p-6 max-w-sm w-full relative">
            <button 
              onClick={() => { setShowPasswordPrompt(false); setPendingAction(null); setPasswordInput(''); setWrongPassword(false); }}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-serif text-[#dcb755] mb-4">Master Password</h3>
            <p className="text-gray-500 text-sm mb-4">Please enter the master password to perform this action.</p>
            <div className="mb-4">
              <input 
                type="password" 
                value={passwordInput} 
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setWrongPassword(false);
                }}
                onKeyDown={(e) => { if (e.key === 'Enter') handlePasswordSubmit(); }}
                className={`w-full bg-[#1a1a1a] border ${wrongPassword ? 'border-red-500' : 'border-[#333]'} rounded px-4 py-3 text-white focus:outline-none focus:border-[#dcb755] transition-colors`}
                placeholder="Enter password..."
                autoFocus
              />
            </div>
            {wrongPassword && <p className="text-red-500 text-xs font-semibold mb-4 text-left">Incorrect password.</p>}
            {!wrongPassword && <div className="mb-4"></div>}
            <div className="flex gap-3">
              <button 
                onClick={() => { setShowPasswordPrompt(false); setPendingAction(null); setPasswordInput(''); setWrongPassword(false); }}
                className="flex-1 bg-transparent border border-[#333] hover:border-gray-500 text-gray-300 font-medium py-2 px-4 rounded transition-colors"
              >
                CANCEL
              </button>
              <button 
                onClick={handlePasswordSubmit}
                className="flex-1 bg-[#dcb755] hover:bg-[#c8a141] text-black font-medium py-2 px-4 rounded transition-colors"
              >
                CONFIRM
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
"""
code = code.replace("    </div>\n  );\n};", modal_html + "};")

# 6. Change New Entry Title
code = code.replace(
    '<h2 className="text-2xl font-serif text-[#dcb755]">New Entry</h2>',
    '<h2 className="text-2xl font-serif text-[#dcb755]">{editingId ? "Edit Entry" : "New Entry"}</h2>'
)
code = code.replace(
    "SAVE RECORD",
    "{editingId ? 'UPDATE RECORD' : 'SAVE RECORD'}"
)

# 7. Update actions in table
table_actions = """                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => requestEdit(record)}
                            className="text-gray-500 hover:text-[#dcb755] transition-colors p-2"
                            title="Edit record"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => requestDelete(record.id)}
                            className="text-gray-500 hover:text-red-500 transition-colors p-2"
                            title="Delete record"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>"""
code = re.sub(
    r'                        <td className="px-4 py-3 text-right">.*?<Trash2 size=\{16\} />\n                          </button>\n                        </td>',
    table_actions,
    code,
    flags=re.DOTALL
)

with open("src/components/DailyRecord.tsx", "w") as f:
    f.write(code)

