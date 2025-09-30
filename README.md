# Openspot_2022

Smart parking utilization & compliance (MVP). Java + MySQL + Spring Boot.

## What this does
- Manage **parking lots** and **spots**
- **Check in** a vehicle (assigns first free spot)
- **Check out** a vehicle (frees spot, logs a ticket)
- List lots with **available counts** and list spots per lot

## Quick start

### 1) Start MySQL (Docker)
```bash
docker compose up -d
