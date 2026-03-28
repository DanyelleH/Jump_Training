provider "aws" {
  region = var.aws_region
}

# -----------------------------
# Get Latest Ubuntu AMI
# -----------------------------
data "aws_ami" "ubuntu" {
  most_recent = true

  owners = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# -----------------------------
# S3 Bucket (Frontend Hosting)
# -----------------------------
resource "aws_s3_bucket" "student_frontend" {
  bucket = "${var.project_name}-frontend"
}

resource "aws_s3_bucket_website_configuration" "student_frontend" {
  bucket = aws_s3_bucket.student_frontend.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

resource "aws_s3_bucket_public_access_block" "student_frontend" {
  bucket = aws_s3_bucket.student_frontend.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "student_frontend" {
  bucket = aws_s3_bucket.student_frontend.id

  depends_on = [
    aws_s3_bucket_public_access_block.student_frontend
  ]

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = "*"
      Action = ["s3:GetObject"]
      Resource = "${aws_s3_bucket.student_frontend.arn}/*"
    }]
  })
}

# -----------------------------
# CloudFront Distribution
# -----------------------------
resource "aws_cloudfront_distribution" "student_cf" {
  origin {
    domain_name = aws_s3_bucket.student_frontend.bucket_regional_domain_name
    origin_id   = "studentS3Origin"
  }

  enabled             = true
  default_root_object = "index.html"

  default_cache_behavior {
    target_origin_id = "studentS3Origin"

    viewer_protocol_policy = "redirect-to-https"

    allowed_methods = ["GET", "HEAD"]
    cached_methods  = ["GET", "HEAD"]

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

# -----------------------------
# Security Group
# -----------------------------
resource "aws_security_group" "student_sg" {
  name = "student-sg-danyelle"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["${var.my_ip}/32"]
  }
  ingress {
  from_port   = 80
  to_port     = 80
  protocol    = "tcp"
  cidr_blocks = ["0.0.0.0/0"]
}

  ingress {
    from_port   = 8000
    to_port     = 8000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 27017
    to_port     = 27017
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}


# -----------------------------
# Generate SSH Key
# -----------------------------
resource "tls_private_key" "student_key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "local_file" "student_private_key" {
  content         = tls_private_key.student_key.private_key_pem
  filename        = "${path.module}/ssh-key/${var.key_name}.pem"
  file_permission = "0400"
}

resource "local_file" "student_public_key" {
  content  = tls_private_key.student_key.public_key_openssh
  filename = "${path.module}/ssh-key/${var.key_name}.pub"
}

resource "aws_key_pair" "student_key" {
  key_name   = var.key_name
  public_key = tls_private_key.student_key.public_key_openssh
}

# -----------------------------
# EC2 Instance (Ubuntu + GitHub App)
# -----------------------------
resource "aws_instance" "student_ec2" {
  ami           = data.aws_ami.ubuntu.id   # ✅ Ubuntu now
  instance_type = var.instance_type
  key_name      = aws_key_pair.student_key.key_name
  security_groups = [aws_security_group.student_sg.name]

  user_data = <<-EOF
              #!/bin/bash
              apt update -y

              # Install dependencies
              apt install -y git python3 python3-pip

              # Clone your repo
              cd /home/ubuntu
              git clone https://github.com/DanyelleH/Jump_Training.git

              cd Jump_Training/backend

              # Install Python deps
              pip3 install --upgrade pip
              pip3 install -r requirements.txt

              # Run FastAPI
              nohup python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 &
              EOF

  tags = {
    Name = "student-danyelle-ec2"
  }
}