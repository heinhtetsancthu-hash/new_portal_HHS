import re

with open("src/types.ts", "r") as f:
    code = f.read()

target = """  id: string;
  ticketId?: string;
  customerName: string;"""
replacement = """  id: string;
  ticketId?: string;
  receiveName?: string;
  customerName: string;"""

if target in code:
    code = code.replace(target, replacement)
    with open("src/types.ts", "w") as f:
        f.write(code)
    print("Success")
else:
    print("Target not found")
