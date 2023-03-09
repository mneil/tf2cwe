import path from "path";
import crypto from "crypto";
import * as types from "./types";
import { ast } from "../..";

interface Config {
  accountId: string;
  region: string;
  partition: string;
  userAgent: types.UserAgent;
  eventType: types.EventType;
}

interface ArnResource {
  accountId: string;
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
  arnFormat = arnFormat.replace("${Account}", resource.accountId);
  arnFormat = arnFormat.slice(0, arnFormat.lastIndexOf("${")) + resource.name;
  return arnFormat;
}

function resourceToEvent(node: ast.Resource, config: Config): types.Event {
  const arn = serviceToArn({ ...config, product: node.product, service: node.service, name: node.name });
  return {
    version: "0",
    id: crypto.randomUUID(),
    "detail-type": "AWS API Call via CloudTrail",
    source: `aws.${node.service}`,
    account: config.accountId,
    time: new Date().toISOString(),
    region: config.region,
    // TODO: need to handle all types of arn formats including those with ids and tokens. See S3 for a good example
    resources: [arn],
    detail: {
      eventVersion: types.EVENT_VERSION,
      // TODO: have userIdentity be configurable from config type / comments
      userIdentity: {
        type: types.UserIdentityType.Root,
        principalId: "123456789012",
        arn: "arn:aws:iam::123456789012:root",
        accountId: "123456789012",
        sessionContext: {
          attributes: {
            mfaAuthenticated: "false",
            creationDate: new Date().toISOString(),
          },
        },
      },
      eventTime: new Date().toISOString(),
      eventSource: `${node.service}.amazonaws.com`,
      // TODO: Find this eventName
      eventName: "CreateBucket",
      awsRegion: config.region,
      sourceIPAddress: "100.100.100.100",
      userAgent: config.userAgent,
      // TODO: fill in / resolve the request parameters
      requestParameters: {},
      responseElements: null,
      requestID: "9D767BCC3B4E7487",
      eventID: crypto.randomUUID(),
      eventType: config.eventType,
    },
  };
}

export async function compile(nodes: ast.Node[]) {
  const resources = nodes
    .filter((n) => n.is(ast.Type.Resource))
    .map((r: ast.Resource) => {
      try {
        return resourceToEvent(r, {
          accountId: "123456789012",
          region: "us-east-1",
          userAgent: types.UserAgent.User,
          eventType: types.EventType.AwsApiCall,
          partition: types.Partition.Aws,
        });
      } catch (e) {
        console.warn(`Unable to resolve resource for ${r.service} ${r.product} ${r.name}`);
        return undefined;
      }
    });
  return resources;
}
