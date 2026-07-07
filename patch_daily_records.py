with open("firestore.rules", "r") as f:
    rules = f.read()

validation_rule = """      match /daily_records/{recordId} {
        function isValidDailyRecord(data) {
          return data.keys().hasAll(['id', 'name', 'category', 'date', 'isCash', 'isBanking', 'cashAmount', 'bankingAmount', 'createdAt']) &&
                 data.id is string && data.id.size() <= 128 &&
                 data.name is string && data.name.size() <= 200 &&
                 data.category is string && data.category.size() <= 100 &&
                 data.date is string && data.date.size() <= 50 &&
                 data.isCash is bool &&
                 data.isBanking is bool &&
                 data.cashAmount is number &&
                 data.bankingAmount is number &&
                 data.createdAt is number;
        }
        allow read, list: if isOwner(userId);
        
        allow create: if isOwner(userId) && isValidId(recordId) && isValidDailyRecord(request.resource.data) && request.resource.data.id == recordId;
        
        allow update: if isOwner(userId) && isValidId(recordId) && isValidDailyRecord(request.resource.data) && request.resource.data.id == recordId;
        allow delete: if isOwner(userId) && isValidId(recordId);
      }"""

rules = rules.replace(
'''      match /daily_records/{recordId} {
        allow read, write: if isOwner(userId);
      }''',
validation_rule
)

with open("firestore.rules", "w") as f:
    f.write(rules)
