import assert from "assert";
import { ast } from "../lib";

function getTerraformFixture() {
  return FIXTURES.filter((f) => f.name === "terraform")[0];
}
describe("terraform HCL to CWE", () => {
  it("should pass", () => {
    assert.equal(getTerraformFixture().blocks.filter((b) => b.is(ast.Type.Resource)).length, 1);
  });
});
