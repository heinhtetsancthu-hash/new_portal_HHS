import re

with open("src/components/MobileSales.tsx", "r") as f:
    code = f.read()

target = "import { jsPDF } from 'jspdf';"
replacement = "import { jsPDF } from 'jspdf';\nimport autoTable from 'jspdf-autotable';"

if target in code and "jspdf-autotable" not in code:
    code = code.replace(target, replacement)
    with open("src/components/MobileSales.tsx", "w") as f:
        f.write(code)
    print("Success")
elif "jspdf-autotable" in code:
    print("Already imported")
else:
    print("Target not found")
