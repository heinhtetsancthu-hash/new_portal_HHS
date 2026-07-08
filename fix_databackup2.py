with open("src/components/DataBackup.tsx", "r") as f:
    code = f.read()

import re

# We can replace the body of reader.onload
pattern = r'(reader\.onload\s*=\s*async\s*\(event\)\s*=>\s*\{\s*try\s*\{\s*const\s*content\s*=\s*event\.target\?\.result\s*as\s*string;)(.*?)(setMessage\(\{ text: \'Data restored successfully)'

def replacer(match):
    return match.group(1) + "\n        const parsedData = JSON.parse(content);\n        await importAllData(parsedData);\n        " + match.group(3)

new_code = re.sub(pattern, replacer, code, flags=re.DOTALL)

with open("src/components/DataBackup.tsx", "w") as f:
    f.write(new_code)
