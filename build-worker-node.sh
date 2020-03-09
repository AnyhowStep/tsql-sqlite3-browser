#!/bin/bash
mkdir -p ./dist/worker

cat \
./dist/worker-node/pre.js \
./dist/worker-browser/base-64-polyfill.js \
./src/sql-wasm/sql-wasm-debug.js \
./dist/worker-browser/body.js \
./dist/worker-node/post.js \
> ./dist/worker/worker-node.js
