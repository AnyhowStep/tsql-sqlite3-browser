import * as monaco from "monaco-editor";
import "./index.css";

// @ts-ignore
self.MonacoEnvironment = {
  getWorkerUrl: function(_moduleId : any, label : string) {
    if (label === "json") {
      return "./json.worker.bundle.js";
    }
    if (label === "css") {
      return "./css.worker.bundle.js";
    }
    if (label === "html") {
      return "./html.worker.bundle.js";
    }
    if (label === "typescript" || label === "javascript") {
      return "./ts.worker.bundle.js";
    }
    return "./editor.worker.bundle.js";
  }
};

declare global {
  interface NodeRequire {
    context : any;
  }
}

const clearTsContent = require("!raw-loader!./clear-ts-content.ts");
const defaultPreTsContent = require("!raw-loader!./default-pre-ts-content.sql");
const defaultPostTsContent = require("!raw-loader!./default-post-ts-content.sql");
const defaultTsContent = require("!raw-loader!./default-ts-content.ts");
//console.log(defaultCodeContent);
const globalCodeContent = require("!raw-loader!./global.d.ts");
const typeMappingContext = require.context('!raw-loader!../../node_modules/type-mapping/src', true, /\.(ts)$/);
const squillContext = require.context('!raw-loader!../../node_modules/@squill/squill/src', true, /\.(ts)$/);
const sqlite3BrowserContext = require.context('!raw-loader!../../src/', true, /(driver|sql-wasm)\/.+\.(ts)$/);
//console.log(squillContext.keys());
//console.log(sqlite3BrowserContext.keys());

const tsEditor = monaco.editor.create(
  document.getElementById("editor")!,
  {
    value: "",
    language: "typescript",
    minimap: {
      enabled: false
    },
    //automaticLayout : true,
  }
);
tsEditor.setModel(monaco.editor.createModel(defaultTsContent.default, "typescript", monaco.Uri.parse("file:///main.ts")));

monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
  module : monaco.languages.typescript.ModuleKind.CommonJS,
  moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
  target : monaco.languages.typescript.ScriptTarget.ESNext,
  strict : true,
  alwaysStrict : true,
  strictNullChecks : true,
});
//console.log("typescriptVersion", monaco.languages.typescript.typescriptVersion);
typeMappingContext.keys().forEach((filePath : string) => {
  //console.log("file:///node_modules/type-mapping/" + filePath.replace(/^\.\//, ""));
  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    typeMappingContext(filePath).default, "file:///node_modules/type-mapping/" + filePath.replace(/^\.\//, "")
  )
});
squillContext.keys().forEach((filePath : string) => {
  //console.log("file:///node_modules/@squill/squill/" + filePath.replace(/^\.\//, ""));
  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    squillContext(filePath).default, "file:///node_modules/@squill/squill/" + filePath.replace(/^\.\//, "")
  )
});
sqlite3BrowserContext.keys().forEach((filePath : string) => {
  //console.log("file:///node_modules/@squill/sqlite3-browser/" + filePath.replace(/^\.\//, ""));
  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    sqlite3BrowserContext(filePath).default, "file:///node_modules/@squill/sqlite3-browser/" + filePath.replace(/^\.\//, "")
  )
});
monaco.languages.typescript.typescriptDefaults.addExtraLib(
  `export * from "./driver";`, "file:///node_modules/@squill/sqlite3-browser/" + "index.ts"
)
monaco.languages.typescript.typescriptDefaults.addExtraLib(
  globalCodeContent.default, "file:///global.d.ts"
)

import * as sql from "@squill/squill";
import * as sqlite3 from "../../dist/driver";
import {ExecResult} from "../../dist/sql-wasm/sql-wasm-debug";

const worker = new Worker("worker-browser.js");

const sqlite3Worker = new sqlite3.SqliteWorker({
    postMessage : worker.postMessage.bind(worker),
    setOnMessage : (onMessage) => {
        worker.onmessage = (event) => {
            onMessage(event.data);
            if (event.data.action == sqlite3.SqliteAction.CLOSE) {
                worker.terminate();
            }
        };
    },
});

const pool = new sqlite3.Pool(sqlite3Worker);

