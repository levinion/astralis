
import React, { useRef } from 'react';
import { X, Moon, Sun, Monitor, Globe, Layout, Image, Zap, Download, Upload, User, Type } from 'lucide-react';
import { TranslationType } from '../translations';
import { AppSettings, Theme, Language, LayoutMode, BackgroundMode } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  updateSettings: (key: keyof AppSettings, value: any) => void;
  t: TranslationType;
  onExport: () => void;
  onImport: (file: File) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  updateSettings,
  t,
  onExport,
  onImport
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImport(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-zinc-800">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{t.settings}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8 max-h-[80vh] overflow-y-auto custom-scrollbar">

          {/* Appearance Section */}
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Moon size={14} />
            {t.theme}
          </h4>

          {/* Theme Selector */}
          <div className="grid grid-cols-3 gap-2 bg-gray-100 dark:bg-black p-1 rounded-xl border dark:border-zinc-800 mb-6">
            {(['light', 'dark', 'system'] as Theme[]).map((theme) => (
              <button
                key={theme}
                onClick={() => updateSettings('theme', theme)}
                className={`
                    flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all
                    ${settings.theme === theme
                    ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-500 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300'
                  }
                  `}
              >
                {theme === 'light' && <Sun size={14} />}
                {theme === 'dark' && <Moon size={14} />}
                {theme === 'system' && <Monitor size={14} />}
                <span className="capitalize">{t[theme]}</span>
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-zinc-800" />

          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Moon size={14} />
            {t.layout}
          </h4>

          <div className="space-y-4 mb-4">
            {/* Show Shortcuts Toggle */}
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-3 text-gray-700 dark:text-zinc-200">
                <Zap size={18} className="text-gray-400 dark:text-zinc-500" />
                <span>{t.showShortcuts}</span>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.showShortcuts}
                  onChange={(e) => updateSettings('showShortcuts', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-blue-600"></div>
              </div>
            </label>

            {/* Show Favicons Toggle */}
            {settings.showShortcuts && (
              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3 text-gray-700 dark:text-zinc-200">
                  <Image size={18} className="text-gray-400 dark:text-zinc-500" />
                  <span>{t.showFavicons}</span>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.showFavicons}
                    onChange={(e) => updateSettings('showFavicons', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-blue-600"></div>
                </div>
              </label>
            )}

            {/* Layout Mode Selector */}
            {settings.showShortcuts && (
              <div className="mb-6">
                <div className="grid grid-cols-3 gap-2 bg-gray-100 dark:bg-black p-1 rounded-xl border dark:border-zinc-800">
                  {(['card', 'list', 'compact'] as LayoutMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => updateSettings('layoutMode', mode)}
                      className={`
                        flex flex-col items-center justify-center gap-1 py-2 text-xs font-medium rounded-lg transition-all
                        ${settings.layoutMode === mode
                          ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm'
                          : 'text-gray-500 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300'
                        }
                      `}
                    >
                      <Layout size={16} />
                      <span className="capitalize">{t[mode]}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Show Footer Toggle */}
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-3 text-gray-700 dark:text-zinc-200">
                <Zap size={18} className="text-gray-400 dark:text-zinc-500" />
                <span>{t.showFooter}</span>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.showFooter}
                  onChange={(e) => updateSettings('showFooter', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-blue-600"></div>
              </div>
            </label>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-zinc-800" />

          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Moon size={14} />
            {t.background}
          </h4>

          <div className="mb-6">
            <div className="grid grid-cols-3 gap-2 bg-gray-100 dark:bg-black p-1 rounded-xl border dark:border-zinc-800">
              {(["default", "color", "image"] as BackgroundMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => updateSettings('backgroundMode', mode)}
                  className={`
                        flex flex-col items-center justify-center gap-1 py-2 text-xs font-medium rounded-lg transition-all
                        ${settings.backgroundMode === mode
                      ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-500 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300'
                    }
                      `}
                >
                  <Layout size={16} />
                  <span className="capitalize">{t[mode]}</span>
                </button>
              ))}
            </div>
          </div>

          {settings.backgroundMode === "color" && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">{t.light}</label>
                <input
                  type="text"
                  value={settings.backgroundColorLight || ''}
                  onChange={(e) => updateSettings('backgroundColorLight', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-blue-500 bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white"
                  placeholder="#eff1f5"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">{t.dark}</label>
                <input
                  type="text"
                  value={settings.backgroundColorDark || ''}
                  onChange={(e) => updateSettings('backgroundColorDark', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-blue-500 bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white"
                  placeholder="#181825"
                />
              </div>
            </>
          )}

          {settings.backgroundMode === "image" && (
            <>
              {/* Custom Wallpaper */}
              < label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">{t.wallpaperUrl}</label>
              <input
                type="text"
                value={settings.customWallpaper || ''}
                onChange={(e) => updateSettings('customWallpaper', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-blue-500 bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white"
                placeholder="https://images.unsplash.com/..."
              />
              <p className="text-[10px] text-gray-400 mt-1">{t.wallpaperUrlHelp}</p>

              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3 text-gray-700 dark:text-zinc-200">
                  <span className="text-sm">{t.blurWallpaper}</span>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.wallpaperBlur}
                    onChange={(e) => updateSettings('wallpaperBlur', e.target.checked)}
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-zinc-600 peer-checked:bg-blue-600"></div>
                </div>
              </label>
            </>
          )}

          <div className="pt-4 border-t border-gray-100 dark:border-zinc-800" />

          {/* Personalization Section */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <User size={14} />
              {t.personalization}
            </h4>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">{t.greetingName}</label>
              <input
                type="text"
                value={settings.greetingName || ''}
                onChange={(e) => updateSettings('greetingName', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-blue-500 bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white"
                placeholder="e.g. Alex"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-zinc-800" />

          {/* General Section */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Layout size={14} />
              {t.general}
            </h4>

            <div className="space-y-4">
              {/* Language */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-gray-700 dark:text-zinc-200">
                  <Globe size={18} className="text-gray-400 dark:text-zinc-500" />
                  <span>{t.selectLanguage}</span>
                </div>
                <div className="flex bg-gray-100 dark:bg-black rounded-lg p-1 border dark:border-zinc-800">
                  {(['en', 'zh'] as Language[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => updateSettings('language', lang)}
                      className={`
                        px-3 py-1 text-xs font-medium rounded-md transition-all
                        ${settings.language === lang
                          ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm'
                          : 'text-gray-500 dark:text-zinc-500'
                        }
                      `}
                    >
                      {lang === 'en' ? 'EN' : '中'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Open Search in New Tab Toggle */}
              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3 text-gray-700 dark:text-zinc-200">
                  <Globe size={18} className="text-gray-400 dark:text-zinc-500" />
                  <span>{t.openSearchInNewTab}</span>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.openSearchInNewTab}
                    onChange={(e) => updateSettings('openSearchInNewTab', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-blue-600"></div>
                </div>
              </label>

              {/* Open Links in New Tab Toggle */}
              {settings.showShortcuts && (
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-3 text-gray-700 dark:text-zinc-200">
                    <Globe size={18} className="text-gray-400 dark:text-zinc-500" />
                    <span>{t.openLinksInNewTab}</span>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.openLinksInNewTab}
                      onChange={(e) => updateSettings('openLinksInNewTab', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-blue-600"></div>
                  </div>
                </label>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-zinc-800" />

          {/* Data Management Section */}
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Download size={14} />
            {t.dataManagement}
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onExport}
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 rounded-xl hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors text-sm font-medium"
            >
              <Download size={16} />
              {t.exportData}
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 rounded-xl hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors text-sm font-medium"
            >
              <Upload size={16} />
              {t.importData}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".json"
            />
          </div>

        </div>
      </div>
    </div >
  );
};
