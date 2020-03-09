#!/bin/bash
WEBPACK_MODE=development webpack --config ./test-browser/webpack.config.js --mode=development

cp ./dist/worker/worker-browser.js ./test-browser/public/worker-browser.js

cp ./dist/worker/sql-wasm-debug.wasm ./test-browser/public/sql-wasm-debug.wasm
