module.exports = {
  mode: "development",
  entry: {
    app: `${__dirname}/src/index.ts`,
    "editor.worker": "monaco-editor/esm/vs/editor/editor.worker.js",
    "json.worker": "monaco-editor/esm/vs/language/json/json.worker",
    "css.worker": "monaco-editor/esm/vs/language/css/css.worker",
    "html.worker": "monaco-editor/esm/vs/language/html/html.worker",
    "ts.worker": `${__dirname}/esm/ts.worker`
  },
  resolve: {
    extensions: [".ts", ".js"]
  },
  output: {
    globalObject: "self",
    filename: "[name].bundle.js",
    path : `${__dirname}/public`,
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: `ts-loader?configFile=${__dirname}/tsconfig.json`,
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.ttf$/,
        use: ['file-loader']
      }
    ]
  },
  plugins: [
  ]
};
