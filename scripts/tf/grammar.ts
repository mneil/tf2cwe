/**
 * Code generator for terraform parser
 *
 * Reads names_data.csv from terraform AWS Source provider and uses it to create a
 * tree-sitter grammar that contains alias so we can map TF resources back to
 * AWS <service> <product> pairs.
 */
import assert from "assert";
import fs from "fs";
import path from "path";

const IS_REGEX = /[^a-zA-Z0-9_]/;
const TREE_SITTER_UNSUPPORTED = /\?\!|\\b|\$/g;
/**
 * Some TF mappings regex is not supported by tree-sitter. This maps acts to convert the non-supported values
 * to ones that are supported with the same behavior. Long-term this would be better off maybe as externals or
 * using another parser to expand these expressions automatically. At this point it's parser inception
 * though and I'm tired.
 */
const TF_REGEX_MAPPING = new Map([
  ["aws_cloudwatch_(?!(event_|log_|query_))", ["aws_cloudwatch_([^event_|log_|query_])[a-z_]+"]],
  ["aws_cognito_identity_(?!provider)", ["aws_cognito_identity_([^provider])[a-z_]+"]],
  ["aws_route53_(?!resolver_)", ["aws_route53_([^resolver_])[a-z_]+"]],
  [
    "aws_(arn|billing_service_account|default_tags|ip_ranges|partition|regions?|service)$",
    ["aws_(arn|billing_service_account|default_tags|ip_ranges|partition|regions?|service)"],
  ],
  [
    "aws_((default_)?(network_acl|route_table|security_group|subnet|vpc(?!_ipam))|ec2_(managed|network|subnet|traffic)|egress_only_internet|flow_log|internet_gateway|main_route_table_association|nat_gateway|network_interface|prefix_list|route\\b)",
    [
      "aws_((default_)?(network_acl|route_table|security_group|subnet|vpc([^_ipam]))|ec2_(managed|network|subnet|traffic)|egress_only_internet|flow_log|internet_gateway|main_route_table_association|nat_gateway|network_interface|prefix_list)",
      "aws_route",
    ],
  ],
  ["aws_a?lb(\\b|_listener|_target_group|s)", ["aws_a?lb(_listener|_target_group|s)", "aws_a?lbs?"]],
]);

enum Columns {
  ColAWSCLIV2Command = 0,
  ColAWSCLIV2CommandNoDashes = 1,
  ColGoV1Package = 2,
  ColGoV2Package = 3,
  ColProviderPackageActual = 4,
  ColProviderPackageCorrect = 5, // package name
  ColSplitPackageRealPackage = 6, // actual package / service
  ColAliases = 7,
  ColProviderNameUpper = 8,
  ColGoV1ClientTypeName = 9,
  ColSkipClientGenerate = 10,
  ColClientSDKV1 = 11,
  ColClientSDKV2 = 12, // supported prefixes. aws_instance_ for example under the ec2 namespace
  ColResourcePrefixActual = 13, // hard prefix like aws_ec2_
  ColResourcePrefixCorrect = 14,
  ColFilePrefix = 15,
  ColDocPrefix = 16, // prefix without provider ec2_coip_pool;ec2_local_gateway, ec2_availability_;ec2_capacity_;ec2_fleet;ec2_host;ec2_instance_;ec2_serial_;ec2_spot_;ec2_tag;eip;instance;key_pair;launch_template;placement_group;spot_
  ColHumanFriendly = 17,
  ColBrand = 18,
  ColExclude = 19,
  ColAllowedSubcategory = 20,
  ColDeprecatedEnvVar = 21,
  ColEnvVar = 22,
  ColNote = 23,
}
// rows with these values in the Note field are ignored Columns.ColNote
const EXCLUDED_ROW_NOTE = [
  "No SDK support",
  "Documentation",
  "CLI only",
  "Legacy",
  "Part of DynamoDB",
  "Part of IoT",
  "Only in Go SDK v1",
  "Part of Resource Groups Tagging",
  "Part of Support",
];

