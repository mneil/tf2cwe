import assert from "assert";
import { ast } from "../lib";

function getTerraformFixture() {
  return FIXTURES.filter((f) => f.name === "terraform")[0];
}
describe("terraform HCL to CWE", () => {
  it("should pass", () => {
    const resources = getTerraformFixture().blocks.filter((b) => b.is(ast.Type.Resource));
    assert.equal(resources.length, 1);
  });
});
