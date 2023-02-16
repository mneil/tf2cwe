import fs from "fs";
import Parser from "web-tree-sitter";

enum NodeType {
  block = "block",
  // rule_prefix_matching = "rule_prefix_matching",
  // rule_suffix_matching = "rule_suffix_matching",
  // rule_equals_ignore_case_matching = "rule_equals_ignore_case_matching",
  // rule_wildcard_matching = "rule_wildcard_matching",
  // rule_anything_but_matching = "rule_anything_but_matching",
  // rule_numeric_matching = "rule_numeric_matching",
  // rule_ip_address_matching = "rule_ip_address_matching",
  // rule_exists_matching = "rule_exists_matching",
  // rule_exactly_matching = "rule_exactly_matching",
  // rule_value_matching = "rule_value_matching",
}

function getAllRuleNodeTypes(): string[] {
  return Object.values(NodeType);
}

export async function compile(parser: Parser, sources: { [key: string]: string[] }) {
  if (!sources[".tf"]) {
    throw new Error("Input contains no .tf files. only .tf files are supported");
  }
  const gigaTf = sources[".tf"].reduce((prev, next) => {
    return prev + fs.readFileSync(next, { encoding: "utf-8" });
  }, "");
  // console.log(gigaTf);

  const tree = parser.parse(gigaTf);
  // console.log(tree.rootNode.toString());

  // const token = "cap";
  // const ruleQueries = getAllRuleNodeTypes()
  //   .map((q) => `(${q}) @${token}`)
  //   .map((q) => parser.getLanguage().query(q))
  //   .map((q) => q.captures(tree.rootNode))
  //   .flatMap((q) => q);

  // console.log(tree.rootNode.toString());
  // const bodies: string[] = [];
  // const regoRulenames: string[] = [];
  // const kebabRegExp = new RegExp(/[^a-zA-Z0-9]|-{1,}/, "g");

  // const ruleCache = new Map<number, string>();
  // const ruleRoots = new Set<string>();
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
  //   emitRule({ node, rules, ruleCache, ruleRoots });
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
  // const init = [...new Set(Array.from(ruleCache.values()))].map((i) => `default ${i} := false`).join("\n");
  // const policy = `\n${rules.join("\n")}`;
  // const footer = `allow {\n\t${Array.from(ruleRoots).join("\n\t")}\n}`;
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
