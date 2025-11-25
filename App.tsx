
import React, { useState, useEffect, useRef } from 'react';
import { Settings, Plus, LayoutGrid, Settings2, Info } from 'lucide-react';
import { Category, Link, SearchEngine, AppSettings } from './types';
import { getDefaultCategories, DEFAULT_SEARCH_ENGINES } from './constants';
import { TRANSLATIONS } from './translations';
import { SearchBar } from './components/SearchBar';
import { CategoryGroup } from './components/CategoryGroup';
import { Modal } from './components/Modal';
import { SettingsModal } from './components/SettingsModal';
import { Clock } from './components/Clock';
import { AboutModal } from './components/AboutModal';

const STORAGE_KEY_DATA = 'astralis_data';
const STORAGE_KEY_ENGINES = 'astralis_engines';
const STORAGE_KEY_SETTINGS = 'astralis_settings';

const DEFAULT_SETTINGS: AppSettings = {
  language: 'en',
  theme: 'system',
  openSearchInNewTab: false,
  openLinksInNewTab: false,
  showFavicons: true,
  layoutMode: 'list',
  showShortcuts: true,
  showFooter: true,
  customWallpaper: '',
  wallpaperBlur: false,
  greetingName: ''
};

const App: React.FC = () => {
  // --- State ---

  // Settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  });

  const t = TRANSLATIONS[settings.language];

  // Categories
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_DATA);
    if (saved) {
      return JSON.parse(saved);
    }
    // Get default categories based on the saved language or browser language
    const savedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
    const language = savedSettings
      ? JSON.parse(savedSettings).language
      : (navigator.language.startsWith('zh') ? 'zh' : 'en');
    return getDefaultCategories(language);
  });

  // Search Engines
  const [searchEngines, setSearchEngines] = useState<SearchEngine[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ENGINES);
    return saved ? JSON.parse(saved) : DEFAULT_SEARCH_ENGINES;
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Modals State
  const [isAddLinkModalOpen, setIsAddLinkModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isAddEngineModalOpen, setIsAddEngineModalOpen] = useState(false);

  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  // Form State
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newCategoryTitle, setNewCategoryTitle] = useState('');

  const [newEngineName, setNewEngineName] = useState('');
  const [newEngineUrl, setNewEngineUrl] = useState('');
  const [newEngineIcon, setNewEngineIcon] = useState('');

  // Drag & Drop State
  const dragItem = useRef<{ type: 'category' | 'link', id: string, parentId?: string } | null>(null);

  // --- Persistence & Effects ---
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ENGINES, JSON.stringify(searchEngines));
  }, [searchEngines]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  }, [settings]);

  // Auto-translate default category titles when language changes
  useEffect(() => {
    const categoryTitleMap: Record<string, Record<string, string>> = {
      'Daily': { 'zh': '日常', 'en': 'Daily' },
      '日常': { 'zh': '日常', 'en': 'Daily' },
      'Work & Dev': { 'zh': '工作与开发', 'en': 'Work & Dev' },
      '工作与开发': { 'zh': '工作与开发', 'en': 'Work & Dev' },
      'News & Read': { 'zh': '新闻与阅读', 'en': 'News & Read' },
      '新闻与阅读': { 'zh': '新闻与阅读', 'en': 'News & Read' }
    };

    setCategories(prev => prev.map(cat => {
      const translationMap = categoryTitleMap[cat.title];
      if (translationMap) {
        return { ...cat, title: translationMap[settings.language] };
      }
      return cat;
    }));
  }, [settings.language]);

  // Apply Theme
  useEffect(() => {
    const root = window.document.documentElement;
    const isDark =
      settings.theme === 'dark' ||
      (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  // Hide loading screen when app is ready
  useEffect(() => {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      // Small delay to ensure everything is rendered
      setTimeout(() => {
        loadingScreen.classList.add('loaded');
        // Remove from DOM after transition
        setTimeout(() => {
          loadingScreen.remove();
        }, 300);
      }, 100);
    }
  }, []);


  // --- Handlers ---
  const updateSettings = (key: keyof AppSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // --- Data Management ---
  const handleExportData = () => {
    const data = {
      categories,
      searchEngines,
      settings
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `astralis_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (file: File) => {
    if (!confirm(t.importConfirm)) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.categories) setCategories(json.categories);
        if (json.searchEngines) setSearchEngines(json.searchEngines);
        if (json.settings) setSettings({ ...DEFAULT_SETTINGS, ...json.settings });
        alert(t.done);
        setIsSettingsOpen(false);
      } catch (error) {
        alert("Invalid backup file.");
      }
    };
    reader.readAsText(file);
  };

  // --- Drag & Drop Handlers ---
  const onDragStart = (e: React.DragEvent, type: 'category' | 'link', id: string, parentId?: string) => {
    dragItem.current = { type, id, parentId };
    e.dataTransfer.effectAllowed = "move";
    // Slight delay to prevent ghost image issues
    setTimeout(() => {
      // Optional: add visual class to dragged item
    }, 0);
  };

  const onDragOver = (e: React.DragEvent, type: 'category' | 'link', id: string) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const onDrop = (e: React.DragEvent, type: 'category' | 'link', targetId: string, targetParentId?: string) => {
    e.preventDefault();
    const dragged = dragItem.current;
    if (!dragged) return;

    // Logic for reordering categories
    if (dragged.type === 'category' && type === 'category') {
      const sourceIndex = categories.findIndex(c => c.id === dragged.id);
      const targetIndex = categories.findIndex(c => c.id === targetId);

      if (sourceIndex === targetIndex) return;

      const newCategories = [...categories];
      const [moved] = newCategories.splice(sourceIndex, 1);
      newCategories.splice(targetIndex, 0, moved);
      setCategories(newCategories);
    }

    // Logic for reordering links (within same category for simplicity in this implementation)
    if (dragged.type === 'link' && type === 'link' && dragged.parentId === targetParentId) {
      const catIndex = categories.findIndex(c => c.id === dragged.parentId);
      if (catIndex === -1) return;

      const newLinks = [...categories[catIndex].links];
      const sourceIndex = newLinks.findIndex(l => l.id === dragged.id);
      const targetIndex = newLinks.findIndex(l => l.id === targetId);

      if (sourceIndex === targetIndex) return;

      const [moved] = newLinks.splice(sourceIndex, 1);
      newLinks.splice(targetIndex, 0, moved);

      const newCategories = [...categories];
      newCategories[catIndex] = { ...newCategories[catIndex], links: newLinks };
      setCategories(newCategories);
    }

    dragItem.current = null;
  };

  // --- CRUD Handlers (Existing) ---
  const handleAddLinkClick = (categoryId: string) => {
    setActiveCategoryId(categoryId);
    setIsAddLinkModalOpen(true);
    setNewLinkTitle('');
    setNewLinkUrl('');
  };

  const submitNewLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCategoryId || !newLinkTitle || !newLinkUrl) return;

    let urlToUse = newLinkUrl;
    if (!/^https?:\/\//i.test(urlToUse)) {
      urlToUse = 'https://' + urlToUse;
    }

    const newLink: Link = {
      id: Date.now().toString(),
      title: newLinkTitle,
      url: urlToUse
    };

    setCategories(prev => prev.map(cat => {
      if (cat.id === activeCategoryId) {
        return { ...cat, links: [...cat.links, newLink] };
      }
      return cat;
    }));

    setIsAddLinkModalOpen(false);
  };

  const deleteLink = (categoryId: string, linkId: string) => {
    if (!confirm(t.deleteLinkConfirm)) return;
    setCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        return { ...cat, links: cat.links.filter(l => l.id !== linkId) };
      }
      return cat;
    }));
  };

  const submitNewCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryTitle) return;

    const newCat: Category = {
      id: Date.now().toString(),
      title: newCategoryTitle,
      links: []
    };

    setCategories([...categories, newCat]);
    setIsAddCategoryModalOpen(false);
    setNewCategoryTitle('');
  };

  const deleteCategory = (categoryId: string) => {
    if (!confirm(t.deleteCategoryConfirm)) return;
    setCategories(prev => prev.filter(c => c.id !== categoryId));
  };

  const handleAddEngineClick = () => {
    setIsAddEngineModalOpen(true);
    setNewEngineName('');
    setNewEngineUrl('');
    setNewEngineIcon('');
  };

  const submitNewEngine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEngineName || !newEngineUrl) return;

    const newEngine: SearchEngine = {
      id: `custom-${Date.now()}`,
      name: newEngineName,
      searchUrl: newEngineUrl,
      icon: newEngineIcon || '🔍',
    };

    setSearchEngines([...searchEngines, newEngine]);
    setIsAddEngineModalOpen(false);
  };

  const deleteEngine = (id: string) => {
    if (searchEngines.length <= 1) {
      alert(t.minOneEngine);
      return;
    }
    if (!confirm(t.deleteEngineConfirm)) return;
    setSearchEngines(prev => prev.filter(e => e.id !== id));
  };

  return (
    <div className={`min-h-screen flex flex-col items-center p-6 relative overflow-x-hidden transition-colors duration-700 bg-[#f8f9fa] dark:bg-black ${settings.showShortcuts ? 'justify-center' : 'justify-center md:justify-start md:pt-[20vh]'}`}>

      {/* --- Wallpaper / Background --- */}
      <div className="fixed inset-0 z-0 pointer-events-none transition-all duration-1000">
        {settings.customWallpaper ? (
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
            style={{
              backgroundImage: `url(${settings.customWallpaper})`,
              filter: settings.wallpaperBlur ? 'blur(20px)' : 'none',
              transform: settings.wallpaperBlur ? 'scale(1.1)' : 'scale(1)'
            }}
          />
        ) : (
          <>
            {/* Light Mode: Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-white via-[#f8f9fa] to-[#f8f9fa] dark:opacity-0 transition-opacity duration-700" />
            {/* Dark Mode: Spotlight */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-zinc-800/20 via-black to-black opacity-0 dark:opacity-100 transition-opacity duration-700" />
          </>
        )}
        {/* Overlay for better text readability on custom wallpapers */}
        {settings.customWallpaper && <div className="absolute inset-0 bg-black/30 dark:bg-black/50" />}
      </div>

      {/* Top Controls */}
      <div className="absolute top-6 right-6 z-40 flex items-center gap-2">
        {/* Edit Toggle - Only show if shortcuts are enabled */}
        {settings.showShortcuts && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`
              p-2.5 rounded-full transition-all duration-300 backdrop-blur-sm
              ${isEditing
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black'
                : 'bg-transparent hover:bg-black/5 dark:hover:bg-white/10 text-gray-400 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200'
              }
            `}
            title={isEditing ? t.done : t.customizeLayout}
          >
            {isEditing ? <Settings2 size={20} strokeWidth={1.5} /> : <LayoutGrid size={20} strokeWidth={1.5} />}
          </button>
        )}

        {/* Settings Button */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2.5 rounded-full bg-transparent hover:bg-black/5 dark:hover:bg-white/10 text-gray-400 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 transition-all backdrop-blur-sm"
          title={t.settings}
        >
          <Settings size={20} strokeWidth={1.5} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-5xl flex flex-col items-center z-10 space-y-12 mb-20 pb-8">

        {/* Header - Clock & Greeting */}
        <div className="text-center mt-8">
          <Clock
            name={settings.greetingName}
            t={t}
            hasCustomWallpaper={!!settings.customWallpaper}
            language={settings.language}
          />
        </div>

        {/* Search Bar */}
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100">
          <SearchBar
            searchEngines={searchEngines}
            isEditing={isEditing}
            onAddEngineClick={handleAddEngineClick}
            onDeleteEngine={deleteEngine}
            openInNewTab={settings.openSearchInNewTab}
            t={t}
          />
        </div>

        {/* Categories Grid (Conditionally Rendered) */}
        {settings.showShortcuts && (
          <div className="w-full relative">
            {isEditing && (
              <div className="text-center text-xs text-gray-400 dark:text-zinc-500 mb-4 animate-pulse">
                {t.dragHint}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              {categories.map(category => (
                <CategoryGroup
                  key={category.id}
                  category={category}
                  isEditing={isEditing}
                  onAddLink={handleAddLinkClick}
                  onDeleteLink={deleteLink}
                  onDeleteCategory={deleteCategory}
                  openInNewTab={settings.openLinksInNewTab}
                  showFavicons={settings.showFavicons}
                  layoutMode={settings.layoutMode}
                  t={t}
                  onDragStart={onDragStart}
                  onDragOver={onDragOver}
                  onDrop={onDrop}
                />
              ))}

              {/* Add Category Button (Visible only in edit mode) */}
              {isEditing && (
                <button
                  onClick={() => setIsAddCategoryModalOpen(true)}
                  className="group flex flex-col items-center justify-center p-6 rounded-3xl border border-dashed border-gray-300 dark:border-zinc-800 text-gray-400 dark:text-zinc-600 hover:border-gray-400 dark:hover:border-zinc-600 hover:text-gray-600 dark:hover:text-zinc-400 transition-all h-full min-h-[160px] bg-white/30 dark:bg-black/20"
                >
                  <Plus size={24} strokeWidth={1.5} className="mb-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                  <span className="font-medium text-xs tracking-wide">{t.newCategory}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>


      {/* --- Modals --- */}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        updateSettings={updateSettings}
        t={t}
        onExport={handleExportData}
        onImport={handleImportData}
      />

      {/* Add Link Modal */}
      <Modal
        isOpen={isAddLinkModalOpen}
        onClose={() => setIsAddLinkModalOpen(false)}
        title={t.addShortcut}
      >
        <form onSubmit={submitNewLink} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">{t.title}</label>
            <input
              type="text"
              required
              value={newLinkTitle}
              onChange={(e) => setNewLinkTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-gray-400 dark:focus:border-zinc-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white transition-colors"
              placeholder="e.g., Reddit"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">{t.url}</label>
            <input
              type="text"
              required
              value={newLinkUrl}
              onChange={(e) => setNewLinkUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-gray-400 dark:focus:border-zinc-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white transition-colors"
              placeholder="reddit.com"
            />
          </div>
          <button type="submit" className="w-full py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:opacity-80 transition-opacity font-medium">
            {t.addLink}
          </button>
        </form>
      </Modal>

      {/* Add Category Modal */}
      <Modal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        title={t.newCategory}
      >
        <form onSubmit={submitNewCategory} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">{t.categoryName}</label>
            <input
              type="text"
              required
              value={newCategoryTitle}
              onChange={(e) => setNewCategoryTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-gray-400 dark:focus:border-zinc-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white transition-colors"
              placeholder="e.g., Entertainment"
            />
          </div>
          <button type="submit" className="w-full py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:opacity-80 transition-opacity font-medium">
            {t.createCategory}
          </button>
        </form>
      </Modal>

      {/* Add Search Engine Modal */}
      <Modal
        isOpen={isAddEngineModalOpen}
        onClose={() => setIsAddEngineModalOpen(false)}
        title={t.addSearchEngine}
      >
        <form onSubmit={submitNewEngine} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">{t.name}</label>
            <input
              type="text"
              required
              value={newEngineName}
              onChange={(e) => setNewEngineName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-gray-400 dark:focus:border-zinc-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white transition-colors"
              placeholder="e.g., DuckDuckGo"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">{t.searchUrl}</label>
            <p className="text-xs text-gray-500 dark:text-zinc-500 mb-2">{t.searchUrlHelp}</p>
            <input
              type="text"
              required
              value={newEngineUrl}
              onChange={(e) => setNewEngineUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-gray-400 dark:focus:border-zinc-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white transition-colors"
              placeholder="https://duckduckgo.com/?q=%s"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">{t.icon}</label>
            <p className="text-xs text-gray-500 dark:text-zinc-500 mb-2" dangerouslySetInnerHTML={{ __html: t.iconHelp }}></p>
            <input
              type="text"
              value={newEngineIcon}
              onChange={(e) => setNewEngineIcon(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-gray-400 dark:focus:border-zinc-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white transition-colors"
              placeholder="https://... or 🦆"
            />
          </div>
          <button type="submit" className="w-full py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:opacity-80 transition-opacity font-medium">
            {t.addEngine}
          </button>
        </form>
      </Modal>

      {/* About Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        t={t}
        onExportData={handleExportData}
      />

      {/* Footer - Copyright & About */}
      {settings.showFooter && (
        <footer className={`
        fixed bottom-0 left-0 right-0 z-30 py-3 px-6 flex items-center justify-center gap-4 text-xs
        backdrop-blur-sm border-t transition-all duration-300
        ${settings.customWallpaper
            ? 'text-white bg-black/40 border-white/10 [&>span]:drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] [&>button]:drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]'
            : 'text-gray-400 dark:text-zinc-600 bg-white/30 dark:bg-black/30 border-gray-100/50 dark:border-zinc-800/50'
          }
      `}>
          <span>{t.copyright}</span>
          <span className={settings.customWallpaper ? 'text-white/60' : 'text-gray-300 dark:text-zinc-700'}>|</span>
          <button
            onClick={() => setIsAboutOpen(true)}
            className={`flex items-center gap-1.5 transition-colors ${settings.customWallpaper
              ? 'hover:text-white/80'
              : 'hover:text-gray-600 dark:hover:text-zinc-400'
              }`}
          >
            <Info size={14} />
            <span>{t.about}</span>
          </button>
        </footer>)}
    </div>
  );
};

export default App;
