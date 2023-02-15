const fs = require('fs')
const path = require('path')
const Parser = require('web-tree-sitter');

(async () => {
  await Parser.init();
  const parser = new Parser();
  const language = await Parser.Language.load(
    path.resolve(__dirname, "tree-sitter-hcl.wasm"),
  );
  parser.setLanguage(language);

  const sourceCode = await fs.promises.readFile(path.resolve(__dirname, 'test', 'terraform', 'main.tf'), {encoding: 'utf-8'})
  const tree = parser.parse(sourceCode);
  console.log(tree.rootNode.toString())
})();
