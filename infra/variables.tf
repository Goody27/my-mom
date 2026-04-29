variable "aws_region" {
  type    = string
  default = "ap-northeast-1"
}

variable "environment" {
  type    = string
  default = "hackathon"
}

variable "slack_bot_token_arn" {
  type        = string
  description = "Secrets ManagerにあるSlack Bot TokenのARN"
}

variable "slack_signing_secret_arn" {
  type        = string
  description = "Secrets ManagerにあるSlack Signing SecretのARN"
}

# bedrock_agent_id, bedrock_agent_alias_id, bedrock_guardrail_id は
# bedrock.tf で Terraform が作成するため input variable として不要。
