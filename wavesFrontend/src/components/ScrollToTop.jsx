import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Renders nothing - just scrolls the window to the top whenever the route pathname changes,
// so navigating between pages (e.g. Home -> Product Details) doesn't leave the scroll
// position wherever it happened to be on the previous page.
export default function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}
