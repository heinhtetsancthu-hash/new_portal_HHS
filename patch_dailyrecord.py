import re

with open("src/components/DailyRecord.tsx", "r") as f:
    code = f.read()

target = """            <div className="border border-[#333] bg-[#0a0a0a] rounded text-sm text-center">
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
                <div className="flex border-b border-[#333]">
                  <div className="flex-1 py-2 border-r border-[#333] text-white">Cash</div>
                  <div className="flex-1 py-2 text-white">Banking</div>
                </div>
                <div className="flex">
                  <div className="flex-1 py-2 border-r border-[#333] text-gray-400">{dMagyi.cash || ''}</div>
                  <div className="flex-1 py-2 text-gray-400">{dMagyi.banking || ''}</div>
                </div>
              </div>

              {/* Total */}
              <div>
                <div className="text-blue-500 py-3 border-b border-[#333]">Total</div>
                <div className="flex border-b border-[#333]">
                  <div className="flex-1 py-2 border-r border-[#333] text-white">Cash</div>
                  <div className="flex-1 py-2 text-white">Banking</div>
                </div>
                <div className="flex">
                  <div className="flex-1 py-2 border-r border-[#333] text-blue-500">{totalCash || 0}</div>
                  <div className="flex-1 py-2 text-blue-500">{totalBanking || 0}</div>
                </div>
              </div>
            </div>"""

replacement = """            <div className="grid grid-cols-2 gap-4 text-sm text-center">
              {/* AA */}
              <div className="border border-[#0ea5e9] bg-[#0a0a0a] rounded py-6 px-2 flex flex-col justify-between">
                <div className="text-green-500 font-bold mb-6 text-base tracking-wider">AA</div>
                <div className="flex font-bold mb-6">
                  <div className="flex-1 text-white">Cash</div>
                  <div className="flex-1 text-white">Banking</div>
                </div>
                <div className="flex font-bold">
                  <div className="flex-1 text-gray-400">{dAA.cash || ''}</div>
                  <div className="flex-1 text-gray-400">{dAA.banking || ''}</div>
                </div>
              </div>

              {/* BB */}
              <div className="border border-[#0ea5e9] bg-[#0a0a0a] rounded py-6 px-2 flex flex-col justify-between">
                <div className="text-green-500 font-bold mb-6 text-base tracking-wider">BB</div>
                <div className="flex font-bold mb-6">
                  <div className="flex-1 text-white">Cash</div>
                  <div className="flex-1 text-white">Banking</div>
                </div>
                <div className="flex font-bold">
                  <div className="flex-1 text-gray-400">{dBB.cash || ''}</div>
                  <div className="flex-1 text-gray-400">{dBB.banking || ''}</div>
                </div>
              </div>

              {/* Daily Accessories */}
              <div className="border border-[#0ea5e9] bg-[#0a0a0a] rounded py-6 px-2 flex flex-col justify-between">
                <div className="text-green-500 font-bold mb-6 text-base tracking-wider">Daily Accessories</div>
                <div className="flex font-bold mb-6">
                  <div className="flex-1 text-white">Cash</div>
                  <div className="flex-1 text-white">Banking</div>
                </div>
                <div className="flex font-bold">
                  <div className="flex-1 text-gray-400">{dAcc.cash || ''}</div>
                  <div className="flex-1 text-gray-400">{dAcc.banking || ''}</div>
                </div>
              </div>

              {/* Daily Expense */}
              <div className="border border-[#0ea5e9] bg-[#0a0a0a] rounded py-6 px-2 flex flex-col justify-between">
                <div className="text-red-500 font-bold mb-6 text-base tracking-wider">Daily Expense</div>
                <div className="flex font-bold mb-6">
                  <div className="flex-1 text-red-500">Cash</div>
                  <div className="flex-1 text-red-500">Banking</div>
                </div>
                <div className="flex font-bold">
                  <div className="flex-1 text-gray-400">{dExp.cash || ''}</div>
                  <div className="flex-1 text-gray-400">{dExp.banking || ''}</div>
                </div>
              </div>

              {/* Ma Gyi */}
              <div className="border border-[#0ea5e9] bg-[#0a0a0a] rounded py-6 px-2 flex flex-col justify-between">
                <div className="text-[#a855f7] font-bold mb-6 text-base tracking-wider">MaGyi</div>
                <div className="flex font-bold mb-6">
                  <div className="flex-1 text-[#a855f7]">Cash</div>
                  <div className="flex-1 text-[#a855f7]">Banking</div>
                </div>
                <div className="flex font-bold">
                  <div className="flex-1 text-gray-400">{dMagyi.cash || ''}</div>
                  <div className="flex-1 text-gray-400">{dMagyi.banking || ''}</div>
                </div>
              </div>

              {/* Total */}
              <div className="border border-[#0ea5e9] bg-[#0a0a0a] rounded py-6 px-2 flex flex-col justify-between">
                <div className="text-blue-500 font-bold mb-6 text-base tracking-wider">Total</div>
                <div className="flex font-bold mb-6">
                  <div className="flex-1 text-blue-500">Cash</div>
                  <div className="flex-1 text-blue-500">Banking</div>
                </div>
                <div className="flex font-bold">
                  <div className="flex-1 text-blue-500">{totalCash || 0}</div>
                  <div className="flex-1 text-blue-500">{totalBanking || 0}</div>
                </div>
              </div>
            </div>"""

if target in code:
    code = code.replace(target, replacement)
    with open("src/components/DailyRecord.tsx", "w") as f:
        f.write(code)
    print("Success")
else:
    print("Target not found")
