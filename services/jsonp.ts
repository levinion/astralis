
let callbackCount = 0;

export const fetchSuggestions = (query: string): Promise<string[]> => {
  return new Promise((resolve) => {
    if (!query) {
      resolve([]);
      return;
    }

    const callbackName = `jsonp_callback_${callbackCount++}`;
    const script = document.createElement('script');

    // Using Baidu's suggestion API as it supports JSONP reliably and has good multilingual data
    const url = `https://suggestion.baidu.com/su?wd=${encodeURIComponent(query)}&cb=${callbackName}`;

    // Define global callback
    (window as any)[callbackName] = (data: any) => {
      if (data && data.s) {
        resolve(data.s);
      } else {
        resolve([]);
      }
      cleanup();
    };

    script.src = url;
    script.onerror = () => {
      resolve([]);
      cleanup();
    };

    document.body.appendChild(script);

    function cleanup() {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      delete (window as any)[callbackName];
    }
  });
};
