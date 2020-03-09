#!/bin/bash
mkdir -p ./dist/sql-wasm

cp ./src/sql-wasm/sql-wasm-debug.wasm ./dist/worker/sql-wasm-debug.wasm

cp ./src/sql-wasm/sql-wasm-debug.d.ts ./dist/sql-wasm/sql-wasm-debug.d.ts
