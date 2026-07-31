import re

with open("src/components/NewTicket.tsx", "r") as f:
    code = f.read()

target = """  useEffect(() => {
    const unsubErrorTypes = subscribeStoredErrorTypes(setErrorTypes);
    const unsubStock = subscribeToSparepartStockItems(setStockItems);
    return () => {
      unsubErrorTypes();
      unsubStock();
    };
  }, []);"""

replacement = """  useEffect(() => {
    const unsubErrorTypes = subscribeStoredErrorTypes(setErrorTypes);
    const unsubStock = subscribeToSparepartStockItems(setStockItems);
    const unsubReceiveNames = subscribeStoredReceiveNames(setReceiveNames);
    return () => {
      unsubErrorTypes();
      unsubStock();
      unsubReceiveNames();
    };
  }, []);"""

if target in code:
    code = code.replace(target, replacement)
    with open("src/components/NewTicket.tsx", "w") as f:
        f.write(code)
    print("Success")
else:
    print("Target not found")
