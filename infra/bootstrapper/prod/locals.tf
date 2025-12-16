locals {
  prefix          = "io"
  env_short       = "p"
  location        = "italynorth"
  domain          = "plt"
  instance_number = "02"
  project         = "${local.prefix}-${local.env_short}-itn"

  adgroups = {
    admins_name = "io-p-adgroup-platform-admins"
    devs_name   = "io-p-adgroup-svc-developers"
  }

  runner = {
    cae_name                = "${local.project}-github-runner-cae-01"
    cae_resource_group_name = "${local.project}-github-runner-rg-01"
    secret = {
      kv_name                = "${local.prefix}-${local.env_short}-kv-common"
      kv_resource_group_name = "${local.prefix}-${local.env_short}-rg-common"
    }
  }

  vnet = {
    name                = "${local.project}-common-vnet-01"
    resource_group_name = "${local.project}-common-rg-01"
  }

  common = {
    weu_resource_group_name = "${local.prefix}-${local.env_short}-rg-common"
    itn_resource_group_name = "${local.project}-common-rg-01"
  }

  functions = {
    itn_platform_io_link_rg_name = "${local.project}-continua-rg-01"
  }

  tf_storage_account = {
    name                = "iopitntfst001"
    resource_group_name = "terraform-state-rg"
  }

  repository = {
    name = "io-link"
  }

  tags = {
    CreatedBy      = "Terraform"
    Environment    = "Prod"
    BusinessUnit   = "App IO"
    ManagementTeam = "IO Platform"
    Source         = "https://github.com/pagopa/io-link/blob/main/infra/bootstrapper"
    CostCenter     = "TS000 - Tecnologia e Servizi"
  }
}
