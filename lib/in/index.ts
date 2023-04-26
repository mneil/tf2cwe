import * as terraform from "./terraform";
import type { Node } from "../ast";

export * as ast from "../ast";
export enum Language {
  Terraform = "hcl",
}

interface CompileOptions {
  input: string;
  language: Language;
}

export async function compile(options: CompileOptions): Promise<Node[]> {
  if (!options.input) {
    throw new Error("tf2cwe compile requires an input");
  }

  switch (options.language) {
    case Language.Terraform:
      return await terraform.compile(options.input);
    default:
      throw new Error(`unhandled language: ${options.input}`);
      break;
  }
}
