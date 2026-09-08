import { Studio } from 'sanity';
import { createHashHistory, type History, type Listener } from 'history';
import config from '../../../sanity.config';

function createHashHistoryForStudio(): History {
  if (typeof window !== 'undefined') {
    const hash = window.location.hash;
    if (!hash || hash === '#' || hash === '#/') {
      if (window.history?.replaceState) {
        window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#/studio`);
      } else {
        window.location.hash = '/studio';
      }
    }
  }

  const history = createHashHistory();

  if (typeof window !== 'undefined' && (!history.location.pathname || history.location.pathname === '/')) {
    history.replace('/studio');
  }

  return {
    get action() { return history.action; },
    get location() { return history.location; },
    get createHref() { return history.createHref; },
    get push() { return history.push; },
    get replace() { return history.replace; },
    get go() { return history.go; },
    get back() { return history.back; },
    get forward() { return history.forward; },
    get block() { return history.block; },
    listen(listener: Listener) {
      return history.listen((update: any) => {
        if (typeof listener === 'function') {
          const location = update?.location || history.location;
          const action = update?.action || history.action;
          const composite = Object.assign({}, location, update, {
            location,
            action,
          });
          try {
            (listener as any)(composite, action);
          } catch {
            try {
              (listener as any)(update);
            } catch {
              (listener as any)(location);
            }
          }
        }
      });
    },
  };
}

function installLinkInterceptor(history: History) {
  if (typeof window === 'undefined' || (window as any).__sanity_studio_click_installed) return;
  (window as any).__sanity_studio_click_installed = true;

  document.addEventListener(
    'click',
    (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }

      const anchor = (e.target as HTMLElement)?.closest('a');
      if (!anchor) return;

      const target = anchor.getAttribute('target');
      if (target && target !== '_self') return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      if (href.startsWith('/studio') && !href.startsWith('/studio#')) {
        e.preventDefault();
        history.push(href);
      }
    },
    { capture: true }
  );
}

let cachedHistory: History | null = null;
function getStudioHistory(): History | undefined {
  if (typeof window === 'undefined') return undefined;
  if (!cachedHistory) {
    cachedHistory = createHashHistoryForStudio();
    installLinkInterceptor(cachedHistory);
  }
  return cachedHistory;
}

export default function SanityStudio() {
  const history = getStudioHistory();

  return (
    <div style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Studio config={config} unstable_history={history} />
    </div>
  );
}

