import re

with open("src/components/DailyRecord.tsx", "r") as f:
    code = f.read()

code = code.replace(
    'placeholder="Enter name..."',
    'placeholder="Enter name..."\n                  value={name}\n                  onChange={e => setName(e.target.value)}'
)

code = code.replace(
    'defaultValue="AA"',
    'value={category}\n                  onChange={e => setCategory(e.target.value)}'
)

code = code.replace(
    'defaultValue="2026-07-07"',
    'value={date}\n                    onChange={e => setDate(e.target.value)}'
)

code = code.replace(
    '''<input
                      type="number"
                      placeholder="0.00"
                      className="w-full bg-[#1a1a1a] border border-[#333] rounded px-4 py-3 text-gray-400 focus:outline-none focus:border-[#dcb755] transition-colors"
                    />''',
    '''<input
                      type="number"
                      placeholder="0.00"
                      value={cashAmount}
                      onChange={e => setCashAmount(e.target.value)}
                      className="w-full bg-[#1a1a1a] border border-[#333] rounded px-4 py-3 text-gray-400 focus:outline-none focus:border-[#dcb755] transition-colors"
                    />''', 1
)

code = code.replace(
    '''<input
                      type="number"
                      placeholder="0.00"
                      className="w-full bg-[#1a1a1a] border border-[#333] rounded px-4 py-3 text-gray-400 focus:outline-none focus:border-[#dcb755] transition-colors"
                    />''',
    '''<input
                      type="number"
                      placeholder="0.00"
                      value={bankingAmount}
                      onChange={e => setBankingAmount(e.target.value)}
                      className="w-full bg-[#1a1a1a] border border-[#333] rounded px-4 py-3 text-gray-400 focus:outline-none focus:border-[#dcb755] transition-colors"
                    />'''
)

code = code.replace(
    "onClick={() => alert('Record Saved')}",
    "onClick={handleSave}"
)

with open("src/components/DailyRecord.tsx", "w") as f:
    f.write(code)

