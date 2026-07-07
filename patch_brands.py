import re

with open("src/components/TemperGlass.tsx", "r") as f:
    code = f.read()

# 1. Update imports
code = code.replace(
    "import { ArrowLeft, Menu, Search } from 'lucide-react';",
    "import { ArrowLeft, Menu, Search, Plus, Edit2, Trash2 } from 'lucide-react';"
)

brands_tab = """          {activeTab === 'BRANDS' && (
            <div>
              <div className="flex justify-between items-center mb-8 border-b border-[#333] pb-4">
                <h2 className="text-xl font-serif text-[#dcb755] uppercase tracking-widest">Brands</h2>
                <button className="bg-[#dcb755] hover:bg-[#c8a141] text-black font-bold tracking-widest py-2 px-4 rounded-sm text-xs transition-colors uppercase flex items-center gap-2">
                  <Plus size={16} strokeWidth={3} /> ADD BRAND
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {['Huawei', 'Infinix', 'iPhone', 'Itel', 'Oppo', 'Realme', 'Redmi', 'Samsung', 'Tecno', 'Vivo'].map((brand, idx) => (
                  <div key={idx} className="bg-[#1a1a1a] border border-[#333] rounded-sm p-5 flex justify-between items-center hover:border-gray-600 transition-colors">
                    <span className="text-white font-medium text-sm">{brand}</span>
                    <div className="flex items-center gap-4">
                      <button className="text-gray-500 hover:text-white transition-colors" title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button className="text-gray-500 hover:text-white transition-colors" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab !== 'DASHBOARD' && activeTab !== 'ADD NEW' && activeTab !== 'BRANDS' && ("""

code = code.replace("          {activeTab !== 'DASHBOARD' && activeTab !== 'ADD NEW' && (", brands_tab)

with open("src/components/TemperGlass.tsx", "w") as f:
    f.write(code)

