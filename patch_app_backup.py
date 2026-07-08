import re

with open("src/App.tsx", "r") as f:
    code = f.read()

target = """    if (view === 'welcome') {
      return <Welcome onEnter={() => { setView('portal'); setActivePortalView('list'); }} onFinance={() => setView('finance')} onMobileSales={() => setView('mobileSales')} onAccessories={() => setView('accessories')} onDailyRecord={() => setView('dailyRecord')} onTemperGlass={() => setView('temperGlass')} theme={theme} toggleTheme={toggleTheme} onSignOut={handleAppSignOut} user={user} />;
    }"""

replacement = """    if (view === 'welcome') {
      return <Welcome onEnter={() => { setView('portal'); setActivePortalView('list'); }} onFinance={() => setView('finance')} onMobileSales={() => setView('mobileSales')} onAccessories={() => setView('accessories')} onDailyRecord={() => setView('dailyRecord')} onTemperGlass={() => setView('temperGlass')} onBackup={() => { setView('portal'); setActivePortalView('backup'); }} theme={theme} toggleTheme={toggleTheme} onSignOut={handleAppSignOut} user={user} />;
    }"""

if target in code:
    code = code.replace(target, replacement)
    with open("src/App.tsx", "w") as f:
        f.write(code)
    print("Success")
else:
    print("Target not found")
