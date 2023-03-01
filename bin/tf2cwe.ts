import { compile, Language } from "../lib/index";
import arg from "arg";

function enumFromStringValue<T>(enm: { [s: string]: T }, value: string): T | undefined {
  return (Object.values(enm) as unknown as string[]).includes(value) ? (value as unknown as T) : undefined;
}
const options = arg({ "--language": String }, { argv: process.argv });
const language = enumFromStringValue(Language, options["--language"]) || Language.Terraform;
(async () => {
  const blocks = await compile({ input: options["_"].pop(), language });
  console.log(JSON.stringify(blocks, undefined, 2));
})();
