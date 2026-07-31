import re

with open("src/components/Settings.tsx", "r") as f:
    code = f.read()

target = """export const DEFAULT_SPAREPART_CATEGORIES = ["""
replacement = """export const DEFAULT_RECEIVE_NAMES = [
  'Main Store',
  'Branch 1',
  'Branch 2',
];

export const getStoredReceiveNames = async (): Promise<string[]> => {
  try {
    const stored = await getSettings('receive_names');
    if (stored) return stored;
  } catch (e) {
    console.error('Failed to get receive names', e);
  }
  return DEFAULT_RECEIVE_NAMES;
};

export const subscribeStoredReceiveNames = (callback: (names: string[]) => void): (() => void) => {
  return subscribeToSettings('receive_names', (stored) => {
    if (stored) {
      callback(stored);
    } else {
      callback(DEFAULT_RECEIVE_NAMES);
    }
  });
};

export const setStoredReceiveNames = async (names: string[]) => {
  try {
    await saveSettings('receive_names', names);
  } catch (e) {
    console.error('Failed to save receive names', e);
  }
};

export const DEFAULT_SPAREPART_CATEGORIES = ["""

if target in code:
    code = code.replace(target, replacement)
    with open("src/components/Settings.tsx", "w") as f:
        f.write(code)
    print("Success")
else:
    print("Target not found")
