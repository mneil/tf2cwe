import assert from "assert";
import Parser from "web-tree-sitter";
import * as ast from "../../ast";
import { Context } from "./types";
import { emitExpression } from "./expression";

enum Local {
  Body = "body",
  Attribute = "attribute",
  Expression = "expression",
}

export function emitBlockLocal(context: Context, node: Parser.SyntaxNode): ast.Node {
  const body = node.namedChildren.filter((n) => n.type === Local.Body)[0];

  const local = {
    id: node.id,
    is: (type: ast.Type) => {
      return type === ast.Type.Config;
    },
  } as any;
  body.namedChildren.forEach((child) => {
    if (child.type !== Local.Attribute) {
      return;
    }
    local[child.namedChildren[0].text] = emitExpression(context, child.namedChildren[1]);
  });
  return local;
}
