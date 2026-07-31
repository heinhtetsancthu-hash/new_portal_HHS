import re

with open("src/components/Settings.tsx", "r") as f:
    code = f.read()

# Let's find the second section and remove it.
# Wait, I will just remove the whole div containing "Receive Names Configuration"

target = """      {/* Receive Names Configuration */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
        <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Receive Names Configuration</h3>"""

import sys

idx = code.find('      {/* Receive Names Configuration */}')
if idx == -1:
    idx = code.find('<h3 className="text-lg font-semibold text-slate-800">Receive Names Configuration</h3>')
    if idx == -1:
        print("Not found")
        sys.exit(0)
    
    # search backwards for <div className="bg-white rounded-2xl shadow-sm
    start = code.rfind('<div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden', 0, idx)
    
    # search forwards for the end of the div
    # it's just before "export default Settings;" or similar, let's find next section or closing tag
    
    
