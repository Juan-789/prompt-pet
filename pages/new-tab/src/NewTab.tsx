import '@src/NewTab.css';
import '@src/NewTab.scss';

import { exampleThemeStorage } from '@extension/storage';
import { cn, ErrorDisplay, LoadingSpinner, ToggleButton } from '@extension/ui';

const NewTab = () => {
  const { isLight } = useStorage(exampleThemeStorage);

  const imageUrl = chrome.runtime.getURL('newTab_image.png');

  return (
    // We use the boilerplate's 'isLight' to switch background colors automatically
    <div className={cn('min-h-screen p-8', isLight ? 'bg-pink-100' : 'bg-gray-900')}>
      <div className="mb-10 flex justify-center">
        <div
          className={cn(
            'flex h-[200px] w-[600px] flex-col items-center justify-center border-2',
            'rounded-[100%]',
            'relative overflow-hidden',
            isLight ? 'border-pink-300 bg-white' : 'border-pink-500 bg-gray-800 text-white',
          )}>
          <img src={imageUrl} alt="WebPage Banner" className="absolute inset-0 h-full w-full object-contain" />
        </div>
      </div>

      {/* 2. MAIN GRID (Now 2 columns: one wide for Left/Middle, one narrow for Right) */}
      <div className="mx-auto grid max-w-[1600px] grid-cols-[3fr_1fr] gap-6">
        {/* LEFT + MIDDLE WRAPPER */}
        <div className="flex flex-col">
          {/* NAV TAB (The header for just these two) */}
          <div
            className={cn(
              'flex h-12 items-center rounded-none border-b-0 px-4',
              isLight ? 'border-pink-300 bg-pink-200' : 'border-gray-600 bg-gray-700 text-white',
            )}>
            <button className="border-b-2 border-pink-500 px-4 py-2 text-sm font-bold uppercase">ABOUT</button>
            <button className="px-4 py-2 text-sm font-bold uppercase opacity-50">CATS</button>
          </div>

          {/* INNER GRID (Split into Left and Middle) */}
          <div className="grid grid-cols-[1fr_2fr] gap-0">
            <div
              className={cn(
                'min-h-[600px] rounded-none border p-6',
                isLight ? 'border-pink-200 bg-white' : 'border-gray-700 bg-gray-800 text-white',
              )}>
              <h2 className="mb-4 font-bold text-pink-500">Left</h2>
            </div>

            <div
              className={cn(
                'min-h-[600px] rounded-none border border-l-0 p-6',
                isLight ? 'border-pink-200 bg-white' : 'border-gray-700 bg-gray-800 text-white',
              )}>
              <h2 className="mb-4 font-bold text-pink-500">Middle</h2>
              <ToggleButton onClick={exampleThemeStorage.toggle}>Theme</ToggleButton>
            </div>
          </div>
        </div>

        {/* 3. RIGHT SECTION (Standing alone) */}
        <div
          className={cn(
            'min-h-[600px] rounded-none border p-6',
            isLight ? 'border-pink-200 bg-white' : 'border-gray-700 bg-gray-800 text-white',
          )}>
          <h2 className="mb-4 font-bold text-pink-500">PROMP-ENGINEERING</h2>
        </div>
      </div>
    </div>
  );
};

/*
  const logo = isLight ? 'new-tab/logo_horizontal.svg' : 'new-tab/logo_horizontal_dark.svg';

  const goGithubSite = () => chrome.tabs.create(PROJECT_URL_OBJECT);

  console.log(t('hello', 'World'));
  return (
    <div className={cn('App', isLight ? 'bg-slate-50' : 'bg-gray-800')}>
      <header className={cn('App-header', isLight ? 'text-gray-900' : 'text-gray-100')}>
        <button onClick={goGithubSite}>
          <img src={chrome.runtime.getURL(logo)} className="App-logo" alt="logo" />
        </button>
        <p>
          Edit <code>pages/new-tab/src/NewTab.tsx</code>
        </p>
        <h6>The color of this paragraph is defined using SASS.</h6>
        <ToggleButton onClick={exampleThemeStorage.toggle}>{t('toggleTheme')}</ToggleButton>
      </header>
    </div>
  );
};

*/

export default withErrorBoundary(withSuspense(NewTab, <LoadingSpinner />), ErrorDisplay);
