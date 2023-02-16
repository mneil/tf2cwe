import assert from "assert";
import fs from "fs/promises";
import path from "path";
import Parser from "web-tree-sitter";
import arg from "arg";
import { walk } from "./input";

enum Language {
  Terraform = "hcl",
}

interface CompileOptions {
  input: string;
  language: Language;
}

const WALK_OPTIONS = {
  [Language.Terraform]: {
    depth: 0,
    extensions: [".tf", ".tfvars"],
  },
};

const createParser = async (): Promise<Parser> => {
  await Parser.init();
  const parser = new Parser();
  const language = await Parser.Language.load(path.resolve(__dirname, "tree-sitter-hcl.wasm"));
  parser.setLanguage(language);
  return parser;
};

export async function compile(options: CompileOptions) {
  if (!options.input) {
    throw new Error("tf2cwe compile requires an input");
  }

  const parser = await createParser();
  // const sourceRoot = path.resolve(options.input);
  const sources = await walk(options.input, WALK_OPTIONS[options.language]);

  // const bodies: string[] = [];
  // const regoRulenames: string[] = [];
  // const kebabRegExp = new RegExp(/[^a-zA-Z0-9]|-{1,}/, "g");

  console.log(sources);
  if (!sources[".tf"]) {
    throw new Error("Input contains no .tf files. only .tf files are supported");
  }
  for (const sourcePath of sources[".tf"]) {
    // const ruleCache = new Map<number, string>();
    // const ruleRoots = new Set<string>();
    const source = await fs.readFile(sourcePath, { encoding: "utf-8" });
    const tree = parser.parse(source);
    // console.log(tree.rootNode.toString());
    //   const token = "cap";
    //   const ruleQueries = getAllRuleNodeTypes()
    //     .map((q) => `(${q}) @${token}`)
    //     .map((q) => parser.getLanguage().query(q))
    //     .map((q) => q.captures(tree.rootNode))
    //     .flatMap((q) => q);
    //   const rules: string[] = [];
    //   for (const ruleQuery of ruleQueries) {
    //     assert.ok(ruleQuery.name === token);
    //     const node = ruleQuery.node;
    //     emitRule({ node, rules, ruleCache, ruleRoots });
    //   }
    //   let header = "";
    //   if (sources.length === 1) {
    //     header = "package rule2rego\ndefault allow := false";
    //   } else {
    //     const pkgPath = path.relative(sourceRoot, sourcePath).slice(0, -5);
    //     const ruleName = pkgPath.replace(kebabRegExp, "");
    //     regoRulenames.push(ruleName);
    //     header = `package rule2rego.${ruleName}\ndefault allow := false`;
    //   }
    //   const init = [...new Set(Array.from(ruleCache.values()))].map((i) => `default ${i} := false`).join("\n");
    //   const policy = `\n${rules.join("\n")}`;
    //   const footer = `allow {\n\t${Array.from(ruleRoots).join("\n\t")}\n}`;
    //   const body = `${header}\n${init}${policy}\n${footer}`.replace(/\n\n/g, "\n");
    //   if (options.input === process.argv[2]) {
    //     console.log(body);
    //     console.log("");
    //   }
    //   bodies.push(body);
  }
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

function enumFromStringValue<T>(enm: { [s: string]: T }, value: string): T | undefined {
  return (Object.values(enm) as unknown as string[]).includes(value) ? (value as unknown as T) : undefined;
}

if (require.main === module) {
  const options = arg({ "--language": String }, { argv: process.argv });
  const language = enumFromStringValue(Language, options["--language"]) || Language.Terraform;
  compile({ input: options["_"].pop(), language });
}
