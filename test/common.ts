import path from "path";
import { input, ast } from "../lib";

export interface Fixture {
  name: string;
  nodes: ast.Node[];
}

let FIXTURES: Fixture[] = [];

export async function fixtures() {
  if (FIXTURES.length) {
    return FIXTURES;
  }
  const fixtures = [{ input: "terraform", language: input.Language.Terraform }];
  FIXTURES = await Promise.all(
    fixtures
      .map((f) => {
        f.input = path.resolve(__dirname, "fixtures", f.input);
        return f;
      })
      .map((f) =>
        input.compile(f).then((nodes) => {
          return { name: path.basename(f.input), nodes };
        })
      )
  );
  return FIXTURES;
}
