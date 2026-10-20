import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

export default function Html({ children }: PropsWithChildren) {
  return <html lang="ko">
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      <ScrollViewStyleReset />
      <style dangerouslySetInnerHTML={{ __html: `
        html, body { width: 100%; min-width: 100%; min-height: 100%; margin: 0; background: #0D1420; }
        body { overflow-x: hidden; }
        #root, #root > div { width: 100vw !important; min-width: 100vw !important; max-width: none !important; min-height: 100vh; }
      ` }} />
    </head>
    <body>{children}</body>
  </html>;
}
