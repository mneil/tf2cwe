import path from "path";
import Parser from "web-tree-sitter";

// have to build this first
const LANGUAGE_WASM = path.resolve(__dirname, "..", "tree-sitter-go.wasm");

const createParser = async (): Promise<Parser> => {
  await Parser.init();
  const parser = new Parser();
  const language = await Parser.Language.load(LANGUAGE_WASM);
  parser.setLanguage(language);
  return parser;
};
