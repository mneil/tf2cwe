import path from "path";
import crypto from "crypto";
import fs from "fs";
import * as types from "./types";
import { ast } from "../..";

export * as types from "./types";

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

function makeRequestId() {
  const length = 16;
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

function serviceToArn(resource: ArnResource) {
  // TODO: this needs to be smarter to handle all sorts of arn formats
  // including those with ids and tokens. See S3 for a good example
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

interface ApiCall {
  service: string;
  action: string;
}
interface Crud {
  create: ApiCall[];
  read: ApiCall[];
  update: ApiCall[];
  delete: ApiCall[];
}

const providerData: Record<string, any> = {
  aws: undefined,
};

async function getResourceApiCalls(provider: string, service: string, product: string): Promise<Crud> {
  let data;
  if (providerData[provider]) {
    data = providerData[provider];
  } else {
    data = await fs.promises.readFile(path.resolve(__dirname, "data", `${provider}.json`), "utf-8");
    providerData[provider] = JSON.parse(data);
  }
  return providerData[provider][service][product];
}

async function resourceToEvent(node: ast.Resource, config: Config): Promise<types.Event[]> {
  const api = await getResourceApiCalls("aws", node.service, node.product);
  const arn = serviceToArn({ ...config, product: node.product, service: node.service, name: node.name });

  return api.create.map((operation) => {
    return {
      version: "0",
      id: crypto.randomUUID(),
      "detail-type": "AWS API Call via CloudTrail",
      source: `aws.${node.service}`,
      account: config.accountId,
      time: new Date().toISOString(),
      region: config.region,
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
        eventName: operation.action,
        awsRegion: config.region,
        sourceIPAddress: "100.100.100.100",
        userAgent: config.userAgent,
        // TODO: fill in / resolve the request parameters
        requestParameters: {
          // ...node.properties,
        },
        responseElements: null,
        requestID: makeRequestId(),
        eventID: crypto.randomUUID(),
        eventType: config.eventType,
      },
    };
  });
}

export async function compile(nodes: ast.Node[]) {
  const resources = await Promise.all(
    nodes
      .filter((n) => n.is(ast.Type.Resource))
      .map(async (r: ast.Resource) => {
        try {
          return await resourceToEvent(r, {
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
      }),
  );
  return resources.flat();
}
