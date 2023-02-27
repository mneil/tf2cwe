import assert from "assert";
import fs from "fs";
import Parser from "web-tree-sitter";
// import * as adk from "./vendor/adk";
import * as ast from "./ast";

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
  IndexedAccess = "index", // ex: module.vpc.public_subnets[0] - seq($._expr_term, $.index),
  RawReference = "get_attr", // ex: var.named.variable where named and variable are get_at) - seq($._expr_term, $.get_attr),
  Splat = "splat", // ex: var.ref.* - seq($._expr_term, $.splat),
  Expression = "expression", // ex: nested expressions - seq('(', $.expression, ')'),
  Conditional = "conditional", // ternary
}

enum ResourceNode {
  ResourceName = "resource_name",
  ResourceType = "resource_type",
  Body = "body",
  Attribute = "attribute",
  Expression = "expression",
}

enum BlockType {
  node_resource = "node_resource",
  // provider = "provider",
  // resource = "resource",
  // module = "module",
  // output = "output",
  // variable = "variable",
}

type Block = ast.ResourceNode;

interface Context {
  readonly node: Parser.SyntaxNode;
  readonly resources: ast.ResourceNode[];
  readonly parser: Parser;
  // readonly blockCache: Map<number, Block>;
  // readonly blockRoots: Set<number>;
}

function getAllBlockTypes(): string[] {
  return Object.values(BlockType);
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
  const expression = node.namedChildren.filter((n) => n.type === ResourceNode.Expression)[0];
  return emitExpression(context, expression);
}

function emitVariableExpression(context: Context, node: Parser.SyntaxNode): string | ast.Reference {
  // TODO: need to implement more agnositic resolvers in the AST
  assert.ok(
    node.firstNamedChild.type === ExpressionNode.VariableExpression,
    `received node type ${node.firstNamedChild.type}. expected ${ExpressionNode.VariableExpression}`
  );
  let target = { id: context.node.id };
  switch (node.firstNamedChild.text) {
    case NamedValue.Variable:
      return { id: node.id, target: "variable", property: [node.lastNamedChild.lastNamedChild.text] };
    case NamedValue.Local:
      return { id: node.id, target: "local", property: [node.lastNamedChild.lastNamedChild.text] };
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
      return { id: node.id, target: "module", property: moduleProperty };
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
      return { id: node.id, target, property: ["_meta_", "index"] };
    case NamedValue.Each:
      return {
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
      return { id: node.id, target, property: selfProperty };
    default:
      // resource reference?
      if (node.namedChildCount === 1) {
        // local node reference
        return { id: node.id, target, property: [node.firstNamedChild.text] };
      }
      const property = node.namedChildren.map((node) => {
        return node.text;
      });
      return { id: node.id, target, property };
  }
}
function emitCollectionValue(context: Context, node: Parser.SyntaxNode) {
  switch (node.firstNamedChild.type) {
    case CollectionValue.Tuple:
      const value = node.firstNamedChild.namedChildren
        .map((c) => {
          if (c.type !== ResourceNode.Expression) return undefined;
          return emitExpression(context, c);
        })
        .filter((c) => c !== undefined);
      return value as ast.PropertyValue[];
    case CollectionValue.Object:
      // const objectElements = node.firstNamedChild.namedChildren
      //   .map((c) => {
      //     if (c.type !== ResourceNode.Expression) return undefined;
      //     return emitExpression(context, c);
      //   })
      //   .filter((c) => c !== undefined);
      return {};
    default:
      assert.ok(false, `unknown collection type ${node.firstChild.type}`);
  }
}

function emitExpression(context: Context, node: Parser.SyntaxNode): ast.PropertyValue {
  assert.ok(
    node.type === ResourceNode.Expression,
    `received node type ${node.type}. expected ${ResourceNode.Expression}`
  );
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
    case ExpressionNode.IndexedAccess:
      return "";
    case ExpressionNode.RawReference:
      return "";
    case ExpressionNode.Splat:
      return "";
    case ExpressionNode.Expression:
      return "";
    case ExpressionNode.Conditional:
      return "";
    default:
      assert.ok(false, `unknown expression type ${node.firstChild.type}`);
  }
}

function emitBlockResource(context: Context, node: Parser.SyntaxNode): ast.ResourceNode {
  let type, name;
  const namedNodes = [ResourceNode.ResourceType.valueOf(), ResourceNode.ResourceName.valueOf()];
  node.namedChildren.forEach((c) => {
    if (!namedNodes.includes(c.type)) {
      return;
    }
    const value = c.children.filter((c2) => c2.type === LiteralValue.TemplateLiteral);
    c.type === ResourceNode.ResourceType && (type = value[0]?.text);
    c.type === ResourceNode.ResourceName && (name = value[0]?.text);
  });
  assert.ok(type, "unknown type for resource");
  assert.ok(name, "unknown name for resource");

  const body = node.namedChildren.filter((n) => n.type === ResourceNode.Body)[0];

  const resource: ast.ResourceNode = {
    id: node.id,
    name,
    type,
    properties: {},
  };
  body.namedChildren.forEach((child) => {
    resource.properties[child.namedChildren[0].text] = emitExpression(context, child.namedChildren[1]);
  });
  return resource;
}

function emitBlock(context: Context, node: Parser.SyntaxNode): Block {
  // if (context.blockCache.has(node.id)) {
  //   return context.blockCache.get(node.id);
  // }
  let iterator: Parser.SyntaxNode | null = node.parent;
  let root = true;
  while (iterator) {
    if (getAllBlockTypes().includes(iterator.text)) {
      root = false;
      break;
    }
    iterator = iterator.parent;
  }
  const block = (() => {
    switch (node.type) {
      case BlockType.node_resource:
        const block = emitBlockResource(context, node);
        context.resources.push(block);
        return block;
      // case BlockType.provider:
      // case BlockType.module:
      // case BlockType.variable:
      // case BlockType.output:
      //   return undefined;
      default:
        assert.ok(false, `unhandled node type: ${node.type}`);
    }
  })();
  // if (block) {
  //   if (root) {
  //     context.blockRoots.add(block.id);
  //   }
  //   context.blockCache.set(node.id, block);
  // }
  return block;
}

export async function compile(parser: Parser, sources: { [key: string]: string[] }) {
  if (!sources[".tf"]) {
    throw new Error("Input contains no .tf files. only .tf files are supported");
  }
  // const blockCache = new Map<number, Block>();
  // const blockRoots = new Set<number>();

  const gigaTf = sources[".tf"].reduce((prev, next) => {
    return prev + fs.readFileSync(next, { encoding: "utf-8" });
  }, "");

  const tree = parser.parse(gigaTf);
  const blocks = getAllBlockTypes()
    .map((q) => `(${q}) @block`)
    .map((q) => parser.getLanguage().query(q))
    .map((q) => q.captures(tree.rootNode))
    .flatMap((q) => q);
  const context: Context = { node: undefined /*, blockCache, blockRoots*/, parser, resources: [] };
  for (const block of blocks) {
    emitBlock({ ...context, node: block.node }, block.node);
  }
  console.log(JSON.stringify(context.resources, undefined, 2));
}
