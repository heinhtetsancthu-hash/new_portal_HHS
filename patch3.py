with open("src/components/DailyRecord.tsx", "r") as f:
    code = f.read()

records_html = """
          <div className="bg-[#111] rounded-xl border border-[#333] p-6 text-gray-300">
            <h2 className="text-xl font-serif text-[#dcb755] mb-6">Records</h2>
            {records.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No records found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-[10px] uppercase tracking-widest text-[#dcb755] border-b border-[#333]">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Name/Ref</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Cash (MMK)</th>
                      <th className="px-4 py-3">Banking (MMK)</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr key={record.id} className="border-b border-[#222] hover:bg-[#1a1a1a] transition-colors">
                        <td className="px-4 py-3">{record.date}</td>
                        <td className="px-4 py-3 text-white font-medium">{record.name}</td>
                        <td className="px-4 py-3">
                          <span className="bg-[#222] text-gray-300 px-2 py-1 rounded text-xs">
                            {record.category}
                          </span>
                        </td>
                        <td className="px-4 py-3">{record.isCash ? record.cashAmount.toLocaleString() : '-'}</td>
                        <td className="px-4 py-3">{record.isBanking ? record.bankingAmount.toLocaleString() : '-'}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => deleteDailyRecord(record.id)}
                            className="text-gray-500 hover:text-red-500 transition-colors p-2"
                            title="Delete record"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
"""

code = code.replace(
'''<div className="bg-[#111] rounded-xl border border-[#333] p-8 text-center text-gray-500">
            <h2 className="text-lg font-medium text-white mb-2">Records</h2>
            <p>Records list coming soon.</p>
          </div>''',
records_html
)

with open("src/components/DailyRecord.tsx", "w") as f:
    f.write(code)

