locals {
  atlantis_image = "ami-830c94e3"
}
resource "aws_instance" "app_server" {
  ami           = "ami-830c94e3"
  instance_type = "t2.micro"
  active = false
  wat = null
  number = 2
  name  = "my-ec2-cluster-${count.index}${instance_type}-bar"
  variable = var.vpc_name

  vpc_security_group_ids = [module.vpc.default_security_group_id]
  subnet_id              = module.vpc.public_subnets[0]
  subnet_id2              = module.vpc.public_subnets.0

  for_each = {
    a_group = "eastus"
    another_group = "westus2"
  }
  regions     = each.key

  tags = {
    Terraform   = "true"
    Environment = "dev"
  }
  container_definitions = <<EOF
 [
     {
         "cpu": 0,
         "environment": [
             {
                 "name": "ATLANTIS_LOG_LEVEL",
                 "value": "debug"
             },
             {
                 "name": "ATLANTIS_PORT",
                 "value": "4141"
             },
             {
                 "name": "ATLANTIS_ATLANTIS_URL",
                 "value": "https://${coalesce(element(concat(aws_route53_record.atlantis.*.fqdn, list("")), 0), module.alb.dns_name)}"
             },
             {
                 "name": "ATLANTIS_VPC_NAME",
                 "value": "${var.vpc_name}"
             },
             {
                 "name": "ATLANTIS_REPO_WHITELIST",
                 "value": "${join(",", var.vpc_azs)}"
             }
         ],
         "essential": true,
         "image": "${local.atlantis_image}",
         "logConfiguration": {
             "logDriver": "awslogs",
             "options": {
                 "awslogs-region": "${data.aws_region.current.name}",
                 "awslogs-stream-prefix": "master"
             }
         },
         "mountPoints": [],
         "name": "atlantis",
         "portMappings": [
             {
                 "containerPort": 4141,
                 "hostPort": 4141,
                 "protocol": "tcp"
             }
         ],
         "volumesFrom": []
     }
 ]
 EOF
}
