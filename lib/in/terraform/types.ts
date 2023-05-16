import Parser from "web-tree-sitter";
import * as ast from "../../ast";

export interface Context {
  readonly node: Parser.SyntaxNode;
  readonly blocks: ast.Node[];
  readonly nodes: Map<number, ast.Node>;
  readonly parser: Parser;
  readonly encode: (node: ast.Node) => string;
  readonly resolve: (chunk: string) => string;
}
