locals{
    repository = {
    name            = "io-link"
    description     = "Webservice that generates and handles Dynamic Links"
    topics          = ["io", "link"]
    jira_boards_ids = ["IOPLT"]

    default_branch_name      = "main"
    infra_cd_policy_branches = ["master"]
    opex_cd_policy_branches  = ["master"]
    app_cd_policy_branches   = ["master"]

    reviewers_teams = [
      "io-platform-admin",
      "engineering-team-cloud-eng"
    ]
  }
}