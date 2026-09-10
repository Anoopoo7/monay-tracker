import { AppData, Category, MoneySource, Spend, Transfer } from '../types/money';
import { getTodayInputDate } from './formatters';

export const STORAGE_KEY = 'money-flow-data';

export const INITIAL_SAMPLE_DATA: AppData = {
  categories: [
    {
      id: 'cat-painting',
      name: 'Painting Work',
      budget: 50000,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cat-compound',
      name: 'Compound Wall',
      budget: 100000,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cat-tiling',
      name: 'Tiling',
      budget: 80000,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cat-interlocking',
      name: 'Interlocking',
      budget: 60000,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    },
  ],
  sources: [
    {
      id: 'src-cash',
      name: 'Cash',
      initialAmount: 20000,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'src-sbi',
      name: 'SBI',
      initialAmount: 150000,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'src-hdfc',
      name: 'HDFC Bank',
      initialAmount: 75000,
      createdAt: new Date().toISOString(),
    },
  ],
  spends: [
    {
      id: 'spend-1',
      amount: 5000,
      categoryId: 'cat-painting',
      sourceId: 'src-sbi',
      date: getTodayInputDate(),
      note: 'Paint and labour',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'spend-2',
      amount: 10000,
      categoryId: 'cat-tiling',
      sourceId: 'src-cash',
      date: getTodayInputDate(),
      note: 'Floor materials',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'spend-3',
      amount: 15000,
      categoryId: 'cat-compound',
      sourceId: 'src-hdfc',
      date: getTodayInputDate(),
      note: 'Wall foundation materials',
      createdAt: new Date().toISOString(),
    },
  ],
  transfers: [
    {
      id: 'transfer-sample-1',
      fromSourceId: 'src-sbi',
      toSourceId: 'src-cash',
      amount: 10000,
      date: getTodayInputDate(),
      note: 'ATM withdrawal',
      createdAt: new Date().toISOString(),
    },
  ],
};

/**
 * Load application data from localStorage with fallback to initial sample data
 * Automatically migrates older data missing 'isCompleted' to isCompleted: false
 */
export const loadAppData = (): AppData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveAppData(INITIAL_SAMPLE_DATA);
      return INITIAL_SAMPLE_DATA;
    }
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      Array.isArray(parsed.categories) &&
      Array.isArray(parsed.sources) &&
      Array.isArray(parsed.spends)
    ) {
      const migratedCategories: Category[] = parsed.categories.map((c: any) => ({
        ...c,
        isCompleted: Boolean(c.isCompleted),
        completedAt: c.completedAt ? String(c.completedAt) : undefined,
      }));

      const appData: AppData = {
        categories: migratedCategories,
        sources: parsed.sources,
        spends: parsed.spends,
        transfers: Array.isArray(parsed.transfers) ? parsed.transfers : [],
      };
      return appData;
    }
  } catch (e) {
    console.error('Failed to load data from localStorage', e);
  }
  saveAppData(INITIAL_SAMPLE_DATA);
  return INITIAL_SAMPLE_DATA;
};

/**
 * Save current application state to localStorage
 */
export const saveAppData = (data: AppData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Failed to save data to localStorage', e);
  }
};

/**
 * Trigger download of formatted JSON backup file including transfers & completion states
 */
export const exportAppDataAsJSON = (data: AppData): void => {
  const dateStr = getTodayInputDate();
  const filename = `money-flow-backup-${dateStr}.json`;
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Validate JSON content before importing to prevent corrupted state
 * Supports legacy backups without 'isCompleted' or 'transfers' fields
 */
export const validateAndImportAppData = (
  jsonString: string
): { success: boolean; data?: AppData; error?: string } => {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'Invalid JSON structure' };
    }
    if (!Array.isArray(parsed.categories)) {
      return { success: false, error: 'Missing or invalid "categories" array' };
    }
    if (!Array.isArray(parsed.sources)) {
      return { success: false, error: 'Missing or invalid "sources" array' };
    }
    if (!Array.isArray(parsed.spends)) {
      return { success: false, error: 'Missing or invalid "spends" array' };
    }

    const validCategories: Category[] = parsed.categories.map((c: any, index: number) => ({
      id: String(c.id || `imported-cat-${index}-${Date.now()}`),
      name: String(c.name || 'Unnamed Category'),
      budget: Number(c.budget) >= 0 ? Number(c.budget) : 0,
      isCompleted: Boolean(c.isCompleted),
      completedAt: c.completedAt ? String(c.completedAt) : undefined,
      createdAt: String(c.createdAt || new Date().toISOString()),
    }));

    const validSources: MoneySource[] = parsed.sources.map((s: any, index: number) => ({
      id: String(s.id || `imported-src-${index}-${Date.now()}`),
      name: String(s.name || 'Unnamed Source'),
      initialAmount: Number(s.initialAmount) >= 0 ? Number(s.initialAmount) : 0,
      createdAt: String(s.createdAt || new Date().toISOString()),
    }));

    const validSpends: Spend[] = parsed.spends.map((sp: any, index: number) => ({
      id: String(sp.id || `imported-spend-${index}-${Date.now()}`),
      amount: Number(sp.amount) > 0 ? Number(sp.amount) : 0,
      categoryId: String(sp.categoryId || ''),
      sourceId: String(sp.sourceId || ''),
      date: String(sp.date || getTodayInputDate()),
      note: sp.note ? String(sp.note) : undefined,
      createdAt: String(sp.createdAt || new Date().toISOString()),
    }));

    const rawTransfers = Array.isArray(parsed.transfers) ? parsed.transfers : [];
    const validTransfers: Transfer[] = rawTransfers.map((t: any, index: number) => ({
      id: String(t.id || `imported-transfer-${index}-${Date.now()}`),
      fromSourceId: String(t.fromSourceId || ''),
      toSourceId: String(t.toSourceId || ''),
      amount: Number(t.amount) > 0 ? Number(t.amount) : 0,
      date: String(t.date || getTodayInputDate()),
      note: t.note ? String(t.note) : undefined,
      createdAt: String(t.createdAt || new Date().toISOString()),
    }));

    const validatedData: AppData = {
      categories: validCategories,
      sources: validSources,
      spends: validSpends,
      transfers: validTransfers,
    };

    saveAppData(validatedData);
    return { success: true, data: validatedData };
  } catch (e) {
    return { success: false, error: 'Failed to parse JSON file' };
  }
};

/**
 * Reset localStorage to initial sample data
 */
export const resetToSampleData = (): AppData => {
  saveAppData(INITIAL_SAMPLE_DATA);
  return INITIAL_SAMPLE_DATA;
};

/**
 * Reset localStorage to completely blank data
 */
export const clearAllData = (): AppData => {
  const emptyData: AppData = {
    categories: [],
    sources: [],
    spends: [],
    transfers: [],
  };
  saveAppData(emptyData);
  return emptyData;
};
