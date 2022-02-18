import {
  Links,
  LinksFunction,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration
} from "remix";
import type { MetaFunction } from "remix";
import GlobalStyles from './global-styles';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

/*
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black">
<meta name="apple-mobile-web-app-title" content="Zélo">
<meta name="theme-color" content="#ffffff">
*/

export const meta: MetaFunction = () => {
  return { 
    title: "New Remix App",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black",
    "apple-mobile-web-app-title": "Minitello",
    "theme-color": "#ffffff",
  };
};

/*
<link rel="apple-touch-startup-image" href="/images/favicons/launch.png">
<link rel="icon" type="image/png" size="256x256" href="/images/favicons/android-chrome-256x256.png">
<link rel="icon" type="image/png" size="192x192" href="/images/favicons/android-chrome-192x192.png">
<link rel="icon" type="image/png" size="150x150" href="/images/favicons/mstile-150x150.png">
<link rel="icon" type="image/png" size="48x48" href="/images/favicons/favicon.ico">
<link rel="apple-touch-icon" href="/images/favicons/apple-touch-icon.png">
<link rel="apple-touch-icon" sizes="180x180" href="/images/favicons/apple-touch-icon-180x180.png">
<link rel="icon" type="image/png" href="/images/favicons/favicon-32x32.png" sizes="32x32">
<link rel="icon" type="image/png" href="/images/favicons/favicon-16x16.png" sizes="16x16">
<link rel="manifest" href="/images/favicons/manifest.json">
*/

export const links: LinksFunction = () => {
  return [
    {
      rel: "stylesheet",
      href: 'https://fonts.googleapis.com/css?family=Nunito+Sans|Titillium+Web:600,800&display=swap'
    },
    {
      rel: "icon shortcut",
      href: "/icons/minitello-logo-64.png",
      type: "image/png"
    },
    {
      rel: "apple-touch-startup-image",
      href: "/icons/minitello-logo-1024.png"
    },
    {
      rel: "icon",
      type: "image/png",
      size: "256x256",
      href: "/icons/minitello-logo-256.png"
    },
    {
      rel: "icon",
      type: "image/png",
      size: "192x192",
      href: "/icons/minitello-logo-192.png"
    },
    {
      rel: "icon",
      type: "image/png",
      size: "150x150",
      href: "/icons/minitello-logo-150.png"
    },
    {
      rel: "icon",
      type: "image/png",
      size: "48x48",
      href: "/icons/minitello-logo-48.png"
    },
    {
      rel: "apple-touch-icon",
      href: "/icons/minitello-logo-1024.png"
    },
    {
      rel: "apple-touch-icon",
      sizes: "32x32",
      href: "/icons/minitello-logo-32.png"
    },
    {
      rel: "apple-touch-icon",
      sizes: "64x64",
      href: "/icons/minitello-logo-64.png"
    },
    {
      rel: "manifest",
      href: "/manifest.json"
    },
  ];
};

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        
        {typeof document === "undefined"
          ? "__STYLES__"
          : null}
      </head>
      <body>
        <GlobalStyles />
        <DndProvider backend={HTML5Backend}>
          <Outlet />
        </DndProvider>
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV === "development" && <LiveReload />}
      </body>
    </html>
  );
}
