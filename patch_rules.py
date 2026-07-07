with open("firestore.rules", "r") as f:
    rules = f.read()

new_rules = """      match /temper_glass/{itemId} {
        allow read, write: if isOwner(userId);
      }
      match /temper_glass_brands/{brandId} {
        allow read, write: if isOwner(userId);
      }
    }
  }
}"""
rules = rules.replace("    }\n  }\n}", new_rules)

with open("firestore.rules", "w") as f:
    f.write(rules)
