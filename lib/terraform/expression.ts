import assert from "assert";
import Parser from "web-tree-sitter";
import * as ast from "../ast";
import { Context } from "./types";

const ExpressionNodeValue = "expression";

// https://developer.hashicorp.com/terraform/language/expressions/reference
enum NamedValue {
  Variable = "var",
  Local = "local",
  Module = "module",
  Data = "data",
  FileSystem = "path",
  Workspace = "terraform",
  Count = "count",
  Each = "each",
  Self = "self", // https://developer.hashicorp.com/terraform/language/expressions/references#self
}

// https://developer.hashicorp.com/terraform/language/expressions/strings
enum TemplateExpression {
  QuotedTemplate = "quoted_template",
  Start = "quoted_template_start",
  Interpolation = "template_interpolation",
  Directive = "template_directive",
  // Literal = "template_literal",
  End = "quoted_template_end",

  HereDocStart = "heredoc_start",
  HereDocIdentifier = "heredoc_identifier",
  HereDocTemplate = "heredoc_template",
  // HereDocTemplate = "_template",
}

enum ObjectValue {
  ObjectElement = "object_elem",
}

enum CollectionValue {
  Tuple = "tuple",
  Object = "object",
}

enum LiteralValue {
  NumericLit = "numeric_lit",
  BoolLit = "bool_lit",
  NullLit = "null_lit",
  StringLit = "string_lit",
  TemplateLiteral = "template_literal",
}

enum ExpressionNode {
  Literal = "literal_value",
  TemplateExpression = "template_expr",
  CollectionValue = "collection_value",
  VariableExpression = "variable_expr",
  Function = "function_call",
  ForExpression = "for_expr",
  Operation = "operation",
  // IndexedAccess = "index", // ex: module.vpc.public_subnets[0] - seq($._expr_term, $.index),
  // RawReference = "get_attr", // ex: var.named.variable where named and variable are get_at) - seq($._expr_term, $.get_attr),
  // Splat = "splat", // ex: var.ref.* - seq($._expr_term, $.splat),
  // Expression = "expression", // ex: nested expressions - seq('(', $.expression, ')'),
  Conditional = "conditional", // ternary
}

function emitLiteralValue(node: Parser.SyntaxNode) {
  assert.ok(
    node.type === ExpressionNode.Literal,
    `received node type ${node.type}. expected ${ExpressionNode.Literal}`
  );
  const firstChild = node.firstChild;
  switch (firstChild.type) {
    case LiteralValue.StringLit:
      return firstChild.namedChildren[1].text;
    case LiteralValue.BoolLit:
      return firstChild.text.toLowerCase() === "false" ? false : true;
    case LiteralValue.NullLit:
      return null;
    case LiteralValue.NumericLit:
      return Number(firstChild.text);
    case LiteralValue.TemplateLiteral:
      return Number(firstChild.text);
    default:
      assert.ok(false, `unknown ${ExpressionNode.Literal}: ${firstChild.type}`);
  }
}

function emitTemplateExpression(context: Context, value: Parser.SyntaxNode): string {
  assert.ok(
    value.type === ExpressionNode.TemplateExpression,
    `received node type ${value.type}. expected ${ExpressionNode.TemplateExpression}`
  );
  switch (value.firstChild.type) {
    case TemplateExpression.HereDocTemplate:
      return ""; // TODO: implement heredoc
    case TemplateExpression.QuotedTemplate:
      return value.firstChild.namedChildren.reduce((value, node) => {
        switch (node.type) {
          case LiteralValue.TemplateLiteral:
            return value + node.text;
          case TemplateExpression.Interpolation:
            return value + emitTemplateInterpolation(context, node);
          default:
            return value;
        }
      }, "");
    default:
      assert.ok(false, `unsupported template expression type ${value.firstChild.type}`);
  }
}

function emitTemplateInterpolation(context: Context, node: Parser.SyntaxNode) {
  assert.ok(
    node.type === TemplateExpression.Interpolation,
    `received node type ${node.type}. expected ${TemplateExpression.Interpolation}`
  );
  const expression = node.namedChildren.filter((n) => n.type === ExpressionNodeValue)[0];
  return emitExpression(context, expression);
}

