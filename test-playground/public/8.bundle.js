(self["webpackJsonp"] = self["webpackJsonp"] || []).push([[8],{

/***/ "./node_modules/monaco-editor/esm/vs/basic-languages/azcli/azcli.js":
/*!**************************************************************************!*\
  !*** ./node_modules/monaco-editor/esm/vs/basic-languages/azcli/azcli.js ***!
  \**************************************************************************/
/*! exports provided: conf, language */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"conf\", function() { return conf; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"language\", function() { return language; });\n/*---------------------------------------------------------------------------------------------\r\n *  Copyright (c) Microsoft Corporation. All rights reserved.\r\n *  Licensed under the MIT License. See License.txt in the project root for license information.\r\n *--------------------------------------------------------------------------------------------*/\r\n\r\nvar conf = {\r\n    comments: {\r\n        lineComment: '#',\r\n    }\r\n};\r\nvar language = {\r\n    defaultToken: 'keyword',\r\n    ignoreCase: true,\r\n    tokenPostfix: '.azcli',\r\n    str: /[^#\\s]/,\r\n    tokenizer: {\r\n        root: [\r\n            { include: '@comment' },\r\n            [/\\s-+@str*\\s*/, {\r\n                    cases: {\r\n                        '@eos': { token: 'key.identifier', next: '@popall' },\r\n                        '@default': { token: 'key.identifier', next: '@type' }\r\n                    }\r\n                }],\r\n            [/^-+@str*\\s*/, {\r\n                    cases: {\r\n                        '@eos': { token: 'key.identifier', next: '@popall' },\r\n                        '@default': { token: 'key.identifier', next: '@type' }\r\n                    }\r\n                }]\r\n        ],\r\n        type: [\r\n            { include: '@comment' },\r\n            [/-+@str*\\s*/, {\r\n                    cases: {\r\n                        '@eos': { token: 'key.identifier', next: '@popall' },\r\n                        '@default': 'key.identifier'\r\n                    }\r\n                }],\r\n            [/@str+\\s*/, {\r\n                    cases: {\r\n                        '@eos': { token: 'string', next: '@popall' },\r\n                        '@default': 'string'\r\n                    }\r\n                }]\r\n        ],\r\n        comment: [\r\n            [/#.*$/, {\r\n                    cases: {\r\n                        '@eos': { token: 'comment', next: '@popall' }\r\n                    }\r\n                }]\r\n        ]\r\n    }\r\n};\r\n\n\n//# sourceURL=webpack:///./node_modules/monaco-editor/esm/vs/basic-languages/azcli/azcli.js?");

/***/ })

}]);