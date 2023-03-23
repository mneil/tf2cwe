export enum UserAgent {
  User = "signin.amazonaws.com",
  Root = "console.amazonaws.com",
  Lambda = "lambda.amazonaws.com",
  JavaSDK = "aws-sdk-java",
  RubySDK = "aws-sdk-ruby",
  AWSCLI = "aws-cli/1.3.23 Python/2.7.6 Linux/2.6.18-164.el5",
}

export enum Partition {
  Aws = "aws",
}

export enum EventType {
  ApiCall = "AwsApiCall",
  ServiceEvent = "AwsServiceEvent",
  ConsoleAction = "AwsConsoleAction",
  ConsoleSignIn = "AwsConsoleSignIn",
  Stream = "AwsCloudTrailInsight",
}

export const EVENT_VERSION = "1.08";

export enum UserIdentityType {
  Root = "Root",
  User = "IAMUser",
  Assumed = "AssumedRole",
  Role = "Role",
  Federated = "FederatedUser",
  Directory = "Directory",
  Account = "AWSAccount",
  Service = "AWSService",
  Unknown = "Unknown",
  SAMLUser = "SAMLUser",
  WebIdentityUser = "WebIdentityUser",
}

export interface SessionContext {
  attributes?: {
    mfaAuthenticated?: "string";
    creationDate?: "string";
  };
  sessionIssuer?: {
    type?: string;
    principalId?: string;
    arn?: string;
    accountId?: string;
    userName?: string;
  };
  webIdFederationData?: Record<string, any>;
}

/**
 * @see https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-event-reference-user-identity.html#cloudtrail-event-reference-user-identity-fields
 */
export interface UserIdentity {
  type: UserIdentityType;
  userName?: string;
  principalId?: string;
  arn?: string;
  accountId?: string;
  accessKeyId?: string;
  sessionContext?: Record<string, any>;
  invokedBy?: string;
  sessionIssuer?: string;
  webIdFederationData?: Record<string, string | object>;
  identityProvider?: string;
}

/**
 * @see https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-event-reference-record-contents.html
 */
export interface Detail {
  eventTime: string;
  // The current version is 1.08
  eventVersion: string;
  userIdentity: UserIdentity;
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
export interface Event {
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
