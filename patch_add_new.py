import re

with open("src/components/TemperGlass.tsx", "r") as f:
    code = f.read()

add_new_tab = """          {activeTab === 'ADD NEW' && (
            <div className="flex justify-center items-start mt-8 h-full">
              <div className="w-full max-w-xl border border-[#333] bg-[#111] p-8 mt-12 rounded-sm shadow-xl">
                <h2 className="text-2xl font-serif text-[#dcb755] tracking-widest uppercase mb-8">Add New Temper Glass</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="relative flex items-center justify-center">
                      <input type="checkbox" className="w-5 h-5 appearance-none border border-[#333] bg-[#1a1a1a] rounded-sm checked:bg-[#dcb755] cursor-pointer" />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 checked-icon text-black">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                      <style>{`
                        input[type="checkbox"]:checked + div {
                          opacity: 1;
                        }
                      `}</style>
                    </div>
                    <label className="text-xs text-gray-400 uppercase tracking-widest cursor-pointer">Customer Order</label>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#dcb755] tracking-widest mb-2 uppercase">Brand</label>
                    <select className="w-full bg-[#1a1a1a] border border-[#333] rounded px-4 py-3 text-gray-400 focus:outline-none focus:border-[#dcb755] transition-colors appearance-none">
                      <option value="">Select Brand</option>
                      <option value="Redmi">Redmi</option>
                      <option value="iPhone">iPhone</option>
                      <option value="Oppo">Oppo</option>
                      <option value="Samsung">Samsung</option>
                      <option value="Vivo">Vivo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#dcb755] tracking-widest mb-2 uppercase">Brand Name</label>
                    <input
                      type="text"
                      placeholder="No spaces or special chars (use /)"
                      className="w-full bg-[#1a1a1a] border border-[#333] rounded px-4 py-3 text-gray-400 focus:outline-none focus:border-[#dcb755] transition-colors"
                    />
                  </div>

                  <div className="pt-6">
                    <button className="w-full bg-[#dcb755] hover:bg-[#c8a141] text-black font-bold tracking-widest py-4 rounded text-sm transition-colors uppercase">
                      Save Record
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'DASHBOARD' && activeTab !== 'ADD NEW' && ("""

code = code.replace("          {activeTab !== 'DASHBOARD' && (", add_new_tab)

with open("src/components/TemperGlass.tsx", "w") as f:
    f.write(code)

