import path from "path";
import Parser from "web-tree-sitter";
import arg from "arg";
import { walk } from "./input";
import * as terraform from "./terraform";

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
  const sources = await walk(options.input, WALK_OPTIONS[options.language]);

  switch (options.language) {
    case Language.Terraform:
      terraform.compile(parser, sources);
      break;
    default:
      break;
  }
}

function enumFromStringValue<T>(enm: { [s: string]: T }, value: string): T | undefined {
  return (Object.values(enm) as unknown as string[]).includes(value) ? (value as unknown as T) : undefined;
}

if (require.main === module) {
  const options = arg({ "--language": String }, { argv: process.argv });
  const language = enumFromStringValue(Language, options["--language"]) || Language.Terraform;
  compile({ input: options["_"].pop(), language });
}
