import { createContext, useContext, useEffect, useState } from 'react';

/*
 * Tiny hash-based router (no dependency). Hash routing works on any static
 * host without server rewrites. Swap for react-router-dom later if you need it.
 */

const RouterContext = createContext({ path: '/', params: {} });

const readPath = () => {
  const raw = window.location.hash.replace(/^#/, '');
  return raw || '/';
};

export function navigate(to) {
  if (readPath() === to) {
    window.scrollTo(0, 0);
    return;
  }
  window.location.hash = to;
}

export function matchPath(pattern, path) {
  const p = pattern.split('/').filter(Boolean);
  const s = path.split('?')[0].split('/').filter(Boolean);
  if (p.length !== s.length) return null;
  const params = {};
  for (let i = 0; i < p.length; i += 1) {
    if (p[i].startsWith(':')) params[p[i].slice(1)] = decodeURIComponent(s[i]);
    else if (p[i] !== s[i]) return null;
  }
  return params;
}

export function Router({ routes, fallback: Fallback }) {
  const [path, setPath] = useState(readPath());

  useEffect(() => {
    const onChange = () => {
      setPath(readPath());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  for (const [pattern, Component, extra] of routes) {
    const params = matchPath(pattern, path);
    if (params) {
      return (
        <RouterContext.Provider value={{ path, params }}>
          <Component {...(extra || {})} />
        </RouterContext.Provider>
      );
    }
  }
  return (
    <RouterContext.Provider value={{ path, params: {} }}>
      <Fallback />
    </RouterContext.Provider>
  );
}

export const useRoute = () => useContext(RouterContext);

export function Link({ to, children, onClick, ...rest }) {
  return (
    <a
      href={`#${to}`}
      onClick={(e) => {
        if (onClick) onClick(e);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