function emitVariableExpression(context: Context, node: Parser.SyntaxNode): string | ast.Reference {
  // TODO: need to implement more agnositic resolvers in the AST
  assert.ok(
    node.firstNamedChild.type === ExpressionNode.VariableExpression,
    `received node type ${node.firstNamedChild.type}. expected ${ExpressionNode.VariableExpression}`
  );
  let target = context.node.id;
  const is = (type: ast.Type) => {
    return type === ast.Type.Reference;
  };
  switch (node.firstNamedChild.text) {
    case NamedValue.Variable:
      return { is, id: node.id, target: "variable", property: [node.lastNamedChild.lastNamedChild.text] };
    case NamedValue.Local:
      return { is, id: node.id, target: "local", property: [node.lastNamedChild.lastNamedChild.text] };
    case NamedValue.Module:
      const moduleProperty = node.namedChildren
        .map((node, index) => {
          if (index === 0) return undefined;
          if (node.type === "index") {
            if (node.firstNamedChild.type === "new_index") return Number(node.firstNamedChild.firstNamedChild.text);
            if (node.firstNamedChild.type === "legacy_index") return Number(node.firstNamedChild.text.split(".").pop());
          }
          return node.firstNamedChild.text;
        })
        .filter((c) => c !== undefined);
      return { is, id: node.id, target: "module", property: moduleProperty };
    case NamedValue.Data:
      // TODO: have to figure out how to make this work and turn into AST
      assert.ok(false, "data source is unsupported at this time");
    case NamedValue.FileSystem:
      // TODO: implement all of the filesystem paths
      // https://developer.hashicorp.com/terraform/language/expressions/references#filesystem-and-workspace-info
      return process.cwd();
    case NamedValue.Workspace:
      // TODO: allow configuration of the workspace? Can we infer it?
      return "";
    case NamedValue.Count:
      return { is, id: node.id, target, property: ["_meta_", "index"] };
    case NamedValue.Each:
      return {
        is,
        id: node.id,
        target,
        property: ["_meta_", "each", node.lastNamedChild.firstNamedChild.text],
      };
    case NamedValue.Self:
      const selfProperty = node.namedChildren
        .map((node, index) => {
          if (index === 0) return undefined;
          return node.text;
        })
        .filter((c) => c !== undefined);
      return { is, id: node.id, target, property: selfProperty };
    default:
      // resource reference?
      if (node.namedChildCount === 1) {
        // local node reference
        return { is, id: node.id, target, property: [node.firstNamedChild.text] };
      }
      const property = node.namedChildren.map((node) => {
        return node.text;
      });
      return { is, id: node.id, target, property };
  }
}
function emitCollectionValue(context: Context, node: Parser.SyntaxNode) {
  switch (node.firstNamedChild.type) {
    case CollectionValue.Tuple:
      const value = node.firstNamedChild.namedChildren
        .map((c) => {
          if (c.type !== ExpressionNodeValue) return undefined;
          return emitExpression(context, c);
        })
        .filter((c) => c !== undefined);
      return value as ast.PropertyValue;
    case CollectionValue.Object:
      let collection: { [key: string]: ast.PropertyValue } = {};
      node.firstNamedChild.namedChildren.forEach((c) => {
        if (c.type !== ObjectValue.ObjectElement) return undefined;
        collection[c.firstNamedChild.text] = emitExpression(context, c.lastNamedChild);
      });
      return collection as ast.PropertyValue;
    default:
      assert.ok(false, `unknown collection type ${node.firstChild.type}`);
  }
}

export function emitExpression(context: Context, node: Parser.SyntaxNode): ast.PropertyValue {
  assert.ok(node.type === ExpressionNodeValue, `received node type ${node.type}. expected ${ExpressionNodeValue}`);
  switch (node.firstChild.type) {
    case ExpressionNode.Literal:
      return emitLiteralValue(node.firstChild);
    case ExpressionNode.TemplateExpression:
      return emitTemplateExpression(context, node.firstChild);
    case ExpressionNode.CollectionValue:
      return emitCollectionValue(context, node.firstChild);
    case ExpressionNode.VariableExpression:
      return emitVariableExpression(context, node);
    case ExpressionNode.Function:
      return "";
    case ExpressionNode.ForExpression:
      return "";
    case ExpressionNode.Operation:
      return "";
    // case ExpressionNode.IndexedAccess:
    //   return "";
    // case ExpressionNode.RawReference:
    //   return "";
    // case ExpressionNode.Splat:
    //   return "";
    // case ExpressionNode.Expression:
    //   return "";
    case ExpressionNode.Conditional:
      return "";
    default:
      assert.ok(false, `unknown expression type ${node.firstChild.type}`);
  }
}
