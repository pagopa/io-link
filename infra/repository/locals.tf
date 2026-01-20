locals {
  repository = {
    name            = "io-link"
    description     = "Webservice that generates and handles Dynamic Links"
    topics          = ["io", "link"]
    jira_boards_ids = ["IOPLT"]

    default_branch_name      = "main"
    infra_cd_policy_branches = ["main"]
    opex_cd_policy_branches  = ["main"]
    app_cd_policy_branches   = ["main"]

    reviewers_teams = [
      "io-platform-admins",
      "io-platform-contributors",
      "engineering-team-devex"
    ]
  }
}