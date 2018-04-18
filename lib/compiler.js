"use strict";

var getBabelConfig = require('./getBabelConfig');

var babelConfig = getBabelConfig();
babelConfig.plugin = babelConfig.plugin.concat(require.resolve('babel-plugin-istanbul'));

require('@babel/register')(babelConfig);

var noop = function noop() {
  return null;
};

['.css', '.less', '.html', 'htm'].forEach(function (ext) {
  require.extensions[ext] = noop;
});

var _require = require('jsdom'),
    jsdom = _require.jsdom;

global.document = jsdom('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost'
});
global.window = global.document.defaultView;
global.navigator = global.window.navigator;