import assert from "assert";
import { ast, output } from "../lib";
import { fixtures } from "./common";

async function getTerraformFixture() {
  return (await fixtures()).filter((f) => f.name === "terraform")[0];
}
describe("terraform HCL to CWE", () => {
  it("should pass", async () => {
    const fixture = await getTerraformFixture();
    const out = output.compile({ language: output.Language.CloudTrail, input: fixture.nodes });
    assert.ok(out);
  });
});
