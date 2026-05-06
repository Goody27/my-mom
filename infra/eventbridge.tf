# ── dm-poller 定期実行用ロール ────────────────────────────────
resource "aws_iam_role" "eventbridge_scheduler" {
  name = "mymom-eventbridge-scheduler-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Action    = "sts:AssumeRole"
      Principal = { Service = "scheduler.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "eventbridge_scheduler" {
  role = aws_iam_role.eventbridge_scheduler.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["lambda:InvokeFunction"]
      Resource = [aws_lambda_function.dm_poller.arn]
    }]
  })
}

# ── SLA one-time スケジュール用ロール ────────────────────────
# sender が CreateSchedule API を呼び、このロールで sla_handler を起動する
resource "aws_iam_role" "eventbridge_sla_scheduler" {
  name = "mymom-sla-scheduler-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Action    = "sts:AssumeRole"
      Principal = { Service = "scheduler.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "eventbridge_sla_scheduler" {
  role = aws_iam_role.eventbridge_sla_scheduler.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["lambda:InvokeFunction"]
      Resource = [aws_lambda_function.sla_handler.arn]
    }]
  })
}

# SLA スケジュール用グループ（sender が CreateSchedule する先）
resource "aws_scheduler_schedule_group" "mymom_sla" {
  name = "mymom-sla"
}

resource "aws_scheduler_schedule" "dm_poller" {
  name = "mymom-dm-poller-schedule"

  flexible_time_window {
    mode = "OFF"
  }

  # 1分ごとにdm-pollerを起動
  schedule_expression = "rate(1 minutes)"

  target {
    arn      = aws_lambda_function.dm_poller.arn
    role_arn = aws_iam_role.eventbridge_scheduler.arn
  }
}
