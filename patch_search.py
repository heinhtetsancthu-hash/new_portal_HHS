import re

with open("src/components/TicketList.tsx", "r") as f:
    code = f.read()

target = """    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchName = t.customerName.toLowerCase().includes(query);
      const matchId = t.ticketId?.toLowerCase().includes(query) || t.id.toLowerCase().includes(query);
      const matchModel = t.deviceModel.toLowerCase().includes(query);
      if (!matchName && !matchId && !matchModel) return false;
    }"""

replacement = """    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchName = t.customerName?.toLowerCase().includes(query);
      const matchId = t.ticketId?.toLowerCase().includes(query) || t.id.toLowerCase().includes(query);
      const matchModel = t.deviceModel?.toLowerCase().includes(query);
      const matchPhone = t.phoneNumber?.toLowerCase().includes(query);
      if (!matchName && !matchId && !matchModel && !matchPhone) return false;
    }"""

target_ui = """placeholder="Search Name, ID or Model...\""""
replacement_ui = """placeholder="Search Name, ID, Model, or Phone...\""""

if target in code:
    code = code.replace(target, replacement)
    code = code.replace(target_ui, replacement_ui)
    with open("src/components/TicketList.tsx", "w") as f:
        f.write(code)
    print("Success")
else:
    print("Target not found")
