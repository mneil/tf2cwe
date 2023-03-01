import path from "path";
import { compile, Language, ast } from "../lib";

interface Fixture {
  name: string;
  blocks: ast.Node[];
}

export default async function setup() {
  const fixtures = [{ input: "terraform", language: Language.Terraform }];
  global.FIXTURES = await Promise.all(
    fixtures
      .map((f) => {
        f.input = path.resolve(__dirname, f.input);
        return f;
      })
      .map((f) =>
        compile(f).then((blocks) => {
          return { name: path.basename(f.input), blocks };
        })
      )
  );
}

declare global {
  var FIXTURES: Fixture[];
}
