import re

with open("src/components/TemperGlass.tsx", "r") as f:
    code = f.read()

# 1. Update imports
if "subscribeToTemperGlassBrands" not in code:
    code = code.replace(
        "import { ArrowLeft, Menu, Search, Plus, Edit2, Trash2 } from 'lucide-react';",
        "import { ArrowLeft, Menu, Search, Plus, Edit2, Trash2, X } from 'lucide-react';\nimport { subscribeToTemperGlassBrands, saveTemperGlassBrand, updateTemperGlassBrand, deleteTemperGlassBrand, subscribeToTemperGlassItems, saveTemperGlassItem, updateTemperGlassItem, deleteTemperGlassItem } from '../db';\nimport { TemperGlassBrand, TemperGlassItem } from '../types';\nimport { useEffect } from 'react';"
    )

# 2. Update states
state_declarations = """  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('DASHBOARD');

  const [brands, setBrands] = useState<TemperGlassBrand[]>([]);
  const [items, setItems] = useState<TemperGlassItem[]>([]);

  // Password & Modal States
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [wrongPassword, setWrongPassword] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'deleteBrand' | 'deleteItem' | 'editBrand', id?: string, brand?: TemperGlassBrand, item?: TemperGlassItem } | null>(null);

  // Brand Form
  const [showBrandForm, setShowBrandForm] = useState(false);
  const [brandName, setBrandName] = useState('');
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);

  // Item Form
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemBrand, setItemBrand] = useState('');
  const [itemName, setItemName] = useState('');
  const [isCustomerOrder, setIsCustomerOrder] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsubBrands = subscribeToTemperGlassBrands(setBrands);
    const unsubItems = subscribeToTemperGlassItems(setItems);
    return () => {
      unsubBrands();
      unsubItems();
    };
  }, []);

  const handlePasswordSubmit = () => {
    if (passwordInput === '1471656') {
      setWrongPassword(false);
      setShowPasswordPrompt(false);
      setPasswordInput('');
      
      if (pendingAction?.type === 'deleteBrand' && pendingAction.id) {
        deleteTemperGlassBrand(pendingAction.id);
      } else if (pendingAction?.type === 'deleteItem' && pendingAction.id) {
        deleteTemperGlassItem(pendingAction.id);
      } else if (pendingAction?.type === 'editBrand' && pendingAction.brand) {
        setBrandName(pendingAction.brand.name);
        setEditingBrandId(pendingAction.brand.id);
        setShowBrandForm(true);
      }
      
      setPendingAction(null);
    } else {
      setWrongPassword(true);
    }
  };

  const requestDeleteBrand = (id: string) => {
    setPendingAction({ type: 'deleteBrand', id });
    setShowPasswordPrompt(true);
  };

  const requestEditBrand = (brand: TemperGlassBrand) => {
    setPendingAction({ type: 'editBrand', brand });
    setShowPasswordPrompt(true);
  };

  const requestDeleteItem = (id: string) => {
    setPendingAction({ type: 'deleteItem', id });
    setShowPasswordPrompt(true);
  };

  const executeEditItem = (item: TemperGlassItem) => {
    setEditingItemId(item.id);
    setItemBrand(item.brand);
    setItemName(item.name);
    setIsCustomerOrder(item.isCustomerOrder);
    setActiveTab('ADD NEW');
  };

  const handleSaveBrand = async () => {
    if (!brandName) return;
    if (editingBrandId) {
      await updateTemperGlassBrand({
        id: editingBrandId,
        name: brandName,
        createdAt: brands.find(b => b.id === editingBrandId)?.createdAt || Date.now()
      });
    } else {
      await saveTemperGlassBrand({
        id: Date.now().toString(),
        name: brandName,
        createdAt: Date.now()
      });
    }
    setBrandName('');
    setEditingBrandId(null);
    setShowBrandForm(false);
  };

  const handleSaveItem = async () => {
    if (!itemBrand || !itemName) return;
    if (editingItemId) {
      await updateTemperGlassItem({
        id: editingItemId,
        brand: itemBrand,
        name: itemName,
        isCustomerOrder,
        createdAt: items.find(i => i.id === editingItemId)?.createdAt || Date.now()
      });
      setEditingItemId(null);
    } else {
      await saveTemperGlassItem({
        id: Date.now().toString(),
        brand: itemBrand,
        name: itemName,
        isCustomerOrder,
        createdAt: Date.now()
      });
    }
    setItemBrand('');
    setItemName('');
    setIsCustomerOrder(false);
    setActiveTab(isCustomerOrder ? 'CUSTOMER ORDER' : 'DASHBOARD');
  };
"""

