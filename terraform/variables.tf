variable "prefix" {
  description = "student code"
  type        = string

  validation {
    condition     = can(regex("^[a-z0-9][a-z0-9-]*$", var.prefix))
    error_message = "bad student code"
  }
}

variable "region" {
  description = "AWS region."
  type        = string
  default     = "eu-north-1"
}

variable "instance_type" {
  description = "EC2 instance type."
  type        = string
  default     = "t3.micro"
}

variable "repository_url" {
  description = "HTTPS URL of the Git repository"
  type        = string
}

variable "repository_branch" {
  description = "Git branch to deploy."
  type        = string
  default     = "main"
}

variable "postgres_password" {
  description = "PostgreSQL password"
  type        = string
  sensitive   = true

  validation {
    condition     = length(var.postgres_password) >= 12
    error_message = "postgres_password must have at least 12 characters."
  }
}