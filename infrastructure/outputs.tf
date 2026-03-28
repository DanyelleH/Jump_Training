output "cloudfront_url" {
  value = aws_cloudfront_distribution.student_cf.domain_name
}

output "ec2_public_ip" {
  value = aws_instance.student_ec2.public_ip
}

output "s3_bucket_name" {
  value = aws_s3_bucket.student_frontend.bucket
}
