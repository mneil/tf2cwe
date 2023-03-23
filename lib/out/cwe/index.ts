import path from "path";
import crypto from "crypto";
import * as types from "./types";
import { ast } from "../..";
import assert from "assert";

// interface Config {
//   accountId: string;
//   region: string;
//   partition: string;
//   userAgent: types.UserAgent;
//   eventType: types.EventType;
//   identity: ast.IdentityType;
// }

interface ArnResource {
  account: string;
  region: string;
  partition: string;
  service: string;
  product: string;
  name: string;
}

function serviceToArn(resource: ArnResource) {
  const serviceDefinition = require(path.resolve(
    __dirname,
    "..",
    "..",
    "vendor",
    "aws-policy-generator",
    "lib",
    "serviceDefinitions",
    resource.service,
    `${resource.service}Resources.json`,
  ));
  let arnFormat = serviceDefinition[resource.product].arn as string;
  arnFormat = arnFormat.replace("${Partition}", resource.partition);
  arnFormat = arnFormat.replace("${Region}", resource.region);
  arnFormat = arnFormat.replace("${Account}", resource.account);
  arnFormat = arnFormat.slice(0, arnFormat.lastIndexOf("${")) + resource.name;
  return arnFormat;
}

function getUserIdentity(config: ast.Config): types.UserIdentity {
  const identityType =
    types.UserIdentityType[config.identity.type as keyof typeof types.UserIdentityType] || types.UserIdentityType.User;

  let identity: Record<string, any> = {};
  // TODO: Support all identity types available
  switch (identityType) {
    case types.UserIdentityType.Assumed:
      const type = types.UserIdentityType[config.identity.details.type as keyof typeof types.UserIdentityType];
      assert.ok(type, "must provide an identity type of SAMLUser or WebIdentityUser");
      return {
        type,
        principalId: config.identity.details.principal,
        userName: config.identity.details.name,
        identityProvider: config.identity.details.identityProvider,
      };
    case types.UserIdentityType.User:
      identity = {
        type: types.UserIdentityType.User,
        arn: `arn:aws:iam::${config.account}:user/${config.identity.details.name}`,
        userName: config.identity.details.name,
      };
    case types.UserIdentityType.Role:
      identity = {
        type: types.UserIdentityType.Role,
        arn: `arn:aws:iam::${config.account}:role/${config.identity.details.name}`,
        userName: config.identity.details.name,
      };
    case types.UserIdentityType.Root:
      return Object.assign(
        {
          type: types.UserIdentityType.Root,
          principalId: "TF2CWETF2CWE",
          arn: `arn:aws:iam::${config.account}:root`,
          accountId: config.account,
          sessionContext: Object.assign(
            {
              attributes: {
                mfaAuthenticated: "true",
                creationDate: new Date().toISOString(),
              },
            },
            identity.sessionContext || {},
          ),
        },
        identity,
      );

    default:
      assert(false, `unknown user identity ${config.identity.type}`);
  }
}

function resourceToEvent(node: ast.Resource): types.Event {
  const config = node.config;
  const arn = serviceToArn({
    product: node.product,
    service: node.service,
    name: node.name,
    account: config.account,
    region: config.region,
    partition: config.partition,
  });
  return {
    version: "0",
    id: crypto.randomUUID(),
    "detail-type": "AWS API Call via CloudTrail",
    source: `aws.${node.service}`,
    account: config.account,
    time: new Date().toISOString(),
    region: config.region,
    // TODO: need to handle all types of arn formats including those with ids and tokens. See S3 for a good example
    resources: [arn],
    detail: {
      eventVersion: types.EVENT_VERSION,
      // TODO: have userIdentity be configurable from config type / comments
      userIdentity: getUserIdentity(config),
      eventTime: new Date().toISOString(),
      eventSource: `${node.service}.amazonaws.com`,
      // TODO: Find this eventName CreateBucket... etc...
      eventName: node.action,
      awsRegion: config.region,
      sourceIPAddress: "100.100.100.100",
      userAgent: types.UserAgent[config.userAgent as keyof typeof types.UserAgent] || types.UserAgent.User,
      requestParameters: node.properties,
      // TODO: fill in the response parameters... how?
      responseElements: null,
      requestID: "TF2CWETF2CWETF2C",
      eventID: crypto.randomUUID(),
      eventType: types.EventType[config.origin],
    },
  };
}

export async function compile(nodes: ast.Node[]) {
  // TODO: config should be user configured / passed
  const resources = nodes
    .filter((n) => n.is(ast.Type.Resource))
    .map((r: ast.Resource) => {
      try {
        return resourceToEvent(r);
      } catch (e) {
        console.warn(`Unable to resolve resource for ${r.service} ${r.product} ${r.name}`);
        return undefined;
      }
    });
  return resources;
}
