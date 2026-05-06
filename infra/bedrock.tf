# ── Bedrock Guardrails ─────────────────────────────────────────
# 正しい名前空間: aws_bedrock_guardrail（Guardrails は bedrockagent ではなく bedrock 名前空間）
resource "aws_bedrock_guardrail" "mymom" {
  name                      = "mymom-ethics-guardrail"
  blocked_input_messaging   = "このリクエストはお母さんには処理できないよ。ごめんね。"
  blocked_outputs_messaging = "この内容は送れないよ。お母さんが止めておいたからね。"
  description               = "MyMom 倫理フィルタ: ハラスメント・違法コンテンツをブロック"

  content_policy_config {
    filters_config {
      input_strength  = "HIGH"
      output_strength = "HIGH"
      type            = "HATE"
    }
    filters_config {
      input_strength  = "HIGH"
      output_strength = "HIGH"
      type            = "VIOLENCE"
    }
    filters_config {
      input_strength  = "MEDIUM"
      output_strength = "HIGH"
      type            = "SEXUAL"
    }
    filters_config {
      input_strength  = "HIGH"
      output_strength = "HIGH"
      type            = "MISCONDUCT"
    }
  }
}

# Guardrail version は Terraform リソースが存在しないため CLI で発行する。
# null_resource で terraform apply 後に自動実行。
resource "null_resource" "guardrail_version" {
  triggers = {
    guardrail_id = aws_bedrock_guardrail.mymom.guardrail_id
  }

  provisioner "local-exec" {
    command = <<-EOC
      aws bedrock create-guardrail-version \
        --guardrail-identifier ${aws_bedrock_guardrail.mymom.guardrail_id} \
        --region ${var.aws_region} \
        --description "v1 — 初回リリース" \
        --query 'version' --output text > /tmp/mymom_guardrail_version.txt
      echo "Guardrail version published: $(cat /tmp/mymom_guardrail_version.txt)"
    EOC
  }
}

# ── Bedrock Agent ───────────────────────────────────────────────
resource "aws_iam_role" "bedrock_agent" {
  name = "mymom-bedrock-agent-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "bedrock.amazonaws.com" }
      Action    = "sts:AssumeRole"
      Condition = {
        StringEquals = {
          "aws:SourceAccount" = data.aws_caller_identity.current.account_id
        }
      }
    }]
  })
}

resource "aws_iam_role_policy" "bedrock_agent" {
  name = "mymom-bedrock-agent-policy"
  role = aws_iam_role.bedrock_agent.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["bedrock:InvokeModel"]
        Resource = "arn:aws:bedrock:${var.aws_region}::foundation-model/anthropic.claude-3-5-sonnet-20241022-v2:0"
      },
      {
        Effect   = "Allow"
        Action   = ["bedrock:ApplyGuardrail"]
        Resource = aws_bedrock_guardrail.mymom.guardrail_arn
      }
    ]
  })
}

data "aws_caller_identity" "current" {}

resource "aws_bedrockagent_agent" "mymom" {
  agent_name              = "mymom-agent"
  agent_resource_role_arn = aws_iam_role.bedrock_agent.arn
  foundation_model        = "anthropic.claude-3-5-sonnet-20241022-v2:0"
  description             = "MyMom: ユーザーの代わりに先回りして意思決定・行動を代行するお母さんAI"

  instruction = <<-EOT
    あなたはユーザーの「お母さん」AIです。
    ユーザーが届いたメッセージを断るべきかどうかを判断し、断り文を生成します。

    ## 判断基準
    - ユーザーのスケジュール・疲労度・過去の断りパターンを考慮する
    - 相手との関係性（上司・友人・顔見知り）を判断文に反映する
    - 断り文は角が立たず、かつ明確に断れる内容にする
    - 倫理的に問題のある依頼（ハラスメント等）は ESCALATE する

    ## 出力形式
    必ず以下のJSON形式で返してください:
    {
      "decision": "APPROVE" | "DECLINE" | "ESCALATE",
      "replyText": "断り文（送信する文章）",
      "quickReplies": ["選択肢A", "選択肢B"],
      "reason": "判断理由（内部ログ用）"
    }
  EOT

  # Guardrails version は null_resource で発行後、手動または tfvars で指定する。
  # ハッカソン期間中は "DRAFT" を使用（版が安定したら番号に固定）。
  guardrail_configuration {
    guardrail_identifier = aws_bedrock_guardrail.mymom.guardrail_id
    guardrail_version    = "DRAFT"
  }

  depends_on = [null_resource.guardrail_version]
}

resource "aws_bedrockagent_agent_alias" "mymom_live" {
  agent_alias_name = "live"
  agent_id         = aws_bedrockagent_agent.mymom.agent_id
  description      = "本番エイリアス"
}

# ── outputs ─────────────────────────────────────────────────────
output "bedrock_agent_id" {
  value = aws_bedrockagent_agent.mymom.agent_id
}

output "bedrock_agent_alias_id" {
  value = aws_bedrockagent_agent_alias.mymom_live.agent_alias_id
}

output "bedrock_guardrail_id" {
  value = aws_bedrock_guardrail.mymom.guardrail_id
}