code = re.sub(
    r"  const \[isSidebarOpen, setIsSidebarOpen\] = useState\(true\);\n  const \[activeTab, setActiveTab\] = useState\('DASHBOARD'\);",
    state_declarations,
    code,
    flags=re.DOTALL
)

# 3. Fix dummyData references and render components
render_dashboard = """          {activeTab === 'DASHBOARD' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-serif text-[#dcb755] uppercase tracking-widest">Inventory</h2>
                <div className="relative w-64">
                  <input
                    type="text"
                    placeholder="Search by Brand or Brand Name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded px-4 py-2 text-sm text-white focus:outline-none focus:border-[#dcb755] transition-colors placeholder-gray-600"
                  />
                </div>
              </div>

              <div className="border border-[#333] bg-[#111] rounded-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="text-[10px] uppercase tracking-widest text-[#dcb755] border-b border-[#333]">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Brand</th>
                      <th className="px-6 py-4 font-semibold">Brand Name</th>
                      <th className="px-6 py-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.filter(i => !i.isCustomerOrder && (i.brand.toLowerCase().includes(searchQuery.toLowerCase()) || i.name.toLowerCase().includes(searchQuery.toLowerCase()))).map((row) => (
                      <tr key={row.id} className="border-b border-[#222] hover:bg-[#1a1a1a] transition-colors">
                        <td className="px-6 py-4 text-white font-medium">{row.brand}</td>
                        <td className="px-6 py-4 text-gray-300">{row.name}</td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button 
                            onClick={() => executeEditItem(row)}
                            className="bg-white text-black px-3 py-1 text-xs font-bold rounded-sm hover:bg-gray-200 transition-colors"
                          >
                            EDIT
                          </button>
                          <button 
                            onClick={() => requestDeleteItem(row.id)}
                            className="bg-white text-black px-3 py-1 text-xs font-bold rounded-sm hover:bg-gray-200 transition-colors"
                          >
                            DEL
                          </button>
                        </td>
                      </tr>
                    ))}
                    {items.filter(i => !i.isCustomerOrder).length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-gray-500">No inventory found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'CUSTOMER ORDER' && (
            <div>
              <div className="flex justify-between items-center mb-8 border-b border-[#333] pb-4">
                <h2 className="text-xl font-serif text-[#dcb755] uppercase tracking-widest">Customer Orders</h2>
              </div>

              <div className="border border-[#333] bg-[#111] rounded-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="text-[10px] uppercase tracking-widest text-[#dcb755] border-b border-[#333]">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Brand</th>
                      <th className="px-6 py-4 font-semibold">Brand Name</th>
                      <th className="px-6 py-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.filter(i => i.isCustomerOrder).map((row) => (
                      <tr key={row.id} className="border-b border-[#222] hover:bg-[#1a1a1a] transition-colors">
                        <td className="px-6 py-4 text-white font-medium">{row.brand}</td>
                        <td className="px-6 py-4 text-gray-300">{row.name}</td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button 
                            onClick={() => executeEditItem(row)}
                            className="bg-white text-black px-3 py-1 text-xs font-bold rounded-sm hover:bg-gray-200 transition-colors"
                          >
                            EDIT
                          </button>
                          <button 
                            onClick={() => requestDeleteItem(row.id)}
                            className="bg-white text-black px-3 py-1 text-xs font-bold rounded-sm hover:bg-gray-200 transition-colors"
                          >
                            DEL
                          </button>
                        </td>
                      </tr>
                    ))}
                    {items.filter(i => i.isCustomerOrder).length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-gray-500">No customer orders found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'ADD NEW' && (
            <div className="flex justify-center items-start mt-8 h-full">
              <div className="w-full max-w-xl border border-[#333] bg-[#111] p-8 mt-12 rounded-sm shadow-xl">
                <h2 className="text-2xl font-serif text-[#dcb755] tracking-widest uppercase mb-8">{editingItemId ? 'Edit' : 'Add New'} Temper Glass</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="relative flex items-center justify-center">
                      <input 
                        type="checkbox" 
                        checked={isCustomerOrder}
                        onChange={(e) => setIsCustomerOrder(e.target.checked)}
                        className="w-5 h-5 appearance-none border border-[#333] bg-[#1a1a1a] rounded-sm checked:bg-[#dcb755] cursor-pointer" 
                      />
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
                    <select 
                      value={itemBrand}
                      onChange={(e) => setItemBrand(e.target.value)}
                      className="w-full bg-[#1a1a1a] border border-[#333] rounded px-4 py-3 text-white focus:outline-none focus:border-[#dcb755] transition-colors appearance-none"
                    >
                      <option value="">Select Brand</option>
                      {brands.map(b => (
                        <option key={b.id} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#dcb755] tracking-widest mb-2 uppercase">Brand Name</label>
                    <input
                      type="text"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      placeholder="No spaces or special chars (use /)"
                      className="w-full bg-[#1a1a1a] border border-[#333] rounded px-4 py-3 text-white focus:outline-none focus:border-[#dcb755] transition-colors"
                    />
                  </div>

                  <div className="pt-6">
                    <button 
                      onClick={handleSaveItem}
                      className="w-full bg-[#dcb755] hover:bg-[#c8a141] text-black font-bold tracking-widest py-4 rounded text-sm transition-colors uppercase"
                    >
                      {editingItemId ? 'Update Record' : 'Save Record'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'BRANDS' && (
            <div>
              <div className="flex justify-between items-center mb-8 border-b border-[#333] pb-4">
                <h2 className="text-xl font-serif text-[#dcb755] uppercase tracking-widest">Brands</h2>
                <button 
                  onClick={() => setShowBrandForm(true)}
                  className="bg-[#dcb755] hover:bg-[#c8a141] text-black font-bold tracking-widest py-2 px-4 rounded-sm text-xs transition-colors uppercase flex items-center gap-2"
                >
                  <Plus size={16} strokeWidth={3} /> ADD BRAND
                </button>
              </div>

              {showBrandForm && (
                <div className="bg-[#1a1a1a] border border-[#333] rounded-sm p-5 mb-8">
                  <div className="flex gap-4">
                    <input
                      type="text"
                      placeholder="Brand Name"
                      value={brandName}
                      onChange={e => setBrandName(e.target.value)}
                      className="flex-1 bg-[#111] border border-[#333] rounded px-4 py-2 text-sm text-white focus:outline-none focus:border-[#dcb755] transition-colors"
                    />
                    <button 
                      onClick={handleSaveBrand}
                      className="bg-[#dcb755] hover:bg-[#c8a141] text-black font-bold tracking-widest px-6 rounded-sm text-xs transition-colors uppercase"
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => { setShowBrandForm(false); setBrandName(''); setEditingBrandId(null); }}
                      className="bg-transparent border border-[#333] text-gray-300 hover:text-white hover:border-gray-500 font-bold tracking-widest px-6 rounded-sm text-xs transition-colors uppercase"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {brands.map((brand) => (
                  <div key={brand.id} className="bg-[#1a1a1a] border border-[#333] rounded-sm p-5 flex justify-between items-center hover:border-gray-600 transition-colors">
                    <span className="text-white font-medium text-sm">{brand.name}</span>
                    <div className="flex items-center gap-4">
                      <button onClick={() => requestEditBrand(brand)} className="text-gray-500 hover:text-white transition-colors" title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => requestDeleteBrand(brand.id)} className="text-gray-500 hover:text-red-500 transition-colors" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                {brands.length === 0 && !showBrandForm && (
                  <div className="col-span-full text-center py-8 text-gray-500 border border-[#333] rounded-sm border-dashed">
                    No brands found. Click "Add Brand" to create one.
                  </div>
                )}
              </div>
            </div>
          )}
"""

code = re.sub(
    r"          \{activeTab === 'DASHBOARD' && \(.*\{activeTab !== 'DASHBOARD' && activeTab !== 'ADD NEW' && activeTab !== 'BRANDS' && \(",
    render_dashboard + "\n          {activeTab !== 'DASHBOARD' && activeTab !== 'ADD NEW' && activeTab !== 'BRANDS' && activeTab !== 'CUSTOMER ORDER' && (",
    code,
    flags=re.DOTALL
)

# 4. Remove dummyData array
code = re.sub(
    r"  const dummyData = \[.*?\];\n",
    "",
    code,
    flags=re.DOTALL
)

# 5. Add password modal at the end before closing
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
"""
code = code.replace("    </div>\n  );\n};", modal_html + "    </div>\n  );\n};")

with open("src/components/TemperGlass.tsx", "w") as f:
    f.write(code)

