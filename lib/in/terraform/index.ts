import fs from "fs";
import path from "path";
import assert from "assert";
import Parser from "web-tree-sitter";
import * as ast from "../../ast";
import { walk } from "../input";
import { Context } from "./types";
import { emitBlockResource } from "./resource";
import { emitBlockVariable } from "./variable";
import { emitBlockLocal } from "./locals";

let LANGUAGE_WASM: string;
// @ts-ignore
if (typeof BUILD !== "undefined") {
  // this is the location of the language wasm when built with webpack
  LANGUAGE_WASM = path.resolve(__dirname, "..", "tree-sitter-hcl.wasm");
} else {
  // location of language wasm when running ts-node
  LANGUAGE_WASM = path.resolve(__dirname, "..", "..", "..", "tree-sitter-hcl.wasm");
}

enum BlockType {
  Resource = "node_resource",
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
    if (node.firstChild.type === BlockType.Resource) {
      const resource = emitBlockResource(context, node.firstChild);
      context.blocks.push(resource);
      return resource;
    }
    switch (node.firstNamedChild.text) {
      case BlockType.Variable:
        const variable = emitBlockVariable(context, node);
        context.blocks.push(variable);
        return variable;
      case BlockType.Provider:
      case BlockType.Module:
      case BlockType.Output:
      case BlockType.Local:
        const local = emitBlockLocal(context, node);
        context.blocks.push(local);
        return local;
      default:
        assert.ok(false, `unhandled node type: ${node.type}`);
    }
  })();
  return block;
}

const createParser = async (): Promise<Parser> => {
  await Parser.init({
    locateFile: () => {
      return `${process.cwd()}/tree-sitter.wasm`;
    },
  });
  const parser = new Parser();
  const lang = fs.readFileSync(LANGUAGE_WASM);
  const language = await Parser.Language.load(lang);
  parser.setLanguage(language);
  return parser;
};

export async function compile(input: string): Promise<ast.Node[]> {
  if (!input) {
    throw new Error("tf2cwe compile requires an input");
  }

  const parser = await createParser();
  const sources = await walk(input, {
    depth: 0,
    extensions: [".tf", ".tfvars"],
  });

  if (!sources[".tf"]) {
    throw new Error("Input contains no .tf files. only .tf files are supported");
  }

  const gigaTf = sources[".tf"].reduce((prev, next) => {
    return prev + fs.readFileSync(next, { encoding: "utf-8" });
  }, "");

  const tree = parser.parse(gigaTf);
  const blocks = parser
    .getLanguage()
    .query("(block) @block")
    .captures(tree.rootNode)
    .flatMap((q) => q);
  const context: Context = {
    node: undefined,
    parser,
    blocks: [],
    nodes: new Map(),
    encode: (node: ast.Node) => {
      if (node.is(ast.Type.Reference)) {
        const ref = node as ast.Reference;
        return `@@{{${ref.id}}}@@`;
      } else {
        throw new Error(`encode not available for: ${node.id}`);
      }
    },
    resolve: (chunk: string): string => {
      return chunk.replace(/@@{{(.+?)}}@@/g, (_, id) => {
        const node = context.nodes.get(Number(id));
        assert(node, `unable to find node with id ${id}`);
        node.resolve?.apply(node);
        const encode = `${node}`;
        const encodedId = encode.match(/@@{{(.+?)}}@@/)?.[1];
        if (encodedId && encodedId !== id) {
          return context.resolve(encode);
        } else {
          assert(!encode.startsWith("@@{{"), `node ${node.id} failed to resolve`);
          return encode;
        }
      });
    },
  };
  for (const block of blocks) {
    emitBlock({ ...context, node: block.node }, block.node);
  }
  for (const block of context.blocks) {
    block.resolve?.apply(block);
  }
  return context.blocks;
}
