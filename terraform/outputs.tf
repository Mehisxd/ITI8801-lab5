output "public_ip" {
  description = "Public IPv4 address of the service VM."
  value       = aws_instance.service.public_ip
}

output "service_url" {
  description = "Public service URL."
  value       = "http://${aws_instance.service.public_ip}"
}

output "health_url" {
  description = "Health endpoint."
  value       = "http://${aws_instance.service.public_ip}/health"
}