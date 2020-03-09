#!/bin/bash
./build-ts.sh

./build-worker-browser.sh

./build-worker-node.sh

./build-worker-node-force-bigint-polyfill.sh

./build-sql-wasm.sh
