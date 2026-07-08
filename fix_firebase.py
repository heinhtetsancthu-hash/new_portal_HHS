import re

with open("src/firebase.ts", "r") as f:
    code = f.read()

target = """export const db = initializeFirestore(app, {
  databaseId: config.firestoreDatabaseId
});"""

replacement = """// @ts-ignore
export const db = initializeFirestore(app, {
  databaseId: config.firestoreDatabaseId
});"""

if target in code:
    code = code.replace(target, replacement)
    with open("src/firebase.ts", "w") as f:
        f.write(code)
    print("Success firebase")
else:
    # Try another target
    target2 = "databaseId: (config as any).firestoreDatabaseId"
    if "config.firestoreDatabaseId" in code:
        code = code.replace("config.firestoreDatabaseId", "(config as any).firestoreDatabaseId")
        with open("src/firebase.ts", "w") as f:
            f.write(code)
        print("Success firebase 2")
    else:
        print("Target not found in firebase")
