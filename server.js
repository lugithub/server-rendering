import Express from 'express';

import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';

import { renderToString } from 'react-dom/server';

import counterApp from './app/reducers';
import Counter from './app/containers/Counter';

const app = Express();
const port = 3000;

//Serve static files
app.use('/dist', Express.static('dist'));

// This is fired every time the server side receives a request
app.use(handleRender);

function handleRender(req, res) {
  const preloadedState = parseInt(req.query.counter, 10) || void 0;
  const store = createStore(counterApp, preloadedState);

  // Render the component to a string
  const html = renderToString(
    <Provider store={store}>
      <Counter />
    </Provider>
  )

  const finalState = store.getState()

  // Send the rendered page back to the client
  res.send(renderFullPage(html, finalState))
}

function renderFullPage(html, preloadedState) {
  return `
    <!doctype html>
    <html>
      <head>
        <title>Redux Universal Example</title>
      </head>
      <body>
        <div id="root">${html}</div>
        <script>
          // WARNING: See the following for security issues around embedding JSON in HTML:
          // http://redux.js.org/docs/recipes/ServerRendering.html#security-considerations
          window.__PRELOADED_STATE__ = ${JSON.stringify(preloadedState).replace(/</g, '\\u003c')}
        </script>
        <script src="/dist/index_bundle.js"></script>
      </body>
    </html>
    `
}

app.listen(port);
