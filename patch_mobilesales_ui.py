import re

with open("src/components/MobileSales.tsx", "r") as f:
    code = f.read()

target = """                  <h2 className="text-lg font-semibold text-slate-800">Stock List</h2>
                  <div className="flex gap-2">
                    <span className="bg-sky-50 text-sky-700 border border-sky-100 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">
                      <span className="text-sky-500 font-normal">Value:</span> 
                      {stockItems.reduce((acc, item) => acc + (item.price || 0), 0).toLocaleString()}
                    </span>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">
                      <span className="text-emerald-500 font-normal">Devices:</span>
                      {stockItems.length}
                    </span>
                  </div>"""
replacement = """                  <h2 className="text-lg font-semibold text-slate-800">Stock List</h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-sky-50 text-sky-700 border border-sky-100 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">
                      <span className="text-sky-500 font-normal">Value:</span> 
                      {stockItems.reduce((acc, item) => acc + (item.price || 0), 0).toLocaleString()}
                    </span>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">
                      <span className="text-emerald-500 font-normal">Devices:</span>
                      {stockItems.length}
                    </span>
                    <button 
                      onClick={exportStockToPDF}
                      className="flex items-center gap-1 bg-slate-800 text-white hover:bg-slate-700 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
                    >
                      <Download size={14} />
                      Export PDF
                    </button>
                  </div>"""

if target in code:
    code = code.replace(target, replacement)
    with open("src/components/MobileSales.tsx", "w") as f:
        f.write(code)
    print("Success")
else:
    print("Target not found")
