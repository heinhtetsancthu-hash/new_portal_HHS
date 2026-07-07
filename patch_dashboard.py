import re

with open("src/components/DailyRecord.tsx", "r") as f:
    code = f.read()

# add dashboardDate state
code = code.replace(
    "const [overviewDate, setOverviewDate] = useState(() => new Date().toISOString().split('T')[0]);",
    "const [overviewDate, setOverviewDate] = useState(() => new Date().toISOString().split('T')[0]);\n  const [dashboardDate, setDashboardDate] = useState(() => new Date().toISOString().split('T')[0]);"
)

dashboard_tab = """      case 'dashboard':
        const dashRecords = records.filter(r => r.date === dashboardDate);
        
        const getDashCategoryStats = (cat: string) => {
          const catRecords = dashRecords.filter(r => r.category === cat);
          const cash = catRecords.reduce((sum, r) => sum + r.cashAmount, 0);
          const banking = catRecords.reduce((sum, r) => sum + r.bankingAmount, 0);
          return { cash, banking, total: cash + banking };
        };

        const dAA = getDashCategoryStats('AA');
        const dBB = getDashCategoryStats('BB');
        const dAcc = getDashCategoryStats('Accessories');
        const dExp = getDashCategoryStats('Daily Expense');
        const dMagyi = getDashCategoryStats('MaGyi');

        // Based on the image: 
        // AA, BB, Daily Accessories, Daily Expense -> all have Cash and Banking split.
        // Ma Gyi -> single amount (total).
        // Total Cash -> total cash? The image shows "Total Cash" 0. It probably means Total Cash in hand or sum of all cash minus expenses. Wait, Total Cash from Income (AA, BB, Acc) - Expense?
        // Let's calculate total cash:
        const totalCashIncome = dAA.cash + dBB.cash + dAcc.cash;
        const totalCashExpense = dExp.cash;
        const totalCash = totalCashIncome - totalCashExpense; // or just all cash in - cash out? Let's just do cash income for now, or cash income - expense. Let's do (dAA.cash + dBB.cash + dAcc.cash) - dExp.cash - dMagyi.cash. Wait, "Total Cash" is often (AA+BB+Acc) cash - Expense cash.

        return (
          <div className="max-w-md mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white tracking-wide">Daily Closing</h2>
              <div className="flex items-center">
                <input 
                  type="date" 
                  value={dashboardDate}
                  onChange={(e) => setDashboardDate(e.target.value)}
                  className="bg-[#1a1a1a] border border-[#333] rounded px-3 py-1.5 text-gray-300 text-sm focus:outline-none focus:border-[#dcb755] [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="border border-[#333] bg-[#0a0a0a] rounded text-sm text-center">
              {/* AA */}
              <div className="border-b border-[#333]">
                <div className="text-green-500 py-3 border-b border-[#333]">AA</div>
                <div className="flex border-b border-[#333]">
                  <div className="flex-1 py-2 border-r border-[#333] text-white">Cash</div>
                  <div className="flex-1 py-2 text-white">Banking</div>
                </div>
                <div className="flex">
                  <div className="flex-1 py-2 border-r border-[#333] text-gray-400">{dAA.cash || ''}</div>
                  <div className="flex-1 py-2 text-gray-400">{dAA.banking || ''}</div>
                </div>
              </div>

              {/* BB */}
              <div className="border-b border-[#333]">
                <div className="text-green-500 py-3 border-b border-[#333]">BB</div>
                <div className="flex border-b border-[#333]">
                  <div className="flex-1 py-2 border-r border-[#333] text-white">Cash</div>
                  <div className="flex-1 py-2 text-white">Banking</div>
                </div>
                <div className="flex">
                  <div className="flex-1 py-2 border-r border-[#333] text-gray-400">{dBB.cash || ''}</div>
                  <div className="flex-1 py-2 text-gray-400">{dBB.banking || ''}</div>
                </div>
              </div>

              {/* Daily Accessories */}
              <div className="border-b border-[#333]">
                <div className="text-green-500 py-3 border-b border-[#333]">Daily Accessories</div>
                <div className="flex border-b border-[#333]">
                  <div className="flex-1 py-2 border-r border-[#333] text-white">Cash</div>
                  <div className="flex-1 py-2 text-white">Banking</div>
                </div>
                <div className="flex">
                  <div className="flex-1 py-2 border-r border-[#333] text-gray-400">{dAcc.cash || ''}</div>
                  <div className="flex-1 py-2 text-gray-400">{dAcc.banking || ''}</div>
                </div>
              </div>

              {/* Daily Expense */}
              <div className="border-b border-[#333]">
                <div className="text-red-500 py-3 border-b border-[#333]">Daily Expense</div>
                <div className="flex border-b border-[#333]">
                  <div className="flex-1 py-2 border-r border-[#333] text-white">Cash</div>
                  <div className="flex-1 py-2 text-white">Banking</div>
                </div>
                <div className="flex">
                  <div className="flex-1 py-2 border-r border-[#333] text-gray-400">{dExp.cash || ''}</div>
                  <div className="flex-1 py-2 text-gray-400">{dExp.banking || ''}</div>
                </div>
              </div>

              {/* Ma Gyi */}
              <div className="border-b border-[#333]">
                <div className="text-blue-500 py-3 border-b border-[#333]">Ma Gyi</div>
                <div className="py-2 text-gray-400">{dMagyi.total || ''}</div>
              </div>

              {/* Total Cash */}
              <div>
                <div className="text-blue-500 py-3 border-b border-[#333]">Total Cash</div>
                <div className="py-2 text-blue-500">{totalCash}</div>
              </div>
            </div>
          </div>
        );"""

code = code.replace(
'''      case 'dashboard':
        return (
          <div className="bg-[#111] rounded-xl border border-[#333] p-8 text-center text-gray-500">
            <h2 className="text-lg font-medium text-white mb-2">Dashboard</h2>
            <p>Dashboard view coming soon.</p>
          </div>
        );''',
dashboard_tab
)

with open("src/components/DailyRecord.tsx", "w") as f:
    f.write(code)

