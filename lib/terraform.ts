import assert from "assert";
import fs from "fs";
import Parser from "web-tree-sitter";
import * as adk from "./vendor/adk";

enum NodeType {
  provider = "provider",
  resource = "resource",
  module = "module",
  output = "output",
  variable = "variable",
}

type Block = Resource;

interface Property {}

interface Resource {
  node: Parser.SyntaxNode;
  properties: Property[];
}

interface Context {
  readonly resources: Resource[];
  readonly parser: Parser;
  readonly blockCache: Map<number, Block>;
  readonly blockRoots: Set<number>;
  readonly node: Parser.SyntaxNode;
}

function getAllRuleNodeTypes(): string[] {
  return Object.values(NodeType);
}

function emitProperty(key: Parser.SyntaxNode, value: Parser.SyntaxNode, context: Context) {
  console.log(key, value, context);
  return { [key.text]: value };
  // (template_expr (quoted_template (template_literal) @lit (template_interpolation) @temp ) )
  // (template_expr (quoted_template (template_literal)? @lit (template_interpolation)? @int  ))

  // gets parts of a literal
  // (template_expr (quoted_template (template_literal) @lit  ) )

  // string value
  // context.parser.getLanguage().query("(literal_value (string_lit (template_literal) @str))").captures(value);

  //
}

function emitBlockResource(context: Context): Resource {
  const body = context.parser
    .getLanguage()
    .query("(attribute (identifier) @key (expression) @value)")
    .captures(context.node.parent);
  assert.ok(body.length % 2 === 0, "missing pairs for properties in resource block");
  const resource: Resource = {
    node: context.node,
    properties: [],
  };
  for (let i = 0; i < body.length; i += 2) {
    resource.properties.push(emitProperty(body[i].node, body[i + 1].node, context));
  }
  return resource;
}

function emitBlock(context: Context): Block {
  if (context.blockCache.has(context.node.id)) {
    return context.blockCache.get(context.node.id);
  }
  let iterator: Parser.SyntaxNode | null = context.node.parent;
  let root = true;
  while (iterator) {
    if (getAllRuleNodeTypes().includes(iterator.text)) {
      root = false;
      break;
    }
    iterator = iterator.parent;
  }
  const block = (() => {
    switch (context.node.text) {
      case NodeType.resource:
        return emitBlockResource(context);
      case NodeType.provider:
      case NodeType.module:
      case NodeType.variable:
      case NodeType.output:
        return undefined;
      default:
        assert.ok(false, `unhandled node type: ${context.node.type}`);
    }
  })();
  if (block) {
    if (root) {
      context.blockRoots.add(block.node.id);
    }
    context.blockCache.set(context.node.id, block);
  }
  return block;
}

export async function compile(parser: Parser, sources: { [key: string]: string[] }) {
  if (!sources[".tf"]) {
    throw new Error("Input contains no .tf files. only .tf files are supported");
  }
  const blockCache = new Map<number, Block>();
  const blockRoots = new Set<number>();

  const gigaTf = sources[".tf"].reduce((prev, next) => {
    return prev + fs.readFileSync(next, { encoding: "utf-8" });
  }, "");

  const tree = parser.parse(gigaTf);
  const blocks = parser
    .getLanguage()
    .query("(block (identifier) @block (string_lit (template_literal)))")
    .captures(tree.rootNode);

  for (const block of blocks) {
    emitBlock({ node: block.node, blockCache, blockRoots, parser, resources: [] });
  }

  // console.log(tree.rootNode.toString());
  // const bodies: string[] = [];
  // const regoRulenames: string[] = [];
  // const kebabRegExp = new RegExp(/[^a-zA-Z0-9]|-{1,}/, "g");

  // const blockRoots = new Set<string>();
  // const token = "cap";
  // const ruleQueries = getAllRuleNodeTypes()
  //   .map((q) => `(${q}) @${token}`)
  //   .map((q) => parser.getLanguage().query(q))
  //   .map((q) => q.captures(tree.rootNode))
  //   .flatMap((q) => q);
  // const rules: string[] = [];
  // for (const ruleQuery of ruleQueries) {
  //   assert.ok(ruleQuery.name === token);
  //   const node = ruleQuery.node;
  //   emitRule({ node, rules, blockCache, blockRoots });
  // }
  // let header = "";
  // if (sources.length === 1) {
  //   header = "package rule2rego\ndefault allow := false";
  // } else {
  //   const pkgPath = path.relative(sourceRoot, sourcePath).slice(0, -5);
  //   const ruleName = pkgPath.replace(kebabRegExp, "");
  //   regoRulenames.push(ruleName);
  //   header = `package rule2rego.${ruleName}\ndefault allow := false`;
  // }
  // const init = [...new Set(Array.from(blockCache.values()))].map((i) => `default ${i} := false`).join("\n");
  // const policy = `\n${rules.join("\n")}`;
  // const footer = `allow {\n\t${Array.from(blockRoots).join("\n\t")}\n}`;
  // const body = `${header}\n${init}${policy}\n${footer}`.replace(/\n\n/g, "\n");
  // if (options.input === process.argv[2]) {
  //   console.log(body);
  //   console.log("");
  // }
  // bodies.push(body);

  // if (sources.length > 1) {
  //   // add the main
  //   const body = `package rule2rego\ndefault allow := false\nallow {\n  data.rule2rego.${regoRulenames.join(
  //     ".allow\n}\nallow {\n  data.rule2rego."
  //   )}.allow\n}`;
  //   bodies.splice(0, 0, body);
  //   if (options.input === process.argv[2]) {
  //     console.log(body);
  //     console.log("");
  //   }
  // }
  // return bodies;
}
