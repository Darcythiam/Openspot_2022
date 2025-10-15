# OpenSpot 2022 (Flask + PostgreSQL)

Visitor pay-lot demo for SCSU. Users pick a lot, see available spots, and pay to occupy a spot.
Rules:
- $0.50 buys 30 minutes (only ≥ $0.50, multiples of $0.50).
- Each lot has **50 normal** spots and **3 quick-15** spots (quick-15 are *not* purchasable here).
- A spot is unavailable while an active session exists (current time < session end).

**Lots:**
4th Avenue Parking Ramp (Pay Lot), Eastman Pay Lot, Husky Pay Lot, ISELF Pay Lot, Miller Pay Lot, South Pay Lot

Campus addr (for docs): 720 4th Ave S, St. Cloud, MN 56301, US.

## Stack
- Flask, SQLAlchemy, Flask-Migrate (Alembic)
- PostgreSQL (psycopg)
- Vanilla HTML/CSS/JS frontend (fetch API)
- Gunicorn for prod

## Quick Start (Docker)
```bash
git clone https://github.com/Darcythiam/Openspot_2022_flask.git
cd Openspot_2022_flask
cp .env.example .env
docker compose up --build



