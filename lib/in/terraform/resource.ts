import assert from "assert";
import Parser from "web-tree-sitter";
import * as ast from "../../ast";
import { Context } from "./types";
import { emitExpression } from "./expression";

enum Resource {
  Body = "body",
}

export function emitBlockResource(context: Context, node: Parser.SyntaxNode): ast.Resource {
  const type = node.namedChildren[0]?.namedChildren[1]?.text;
  const service = node.namedChildren[0]?.namedChildren[1].firstChild.type;
  const name = node.children[2]?.namedChildren[1]?.text;

  assert.ok(type, "unknown type for resource");
  assert.ok(service, "unknown service for resource");
  assert.ok(name, "unknown name for resource");

  const regex = new RegExp(`^aws_[${service}_]?`);
  const product = type.replace(regex, "");

  const body = node.namedChildren.filter((n) => n.type === Resource.Body)[0];

  const resource: ast.Resource = {
    id: node.id,
    name,
    service,
    product,
    resolve: function () {
      const self = this as ast.Resource;
      for (const property in self.properties) {
        const value = self.properties[property];
        if (typeof value === "string") {
          self.properties[property] = context.resolve(value);
        }
        if (ast.IsNode(value)) {
          value.resolve?.apply?.(value);
        }
      }
    },
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
