# 🛡️ Aegis Command Center — Emergency Logistics & Resource Tracking Platform

**Aegis** is a full-stack geolocation and emergency inventory management system designed to coordinate humanitarian, medical, and rescue supplies across **Algiers, Algeria**. It provides real-time visibility into resource stock levels, organizational ownership, and interactive GPS deployment mapping.

## 🏗️ System Architecture
- **Backend:** NestJS, Prisma ORM, PostgreSQL (Port 3000)
- **Frontend:** Next.js 16 App Router, Tailwind CSS, React-Leaflet (Port 3001)

## 📡 Core Features
- Relational inventory engine with UUIDs and organization foreign keys.
- Interactive Algiers tactical map with OpenStreetMap & custom low-stock red markers.
- Automated low-stock telemetry (flashing alerts for stock < 30 units).
- Real-time client-side filtering by category, organization, and keyword search.

## 👤 Author
**Noureddine Khelfaoui** — USTHB, Algiers
