import { output } from "../lib";
import { fixtures } from "./common";

async function getTerraformFixture() {
  return (await fixtures()).filter((f) => f.name === "terraform")[0];
}
describe("terraform HCL to CWE", () => {
  it("should pass", async () => {
    const fixture = await getTerraformFixture();
    const out = await output.compile({ language: output.Language.CloudTrail, input: fixture.nodes });
    for(const resource of out) {
      delete resource.id
      delete resource.detail.eventID
    }
    expect(out[0]).toMatchSnapshot({
      time:  expect.any(String),
      detail: {
        userIdentity: {
          sessionContext: {
            attributes: {
              creationDate: expect.any(String),
            }
          }
        },
        eventTime: expect.any(String),
      }
    });
  });
});
