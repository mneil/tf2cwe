import * as cwe from "./cwe";
import { ast } from "../";

export enum Language {
  CloudTrail = "cwe",
}

interface CompileOptions {
  input: ast.Node[];
  language: Language;
}

export async function compile(options: CompileOptions) {
  if (!options.input) {
    throw new Error("tf2cwe compile requires an input");
  }
  switch (options.language) {
    case Language.CloudTrail:
      return await cwe.compile(options.input);
    default:
      break;
  }
}
