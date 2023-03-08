import crypto from "crypto";
import * as types from "./types";
import { ast } from "../..";

interface Config {
  accountId: string;
  region: string;
  userAgent: types.UserAgent;
  eventType: types.EventType;
}

enum Columns {
  ColAWSCLIV2Command = 0,
  ColAWSCLIV2CommandNoDashes = 1,
  ColGoV1Package = 2,
  ColGoV2Package = 3,
  ColProviderPackageActual = 4,
  ColProviderPackageCorrect = 5, // package name we care about. ie: vpc goes back to ec2, aws_instance is ec2
  ColSplitPackageRealPackage = 6,
  ColAliases = 7,
  ColProviderNameUpper = 8,
  ColGoV1ClientTypeName = 9,
  ColSkipClientGenerate = 10,
  ColClientSDKV1 = 11,
  ColClientSDKV2 = 12, // supported prefixes. aws_instance_ for example under the ec2 namespace
  ColResourcePrefixActual = 13, // hard prefix like aws_ec2_
  ColResourcePrefixCorrect = 14,
  ColFilePrefix = 15,
  ColDocPrefix = 16, // prefix without provider ec2_coip_pool;ec2_local_gateway, ec2_availability_;ec2_capacity_;ec2_fleet;ec2_host;ec2_instance_;ec2_serial_;ec2_spot_;ec2_tag;eip;instance;key_pair;launch_template;placement_group;spot_
  ColHumanFriendly = 17,
  ColBrand = 18,
  ColExclude = 19,
  ColAllowedSubcategory = 20,
  ColDeprecatedEnvVar = 21,
  ColEnvVar = 22,
  ColNote = 23,
}

("aws_ec2_local_gateway_virtual_interface_groups");
const row =
  "ec2,ec2,ec2,ec2,,ec2,ec2,,EC2,EC2,,1,2,aws_(ami|availability_zone|ec2_(availability|capacity|fleet|host|instance|serial|spot|tag)|eip|instance|key_pair|launch_template|placement_group|spot),aws_ec2_,ec2_,ami;availability_zone;ec2_availability_;ec2_capacity_;ec2_fleet;ec2_host;ec2_instance_;ec2_serial_;ec2_spot_;ec2_tag;eip;instance;key_pair;launch_template;placement_group;spot_,EC2 (Elastic Compute Cloud),Amazon,,,,,";

// aws_((default_)?(network_acl|route_table|security_group|subnet|vpc(?!_ipam))|ec2_(managed|network|subnet|traffic)|egress_only_internet|flow_log|internet_gateway|main_route_table_association|nat_gateway|network_interface|prefix_list|route\b)

function resourceToEvent(node: ast.Resource, config: Config): types.Event {
  const columns = row.split(",");
  const nodeTypes = columns[Columns.ColResourcePrefixActual];

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
      eventVersion: types.EVENT_VERSION,
      userIdentity: {
        type: types.UserIdentityType.Root,
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
      resourceToEvent(r as ast.Resource, {
        accountId: "123456789012",
        region: "us-east-1",
        userAgent: types.UserAgent.User,
        eventType: types.EventType.AwsApiCall,
      })
    );
  return resources;
}
