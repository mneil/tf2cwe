import assert from "assert";
import Parser from "web-tree-sitter";
import * as ast from "../ast";
import { Context } from "./types";
import { emitExpression } from "./expression";

enum Resource {
  Body = "body",
}

export function emitBlockResource(context: Context, node: Parser.SyntaxNode): ast.Resource {
  const type = node.namedChildren[1]?.namedChildren[1]?.text;
  const name = node.namedChildren[2]?.namedChildren[1]?.text;

  assert.ok(type, "unknown type for resource");
  assert.ok(name, "unknown name for resource");

  const body = node.namedChildren.filter((n) => n.type === Resource.Body)[0];

  const resource: ast.Resource = {
    id: node.id,
    name,
    type,
    properties: {},
    is: (type: ast.Type) => {
      return type === ast.Type.Resource;
    },
  };
  body.namedChildren.forEach((child) => {
    // TODO: handle for_each
    resource.properties[child.namedChildren[0].text] = emitExpression(context, child.namedChildren[1]);
  });
  return resource;
}
