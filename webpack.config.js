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
      path: path.resolve(__dirname, "dist", "lib"),
      library: {
        commonjs: "tf2cwe",
        amd: "tf2cwe",
        root: "TF2CWE",
      },
      libraryTarget: "umd",
      umdNamedDefine: true,
      globalObject: `(typeof self !== 'undefined' ? self : this)`,
      filename: "index.js",
    },
    plugins: [
      new AfterBuild(() => {
        const pkg = require("./package.json");
        delete pkg.scripts;
        delete pkg.devDependencies;
        delete pkg.overrides;
        fs.writeFileSync(path.resolve(__dirname, "dist", "package.json"), JSON.stringify(pkg, undefined, 2));
      }),
      new CopyPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, "node_modules", "web-tree-sitter", "tree-sitter.wasm"),
            to: path.resolve(__dirname, "dist", "lib", "tree-sitter.wasm"),
          },
          {
            from: path.resolve(__dirname, "tree-sitter-hcl.wasm"),
            to: path.resolve(__dirname, "dist", "tree-sitter-hcl.wasm"),
          },
        ],
      }),
    ],
    optimization: {
      minimize: argv.mode === "development" ? false : true,
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
  const bin = {
    mode: argv.mode === "development" ? "development" : "production",
    entry: "./bin/tf2cwe.ts",
    target: "node",
    devtool: false,
    output: {
      path: path.resolve(__dirname, "dist", "bin"),
      globalObject: `(typeof self !== 'undefined' ? self : this)`,
      filename: "tf2cwe.js",
    },
    externals: [
      {
        "../lib/index": "require('../lib/index')",
      },
    ],

    plugins: [],
    optimization: {
      minimize: argv.mode === "development" ? false : true,
      nodeEnv: false,
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
  return [config, bin];
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
