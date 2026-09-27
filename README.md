<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=F97316&height=200&section=header&text=RAHI&fontSize=90&fontColor=ffffff&animation=fadeIn&desc=Move%20With%20The%20Mountains,%20Safely" width="100%" />

  <a href="#">
    <img src="https://readme-typing-svg.herokuapp.com?font=Montserrat&weight=900&size=28&pause=1000&color=1E293B&center=true&vCenter=true&width=800&lines=The+Future+of+Himalayan+Mobility;Live+AI+Telemetry+%26+Topography;Intelligent+Smart+Pooling;NLP-Powered+Trip+Booking" alt="Typing SVG" />
  </a>
</div>

<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white" />
  <img src="https://img.shields.io/badge/Google_Translate-4285F4?style=for-the-badge&logo=google&logoColor=white" />
</div>

<br />

> **Rahi** is an intelligent, topography-aware mobility ecosystem designed to conquer the unique challenges of mountain transportation. Featuring live telemetry, AI-driven NLP bookings, and emergency SOS integrations, we're not just building a ride-sharing app—we are building a lifeline for the Himalayas.

---

## ✨ Jaw-Dropping Features

<div align="center">
  <table>
    <tr>
      <td align="center">🧠<br/><b>AI NLP Booking</b><br/>Just type "I want to go to Nainital tomorrow morning with 4 people" and AI handles the rest.</td>
      <td align="center">🛰️<br/><b>Live Telemetry</b><br/>Real-time vehicle diagnostics, weather overlay, and topographical safety checks.</td>
      <td align="center">🌐<br/><b>Instant Bilingual</b><br/>Real-time English & Hindi toggle capability across the entire app ecosystem.</td>
    </tr>
    <tr>
      <td align="center">🤝<br/><b>Smart Pooling</b><br/>Algorithmically matches travelers to reduce mountain congestion & emissions.</td>
      <td align="center">🛡️<br/><b>SDRF SOS</b><br/>Direct emergency response integration with local authorities in blind-spots.</td>
      <td align="center">🎨<br/><b>Dynamic UI/UX</b><br/>Glassmorphism, 3D Scroll Triggers, and GPU-accelerated interactive particles.</td>
    </tr>
  </table>
</div>

---

## 🔄 Data Flow Diagram (DFD)

Our entire ecosystem is connected seamlessly in real-time. Here is how data moves across the platform:

```mermaid
graph TD;
    %% Styling
    classDef user fill:#f97316,stroke:#ea580c,stroke-width:2px,color:#fff,font-weight:bold;
    classDef system fill:#1e293b,stroke:#0f172a,stroke-width:2px,color:#fff;
    classDef db fill:#0ea5e9,stroke:#0284c7,stroke-width:2px,color:#fff;
    
    %% Nodes
    A[Customer Dashboard]:::user
    B[Driver Dashboard]:::user
    C{Rahi Core API Engine}:::system
    D[AI NLP Parsing Engine]:::system
    E[PostgreSQL / Neon DB]:::db
    F[Live Telemetry / WebSockets]:::system
    G[SDRF / Emergency Auth]:::db

    %% Flows
    A -- "Raw Text ('Go to Manali')" --> D
    D -- "Structured Booking JSON" --> C
    A -- "Creates Pool/Package" --> C
    B -- "Real-time GPS & Speed" --> F
    F -- "Topography Danger Alert" --> B
    F -- "Live Sync" --> C
    C -- "Store / Fetch Data" --> E
    B -- "SOS Trigger" --> G
```

---

## 🚀 How It Works (Architecture Sequence)

```mermaid
sequenceDiagram
    autonumber
    participant Customer
    participant Frontend
    participant NLP AI
    participant Core Backend
    participant Driver
    
    Customer->>Frontend: Types prompt in native language
    Frontend->>NLP AI: Send raw text for intent parsing
    NLP AI-->>Frontend: Return formatted Date, Route & Passengers
    Frontend->>Core Backend: Confirm Booking Payload
    Core Backend->>Driver: Ping active drivers in Topo-Radius
    Driver->>Core Backend: Accept Ride
    Core Backend-->>Customer: Ride Confirmed + Live Telemetry Tracking
    loop Telemetry Sync
        Driver->>Core Backend: Broadcast GPS/Speed/Weather
        Core Backend->>Frontend: WebSocket Live Update
    end
```

---

## 💻 Tech Stack Deep Dive

- **Frontend:** React 19, TailwindCSS, Framer Motion, Lucide Icons, Canvas API for Particle engines.
- **Backend:** Node.js, Express, REST + WebSockets.
- **Database:** PostgreSQL (Neon Tech Pooler).
- **AI/ML:** Custom NLP prompt parsing, Live Route Optimization.

---

<br />

<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=1E293B&height=150&section=footer" width="100%" />
</div>

<div align="center">
  <h2>🏆 HackIndia Hackathon Project</h2>
  <p>Proudly designed, developed, and deployed by <b>Team Predator</b>.</p>
  
  <p>
    <b>Team Leader:</b> <br/>
    <a href="#">
      <img src="https://img.shields.io/badge/Kamlesh%20Singh%20Kotwal-F97316?style=for-the-badge&logo=github&logoColor=white" />
    </a>
  </p>
  <br/>
  <i>"Conquering heights with code."</i>
</div>
