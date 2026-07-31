# Cloudflare D1 Database Schema

Status: open  
Type: task  

## Question

What SQL tables and column definitions do we need in Cloudflare D1 for storing runner signups and generated certificate records?

### Focus Areas
- `signups` table schema (`id`, `runner_name`, `email`, `run_id`, `created_at`).
- `certificates` table schema (`cert_id`, `runner_name`, `run_id`, `distance_km`, `moving_time`, `elevation_m`, `polyline`, `created_at`).
