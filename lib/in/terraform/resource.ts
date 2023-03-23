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
  const name = node.namedChildren[1]?.namedChildren[1]?.text;

  assert.ok(type, "unknown type for resource");
  assert.ok(service, "unknown service for resource");
  assert.ok(name, "unknown name for resource");

  const regex = new RegExp(`^aws_[${service}_]?`);
  const product = type.replace(regex, "");

  const body = node.namedChildren.filter((n) => n.type === Resource.Body)[0];

  // TODO: This needs to come from config blocks or from individual resources
  const config = {
    id: 0,
    is: (type: ast.Type) => {
      return type === ast.Type.Config;
    },
    account: "123456789012",
    region: "us-east-1",
    userAgent: "bla",
    identity: { type: ast.IdentityType.User },
    eventType: ast.EventOrigin.ApiCall,
    partition: "aws",
  };

  const resource: ast.Resource = {
    id: node.id,
    config,
    name,
    service,
    product,
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
