import fs from "fs";
import path from "path";
import { input, ast } from "../lib";

export interface Fixture {
  name: string;
  nodes: ast.Node[];
}

let FIXTURES: Fixture[] = [];

// This is to fix the issue with tree-sitter not being able to load the wasm file
// due to all fetch implementation missing the capability to load a file from disk
// for some unholy reason. Security implications they say!
Object.assign(globalThis, {
  fetch: (url: string) => {
    return new Promise((resolve) => {
      const filePath = path.normalize(url.replace("file:", ""));
      const readStream = fs.createReadStream(filePath);
      readStream.on("open", () => {
        resolve(
          new Response(readStream as any as BodyInit, {
            status: 200,
            statusText: "OK",
            headers: {
              "Content-Length": `${fs.statSync(filePath).size}`,
              "Content-Type": "application/wasm",
            },
          }),
        );
      });
    });
  },
});

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
        }),
      ),
  );
  return FIXTURES;
}
