import Parser from "web-tree-sitter";
import * as ast from "../../ast";

export interface Context {
  readonly node: Parser.SyntaxNode;
  readonly blocks: ast.Node[];
  readonly parser: Parser;
  // readonly blockCache: Map<number, Block>;
  // readonly blockRoots: Set<number>;
}
