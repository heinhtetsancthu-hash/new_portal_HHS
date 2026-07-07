import re

with open("src/components/DailyRecord.tsx", "r") as f:
    code = f.read()

target = """      <header className="bg-[#111] border-b border-[#333] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 -ml-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#222] transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div className="flex flex-col">
                <h1 className="text-2xl font-serif text-[#dcb755] tracking-widest leading-none mb-1">DAILYRECORD</h1>
                <span className="text-[10px] tracking-[0.2em] text-gray-500">HHS MANAGEMENT SYSTEM</span>
              </div>
            </div>
            
            <div className="flex items-center gap-8 h-full">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`text-xs tracking-widest uppercase h-full px-1 border-b-2 transition-colors ${activeTab === 'dashboard' ? 'border-[#dcb755] text-[#dcb755]' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('newEntry')}
                className={`text-xs tracking-widest uppercase h-full px-1 border-b-2 transition-colors ${activeTab === 'newEntry' ? 'border-[#dcb755] text-[#dcb755]' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
              >
                New Entry
              </button>
              <button
                onClick={() => setActiveTab('records')}
                className={`text-xs tracking-widest uppercase h-full px-1 border-b-2 transition-colors ${activeTab === 'records' ? 'border-[#dcb755] text-[#dcb755]' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
              >
                Records
              </button>
              <button
                onClick={() => setActiveTab('overview')}
                className={`text-xs tracking-widest uppercase h-full px-1 border-b-2 transition-colors ${activeTab === 'overview' ? 'border-[#dcb755] text-[#dcb755]' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
              >
                Overview
              </button>
            </div>
          </div>
        </div>
      </header>"""

replacement = """      <header className="bg-[#111] border-b border-[#333] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col h-auto pt-4 pb-0">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={onBack}
                className="p-2 -ml-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#222] transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div className="flex flex-col">
                <h1 className="text-2xl font-serif text-[#dcb755] tracking-widest leading-none mb-1">DAILYRECORD</h1>
                <span className="text-[10px] tracking-[0.2em] text-gray-500">HHS MANAGEMENT SYSTEM</span>
              </div>
            </div>
            
            <div className="flex items-center gap-8 h-12">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`text-xs tracking-widest uppercase h-full px-1 border-b-2 transition-colors ${activeTab === 'dashboard' ? 'border-[#dcb755] text-[#dcb755]' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('newEntry')}
                className={`text-xs tracking-widest uppercase h-full px-1 border-b-2 transition-colors ${activeTab === 'newEntry' ? 'border-[#dcb755] text-[#dcb755]' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
              >
                New Entry
              </button>
              <button
                onClick={() => setActiveTab('records')}
                className={`text-xs tracking-widest uppercase h-full px-1 border-b-2 transition-colors ${activeTab === 'records' ? 'border-[#dcb755] text-[#dcb755]' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
              >
                Records
              </button>
              <button
                onClick={() => setActiveTab('overview')}
                className={`text-xs tracking-widest uppercase h-full px-1 border-b-2 transition-colors ${activeTab === 'overview' ? 'border-[#dcb755] text-[#dcb755]' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
              >
                Overview
              </button>
            </div>
          </div>
        </div>
      </header>"""

if target in code:
    code = code.replace(target, replacement)
    with open("src/components/DailyRecord.tsx", "w") as f:
        f.write(code)
    print("Success")
else:
    print("Target not found")
