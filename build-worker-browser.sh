#!/bin/bash
mkdir -p ./dist/worker

cat \
./dist/worker-browser/base-64-polyfill.js \
./src/sql-wasm/sql-wasm-debug.js \
./dist/worker-browser/pre.js \
./dist/worker-browser/body.js \
> ./dist/worker/worker-browser.js
