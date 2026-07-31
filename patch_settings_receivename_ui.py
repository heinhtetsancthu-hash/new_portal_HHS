import re

with open("src/components/Settings.tsx", "r") as f:
    code = f.read()

# Add states
target_state = """  const [sparepartCategories, setSparepartCategories] = useState<string[]>([]);"""
replacement_state = """  const [sparepartCategories, setSparepartCategories] = useState<string[]>([]);
  const [receiveNames, setReceiveNames] = useState<string[]>([]);
  const [newReceiveNameText, setNewReceiveNameText] = useState('');
  const [editingReceiveNameIndex, setEditingReceiveNameIndex] = useState<number | null>(null);
  const [editReceiveNameText, setEditReceiveNameText] = useState('');"""
code = code.replace(target_state, replacement_state)

# Add effect
target_effect = """    const unsubCategories = subscribeStoredSparepartCategories(setSparepartCategories);"""
replacement_effect = """    const unsubCategories = subscribeStoredSparepartCategories(setSparepartCategories);
    const unsubReceiveNames = subscribeStoredReceiveNames(setReceiveNames);"""
code = code.replace(target_effect, replacement_effect)

target_effect_cleanup = """      unsubCategories();
    };"""
replacement_effect_cleanup = """      unsubCategories();
      unsubReceiveNames();
    };"""
code = code.replace(target_effect_cleanup, replacement_effect_cleanup)

# Add handlers
target_handlers = """  const handleAddCategory = () => {"""
replacement_handlers = """  const handleAddReceiveName = () => {
    if (newReceiveNameText.trim()) {
      const updated = [...receiveNames, newReceiveNameText.trim()];
      setReceiveNames(updated);
      setStoredReceiveNames(updated);
      setNewReceiveNameText('');
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
  };

  const handleAddCategory = () => {"""
code = code.replace(target_handlers, replacement_handlers)

# Add UI section
target_ui = """      {/* Sparepart Category Section */}"""
replacement_ui = """      {/* Receive Name Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Receive Name Configuration</h3>
            <p className="text-sm text-slate-500 mt-1">Manage the receive locations/names for new tickets.</p>
          </div>
          <button
            onClick={() => {
              setReceiveNames(DEFAULT_RECEIVE_NAMES);
              setStoredReceiveNames(DEFAULT_RECEIVE_NAMES);
            }}
            className="text-sm px-3 py-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
          >
            Reset to Defaults
          </button>
        </div>
        <div className="p-6">
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={newReceiveNameText}
              onChange={(e) => setNewReceiveNameText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddReceiveName()}
              placeholder="Add new receive name..."
              className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <button
              onClick={handleAddReceiveName}
              disabled={!newReceiveNameText.trim()}
              className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Plus size={16} />
              Add
            </button>
          </div>

          <div className="space-y-2">
            {receiveNames.map((name, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl bg-[#F9FAFB] shadow-sm">
                {editingReceiveNameIndex === index ? (
                  <div className="flex items-center gap-2 flex-1 mr-4">
                    <input
                      type="text"
                      value={editReceiveNameText}
                      onChange={(e) => setEditReceiveNameText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveEditReceiveName(index)}
                      className="flex-1 px-3 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:border-indigo-500"
                      autoFocus
                    />
                    <button onClick={() => handleSaveEditReceiveName(index)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded">
                      <Check size={16} />
                    </button>
                    <button onClick={() => setEditingReceiveNameIndex(null)} className="p-1.5 text-slate-400 hover:bg-slate-200 rounded">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-sm font-medium text-slate-700">{name}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleStartEditReceiveName(index)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDeleteReceiveName(index)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {receiveNames.length === 0 && (
              <p className="text-center text-sm text-slate-400 py-6">No receive names configured.</p>
            )}
          </div>
        </div>
      </div>

      {/* Sparepart Category Section */}"""
code = code.replace(target_ui, replacement_ui)

with open("src/components/Settings.tsx", "w") as f:
    f.write(code)
print("Success")
