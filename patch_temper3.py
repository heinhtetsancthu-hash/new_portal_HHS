import re

with open("src/components/TemperGlass.tsx", "r") as f:
    code = f.read()

# 1. Update pendingAction type
code = code.replace(
    "const [pendingAction, setPendingAction] = useState<{ type: 'deleteBrand' | 'deleteItem' | 'editBrand', id?: string, brand?: TemperGlassBrand, item?: TemperGlassItem } | null>(null);",
    "const [pendingAction, setPendingAction] = useState<{ type: 'deleteBrand' | 'deleteItem' | 'editBrand' | 'editItem', id?: string, brand?: TemperGlassBrand, item?: TemperGlassItem } | null>(null);"
)

# 2. Add requestEditItem function
request_edit = """  const requestEditItem = (item: TemperGlassItem) => {
    setPendingAction({ type: 'editItem', item });
    setShowPasswordPrompt(true);
  };

  const executeEditItem = (item: TemperGlassItem) => {"""

code = code.replace("  const executeEditItem = (item: TemperGlassItem) => {", request_edit)

# 3. Handle editItem in password submit
handle_pass = """      if (pendingAction?.type === 'deleteBrand' && pendingAction.id) {
        deleteTemperGlassBrand(pendingAction.id);
      } else if (pendingAction?.type === 'deleteItem' && pendingAction.id) {
        deleteTemperGlassItem(pendingAction.id);
      } else if (pendingAction?.type === 'editBrand' && pendingAction.brand) {
        setBrandName(pendingAction.brand.name);
        setEditingBrandId(pendingAction.brand.id);
        setShowBrandForm(true);
      } else if (pendingAction?.type === 'editItem' && pendingAction.item) {
        executeEditItem(pendingAction.item);
      }"""

code = code.replace("""      if (pendingAction?.type === 'deleteBrand' && pendingAction.id) {
        deleteTemperGlassBrand(pendingAction.id);
      } else if (pendingAction?.type === 'deleteItem' && pendingAction.id) {
        deleteTemperGlassItem(pendingAction.id);
      } else if (pendingAction?.type === 'editBrand' && pendingAction.brand) {
        setBrandName(pendingAction.brand.name);
        setEditingBrandId(pendingAction.brand.id);
        setShowBrandForm(true);
      }""", handle_pass)

# 4. Replace executeEditItem calls in template
code = code.replace("onClick={() => executeEditItem(row)}", "onClick={() => requestEditItem(row)}")

with open("src/components/TemperGlass.tsx", "w") as f:
    f.write(code)

