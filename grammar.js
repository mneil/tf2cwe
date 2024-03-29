/// <reference path="node_modules/tree-sitter-cli/dsl.d.ts" />
module.exports = grammar(require("tree-sitter-hcl/grammar"), {
  name: "hcl",

  rules: {
    block: ($, original) => choice(original, $.node_resource),

    body: ($, original) => choice(original, $.for_each),

    for_each: ($) => seq("for_each", "=", $.expression),

    node_resource: ($) =>
      seq(
        "resource",
        $.resource_type,
        alias($.string_lit, "resource_name"),
        $.block_start,
        optional($.body),
        $.block_end,
      ),

    resource_type: ($) => seq($.quoted_template_start, optional($.resource_service_map), $.quoted_template_end),

    // STOP. Do not edit below this line. The rest of this file is auto-generated.
    // BEGIN AUTO-GENERATED FROM ./scripts/terraform
    
    resource_service_map: ($) => choice(
      alias($.account0, "account"),
      alias($.acm0, "acm"),
      alias($.acmpca0, "acmpca"),
      alias($.alexaforbusiness0, "alexaforbusiness"),
      alias($.amp0, "amp"),
      alias($.amplify0, "amplify"),
      alias($.amplifybackend0, "amplifybackend"),
      alias($.amplifyuibuilder0, "amplifyuibuilder"),
      alias($.apigateway0, "apigateway"),
      alias($.apigatewaymanagementapi0, "apigatewaymanagementapi"),
      alias($.apigatewayv20, "apigatewayv2"),
      alias($.appmesh0, "appmesh"),
      alias($.apprunner0, "apprunner"),
      alias($.appconfig0, "appconfig"),
      alias($.appconfigdata0, "appconfigdata"),
      alias($.appflow0, "appflow"),
      alias($.appintegrations0, "appintegrations"),
      alias($.applicationautoscaling0, "applicationautoscaling"),
      alias($.applicationcostprofiler0, "applicationcostprofiler"),
      alias($.discovery0, "discovery"),
      alias($.mgn0, "mgn"),
      alias($.appstream0, "appstream"),
      alias($.appsync0, "appsync"),
      alias($.athena0, "athena"),
      alias($.auditmanager0, "auditmanager"),
      alias($.autoscaling0, "autoscaling"),
      alias($.autoscalingplans0, "autoscalingplans"),
      alias($.backup0, "backup"),
      alias($.backupgateway0, "backupgateway"),
      alias($.batch0, "batch"),
      alias($.billingconductor0, "billingconductor"),
      alias($.braket0, "braket"),
      alias($.ce0, "ce"),
      alias($.chime0, "chime"),
      alias($.chimesdkidentity0, "chimesdkidentity"),
      alias($.chimesdkmeetings0, "chimesdkmeetings"),
      alias($.chimesdkmessaging0, "chimesdkmessaging"),
      alias($.cloudcontrol0, "cloudcontrol"),
      alias($.clouddirectory0, "clouddirectory"),
      alias($.servicediscovery0, "servicediscovery"),
      alias($.cloud90, "cloud9"),
      alias($.cloudformation0, "cloudformation"),
      alias($.cloudfront0, "cloudfront"),
      alias($.cloudhsmv20, "cloudhsmv2"),
      alias($.cloudsearch0, "cloudsearch"),
      alias($.cloudsearchdomain0, "cloudsearchdomain"),
      alias($.cloudtrail0, "cloudtrail"),
      alias($.cloudwatch0, "cloudwatch"),
      alias($.applicationinsights0, "applicationinsights"),
      alias($.evidently0, "evidently"),
      alias($.logs0, "logs"),
      alias($.rum0, "rum"),
      alias($.synthetics0, "synthetics"),
      alias($.codeartifact0, "codeartifact"),
      alias($.codebuild0, "codebuild"),
      alias($.codecommit0, "codecommit"),
      alias($.deploy0, "deploy"),
      alias($.codeguruprofiler0, "codeguruprofiler"),
      alias($.codegurureviewer0, "codegurureviewer"),
      alias($.codepipeline0, "codepipeline"),
      alias($.codestar0, "codestar"),
      alias($.codestarconnections0, "codestarconnections"),
      alias($.codestarnotifications0, "codestarnotifications"),
      alias($.cognitoidentity0, "cognitoidentity"),
      alias($.cognitoidp0, "cognitoidp"),
      alias($.cognitosync0, "cognitosync"),
      alias($.comprehend0, "comprehend"),
      alias($.comprehendmedical0, "comprehendmedical"),
      alias($.computeoptimizer0, "computeoptimizer"),
      alias($.configservice0, "configservice"),
      alias($.connect0, "connect"),
      alias($.connectcontactlens0, "connectcontactlens"),
      alias($.customerprofiles0, "customerprofiles"),
      alias($.connectparticipant0, "connectparticipant"),
      alias($.voiceid0, "voiceid"),
      alias($.wisdom0, "wisdom"),
      alias($.controltower0, "controltower"),
      alias($.cur0, "cur"),
      alias($.dataexchange0, "dataexchange"),
      alias($.datapipeline0, "datapipeline"),
      alias($.datasync0, "datasync"),
      alias($.detective0, "detective"),
      alias($.devicefarm0, "devicefarm"),
      alias($.devopsguru0, "devopsguru"),
      alias($.directconnect0, "directconnect"),
      alias($.dlm0, "dlm"),
      alias($.dms0, "dms"),
      alias($.docdb0, "docdb"),
      alias($.drs0, "drs"),
      alias($.ds0, "ds"),
      alias($.dynamodb0, "dynamodb"),
      alias($.dax0, "dax"),
      alias($.dynamodbstreams0, "dynamodbstreams"),
      alias($.ec20, "ec2"),
      alias($.ebs0, "ebs"),
      alias($.ec21, "ec2"),
      alias($.imagebuilder0, "imagebuilder"),
      alias($.ec2instanceconnect0, "ec2instanceconnect"),
      alias($.ecr0, "ecr"),
      alias($.ecrpublic0, "ecrpublic"),
      alias($.ecs0, "ecs"),
      alias($.efs0, "efs"),
      alias($.eks0, "eks"),
      alias($.elasticbeanstalk0, "elasticbeanstalk"),
      alias($.elasticinference0, "elasticinference"),
      alias($.elastictranscoder0, "elastictranscoder"),
      alias($.elasticache0, "elasticache"),
      alias($.es0, "es"),
      alias($.elbv20, "elbv2"),
      alias($.elbv21, "elbv2"),
      alias($.elb0, "elb"),
      alias($.mediaconnect0, "mediaconnect"),
      alias($.mediaconvert0, "mediaconvert"),
      alias($.medialive0, "medialive"),
      alias($.mediapackage0, "mediapackage"),
      alias($.mediapackagevod0, "mediapackagevod"),
      alias($.mediastore0, "mediastore"),
      alias($.mediastoredata0, "mediastoredata"),
      alias($.mediatailor0, "mediatailor"),
      alias($.emr0, "emr"),
      alias($.emrcontainers0, "emrcontainers"),
      alias($.emrserverless0, "emrserverless"),
      alias($.events0, "events"),
      alias($.schemas0, "schemas"),
      alias($.fis0, "fis"),
      alias($.finspace0, "finspace"),
      alias($.finspacedata0, "finspacedata"),
      alias($.fms0, "fms"),
      alias($.forecast0, "forecast"),
      alias($.forecastquery0, "forecastquery"),
      alias($.frauddetector0, "frauddetector"),
      alias($.fsx0, "fsx"),
      alias($.gamelift0, "gamelift"),
      alias($.globalaccelerator0, "globalaccelerator"),
      alias($.glue0, "glue"),
      alias($.databrew0, "databrew"),
      alias($.groundstation0, "groundstation"),
      alias($.guardduty0, "guardduty"),
      alias($.health0, "health"),
      alias($.healthlake0, "healthlake"),
      alias($.honeycode0, "honeycode"),
      alias($.iam0, "iam"),
      alias($.accessanalyzer0, "accessanalyzer"),
      alias($.inspector0, "inspector"),
      alias($.inspector20, "inspector2"),
      alias($.iot1clickdevices0, "iot1clickdevices"),
      alias($.iot1clickprojects0, "iot1clickprojects"),
      alias($.iotanalytics0, "iotanalytics"),
      alias($.iot0, "iot"),
      alias($.iotdata0, "iotdata"),
      alias($.iotdeviceadvisor0, "iotdeviceadvisor"),
      alias($.iotevents0, "iotevents"),
      alias($.ioteventsdata0, "ioteventsdata"),
      alias($.iotfleethub0, "iotfleethub"),
      alias($.greengrass0, "greengrass"),
      alias($.greengrassv20, "greengrassv2"),
      alias($.iotjobsdata0, "iotjobsdata"),
      alias($.iotsecuretunneling0, "iotsecuretunneling"),
      alias($.iotsitewise0, "iotsitewise"),
      alias($.iotthingsgraph0, "iotthingsgraph"),
      alias($.iottwinmaker0, "iottwinmaker"),
      alias($.iotwireless0, "iotwireless"),
      alias($.ivs0, "ivs"),
      alias($.ivschat0, "ivschat"),
      alias($.kendra0, "kendra"),
      alias($.keyspaces0, "keyspaces"),
      alias($.kinesis0, "kinesis"),
      alias($.kinesisanalytics0, "kinesisanalytics"),
      alias($.kinesisanalyticsv20, "kinesisanalyticsv2"),
      alias($.firehose0, "firehose"),
      alias($.kinesisvideo0, "kinesisvideo"),
      alias($.kinesisvideoarchivedmedia0, "kinesisvideoarchivedmedia"),
      alias($.kinesisvideomedia0, "kinesisvideomedia"),
      alias($.kinesisvideosignaling0, "kinesisvideosignaling"),
      alias($.kms0, "kms"),
      alias($.lakeformation0, "lakeformation"),
      alias($.lambda0, "lambda"),
      alias($.lexmodels0, "lexmodels"),
      alias($.lexmodelsv20, "lexmodelsv2"),
      alias($.lexruntime0, "lexruntime"),
      alias($.lexruntimev20, "lexruntimev2"),
      alias($.licensemanager0, "licensemanager"),
      alias($.lightsail0, "lightsail"),
      alias($.location0, "location"),
      alias($.lookoutequipment0, "lookoutequipment"),
      alias($.lookoutmetrics0, "lookoutmetrics"),
      alias($.lookoutvision0, "lookoutvision"),
      alias($.machinelearning0, "machinelearning"),
      alias($.macie20, "macie2"),
      alias($.macie0, "macie"),
      alias($.managedblockchain0, "managedblockchain"),
      alias($.grafana0, "grafana"),
      alias($.kafka0, "kafka"),
      alias($.kafkaconnect0, "kafkaconnect"),
      alias($.marketplacecatalog0, "marketplacecatalog"),
      alias($.marketplacecommerceanalytics0, "marketplacecommerceanalytics"),
      alias($.marketplaceentitlement0, "marketplaceentitlement"),
      alias($.marketplacemetering0, "marketplacemetering"),
      alias($.memorydb0, "memorydb"),
      alias($.meta0, "meta"),
      alias($.mgh0, "mgh"),
      alias($.migrationhubconfig0, "migrationhubconfig"),
      alias($.migrationhubrefactorspaces0, "migrationhubrefactorspaces"),
      alias($.migrationhubstrategy0, "migrationhubstrategy"),
      alias($.mobile0, "mobile"),
      alias($.mq0, "mq"),
      alias($.mturk0, "mturk"),
      alias($.mwaa0, "mwaa"),
      alias($.neptune0, "neptune"),
      alias($.networkfirewall0, "networkfirewall"),
      alias($.networkmanager0, "networkmanager"),
      alias($.nimble0, "nimble"),
      alias($.oam0, "oam"),
      alias($.opensearch0, "opensearch"),
      alias($.opensearchserverless0, "opensearchserverless"),
      alias($.opsworks0, "opsworks"),
      alias($.opsworkscm0, "opsworkscm"),
      alias($.organizations0, "organizations"),
      alias($.outposts0, "outposts"),
      alias($.ec22, "ec2"),
      alias($.panorama0, "panorama"),
      alias($.personalize0, "personalize"),
      alias($.personalizeevents0, "personalizeevents"),
      alias($.personalizeruntime0, "personalizeruntime"),
      alias($.pinpoint0, "pinpoint"),
      alias($.pinpointemail0, "pinpointemail"),
      alias($.pinpointsmsvoice0, "pinpointsmsvoice"),
      alias($.pipes0, "pipes"),
      alias($.polly0, "polly"),
      alias($.pricing0, "pricing"),
      alias($.proton0, "proton"),
      alias($.qldb0, "qldb"),
      alias($.qldbsession0, "qldbsession"),
      alias($.quicksight0, "quicksight"),
      alias($.ram0, "ram"),
      alias($.rds0, "rds"),
      alias($.rdsdata0, "rdsdata"),
      alias($.pi0, "pi"),
      alias($.rbin0, "rbin"),
      alias($.redshift0, "redshift"),
      alias($.redshiftdata0, "redshiftdata"),
      alias($.redshiftserverless0, "redshiftserverless"),
      alias($.rekognition0, "rekognition"),
      alias($.resiliencehub0, "resiliencehub"),
      alias($.resourceexplorer20, "resourceexplorer2"),
      alias($.resourcegroups0, "resourcegroups"),
      alias($.resourcegroupstaggingapi0, "resourcegroupstaggingapi"),
      alias($.robomaker0, "robomaker"),
      alias($.rolesanywhere0, "rolesanywhere"),
      alias($.route530, "route53"),
      alias($.route53domains0, "route53domains"),
      alias($.route53recoverycluster0, "route53recoverycluster"),
      alias($.route53recoverycontrolconfig0, "route53recoverycontrolconfig"),
      alias($.route53recoveryreadiness0, "route53recoveryreadiness"),
      alias($.route53resolver0, "route53resolver"),
      alias($.s30, "s3"),
      alias($.s3control0, "s3control"),
      alias($.glacier0, "glacier"),
      alias($.s3outposts0, "s3outposts"),
      alias($.sagemaker0, "sagemaker"),
      alias($.sagemakera2iruntime0, "sagemakera2iruntime"),
      alias($.sagemakeredge0, "sagemakeredge"),
      alias($.sagemakerfeaturestoreruntime0, "sagemakerfeaturestoreruntime"),
      alias($.sagemakerruntime0, "sagemakerruntime"),
      alias($.savingsplans0, "savingsplans"),
      alias($.sdb0, "sdb"),
      alias($.scheduler0, "scheduler"),
      alias($.secretsmanager0, "secretsmanager"),
      alias($.securityhub0, "securityhub"),
      alias($.serverlessrepo0, "serverlessrepo"),
      alias($.servicecatalog0, "servicecatalog"),
      alias($.servicecatalogappregistry0, "servicecatalogappregistry"),
      alias($.servicequotas0, "servicequotas"),
      alias($.ses0, "ses"),
      alias($.sesv20, "sesv2"),
      alias($.sfn0, "sfn"),
      alias($.shield0, "shield"),
      alias($.signer0, "signer"),
      alias($.sms0, "sms"),
      alias($.snowdevicemanagement0, "snowdevicemanagement"),
      alias($.snowball0, "snowball"),
      alias($.sns0, "sns"),
      alias($.sqs0, "sqs"),
      alias($.ssm0, "ssm"),
      alias($.ssmcontacts0, "ssmcontacts"),
      alias($.ssmincidents0, "ssmincidents"),
      alias($.sso0, "sso"),
      alias($.ssoadmin0, "ssoadmin"),
      alias($.identitystore0, "identitystore"),
      alias($.ssooidc0, "ssooidc"),
      alias($.storagegateway0, "storagegateway"),
      alias($.sts0, "sts"),
      alias($.support0, "support"),
      alias($.swf0, "swf"),
      alias($.textract0, "textract"),
      alias($.timestreamquery0, "timestreamquery"),
      alias($.timestreamwrite0, "timestreamwrite"),
      alias($.transcribe0, "transcribe"),
      alias($.transcribestreaming0, "transcribestreaming"),
      alias($.transfer0, "transfer"),
      alias($.ec23, "ec2"),
      alias($.translate0, "translate"),
      alias($.ec24, "ec2"),
      alias($.ec25, "ec2"),
      alias($.ec26, "ec2"),
      alias($.ec27, "ec2"),
      alias($.ec28, "ec2"),
      alias($.ec29, "ec2"),
      alias($.wafv20, "wafv2"),
      alias($.waf0, "waf"),
      alias($.wafregional0, "wafregional"),
      alias($.ec210, "ec2"),
      alias($.budgets0, "budgets"),
      alias($.wellarchitected0, "wellarchitected"),
      alias($.workdocs0, "workdocs"),
      alias($.worklink0, "worklink"),
      alias($.workmail0, "workmail"),
      alias($.workmailmessageflow0, "workmailmessageflow"),
      alias($.workspaces0, "workspaces"),
      alias($.workspacesweb0, "workspacesweb"),
      alias($.xray0, "xray")
    ),

    account0: ($) => /aws_account_[a-zA-Z_]+/,
    acm0: ($) => /aws_acm_[a-zA-Z_]+/,
    acmpca0: ($) => /aws_acmpca_[a-zA-Z_]+/,
    alexaforbusiness0: ($) => /aws_alexaforbusiness_[a-zA-Z_]+/,
    amp0: ($) => /aws_prometheus_[a-zA-Z_]+/,
    amplify0: ($) => /aws_amplify_[a-zA-Z_]+/,
    amplifybackend0: ($) => /aws_amplifybackend_[a-zA-Z_]+/,
    amplifyuibuilder0: ($) => /aws_amplifyuibuilder_[a-zA-Z_]+/,
    apigateway0: ($) => /aws_api_gateway_[a-zA-Z_]+/,
    apigatewaymanagementapi0: ($) => /aws_apigatewaymanagementapi_[a-zA-Z_]+/,
    apigatewayv20: ($) => /aws_apigatewayv2_[a-zA-Z_]+/,
    appmesh0: ($) => /aws_appmesh_[a-zA-Z_]+/,
    apprunner0: ($) => /aws_apprunner_[a-zA-Z_]+/,
    appconfig0: ($) => /aws_appconfig_[a-zA-Z_]+/,
    appconfigdata0: ($) => /aws_appconfigdata_[a-zA-Z_]+/,
    appflow0: ($) => /aws_appflow_[a-zA-Z_]+/,
    appintegrations0: ($) => /aws_appintegrations_[a-zA-Z_]+/,
    applicationautoscaling0: ($) => /aws_appautoscaling_[a-zA-Z_]+/,
    applicationcostprofiler0: ($) => /aws_applicationcostprofiler_[a-zA-Z_]+/,
    discovery0: ($) => /aws_discovery_[a-zA-Z_]+/,
    mgn0: ($) => /aws_mgn_[a-zA-Z_]+/,
    appstream0: ($) => /aws_appstream_[a-zA-Z_]+/,
    appsync0: ($) => /aws_appsync_[a-zA-Z_]+/,
    athena0: ($) => /aws_athena_[a-zA-Z_]+/,
    auditmanager0: ($) => /aws_auditmanager_[a-zA-Z_]+/,
    autoscaling0: ($) => /aws_(autoscaling_|launch_configuration)/,
    autoscalingplans0: ($) => /aws_autoscalingplans_[a-zA-Z_]+/,
    backup0: ($) => /aws_backup_[a-zA-Z_]+/,
    backupgateway0: ($) => /aws_backupgateway_[a-zA-Z_]+/,
    batch0: ($) => /aws_batch_[a-zA-Z_]+/,
    billingconductor0: ($) => /aws_billingconductor_[a-zA-Z_]+/,
    braket0: ($) => /aws_braket_[a-zA-Z_]+/,
    ce0: ($) => /aws_ce_[a-zA-Z_]+/,
    chime0: ($) => /aws_chime_[a-zA-Z_]+/,
    chimesdkidentity0: ($) => /aws_chimesdkidentity_[a-zA-Z_]+/,
    chimesdkmeetings0: ($) => /aws_chimesdkmeetings_[a-zA-Z_]+/,
    chimesdkmessaging0: ($) => /aws_chimesdkmessaging_[a-zA-Z_]+/,
    cloudcontrol0: ($) => /aws_cloudcontrolapi_[a-zA-Z_]+/,
    clouddirectory0: ($) => /aws_clouddirectory_[a-zA-Z_]+/,
    servicediscovery0: ($) => /aws_service_discovery_[a-zA-Z_]+/,
    cloud90: ($) => /aws_cloud9_[a-zA-Z_]+/,
    cloudformation0: ($) => /aws_cloudformation_[a-zA-Z_]+/,
    cloudfront0: ($) => /aws_cloudfront_[a-zA-Z_]+/,
    cloudhsmv20: ($) => /aws_cloudhsm_v2_[a-zA-Z_]+/,
    cloudsearch0: ($) => /aws_cloudsearch_[a-zA-Z_]+/,
    cloudsearchdomain0: ($) => /aws_cloudsearchdomain_[a-zA-Z_]+/,
    cloudtrail0: ($) => /aws_cloudtrail/,
    cloudwatch0: ($) => /aws_cloudwatch_([^event_|log_|query_])[a-z_]+/,
    applicationinsights0: ($) => /aws_applicationinsights_[a-zA-Z_]+/,
    evidently0: ($) => /aws_evidently_[a-zA-Z_]+/,
    logs0: ($) => /aws_cloudwatch_(log_|query_)/,
    rum0: ($) => /aws_rum_[a-zA-Z_]+/,
    synthetics0: ($) => /aws_synthetics_[a-zA-Z_]+/,
    codeartifact0: ($) => /aws_codeartifact_[a-zA-Z_]+/,
    codebuild0: ($) => /aws_codebuild_[a-zA-Z_]+/,
    codecommit0: ($) => /aws_codecommit_[a-zA-Z_]+/,
    deploy0: ($) => /aws_codedeploy_[a-zA-Z_]+/,
    codeguruprofiler0: ($) => /aws_codeguruprofiler_[a-zA-Z_]+/,
    codegurureviewer0: ($) => /aws_codegurureviewer_[a-zA-Z_]+/,
    codepipeline0: ($) => /aws_codepipeline/,
    codestar0: ($) => /aws_codestar_[a-zA-Z_]+/,
    codestarconnections0: ($) => /aws_codestarconnections_[a-zA-Z_]+/,
    codestarnotifications0: ($) => /aws_codestarnotifications_[a-zA-Z_]+/,
    cognitoidentity0: ($) => /aws_cognito_identity_([^provider])[a-z_]+/,
    cognitoidp0: ($) => /aws_cognito_(identity_provider|resource|user|risk)/,
    cognitosync0: ($) => /aws_cognitosync_[a-zA-Z_]+/,
    comprehend0: ($) => /aws_comprehend_[a-zA-Z_]+/,
    comprehendmedical0: ($) => /aws_comprehendmedical_[a-zA-Z_]+/,
    computeoptimizer0: ($) => /aws_computeoptimizer_[a-zA-Z_]+/,
    configservice0: ($) => /aws_config_[a-zA-Z_]+/,
    connect0: ($) => /aws_connect_[a-zA-Z_]+/,
    connectcontactlens0: ($) => /aws_connectcontactlens_[a-zA-Z_]+/,
    customerprofiles0: ($) => /aws_customerprofiles_[a-zA-Z_]+/,
    connectparticipant0: ($) => /aws_connectparticipant_[a-zA-Z_]+/,
    voiceid0: ($) => /aws_voiceid_[a-zA-Z_]+/,
    wisdom0: ($) => /aws_wisdom_[a-zA-Z_]+/,
    controltower0: ($) => /aws_controltower_[a-zA-Z_]+/,
    cur0: ($) => /aws_cur_[a-zA-Z_]+/,
    dataexchange0: ($) => /aws_dataexchange_[a-zA-Z_]+/,
    datapipeline0: ($) => /aws_datapipeline_[a-zA-Z_]+/,
    datasync0: ($) => /aws_datasync_[a-zA-Z_]+/,
    detective0: ($) => /aws_detective_[a-zA-Z_]+/,
    devicefarm0: ($) => /aws_devicefarm_[a-zA-Z_]+/,
    devopsguru0: ($) => /aws_devopsguru_[a-zA-Z_]+/,
    directconnect0: ($) => /aws_dx_[a-zA-Z_]+/,
    dlm0: ($) => /aws_dlm_[a-zA-Z_]+/,
    dms0: ($) => /aws_dms_[a-zA-Z_]+/,
    docdb0: ($) => /aws_docdb_[a-zA-Z_]+/,
    drs0: ($) => /aws_drs_[a-zA-Z_]+/,
    ds0: ($) => /aws_directory_service_[a-zA-Z_]+/,
    dynamodb0: ($) => /aws_dynamodb_[a-zA-Z_]+/,
    dax0: ($) => /aws_dax_[a-zA-Z_]+/,
    dynamodbstreams0: ($) => /aws_dynamodbstreams_[a-zA-Z_]+/,
    ec20: ($) => /aws_(ebs_|volume_attach|snapshot_create)/,
    ebs0: ($) => /aws_ebs_[a-zA-Z_]+/,
    ec21: ($) => /aws_(ami|availability_zone|ec2_(availability|capacity|fleet|host|instance|serial|spot|tag)|eip|instance|key_pair|launch_template|placement_group|spot)/,
    imagebuilder0: ($) => /aws_imagebuilder_[a-zA-Z_]+/,
    ec2instanceconnect0: ($) => /aws_ec2instanceconnect_[a-zA-Z_]+/,
    ecr0: ($) => /aws_ecr_[a-zA-Z_]+/,
    ecrpublic0: ($) => /aws_ecrpublic_[a-zA-Z_]+/,
    ecs0: ($) => /aws_ecs_[a-zA-Z_]+/,
    efs0: ($) => /aws_efs_[a-zA-Z_]+/,
    eks0: ($) => /aws_eks_[a-zA-Z_]+/,
    elasticbeanstalk0: ($) => /aws_elastic_beanstalk_[a-zA-Z_]+/,
    elasticinference0: ($) => /aws_elasticinference_[a-zA-Z_]+/,
    elastictranscoder0: ($) => /aws_elastictranscoder_[a-zA-Z_]+/,
    elasticache0: ($) => /aws_elasticache_[a-zA-Z_]+/,
    es0: ($) => /aws_elasticsearch_[a-zA-Z_]+/,
    elbv20: ($) => /aws_a?lb(_listener|_target_group|s)/,
    elbv21: ($) => /aws_a?lbs?/,
    elb0: ($) => /aws_(app_cookie_stickiness_policy|elb|lb_cookie_stickiness_policy|lb_ssl_negotiation_policy|load_balancer_|proxy_protocol_policy)/,
    mediaconnect0: ($) => /aws_mediaconnect_[a-zA-Z_]+/,
    mediaconvert0: ($) => /aws_media_convert_[a-zA-Z_]+/,
    medialive0: ($) => /aws_medialive_[a-zA-Z_]+/,
    mediapackage0: ($) => /aws_media_package_[a-zA-Z_]+/,
    mediapackagevod0: ($) => /aws_mediapackagevod_[a-zA-Z_]+/,
    mediastore0: ($) => /aws_media_store_[a-zA-Z_]+/,
    mediastoredata0: ($) => /aws_mediastoredata_[a-zA-Z_]+/,
    mediatailor0: ($) => /aws_mediatailor_[a-zA-Z_]+/,
    emr0: ($) => /aws_emr_[a-zA-Z_]+/,
    emrcontainers0: ($) => /aws_emrcontainers_[a-zA-Z_]+/,
    emrserverless0: ($) => /aws_emrserverless_[a-zA-Z_]+/,
    events0: ($) => /aws_cloudwatch_event_[a-zA-Z_]+/,
    schemas0: ($) => /aws_schemas_[a-zA-Z_]+/,
    fis0: ($) => /aws_fis_[a-zA-Z_]+/,
    finspace0: ($) => /aws_finspace_[a-zA-Z_]+/,
    finspacedata0: ($) => /aws_finspacedata_[a-zA-Z_]+/,
    fms0: ($) => /aws_fms_[a-zA-Z_]+/,
    forecast0: ($) => /aws_forecast_[a-zA-Z_]+/,
    forecastquery0: ($) => /aws_forecastquery_[a-zA-Z_]+/,
    frauddetector0: ($) => /aws_frauddetector_[a-zA-Z_]+/,
    fsx0: ($) => /aws_fsx_[a-zA-Z_]+/,
    gamelift0: ($) => /aws_gamelift_[a-zA-Z_]+/,
    globalaccelerator0: ($) => /aws_globalaccelerator_[a-zA-Z_]+/,
    glue0: ($) => /aws_glue_[a-zA-Z_]+/,
    databrew0: ($) => /aws_databrew_[a-zA-Z_]+/,
    groundstation0: ($) => /aws_groundstation_[a-zA-Z_]+/,
    guardduty0: ($) => /aws_guardduty_[a-zA-Z_]+/,
    health0: ($) => /aws_health_[a-zA-Z_]+/,
    healthlake0: ($) => /aws_healthlake_[a-zA-Z_]+/,
    honeycode0: ($) => /aws_honeycode_[a-zA-Z_]+/,
    iam0: ($) => /aws_iam_[a-zA-Z_]+/,
    accessanalyzer0: ($) => /aws_accessanalyzer_[a-zA-Z_]+/,
    inspector0: ($) => /aws_inspector_[a-zA-Z_]+/,
    inspector20: ($) => /aws_inspector2_[a-zA-Z_]+/,
    iot1clickdevices0: ($) => /aws_iot1clickdevices_[a-zA-Z_]+/,
    iot1clickprojects0: ($) => /aws_iot1clickprojects_[a-zA-Z_]+/,
    iotanalytics0: ($) => /aws_iotanalytics_[a-zA-Z_]+/,
    iot0: ($) => /aws_iot_[a-zA-Z_]+/,
    iotdata0: ($) => /aws_iotdata_[a-zA-Z_]+/,
    iotdeviceadvisor0: ($) => /aws_iotdeviceadvisor_[a-zA-Z_]+/,
    iotevents0: ($) => /aws_iotevents_[a-zA-Z_]+/,
    ioteventsdata0: ($) => /aws_ioteventsdata_[a-zA-Z_]+/,
    iotfleethub0: ($) => /aws_iotfleethub_[a-zA-Z_]+/,
    greengrass0: ($) => /aws_greengrass_[a-zA-Z_]+/,
    greengrassv20: ($) => /aws_greengrassv2_[a-zA-Z_]+/,
    iotjobsdata0: ($) => /aws_iotjobsdata_[a-zA-Z_]+/,
    iotsecuretunneling0: ($) => /aws_iotsecuretunneling_[a-zA-Z_]+/,
    iotsitewise0: ($) => /aws_iotsitewise_[a-zA-Z_]+/,
    iotthingsgraph0: ($) => /aws_iotthingsgraph_[a-zA-Z_]+/,
    iottwinmaker0: ($) => /aws_iottwinmaker_[a-zA-Z_]+/,
    iotwireless0: ($) => /aws_iotwireless_[a-zA-Z_]+/,
    ivs0: ($) => /aws_ivs_[a-zA-Z_]+/,
    ivschat0: ($) => /aws_ivschat_[a-zA-Z_]+/,
    kendra0: ($) => /aws_kendra_[a-zA-Z_]+/,
    keyspaces0: ($) => /aws_keyspaces_[a-zA-Z_]+/,
    kinesis0: ($) => /aws_kinesis_stream/,
    kinesisanalytics0: ($) => /aws_kinesis_analytics_[a-zA-Z_]+/,
    kinesisanalyticsv20: ($) => /aws_kinesisanalyticsv2_[a-zA-Z_]+/,
    firehose0: ($) => /aws_kinesis_firehose_[a-zA-Z_]+/,
    kinesisvideo0: ($) => /aws_kinesisvideo_[a-zA-Z_]+/,
    kinesisvideoarchivedmedia0: ($) => /aws_kinesisvideoarchivedmedia_[a-zA-Z_]+/,
    kinesisvideomedia0: ($) => /aws_kinesisvideomedia_[a-zA-Z_]+/,
    kinesisvideosignaling0: ($) => /aws_kinesisvideosignaling_[a-zA-Z_]+/,
    kms0: ($) => /aws_kms_[a-zA-Z_]+/,
    lakeformation0: ($) => /aws_lakeformation_[a-zA-Z_]+/,
    lambda0: ($) => /aws_lambda_[a-zA-Z_]+/,
    lexmodels0: ($) => /aws_lex_[a-zA-Z_]+/,
    lexmodelsv20: ($) => /aws_lexmodelsv2_[a-zA-Z_]+/,
    lexruntime0: ($) => /aws_lexruntime_[a-zA-Z_]+/,
    lexruntimev20: ($) => /aws_lexruntimev2_[a-zA-Z_]+/,
    licensemanager0: ($) => /aws_licensemanager_[a-zA-Z_]+/,
    lightsail0: ($) => /aws_lightsail_[a-zA-Z_]+/,
    location0: ($) => /aws_location_[a-zA-Z_]+/,
    lookoutequipment0: ($) => /aws_lookoutequipment_[a-zA-Z_]+/,
    lookoutmetrics0: ($) => /aws_lookoutmetrics_[a-zA-Z_]+/,
    lookoutvision0: ($) => /aws_lookoutvision_[a-zA-Z_]+/,
    machinelearning0: ($) => /aws_machinelearning_[a-zA-Z_]+/,
    macie20: ($) => /aws_macie2_[a-zA-Z_]+/,
    macie0: ($) => /aws_macie_[a-zA-Z_]+/,
    managedblockchain0: ($) => /aws_managedblockchain_[a-zA-Z_]+/,
    grafana0: ($) => /aws_grafana_[a-zA-Z_]+/,
    kafka0: ($) => /aws_msk_[a-zA-Z_]+/,
    kafkaconnect0: ($) => /aws_mskconnect_[a-zA-Z_]+/,
    marketplacecatalog0: ($) => /aws_marketplacecatalog_[a-zA-Z_]+/,
    marketplacecommerceanalytics0: ($) => /aws_marketplacecommerceanalytics_[a-zA-Z_]+/,
    marketplaceentitlement0: ($) => /aws_marketplaceentitlement_[a-zA-Z_]+/,
    marketplacemetering0: ($) => /aws_marketplacemetering_[a-zA-Z_]+/,
    memorydb0: ($) => /aws_memorydb_[a-zA-Z_]+/,
    meta0: ($) => /aws_(arn|billing_service_account|default_tags|ip_ranges|partition|regions?|service)/,
    mgh0: ($) => /aws_mgh_[a-zA-Z_]+/,
    migrationhubconfig0: ($) => /aws_migrationhubconfig_[a-zA-Z_]+/,
    migrationhubrefactorspaces0: ($) => /aws_migrationhubrefactorspaces_[a-zA-Z_]+/,
    migrationhubstrategy0: ($) => /aws_migrationhubstrategy_[a-zA-Z_]+/,
    mobile0: ($) => /aws_mobile_[a-zA-Z_]+/,
    mq0: ($) => /aws_mq_[a-zA-Z_]+/,
    mturk0: ($) => /aws_mturk_[a-zA-Z_]+/,
    mwaa0: ($) => /aws_mwaa_[a-zA-Z_]+/,
    neptune0: ($) => /aws_neptune_[a-zA-Z_]+/,
    networkfirewall0: ($) => /aws_networkfirewall_[a-zA-Z_]+/,
    networkmanager0: ($) => /aws_networkmanager_[a-zA-Z_]+/,
    nimble0: ($) => /aws_nimble_[a-zA-Z_]+/,
    oam0: ($) => /aws_oam_[a-zA-Z_]+/,
    opensearch0: ($) => /aws_opensearch_[a-zA-Z_]+/,
    opensearchserverless0: ($) => /aws_opensearchserverless_[a-zA-Z_]+/,
    opsworks0: ($) => /aws_opsworks_[a-zA-Z_]+/,
    opsworkscm0: ($) => /aws_opsworkscm_[a-zA-Z_]+/,
    organizations0: ($) => /aws_organizations_[a-zA-Z_]+/,
    outposts0: ($) => /aws_outposts_[a-zA-Z_]+/,
    ec22: ($) => /aws_ec2_(coip_pool|local_gateway)/,
    panorama0: ($) => /aws_panorama_[a-zA-Z_]+/,
    personalize0: ($) => /aws_personalize_[a-zA-Z_]+/,
    personalizeevents0: ($) => /aws_personalizeevents_[a-zA-Z_]+/,
    personalizeruntime0: ($) => /aws_personalizeruntime_[a-zA-Z_]+/,
    pinpoint0: ($) => /aws_pinpoint_[a-zA-Z_]+/,
    pinpointemail0: ($) => /aws_pinpointemail_[a-zA-Z_]+/,
    pinpointsmsvoice0: ($) => /aws_pinpointsmsvoice_[a-zA-Z_]+/,
    pipes0: ($) => /aws_pipes_[a-zA-Z_]+/,
    polly0: ($) => /aws_polly_[a-zA-Z_]+/,
    pricing0: ($) => /aws_pricing_[a-zA-Z_]+/,
    proton0: ($) => /aws_proton_[a-zA-Z_]+/,
    qldb0: ($) => /aws_qldb_[a-zA-Z_]+/,
    qldbsession0: ($) => /aws_qldbsession_[a-zA-Z_]+/,
    quicksight0: ($) => /aws_quicksight_[a-zA-Z_]+/,
    ram0: ($) => /aws_ram_[a-zA-Z_]+/,
    rds0: ($) => /aws_(db_|rds_)/,
    rdsdata0: ($) => /aws_rdsdata_[a-zA-Z_]+/,
    pi0: ($) => /aws_pi_[a-zA-Z_]+/,
    rbin0: ($) => /aws_rbin_[a-zA-Z_]+/,
    redshift0: ($) => /aws_redshift_[a-zA-Z_]+/,
    redshiftdata0: ($) => /aws_redshiftdata_[a-zA-Z_]+/,
    redshiftserverless0: ($) => /aws_redshiftserverless_[a-zA-Z_]+/,
    rekognition0: ($) => /aws_rekognition_[a-zA-Z_]+/,
    resiliencehub0: ($) => /aws_resiliencehub_[a-zA-Z_]+/,
    resourceexplorer20: ($) => /aws_resourceexplorer2_[a-zA-Z_]+/,
    resourcegroups0: ($) => /aws_resourcegroups_[a-zA-Z_]+/,
    resourcegroupstaggingapi0: ($) => /aws_resourcegroupstaggingapi_[a-zA-Z_]+/,
    robomaker0: ($) => /aws_robomaker_[a-zA-Z_]+/,
    rolesanywhere0: ($) => /aws_rolesanywhere_[a-zA-Z_]+/,
    route530: ($) => /aws_route53_([^resolver_])[a-z_]+/,
    route53domains0: ($) => /aws_route53domains_[a-zA-Z_]+/,
    route53recoverycluster0: ($) => /aws_route53recoverycluster_[a-zA-Z_]+/,
    route53recoverycontrolconfig0: ($) => /aws_route53recoverycontrolconfig_[a-zA-Z_]+/,
    route53recoveryreadiness0: ($) => /aws_route53recoveryreadiness_[a-zA-Z_]+/,
    route53resolver0: ($) => /aws_route53_resolver_[a-zA-Z_]+/,
    s30: ($) => /aws_(canonical_user_id|s3_bucket|s3_object)/,
    s3control0: ($) => /aws_(s3_account_|s3control_|s3_access_)/,
    glacier0: ($) => /aws_glacier_[a-zA-Z_]+/,
    s3outposts0: ($) => /aws_s3outposts_[a-zA-Z_]+/,
    sagemaker0: ($) => /aws_sagemaker_[a-zA-Z_]+/,
    sagemakera2iruntime0: ($) => /aws_sagemakera2iruntime_[a-zA-Z_]+/,
    sagemakeredge0: ($) => /aws_sagemakeredge_[a-zA-Z_]+/,
    sagemakerfeaturestoreruntime0: ($) => /aws_sagemakerfeaturestoreruntime_[a-zA-Z_]+/,
    sagemakerruntime0: ($) => /aws_sagemakerruntime_[a-zA-Z_]+/,
    savingsplans0: ($) => /aws_savingsplans_[a-zA-Z_]+/,
    sdb0: ($) => /aws_simpledb_[a-zA-Z_]+/,
    scheduler0: ($) => /aws_scheduler_[a-zA-Z_]+/,
    secretsmanager0: ($) => /aws_secretsmanager_[a-zA-Z_]+/,
    securityhub0: ($) => /aws_securityhub_[a-zA-Z_]+/,
    serverlessrepo0: ($) => /aws_serverlessapplicationrepository_[a-zA-Z_]+/,
    servicecatalog0: ($) => /aws_servicecatalog_[a-zA-Z_]+/,
    servicecatalogappregistry0: ($) => /aws_servicecatalogappregistry_[a-zA-Z_]+/,
    servicequotas0: ($) => /aws_servicequotas_[a-zA-Z_]+/,
    ses0: ($) => /aws_ses_[a-zA-Z_]+/,
    sesv20: ($) => /aws_sesv2_[a-zA-Z_]+/,
    sfn0: ($) => /aws_sfn_[a-zA-Z_]+/,
    shield0: ($) => /aws_shield_[a-zA-Z_]+/,
    signer0: ($) => /aws_signer_[a-zA-Z_]+/,
    sms0: ($) => /aws_sms_[a-zA-Z_]+/,
    snowdevicemanagement0: ($) => /aws_snowdevicemanagement_[a-zA-Z_]+/,
    snowball0: ($) => /aws_snowball_[a-zA-Z_]+/,
    sns0: ($) => /aws_sns_[a-zA-Z_]+/,
    sqs0: ($) => /aws_sqs_[a-zA-Z_]+/,
    ssm0: ($) => /aws_ssm_[a-zA-Z_]+/,
    ssmcontacts0: ($) => /aws_ssmcontacts_[a-zA-Z_]+/,
    ssmincidents0: ($) => /aws_ssmincidents_[a-zA-Z_]+/,
    sso0: ($) => /aws_sso_[a-zA-Z_]+/,
    ssoadmin0: ($) => /aws_ssoadmin_[a-zA-Z_]+/,
    identitystore0: ($) => /aws_identitystore_[a-zA-Z_]+/,
    ssooidc0: ($) => /aws_ssooidc_[a-zA-Z_]+/,
    storagegateway0: ($) => /aws_storagegateway_[a-zA-Z_]+/,
    sts0: ($) => /aws_caller_identity/,
    support0: ($) => /aws_support_[a-zA-Z_]+/,
    swf0: ($) => /aws_swf_[a-zA-Z_]+/,
    textract0: ($) => /aws_textract_[a-zA-Z_]+/,
    timestreamquery0: ($) => /aws_timestreamquery_[a-zA-Z_]+/,
    timestreamwrite0: ($) => /aws_timestreamwrite_[a-zA-Z_]+/,
    transcribe0: ($) => /aws_transcribe_[a-zA-Z_]+/,
    transcribestreaming0: ($) => /aws_transcribestreaming_[a-zA-Z_]+/,
    transfer0: ($) => /aws_transfer_[a-zA-Z_]+/,
    ec23: ($) => /aws_ec2_transit_gateway/,
    translate0: ($) => /aws_translate_[a-zA-Z_]+/,
    ec24: ($) => /aws_verifiedaccess/,
    ec25: ($) => /aws_((default_)?(network_acl|route_table|security_group|subnet|vpc([^_ipam]))|ec2_(managed|network|subnet|traffic)|egress_only_internet|flow_log|internet_gateway|main_route_table_association|nat_gateway|network_interface|prefix_list)/,
    ec26: ($) => /aws_route/,
    ec27: ($) => /aws_vpc_ipam/,
    ec28: ($) => /aws_ec2_client_vpn/,
    ec29: ($) => /aws_(customer_gateway|vpn_)/,
    wafv20: ($) => /aws_wafv2_[a-zA-Z_]+/,
    waf0: ($) => /aws_waf_[a-zA-Z_]+/,
    wafregional0: ($) => /aws_wafregional_[a-zA-Z_]+/,
    ec210: ($) => /aws_ec2_carrier_gateway/,
    budgets0: ($) => /aws_budgets_[a-zA-Z_]+/,
    wellarchitected0: ($) => /aws_wellarchitected_[a-zA-Z_]+/,
    workdocs0: ($) => /aws_workdocs_[a-zA-Z_]+/,
    worklink0: ($) => /aws_worklink_[a-zA-Z_]+/,
    workmail0: ($) => /aws_workmail_[a-zA-Z_]+/,
    workmailmessageflow0: ($) => /aws_workmailmessageflow_[a-zA-Z_]+/,
    workspaces0: ($) => /aws_workspaces_[a-zA-Z_]+/,
    workspacesweb0: ($) => /aws_workspacesweb_[a-zA-Z_]+/,
    xray0: ($) => /aws_xray_[a-zA-Z_]+/,


    // END AUTO-GENERATED FROM ./scripts/terraform
  },
});
