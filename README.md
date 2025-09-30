# OpenSpot_2022

Smart, minimal parking lot tracker. One page frontend + Node/Express backend + MySQL schema.
Lets you list lots, view open/occupied spaces, and record simple occupancy/violation events.

## Why this exists
Campus/municipal lots rarely expose real-time availability. OpenSpot demonstrates a clean, intermediate-level CRUD/queries stack with an auditable event log.

## Features
- List lots and spaces, filter by status (open / occupied / blocked)
- Record occupancy events (enter, exit, block, unblock)
- Log and resolve simple permit violations
- Clean schema with FK constraints and useful indexes

## Stack
- **Frontend:** Vanilla HTML/JS/CSS (no framework)
- **Backend:** Node.js (Express, mysql2, helmet, cors, morgan)
- **DB:** MySQL 8+ (InnoDB, utf8mb4)

## Quick start

### 1) Prereqs
- Node 18+  
- MySQL 8+

### 2) Clone & install
```bash
git clone https://github.com/Darcythiam/Openspot_2022.git
cd Openspot_2022
npm install


