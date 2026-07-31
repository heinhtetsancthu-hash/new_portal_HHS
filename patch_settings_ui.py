import re

with open("src/components/Settings.tsx", "r") as f:
    code = f.read()

target = """            {sparepartCategories.length === 0 && (
              <p className="text-center text-sm text-slate-400 py-6">No categories configured.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};"""

replacement = """            {sparepartCategories.length === 0 && (
              <p className="text-center text-sm text-slate-400 py-6">No categories configured.</p>
            )}
          </div>
        </div>

        {/* Receive Names Configuration */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Receive Names Configuration</h3>
            <p className="text-sm text-slate-500 mt-1">Manage the receive names available in the new ticket form.</p>
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
              value={newReceiveName}
              onChange={(e) => setNewReceiveName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddReceiveName()}
              placeholder="Add new receive name..."
              className="flex-1 rounded-xl border-slate-300 focus:border-sky-500 focus:ring-sky-500 outline-none p-3 border bg-slate-50 text-slate-800"
            />
            <button
              onClick={handleAddReceiveName}
              className="bg-slate-800 text-white px-6 rounded-xl hover:bg-slate-700 transition-colors flex items-center gap-2 font-medium"
            >
              <Plus size={18} />
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
                      onKeyPress={(e) => e.key === 'Enter' && handleSaveEditReceiveName(index)}
                      className="flex-1 rounded-lg border-slate-300 focus:border-sky-500 focus:ring-sky-500 outline-none p-2 border bg-white"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveEditReceiveName(index)}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    >
                      <Check size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setEditingReceiveNameIndex(null);
                        setEditReceiveNameText('');
                      }}
                      className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="font-medium text-slate-700">{name}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartEditReceiveName(index)}
                        className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteReceiveName(index)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
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
    </div>
  );
};"""

if target in code:
    code = code.replace(target, replacement)
    with open("src/components/Settings.tsx", "w") as f:
        f.write(code)
    print("Success")
else:
    print("Target not found")
