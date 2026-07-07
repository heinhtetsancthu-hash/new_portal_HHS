import re

with open("src/components/DailyRecord.tsx", "r") as f:
    code = f.read()

# 1. Update imports
if "Search" not in code:
    code = code.replace(
        "import { ArrowLeft, Trash2, Edit2, X } from 'lucide-react';",
        "import { ArrowLeft, Trash2, Edit2, X, Search, Filter } from 'lucide-react';"
    )

# 2. Add filter states
filter_states = """  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterDate, setFilterDate] = useState(() => new Date().toISOString().split('T')[0]);
"""
code = code.replace(
    "const [records, setRecords] = useState<DailyRecordItem[]>([]);",
    filter_states + "  const [records, setRecords] = useState<DailyRecordItem[]>([]);"
)

# 3. Add filtering logic to 'records' tab
records_tab = """      case 'records':
        const filteredRecords = records.filter(r => {
          const matchSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase());
          const matchCategory = filterCategory === 'All' || r.category === filterCategory;
          const matchDate = !filterDate || r.date === filterDate;
          return matchSearch && matchCategory && matchDate;
        });

        return (
          <div className="bg-[#111] rounded-xl border border-[#333] p-6 text-gray-300">
            <h2 className="text-xl font-serif text-[#dcb755] mb-6">Records</h2>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                  type="text"
                  placeholder="Search by name/ref..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded px-10 py-2 text-white text-sm focus:outline-none focus:border-[#dcb755] transition-colors"
                />
              </div>
              <div className="flex gap-4">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-[#1a1a1a] border border-[#333] rounded pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:border-[#dcb755] appearance-none"
                  >
                    <option value="All">All Categories</option>
                    <option value="AA">AA</option>
                    <option value="BB">BB</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Daily Expense">Daily Expense</option>
                    <option value="MaGyi">MaGyi</option>
                  </select>
                </div>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="bg-[#1a1a1a] border border-[#333] rounded px-4 py-2 text-white text-sm focus:outline-none focus:border-[#dcb755] [color-scheme:dark]"
                />
              </div>
            </div>

            {filteredRecords.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No records found for the selected filters.</p>
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
                    {filteredRecords.map((record) => ("""

code = re.sub(
    r"      case 'records':\n        return \(\n                    <div className=\"bg\[#111\] rounded-xl border border\[#333\] p-6 text-gray-300\">\n            <h2 className=\"text-xl font-serif text\[#dcb755\] mb-6\">Records</h2>\n            \{records\.length === 0 \? \(\n              <p className=\"text-center text-gray-500 py-8\">No records found\.</p>\n            \) : \(\n              <div className=\"overflow-x-auto\">\n                <table className=\"w-full text-left text-sm\">\n                  <thead className=\"text-\[10px\] uppercase tracking-widest text-\[#dcb755\] border-b border-\[#333\]\">\n                    <tr>\n                      <th className=\"px-4 py-3\">Date</th>\n                      <th className=\"px-4 py-3\">Name/Ref</th>\n                      <th className=\"px-4 py-3\">Category</th>\n                      <th className=\"px-4 py-3\">Cash \(MMK\)</th>\n                      <th className=\"px-4 py-3\">Banking \(MMK\)</th>\n                      <th className=\"px-4 py-3 text-right\">Actions</th>\n                    </tr>\n                  </thead>\n                  <tbody>\n                    \{records\.map\(\(record\) => \(",
    records_tab,
    code,
    flags=re.DOTALL
)

with open("src/components/DailyRecord.tsx", "w") as f:
    f.write(code)

