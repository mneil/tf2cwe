import { input, output } from "../lib";
import arg from "arg";

function enumFromStringValue<T>(enm: { [s: string]: T }, value: string): T | undefined {
  return (Object.values(enm) as unknown as string[]).includes(value) ? (value as unknown as T) : undefined;
}

const options = arg({ "--in": String, "--out": String }, { argv: process.argv });
const language = enumFromStringValue(input.Language, options["--in"]!) || input.Language.Terraform;
const outLanguage = enumFromStringValue(output.Language, options["--out"]!) || output.Language.CloudTrail;

(async () => {
  const nodes = await input.compile({ input: options["_"].pop()!, language });
  const out = await output.compile({ input: nodes!, language: outLanguage });
  console.log(JSON.stringify(out, undefined, 2));
})();
