import re

with open("src/components/DailyRecord.tsx", "r") as f:
    code = f.read()

# add overviewDate state
code = code.replace(
    "const [activeTab, setActiveTab] = useState<'dashboard' | 'newEntry' | 'records' | 'overview'>('newEntry');",
    "const [activeTab, setActiveTab] = useState<'dashboard' | 'newEntry' | 'records' | 'overview'>('newEntry');\n  const [overviewDate, setOverviewDate] = useState(() => new Date().toISOString().split('T')[0]);"
)

overview_tab = """      case 'overview':
        const overviewRecords = records.filter(r => r.date === overviewDate);
        const getCategoryTotal = (cat: string) => {
          const catRecords = overviewRecords.filter(r => r.category === cat);
          const cash = catRecords.reduce((sum, r) => sum + r.cashAmount, 0);
          const banking = catRecords.reduce((sum, r) => sum + r.bankingAmount, 0);
          return { cash, banking, total: cash + banking, records: catRecords };
        };

        const aaStats = getCategoryTotal('AA');
        const bbStats = getCategoryTotal('BB');
        const accStats = getCategoryTotal('Accessories');
        const expStats = getCategoryTotal('Daily Expense');
        const magyiStats = getCategoryTotal('MaGyi');

        const incomeCashTotal = aaStats.cash + bbStats.cash + accStats.cash;
        const incomeBankingTotal = aaStats.banking + bbStats.banking + accStats.banking;
        const closingAmount = (aaStats.total + bbStats.total + accStats.total) - expStats.total;

        return (
          <div className="bg-[#111] rounded-xl border border-[#333] p-6">
            <div className="flex justify-between items-center mb-6 border-b border-[#333] pb-4">
              <h2 className="text-sm font-bold text-[#dcb755] tracking-widest uppercase">Daily Overview Sheet</h2>
              <div className="flex items-center gap-4">
                <span className="text-[10px] text-gray-500 tracking-widest uppercase">SELECT DATE:</span>
                <input 
                  type="date" 
                  value={overviewDate}
                  onChange={(e) => setOverviewDate(e.target.value)}
                  className="bg-[#1a1a1a] border border-[#333] rounded px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#dcb755] [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="border border-[#333] bg-[#0a0a0a]">
              {/* Top 5 columns row */}
              <div className="grid grid-cols-5 border-b border-[#333]">
                {/* Col 1: AA */}
                <div className="p-4 border-r border-[#333]">
                  <div className="flex justify-between mb-2 text-sm"><span className="text-gray-400">Cash</span><span className="text-white">{aaStats.cash || ''}</span></div>
                  <div className="flex justify-between mb-2 text-sm"><span className="text-gray-400">Banking</span><span className="text-white">{aaStats.banking || ''}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-400">Total Amount</span><span className="text-[#dcb755]">{aaStats.total || ''}</span></div>
                </div>
                {/* Col 2: BB */}
                <div className="p-4 border-r border-[#333]">
                  <div className="flex justify-between mb-2 text-sm"><span className="text-gray-400">Cash</span><span className="text-white">{bbStats.cash || ''}</span></div>
                  <div className="flex justify-between mb-2 text-sm"><span className="text-gray-400">Banking</span><span className="text-white">{bbStats.banking || ''}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-400">Total Amount</span><span className="text-[#dcb755]">{bbStats.total || ''}</span></div>
                </div>
                {/* Col 3: Accessories */}
                <div className="p-4 border-r border-[#333]">
                  <div className="flex justify-between mb-2 text-sm"><span className="text-gray-400">Cash</span><span className="text-white">{accStats.cash || ''}</span></div>
                  <div className="flex justify-between mb-2 text-sm"><span className="text-gray-400">Banking</span><span className="text-white">{accStats.banking || ''}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-400">Total Amount</span><span className="text-[#dcb755]">{accStats.total || ''}</span></div>
                </div>
                {/* Col 4: Daily Expense */}
                <div className="p-4 border-r border-[#333]">
                  <div className="flex justify-between mb-2 text-sm"><span className="text-red-500">Cash</span><span className="text-white">{expStats.cash || ''}</span></div>
                  <div className="flex justify-between mb-2 text-sm"><span className="text-red-500">Banking</span><span className="text-white">{expStats.banking || ''}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-red-500">Total Amount</span><span className="text-[#dcb755]">{expStats.total || ''}</span></div>
                </div>
                {/* Col 5: MaGyi */}
                <div className="p-4">
                  <div className="flex justify-between mb-2 text-sm"><span className="text-gray-400">Cash</span><span className="text-white">{magyiStats.cash || ''}</span></div>
                  <div className="flex justify-between mb-2 text-sm"><span className="text-gray-400">Banking</span><span className="text-white">{magyiStats.banking || ''}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-400">Total Amount</span><span className="text-[#dcb755]">{magyiStats.total || ''}</span></div>
                </div>
              </div>

              {/* Cash Total Row */}
              <div className="border-b border-[#333] p-4 flex items-center">
                <span className="text-gray-400 text-sm w-[40%]">Cash Total (AA +BB +Accessories)</span>
                <span className="text-white text-sm">{incomeCashTotal || ''}</span>
              </div>

              {/* Banking Total Row */}
              <div className="border-b border-[#333] p-4 flex items-center">
                <span className="text-gray-400 text-sm w-[40%]">Banking Total (AA +BB +Accessories )</span>
                <span className="text-white text-sm">{incomeBankingTotal || ''}</span>
              </div>

              {/* Closing Amount Row */}
              <div className="border-b border-[#333] p-4 flex items-center">
                <span className="text-gray-400 text-sm w-[40%]">Closing Amount ( AA + BB + Accessories ) - Daily Expense</span>
                <span className="text-[#dcb755] font-bold text-sm">{closingAmount || ''}</span>
              </div>

              {/* Header Row for Items */}
              <div className="grid grid-cols-5 border-b border-[#333] text-center text-sm py-4">
                <div className="border-r border-[#333] text-green-500">AA</div>
                <div className="border-r border-[#333] text-green-500">BB</div>
                <div className="border-r border-[#333] text-green-500">Accessories</div>
                <div className="border-r border-[#333] text-red-500">Daily Expense</div>
                <div className="text-blue-500">MaGyi</div>
              </div>

              {/* Items Rows */}
              <div className="flex text-sm">
                {[aaStats, bbStats, accStats, expStats, magyiStats].map((stat, idx) => (
                  <div key={idx} className={`flex-1 ${idx < 4 ? 'border-r border-[#333]' : ''} p-4 min-h-[300px]`}>
                    {stat.records.map(r => (
                      <div key={r.id} className="flex justify-between mb-3 items-center">
                        <span className="text-gray-400 text-xs truncate pr-2" title={r.name}>{r.name}</span>
                        <span className="text-white text-xs whitespace-nowrap">{r.cashAmount + r.bankingAmount}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );"""

code = code.replace(
'''      case 'overview':
        return (
          <div className="bg-[#111] rounded-xl border border-[#333] p-8 text-center text-gray-500">
            <h2 className="text-lg font-medium text-white mb-2">Overview</h2>
            <p>Overview charts and stats coming soon.</p>
          </div>
        );''',
overview_tab
)

with open("src/components/DailyRecord.tsx", "w") as f:
    f.write(code)

