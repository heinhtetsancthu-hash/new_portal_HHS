import re

with open("src/components/Settings.tsx", "r") as f:
    lines = f.readlines()

new_lines = []
skip = False
for line in lines:
    if "{/* Receive Names Configuration */}" in line:
        skip = True
    elif "{/* Terms & Conditions Section */}" in line:
        skip = False
    
    if not skip:
        new_lines.append(line)

with open("src/components/Settings.tsx", "w") as f:
    f.writelines(new_lines)
print("Success")
