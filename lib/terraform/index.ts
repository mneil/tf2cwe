import assert from "assert";
import fs from "fs";
import Parser from "web-tree-sitter";
// import * as adk from "./vendor/adk";
import * as ast from "../ast";
import { Context } from "./types";

import { emitBlockResource } from "./resource";
import { emitBlockVariable } from "./variable";

enum BlockType {
  Resource = "resource",
  Provider = "provider",
  Module = "module",
  Output = "output",
  Variable = "variable",
  Local = "locals",
}

function getAllBlockTypes(): string[] {
  return Object.values(BlockType);
}

function emitBlock(context: Context, node: Parser.SyntaxNode): ast.Node {
  // if (context.blockCache.has(node.id)) {
  //   return context.blockCache.get(node.id);
  // }
  assert.ok(node.type === "block", `received node type ${node.type}. expected block`);
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
    switch (node.firstNamedChild.text) {
      case BlockType.Resource:
        const resource = emitBlockResource(context, node);
        context.blocks.push(resource);
        return resource;
      case BlockType.Variable:
        const variable = emitBlockVariable(context, node);
        context.blocks.push(variable);
        return variable;
      case BlockType.Provider:
      case BlockType.Module:
      case BlockType.Output:
      case BlockType.Local:
        return undefined;
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
  const blocks = parser
    .getLanguage()
    .query("(block) @block")
    .captures(tree.rootNode)
    .flatMap((q) => q);
  // getAllBlockTypes()
  //   .map((q) => `(${q}) @block`)
  //   .map((q) => parser.getLanguage().query(q))
  //   .map((q) => q.captures(tree.rootNode))
  //   .flatMap((q) => q);
  const context: Context = { node: undefined /*, blockCache, blockRoots*/, parser, blocks: [] };
  for (const block of blocks) {
    emitBlock({ ...context, node: block.node }, block.node);
  }
  console.log(JSON.stringify(context.blocks, undefined, 2));
}
