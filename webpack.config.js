const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = (env, argv) => {
  /** @type {webpack.Configuration} */
  const config = {
    mode: argv.mode === "development" ? "development" : "production",
    entry: "./lib/index.ts",
    target: "node",
    devtool: false,
    output: {
      path: path.resolve(__dirname, "dist"),
      library: {
        commonjs: "tf2cwe",
        amd: "tf2cwe",
        root: "TF2CWE",
      },
      libraryTarget: "umd",
      umdNamedDefine: true,
      globalObject: `(typeof self !== 'undefined' ? self : this)`,
      filename: "main.js",
    },
    plugins: [
      new AfterBuild((compiler) => {
        const pkg = require("./package.json");
        delete pkg.scripts;
        delete pkg.devDependencies;
        delete pkg.overrides;
        fs.writeFileSync(path.resolve(compiler.options.output.path, "package.json"), JSON.stringify(pkg, undefined, 2));
      }),
      new CopyPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, "node_modules/web-tree-sitter/tree-sitter.wasm"),
            to: path.resolve(__dirname, "dist/tree-sitter.wasm"),
          },
          {
            from: path.resolve(__dirname, "lib/tree-sitter-hcl.wasm"),
            to: path.resolve(__dirname, "dist/tree-sitter-hcl.wasm"),
          },
        ],
      }),
    ],
    optimization: {
      minimize: true,
      nodeEnv: false,
    },
    node: {
      global: false,
      __dirname: false,
      __filename: false,
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/i,
          loader: "ts-loader",
          exclude: ["/node_modules/"],
        },
      ],
    },
    externalsPresets: { node: true },
    resolve: {
      extensions: [".ts", ".js"],
    },
  };
  return [config];
};

class AfterBuild {
  constructor(callback) {
    if (typeof callback !== "function") {
      throw new Error("After Build Plugin requires a callback function");
    }
    this.callback = callback;
  }
  apply(compiler) {
    if (process.env.WEBPACK_WATCH) {
      return compiler.hooks.watchClose.tap("AfterBuild", (stats) => {
        this.callback(compiler, stats);
      });
    }
    return compiler.hooks.done.tap("AfterBuild", (stats) => {
      this.callback(compiler, stats);
    });
  }
}
