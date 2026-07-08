with open("src/firebase.ts", "r") as f:
    code = f.read()

code = code.replace("firebaseConfig.firestoreDatabaseId", "(firebaseConfig as any).firestoreDatabaseId")

with open("src/firebase.ts", "w") as f:
    f.write(code)
