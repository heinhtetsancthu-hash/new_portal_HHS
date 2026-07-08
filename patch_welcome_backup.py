import re

with open("src/components/Welcome.tsx", "r") as f:
    code = f.read()

target = """          <button 
            onClick={onTemperGlass}
            className={`w-full font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm ${isDark ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
          >
            <Activity size={20} />
            TemperGlass
          </button>"""

replacement = """          <button 
            onClick={onTemperGlass}
            className={`w-full font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm ${isDark ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
          >
            <Activity size={20} />
            TemperGlass
          </button>
          
          <button 
            onClick={onBackup}
            className={`w-full font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm ${isDark ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-purple-500 hover:bg-purple-600 text-white'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-database-backup"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 12c0 1.18 2.03 2.2 5 2.7M21 5v4.5c0 .76-.64 1.43-1.6 2M3 5v14c0 1.66 4 3 9 3 1.25 0 2.45-.15 3.5-.4"/><path d="M22 17.5c0 1.4-1.1 2.5-2.5 2.5h-5.4l1.3 1.3"/><path d="M15.4 16.2l-1.3 1.3"/></svg>
            Backup
          </button>"""

if target in code:
    code = code.replace(target, replacement)
    
    # also add onBackup to props
    prop_target = """  onTemperGlass: () => void;
  theme: 'original' | 'dark';"""
    prop_replacement = """  onTemperGlass: () => void;
  onBackup: () => void;
  theme: 'original' | 'dark';"""
    code = code.replace(prop_target, prop_replacement)
    
    fn_target = """export const Welcome: React.FC<WelcomeProps> = ({ onEnter, onFinance, onMobileSales, onAccessories, onDailyRecord, onTemperGlass, theme, toggleTheme, onSignOut, user }) => {"""
    fn_replacement = """export const Welcome: React.FC<WelcomeProps> = ({ onEnter, onFinance, onMobileSales, onAccessories, onDailyRecord, onTemperGlass, onBackup, theme, toggleTheme, onSignOut, user }) => {"""
    code = code.replace(fn_target, fn_replacement)
    
    with open("src/components/Welcome.tsx", "w") as f:
        f.write(code)
    print("Success")
else:
    print("Target not found")
