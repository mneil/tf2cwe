import assert from "assert";
import Parser from "web-tree-sitter";
import * as ast from "../ast";
import { Context } from "./types";
import { emitExpression } from "./expression";

enum Variable {
  Body = "body",
  Attribute = "attribute",
  Expression = "expression",
}

enum VariableProperties {
  Description = "description",
  Type = "type",
  Default = "default",
  Validation = "validation",
  Sensitive = "sensitive",
  Nullable = "nullable",
}

export function emitBlockVariable(context: Context, node: Parser.SyntaxNode): ast.Variable {
  const name = node.namedChildren[1]?.namedChildren[1]?.text;

  assert.ok(name, "unknown name for variable");

  const body = node.namedChildren.filter((n) => n.type === Variable.Body)[0];

  const variable = {
    id: node.id,
    name,
  } as any;
  body.namedChildren.forEach((child) => {
    if (child.type !== Variable.Attribute) {
      return;
    }
    let value;
    const key = child.namedChildren[0].text;
    switch (key) {
      case VariableProperties.Type:
        // TODO: type is complex but I haven't implemented all the parsing yet
        value = child.namedChildren[1].text;
        break;
      default:
        value = emitExpression(context, child.namedChildren[1]);
        break;
    }
    variable[key] = value;
  });
  assert.ok(variable.type, `unknown type for variable ${name}`);
  return variable as ast.Variable;
}
