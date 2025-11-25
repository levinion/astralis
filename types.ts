
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

export type BackgroundMode = 'default' | 'color' | 'image';

export interface AppSettings {
  language: Language;
  searchEngine: "duckduckgo" | "google" | "baidu" | "bing";
  theme: Theme;
  layoutMode: LayoutMode;
  backgroundMode: BackgroundMode;
  showFavicons: boolean;
  showShortcuts: boolean;
  showFooter: boolean;
  openSearchInNewTab: boolean;
  openLinksInNewTab: boolean;
  backgroundColorLight: string;
  backgroundColorDark: string;
  customWallpaper: string;
  wallpaperBlur: boolean;
  greetingName: string;
}
