import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="ru">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="NEON GEO" />
        <meta name="theme-color" content="#05050F" />
        <title>NEON GEO</title>
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body, #root {
                background-color: #05050F;
                overscroll-behavior: none;
                touch-action: none;
                user-select: none;
                -webkit-user-select: none;
                -webkit-touch-callout: none;
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
