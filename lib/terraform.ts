import assert from "assert";
import fs from "fs";
import Parser from "web-tree-sitter";
import * as adk from "./vendor/adk";
import * as ast from "./ast";

enum NamedNodes {
  TemplateLiteral = "template_literal",
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

function getAllBlockTypes(): string[] {
  return Object.values(BlockType);
}

function emitProperty(value: Parser.SyntaxNode, context: Context) {
  return value.text;
  // (template_expr (quoted_template (template_literal) @lit (template_interpolation) @temp ) )
  // (template_expr (quoted_template (template_literal)? @lit (template_interpolation)? @int  ))

  // gets parts of a literal
  // (template_expr (quoted_template (template_literal) @lit  ) )

  // string value
  // context.parser.getLanguage().query("(literal_value (string_lit (template_literal) @str))").captures(value);

  //
}

function emitBlockResource(context: Context): ast.ResourceNode {
  let type, name;
  const namedNodes = [NamedNodes.ResourceType.valueOf(), NamedNodes.ResourceName.valueOf()];
  context.node.namedChildren.forEach((c) => {
    if (!namedNodes.includes(c.type)) {
      return;
    }
    const value = c.children.filter((c2) => c2.type === NamedNodes.TemplateLiteral);
    c.type === NamedNodes.ResourceType && (type = value[0]?.text);
    c.type === NamedNodes.ResourceName && (name = value[0]?.text);
  });
  assert.ok(type, "no type found for resource");
  assert.ok(name, "no name found for resource");

  const body = context.node.namedChildren.filter((n) => n.type === NamedNodes.Body)[0];

  const resource: ast.ResourceNode = {
    id: context.node.id,
    name,
    type,
    properties: {},
  };
  body.namedChildren.forEach((child) => {
    assert.ok(child.namedChildCount === 2, "missing pairs for properties in resource block");
    resource.properties[child.namedChildren[0].text] = emitProperty(child.namedChildren[1], context);
  });
  // const body = context.parser
  //   .getLanguage()
  //   .query("(attribute (identifier) @key (expression) @value)")
  //   .captures(context.node.parent);

  // for (let i = 0; i < body.length; i += 2) {
  //   resource.properties.push(emitProperty(body[i].node, body[i + 1].node, context));
  // }
  return resource;
}

function emitBlock(context: Context): Block {
  if (context.blockCache.has(context.node.id)) {
    return context.blockCache.get(context.node.id);
  }
  let iterator: Parser.SyntaxNode | null = context.node.parent;
  let root = true;
  while (iterator) {
    if (getAllBlockTypes().includes(iterator.text)) {
      root = false;
      break;
    }
    iterator = iterator.parent;
  }
  const block = (() => {
    switch (context.node.type) {
      case BlockType.node_resource:
        return emitBlockResource(context);
      // case BlockType.provider:
      // case BlockType.module:
      // case BlockType.variable:
      // case BlockType.output:
      //   return undefined;
      default:
        assert.ok(false, `unhandled node type: ${context.node.type}`);
    }
  })();
  if (block) {
    if (root) {
      context.blockRoots.add(block.id);
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
  const blocks = getAllBlockTypes()
    .map((q) => `(${q}) @block`)
    .map((q) => parser.getLanguage().query(q))
    .map((q) => q.captures(tree.rootNode))
    .flatMap((q) => q);
  // const blocks = parser
  //   .getLanguage()
  //   .query("(block (identifier) @block (string_lit (template_literal)))")
  //   .captures(tree.rootNode);

  for (const block of blocks) {
    emitBlock({ node: block.node, blockCache, blockRoots, parser, resources: [] });
  }

  // console.log(tree.rootNode.toString());
  // const bodies: string[] = [];
  // const regoRulenames: string[] = [];
  // const kebabRegExp = new RegExp(/[^a-zA-Z0-9]|-{1,}/, "g");

  // const blockRoots = new Set<string>();
  // const token = "cap";
  // const ruleQueries = getAllBlockTypes()
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