function unsupportedNodeType(columns: string[]) {
  if (!columns[Columns.ColClientSDKV2] && !columns[Columns.ColResourcePrefixCorrect]) {
    if (EXCLUDED_ROW_NOTE.includes(columns[Columns.ColNote])) {
      return true;
    }
    throw new Error(`Found unsupported row in parser ${columns.join(",")}`);
  }
  return false;
}

function expandPrefix(input: string): string[] {
  if (TF_REGEX_MAPPING.has(input)) {
    const value = TF_REGEX_MAPPING.get(input);
    assert.ok(value)
    TF_REGEX_MAPPING.delete(input);
    return value;
  }
  if (!input.match(IS_REGEX) && input.endsWith("_")) {
    return [`${input}[a-zA-Z_]+`];
  }
  if (input.match(TREE_SITTER_UNSUPPORTED)) {
    throw new Error(`prefix is unsupported and unmapped ${input}`);
  }

  return [input];
}

function toGrammar(prefixes: Map<string, string>) {
  const gigaRule: string[] = [];
  const rules: string[] = [];
  const serviceCount = {};
  for (const [value, service] of prefixes.entries()) {
    if (!serviceCount[service]) {
      serviceCount[service] = 0;
    }
    const rule = service + serviceCount[service]++;
    gigaRule.push(`alias($.${rule}, "${service}")`);
    rules.push(`${rule}: ($) => /${value}/`);
  }
  return `
    resource_service_map: ($) => choice(
      ${gigaRule.join(",\n      ")}
    ),

    ${rules.join(",\n    ")},
`;
}

function writeGrammar(text: string) {
  // This writing to file is pretty naive. In the future we will want to support
  // replacing blocks of code rather than the when end
  const grammarPath = path.resolve(__dirname, "..", "..", "grammar.js");
  const grammar = fs.readFileSync(grammarPath, { encoding: "utf-8" });

  const start = grammar.indexOf("// BEGIN AUTO-GENERATED FROM ./scripts/terraform");
  const end = grammar.indexOf("// END AUTO-GENERATED FROM ./scripts/terraform");
  assert.ok(start, "missing start generator tag for terraform grammar generation");
  assert.ok(end, "missing end generator tag for terraform grammar generation");

  fs.writeFileSync(
    grammarPath,
    `${grammar.slice(0, start)}// BEGIN AUTO-GENERATED FROM ./scripts/terraform
    ${text}

    ${grammar.slice(end, grammar.length)}`
  );
}

async function parseNamesDataForResources() {
  const names = fs.readFileSync(path.join(__dirname, "..", "..", "lib", "vendor", "terraform", "names", "names_data.csv"), {
    encoding: "utf-8",
  });
  const rows = names.split("\n");
  const prefixes = new Map<string, string>();
  let headers: string[] = [];

  for (const row of rows) {
    if (!headers.length) {
      headers = row.split(",");
      continue;
    }
    if (row === "") {
      continue;
    }
    const columns = row.split(",");
    if (unsupportedNodeType(columns)) {
      continue;
    }
    if (!columns[Columns.ColResourcePrefixActual]) {
      // these packages always use ColProviderPackageCorrect for the endpoint name
      for (const expanded of expandPrefix(columns[Columns.ColResourcePrefixCorrect])) {
        prefixes.set(expanded, columns[Columns.ColProviderPackageCorrect]);
      }

      continue;
    }
    if (prefixes.has(columns[Columns.ColResourcePrefixActual])) {
      console.log("duplicate", columns);
    }
    for (const expanded of expandPrefix(columns[Columns.ColResourcePrefixActual])) {
      prefixes.set(expanded, columns[Columns.ColSplitPackageRealPackage] || columns[Columns.ColProviderPackageCorrect]);
    }
  }

  const out = toGrammar(prefixes);
  assert.ok(TF_REGEX_MAPPING.size === 0, "TF_REGEX_MAPPING contains entries");
  writeGrammar(out);
}

parseNamesDataForResources();