declare global {
    interface Window {
        rawQuery : (sqlString : string) => Promise<sql.RawQueryResult>;
        exec : (sqlString : string) => Promise<{ execResult : ExecResult, rowsModified : number }>;
        exportDb : () => Promise<Uint8Array>;
        importDb : (dbFile : Uint8Array) => Promise<void>;

        clearTsContent : string;
        defaultPreTsContent : string;
        defaultPostTsContent : string;
        defaultTsContent : string;

        tsEditor : monaco.editor.IStandaloneCodeEditor;

        Output : typeof Output;

        sql : typeof import("@squill/squill");
        sqlite3 : typeof import("../../dist/driver");
        pool : InstanceType<typeof import("../../dist/driver").Pool>;

    }
}

window.rawQuery = (sqlString) => pool.acquire(
    connection => connection.rawQuery(sqlString)
);

window.exec = (sqlString) => pool.acquire(
    connection => connection.exec(sqlString)
);

window.exportDb = () => pool.acquire(
    connection => connection.export()
);

window.importDb = (dbFile : Uint8Array) => pool.acquire(
    connection => connection.open(dbFile)
);

window.clearTsContent = clearTsContent.default;
window.defaultPreTsContent = defaultPreTsContent.default;
window.defaultPostTsContent = defaultPostTsContent.default;
window.defaultTsContent = defaultTsContent.default;

window.tsEditor = tsEditor;

class Output {
  resultContainer : HTMLDivElement;
  MyBigInt : any;

  resultDiv : HTMLDivElement|undefined;
  constructor (resultContainer : HTMLDivElement, MyBigInt : any) {
    this.resultContainer = resultContainer;
    this.MyBigInt = MyBigInt;
  }

  clearOutput () {
    if (this.resultDiv != undefined) {
      this.resultDiv.parentNode!.removeChild(this.resultDiv);
      this.resultDiv = undefined;
    }
    this.resultDiv = document.createElement("div");
    this.resultContainer.appendChild(this.resultDiv);
  }
  setError (err : Error) {
    console.error(err);
    this.clearOutput();
    {
      const h2 = document.createElement("h2");
      this.resultDiv!.appendChild(h2);
      h2.appendChild(document.createTextNode("Message"));
      const pre = document.createElement("pre");
      this.resultDiv!.appendChild(pre);
      pre.appendChild(document.createTextNode(err.message));
    }
    {
      const h2 = document.createElement("h2");
      this.resultDiv!.appendChild(h2);
      h2.appendChild(document.createTextNode("Stack"));
      const pre = document.createElement("pre");
      this.resultDiv!.appendChild(pre);
      pre.appendChild(document.createTextNode(err.stack!));
    }
  }

  setResult (result : { execResult : ExecResult }) {
    console.log(result);
    this.clearOutput();

    for (const resultSet of result.execResult) {
      const table = document.createElement("table");
      this.resultDiv!.appendChild(table);

      table.setAttribute("border", "1");
      table.setAttribute("cellpadding", "5");

      const thead = document.createElement("thead");
      const theadTr = document.createElement("tr");
      table.appendChild(thead);
      thead.appendChild(theadTr);

      for (const columnAlias of resultSet.columns) {
          const th = document.createElement("th");
          theadTr.appendChild(th);
          th.appendChild(document.createTextNode(columnAlias));
      }

      const tbody = document.createElement("tbody");
      table.appendChild(tbody);
      for (const row of resultSet.values) {
          const tr = document.createElement("tr");
          tbody.appendChild(tr);
          for (const col of row) {
              const td = document.createElement("td");
              tr.appendChild(td);
              td.appendChild(document.createTextNode(String(col)));
              if (col === null) {
                  td.setAttribute("style", "color:#666666");
              } else if (typeof col == "number") {
                  td.setAttribute("style", "color:#0000cc");
              } else if (typeof col == "bigint" || col instanceof this.MyBigInt) {
                  td.setAttribute("style", "color:#008800");
                  td.appendChild(document.createTextNode("n"));
              } else if (typeof col == "string") {
                  td.setAttribute("style", "color:#130700");
              } else if (col instanceof Uint8Array) {
                  td.setAttribute("style", "color:#4b5320");
                  td.prepend(document.createTextNode("Uint8Array(" + col.length + ") "));
              }
          }
      }
    }
  }

  setText (str : string) {
    console.log(str);
    this.clearOutput();
    this.resultDiv!.appendChild(document.createTextNode(str));
  }
}

window.Output = Output;


window.sql = sql;
window.sqlite3 = sqlite3;
window.pool = pool;
