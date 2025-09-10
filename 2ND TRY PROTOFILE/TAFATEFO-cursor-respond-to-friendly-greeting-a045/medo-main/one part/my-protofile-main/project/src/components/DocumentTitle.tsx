import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const routeToTitle: Record<string, string> = {
  '/': 'Home',
  '/works': 'Our Works',
  '/skills': 'Skills',
  '/about': 'About',
  '/certification': 'Certification',
  '/rating': 'Rating',
  '/talk': 'Talk',
  '/contact': 'Contact',
  '/login': 'Login',
};

const base = 'Mohamed Atef Abdelsattar - Portfolio v2';

const DocumentTitle = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    const title = routeToTitle[pathname] ? `${routeToTitle[pathname]} | ${base}` : base;
    document.title = title;
  }, [pathname]);
  return null;
};

export default DocumentTitle;

