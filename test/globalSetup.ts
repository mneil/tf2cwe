import path from "path";
import { input, ast } from "../lib";

interface Fixture {
  name: string;
  blocks: ast.Node[];
}

export default async function setup() {
  const fixtures = [{ input: "terraform", language: input.Language.Terraform }];
  global.FIXTURES = await Promise.all(
    fixtures
      .map((f) => {
        f.input = path.resolve(__dirname, f.input);
        return f;
      })
      .map((f) =>
        input.compile(f).then((blocks) => {
          return { name: path.basename(f.input), blocks };
        })
      )
  );
}

declare global {
  var FIXTURES: Fixture[];
}
