import crypto from "crypto";
import { ast } from "../";

enum UserAgent {
  User = "signin.amazonaws.com",
  Root = "console.amazonaws.com",
  Lambda = "lambda.amazonaws.com",
  JavaSDK = "aws-sdk-java",
  RubySDK = "aws-sdk-ruby",
  AWSCLI = "aws-cli/1.3.23 Python/2.7.6 Linux/2.6.18-164.el5",
}

enum EventType {
  AwsApiCall,
  AwsServiceEvent,
  AwsConsoleAction,
  AwsConsoleSignIn,
  AwsCloudTrailInsight,
}

const EVENT_VERSION = "1.08";

/**
 * @see https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-event-reference-record-contents.html
 */
interface Detail {
  eventTime: string;
  // The current version is 1.08
  eventVersion: string;
  userIdentity: {
    type: "Root";
    principalId: "123456789012";
    arn: "arn:aws:iam::123456789012:root";
    accountId: "123456789012";
    sessionContext: {
      attributes: {
        mfaAuthenticated: "false";
        creationDate: "2016-02-20T01:05:59Z";
      };
    };
  };
  eventSource: string;
  eventName: string;
  awsRegion: string;
  sourceIPAddress: string;
  userAgent: UserAgent;
  errorCode?: string;
  errorMessage?: string;
  requestParameters: null | Record<string, any>;
  responseElements: null | Record<string, any>;
  additionalEventData?: Record<string, any>;
  requestID: string;
  eventID: string;
  eventType: EventType;
  apiVersion?: string;
  managementEvent?: boolean;
  readOnly?: boolean;
  recipientAccountId?: string;
  serviceEventDetails?: string;
  sharedEventID?: string;
  vpcEndpointId?: string;
  eventCategory?: string;
  addendum?: Record<string, any>;
  sessionCredentialFromConsole?: Record<string, any>;
  edgeDeviceDetails?: Record<string, any>;
  tlsDetails?: Record<string, any>;
}

/**
 * @see https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/EventTypes.html#events-for-services-not-listed
 */
interface Event {
  version: string;
  id: string;
  "detail-type": string;
  source: string;
  account: string;
  time: string;
  region: string;
  resources: string[];
  detail: Detail;
}

interface Config {
  accountId: string;
  region: string;
  userAgent: UserAgent;
  eventType: EventType;
}

function resourceToEvent(node: ast.Node, config: Config): Event {
  return {
    version: "0",
    id: crypto.randomUUID(),
    "detail-type": "AWS API Call via CloudTrail",
    source: "aws.s3",
    account: config.accountId,
    time: new Date().toISOString(),
    region: config.region,
    resources: [""],
    detail: {
      eventVersion: EVENT_VERSION,
      userIdentity: {
        type: "Root",
        principalId: "123456789012",
        arn: "arn:aws:iam::123456789012:root",
        accountId: "123456789012",
        sessionContext: {
          attributes: {
            mfaAuthenticated: "false",
            creationDate: "2016-02-20T01:05:59Z",
          },
        },
      },
      eventTime: "2016-02-20T01:09:13Z",
      eventSource: "s3.amazonaws.com",
      eventName: "CreateBucket",
      awsRegion: config.region,
      sourceIPAddress: "100.100.100.100",
      userAgent: config.userAgent,
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
    .map((r) =>
      resourceToEvent(r, {
        accountId: "123456789012",
        region: "us-east-1",
        userAgent: UserAgent.User,
        eventType: EventType.AwsApiCall,
      })
    );
  return resources;
}
