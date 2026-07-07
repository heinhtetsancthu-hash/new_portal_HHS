import re

with open("src/components/DailyRecord.tsx", "r") as f:
    code = f.read()

# Replace the totalCash calculation
old_calc = """        // Based on the image: 
        // AA, BB, Daily Accessories, Daily Expense -> all have Cash and Banking split.
        // Ma Gyi -> single amount (total).
        // Total Cash -> total cash? The image shows "Total Cash" 0. It probably means Total Cash in hand or sum of all cash minus expenses. Wait, Total Cash from Income (AA, BB, Acc) - Expense?
        // Let's calculate total cash:
        const totalCashIncome = dAA.cash + dBB.cash + dAcc.cash;
        const totalCashExpense = dExp.cash;
        const totalCash = totalCashIncome - totalCashExpense; // or just all cash in - cash out? Let's just do cash income for now, or cash income - expense. Let's do (dAA.cash + dBB.cash + dAcc.cash) - dExp.cash - dMagyi.cash. Wait, "Total Cash" is often (AA+BB+Acc) cash - Expense cash."""

new_calc = """        const totalCashIncome = dAA.cash + dBB.cash + dAcc.cash;
        const totalCashExpense = dExp.cash;
        const totalCash = totalCashIncome - totalCashExpense;
        const totalBanking = dAA.banking + dBB.banking + dAcc.banking;"""

code = code.replace(old_calc, new_calc)

old_magyi_total = """              {/* Ma Gyi */}
              <div className="border-b border-[#333]">
                <div className="text-blue-500 py-3 border-b border-[#333]">Ma Gyi</div>
                <div className="py-2 text-gray-400">{dMagyi.total || ''}</div>
              </div>

              {/* Total Cash */}
              <div>
                <div className="text-blue-500 py-3 border-b border-[#333]">Total Cash</div>
                <div className="py-2 text-blue-500">{totalCash}</div>
              </div>
            </div>"""

new_magyi_total = """              {/* Ma Gyi */}
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

code = code.replace(old_magyi_total, new_magyi_total)

with open("src/components/DailyRecord.tsx", "w") as f:
    f.write(code)

