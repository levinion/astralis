
import React from 'react';
import { Plus, Trash2, ExternalLink, GripHorizontal } from 'lucide-react';
import { Category, LayoutMode } from '../types';
import { TranslationType } from '../translations';

interface CategoryGroupProps {
  category: Category;
  isEditing: boolean;
  onDeleteLink: (categoryId: string, linkId: string) => void;
  onAddLink: (categoryId: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  openInNewTab: boolean;
  showFavicons: boolean;
  layoutMode: LayoutMode;
  t: TranslationType;
  // Drag & Drop props
  onDragStart: (e: React.DragEvent, type: 'category' | 'link', id: string, parentId?: string) => void;
  onDragOver: (e: React.DragEvent, type: 'category' | 'link', id: string) => void;
  onDrop: (e: React.DragEvent, type: 'category' | 'link', id: string, parentId?: string) => void;
}

// Internal component to handle image fallback gracefully
const Favicon: React.FC<{ url: string; title: string; className?: string }> = ({ url, title, className }) => {
  const getFaviconUrl = (u: string) => {
    try {
      const domain = new URL(u).hostname;
      return `https://ico.faviconkit.net/favicon/${domain}?sz=128`;
    } catch {
      return '';
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const ASTRALIS_ICONS_KEY = "astralis_icons"

  const fetchFavicon = async (url: string) => {
    const faviconUrl = getFaviconUrl(url)
    const proxyedUrl = 'https://corsproxy.io/?url=' + encodeURIComponent(faviconUrl);
    const response = await fetch(proxyedUrl, {
      method: 'GET',
      headers: {
        'Accept': 'image/x-icon'
      },
    });
    if (!response.ok) {
      throw new Error(`error: ${response.status}`);
    }
    let blob = await response.blob()
    let icon = await blobToBase64(blob)

    const icons = localStorage.getItem(ASTRALIS_ICONS_KEY) ?? "{}"
    let dict: { [url: string]: string } = JSON.parse(icons)
    dict[url] = icon
    localStorage.setItem(ASTRALIS_ICONS_KEY, JSON.stringify(dict))

    return icon
  }

  const getFavicon = (url: string): string | null => {
    const icons = localStorage.getItem(ASTRALIS_ICONS_KEY)
    if (icons) {
      let dict: { [url: string]: string } = JSON.parse(icons)
      if (url in dict) {
        return dict[url]
      }
    }
    fetchFavicon(url).then(icon => { return icon }).catch(_ => { return null })
  }

  const icon = getFavicon(url);

  if (icon) {
    return (
      <img
        src={icon}
        alt=""
        className={`object-contain rounded-md ${className}`}
      />
    );
  } else {
    return (
      <div className={`flex items-center justify-center bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500 rounded-full ${className}`}>
        <span className="font-bold uppercase text-xs sm:text-sm">{title.charAt(0)}</span>
      </div>
    );
  }
};

export const CategoryGroup: React.FC<CategoryGroupProps> = ({
  category,
  isEditing,
  onDeleteLink,
  onAddLink,
  onDeleteCategory,
  openInNewTab,
  showFavicons,
  layoutMode,
  t,
  onDragStart,
  onDragOver,
  onDrop
}) => {

  // Grid configuration based on layout mode
  const gridClasses = {
    card: 'grid-cols-3 sm:grid-cols-3 gap-3',
    list: 'grid-cols-1 gap-2',
    compact: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2'
  }[layoutMode];

  return (
    <div
      className={`bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl rounded-3xl p-5 shadow-sm border border-white/50 dark:border-zinc-800/50 transition-all duration-300 relative group h-fit flex flex-col
          ${isEditing ? 'cursor-move hover:border-dashed hover:border-gray-400 dark:hover:border-zinc-600' : ''}
        `}
      draggable={isEditing}
      onDragStart={(e) => onDragStart(e, 'category', category.id)}
      onDragOver={(e) => onDragOver(e, 'category', category.id)}
      onDrop={(e) => onDrop(e, 'category', category.id)}
    >

      {/* Category Header */}
      <div className="flex justify-between items-center mb-4 pl-1">
        <h3 className="font-semibold text-gray-700 dark:text-zinc-200 text-sm tracking-wide flex items-center gap-2 select-none">
          {isEditing && <GripHorizontal size={14} className="text-gray-400" />}
          {category.title}
          <span className="text-[10px] bg-gray-100 dark:bg-zinc-800 text-gray-400 px-1.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            {category.links.length}
          </span>
        </h3>
        {isEditing && (
          <button
            onClick={() => onDeleteCategory(category.id)}
            className="text-gray-400 hover:text-red-500 dark:text-zinc-600 dark:hover:text-red-400 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            title="Delete Category"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div className={`grid ${gridClasses}`}>
        {category.links.map((link) => (
          <div
            key={link.id}
            className={`relative group/link w-full ${isEditing ? 'cursor-grab active:cursor-grabbing' : ''}`}
            draggable={isEditing}
            onDragStart={(e) => {
              e.stopPropagation(); // Prevent category drag
              onDragStart(e, 'link', link.id, category.id);
            }}
            onDragOver={(e) => {
              e.stopPropagation();
              onDragOver(e, 'link', link.id);
            }}
            onDrop={(e) => {
              e.stopPropagation();
              onDrop(e, 'link', link.id, category.id);
            }}
          >
            <a
              href={link.url}
              target={isEditing ? "_self" : (openInNewTab ? "_blank" : "_self")}
              rel={openInNewTab ? "noopener noreferrer" : undefined}
              onClick={(e) => isEditing && e.preventDefault()}
              className={`
                flex items-center relative overflow-hidden transition-all duration-200 w-full outline-none focus-visible:ring-2 ring-blue-500/50
                ${isEditing
                  ? 'bg-gray-50/50 dark:bg-zinc-800/30 cursor-default border border-dashed border-gray-300 dark:border-zinc-700 opacity-80'
                  : 'bg-white dark:bg-zinc-800/40 border border-transparent hover:border-gray-200 dark:hover:border-zinc-700 hover:shadow-lg dark:hover:shadow-black/40 hover:bg-white dark:hover:bg-zinc-800'
                }
                
                ${layoutMode === 'card' ? `
                  flex-col p-4 aspect-4/3 rounded-2xl gap-3 justify-center
                ` : ''}

                ${layoutMode === 'list' ? `
                  flex-row p-3 h-14 rounded-xl gap-4 justify-start px-4
                ` : ''}

                ${layoutMode === 'compact' ? `
                  flex-row p-2 h-10 rounded-lg gap-2 justify-center
                ` : ''}
              `}
            >
              {/* --- Icon Rendering --- */}
              {showFavicons && (
                <div className={`
                  flex items-center justify-center shrink-0 transition-transform duration-300 group-hover/link:scale-110
                  ${layoutMode === 'card' ? 'w-10 h-10 shadow-sm rounded-xl' : ''}
                  ${layoutMode === 'list' ? 'w-6 h-6' : ''}
                  ${layoutMode === 'compact' ? 'w-4 h-4' : ''}
                `}>
                  <Favicon
                    url={link.url}
                    title={link.title}
                    className="w-full h-full"
                  />
                </div>
              )}

              {/* --- Text Rendering --- */}
              <div className={`
                 flex flex-col overflow-hidden
                 ${layoutMode === 'card' ? 'items-center text-center w-full' : ''}
                 ${layoutMode === 'list' ? 'items-start flex-1' : ''}
                 ${layoutMode === 'compact' ? 'items-center max-w-full' : ''}
              `}>
                <span className={`
                  font-medium truncate w-full text-gray-700 dark:text-zinc-200 group-hover/link:text-blue-600 dark:group-hover/link:text-blue-400 transition-colors
                  ${layoutMode === 'card' ? (showFavicons ? 'text-xs' : 'text-sm font-semibold') : ''}
                  ${layoutMode === 'list' ? 'text-sm' : ''}
                  ${layoutMode === 'compact' ? 'text-xs' : ''}
                `}>
                  {link.title}
                </span>

                {/* URL Subtitle (Only for List Mode) */}
                {layoutMode === 'list' && (
                  <span className="text-[10px] text-gray-400 dark:text-zinc-500 truncate w-full max-w-[200px]">
                    {new URL(link.url).hostname.replace('www.', '')}
                  </span>
                )}
              </div>

              {/* Hover Indicator (Only List Mode) */}
              {!isEditing && layoutMode === 'list' && (
                <ExternalLink size={12} className="opacity-0 group-hover/link:opacity-100 text-gray-300 dark:text-zinc-600 absolute right-3 transition-opacity" />
              )}
            </a>

            {/* Delete Button (Edit Mode) */}
            {isEditing && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteLink(category.id, link.id);
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 hover:scale-110 transition-all z-20"
              >
                <Plus size={12} className="rotate-45" />
              </button>
            )}
          </div>
        ))}

        {/* --- Add Button (Edit Mode) --- */}
        {isEditing && (
          <button
            onClick={() => onAddLink(category.id)}
            className={`
              flex items-center justify-center rounded-xl border-2 border-dashed border-gray-200 dark:border-zinc-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group/add w-full
              text-gray-400 dark:text-zinc-600 hover:text-blue-500 dark:hover:text-blue-400
              ${layoutMode === 'card' ? 'aspect-4/3 rounded-2xl flex-col gap-2' : ''}
              ${layoutMode === 'list' ? 'h-14 rounded-xl' : ''}
              ${layoutMode === 'compact' ? 'h-10 rounded-lg' : ''}
            `}
          >
            <Plus size={layoutMode === 'card' ? 20 : 16} />
            {layoutMode === 'card' && <span className="text-xs font-medium">{t.add}</span>}
          </button>
        )}
      </div>
    </div>
  );
};
