
export interface Link {
  id: string;
  title: string;
  url: string;
}

export interface Category {
  id: string;
  title: string;
  links: Link[];
}

export interface SearchEngine {
  id: string;
  name: string;
  searchUrl: string; // URL with %s for query
  icon: string; // Emoji or generic name for icon mapping
}

export type SearchMode = 'web' | 'ai';

export type Language = 'en' | 'zh';

export type Theme = 'system' | 'light' | 'dark';

export type LayoutMode = 'card' | 'list' | 'compact';

export interface AppSettings {
  language: Language;
  theme: Theme;
  layoutMode: LayoutMode;
  showFavicons: boolean;
  showShortcuts: boolean;
  showFooter: boolean;
  openSearchInNewTab: boolean;
  openLinksInNewTab: boolean;
  customWallpaper: string;
  wallpaperBlur: boolean;
  greetingName: string;
}
