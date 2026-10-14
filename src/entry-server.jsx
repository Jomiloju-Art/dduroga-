/**
 * Server render for the build only (scripts/postbuild.mjs).
 *
 * Writes each route's page text into its static HTML, so a crawler that does
 * not run JavaScript (and Google on its first pass) reads the real content,
 * not an empty <div id="root">. In the browser the app renders fresh over it
 * with createRoot, so this markup never has to match the client exactly.
 */
import { Writable } from 'node:stream';
import { renderToPipeableStream } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import App from './App.jsx';

export function render(url) {
  return new Promise((resolve, reject) => {
    let html = '';
    const sink = new Writable({ write(chunk, _enc, done) { html += chunk; done(); } });
    sink.on('finish', () => resolve(html));
    const { pipe, abort } = renderToPipeableStream(
      <StaticRouter location={url}><App /></StaticRouter>,
      { onAllReady() { pipe(sink); }, onShellError: reject, onError() {} },
    );
    setTimeout(() => abort(), 10000);
  });
}
