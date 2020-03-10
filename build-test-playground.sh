#!/bin/bash
./node_modules/.bin/webpack --config ./test-playground/webpack.config.js  --mode=development

cp ./dist/worker/worker-browser.js ./test-playground/public/worker-browser.js

cp ./dist/worker/sql-wasm-debug.wasm ./test-playground/public/sql-wasm-debug.wasm
