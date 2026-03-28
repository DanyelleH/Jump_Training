variable "aws_region" {
  default = "us-east-1"
}

variable "project_name" {
  default = "student-employee-management-danyelle"
}

variable "instance_type" {
  default = "t2.micro"
}

variable "key_name" {
  default = "student-employee-management-danyelle-key"
}

variable "my_ip" {
  description = "Your IP for SSH access"
  default     = "47.198.234.16"
}