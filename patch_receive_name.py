import re

with open("src/components/NewTicket.tsx", "r") as f:
    code = f.read()

# 1. Remove Receive Name from the top
target_top = """          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Receive Name</label>
              <select name="receiveName" value={formData.receiveName} onChange={handleInputChange} className="w-full px-3 py-1.5 bg-[#F9FAFB] border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors">
                <option value="">Select Location</option>
                {receiveNames.map((name, i) => (
                  <option key={i} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Customer Name</label>"""

replacement_top = """          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Customer Name</label>"""

if target_top in code:
    code = code.replace(target_top, replacement_top)
else:
    print("Could not find top target")

# 2. Add Receive Name to the bottom
target_bottom = """          )}
        </div>
      </div>
    </div>
  );
};"""

replacement_bottom = """          )}
          
          <div className="pt-2">
            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Receive Name</label>
            <select name="receiveName" value={formData.receiveName} onChange={handleInputChange} className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-sm text-slate-700 appearance-none">
              <option value="">Select Name</option>
              {receiveNames.map((name, i) => (
                <option key={i} value={name}>{name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};"""

if target_bottom in code:
    code = code.replace(target_bottom, replacement_bottom)
else:
    print("Could not find bottom target")

with open("src/components/NewTicket.tsx", "w") as f:
    f.write(code)
print("Success")
