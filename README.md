# 🚗 EcoMove — Commercial Transfer & Mobility Platform

[![Live Site](https://img.shields.io/badge/Production-ecotransferprague.com-00C853?style=flat-square&logo=googlechrome&logoColor=white)](https://ecotransferprague.com)
[![Tech Stack](https://img.shields.io/badge/Tech_Stack-Vanilla_JS_%7C_HTML5_%7C_CSS3-blue?style=flat-square)](https://ecotransferprague.com)
[![Status](https://img.shields.io/badge/Status-Active_Production-success?style=flat-square)](https://ecotransferprague.com)

**EcoTransfer** (`ecotransferprague.com`) is a production-ready, multi-language commercial web platform designed for booking private passenger transfers across Prague and European intercity routes.

The platform provides users with interactive route lookup, dynamic dynamic fare calculation, fleet browsing, and an automated checkout system connected directly to operations management.

🌐 **Live Website:** [ecotransferprague.com](https://ecotransferprague.com)  
📧 **Business Contact:** [info@ecotransferprague.com](mailto:info@ecotransferprague.com)

---

## ⚡ Key Technical Highlights & Features

- **🌐 Multi-Language Architecture (i18n):** Static routing architecture supporting 5 languages (**EN**, **ES**, **FR**, **HE**, **RU**) with locale-specific content and RTL support readiness.
- **📍 Smart Route Lookup & Autocomplete:** Real-time city and address suggestions integrated via **Geoapify API**.
- **💰 Dynamic Fare Calculation:** Client-side pricing engine calculated based on chosen vehicle class and distance algorithms.
- **⚡ Serverless Order Pipeline:** Async booking pipeline leveraging **Google Apps Script (GAS) API** as a lightweight serverless backend.
- **📲 Instant Dispatch Notifications:** Real-time push alerts sent to dispatchers via **Telegram Bot API** upon form submission.
- **📱 Responsive & Performance-Optimized:** Modular CSS and Vanilla JavaScript engineered with zero framework overhead for ultra-fast load times.
- **⚖️ Legal Compliance:** Complete GDPR-compliant legal suite (Terms of Service, Privacy Policy, User Agreement).

---

## 🛠 Tech Stack & Services

| Layer | Technology / Service | Description |
| :--- | :--- | :--- |
| **Frontend** | HTML5, Modular CSS3, Vanilla JS (ES6+) | Lightweight, dependency-free client architecture |
| **Location API** | Geoapify Places & Autocomplete API | Geocoding and route address auto-suggestions |
| **Serverless Backend**| Google Apps Script (GAS) Web App | Async REST endpoint for order ingestion |
| **Notification Engine**| Telegram Bot API | Instant dispatch notifications for managers |
| **Hosting & Web** | Custom Domain, PWA Manifest | Production deployment with SSL and PWA support |

---

## 🔄 System Architecture & Data Flow

```text
[ Client Request ]
       │
       ▼
[ Geoapify API ] ──► (Address Validation & Autocomplete)
       │
       ▼
[ Client-side Engine ] ──► (Calculates Fare & Form Validation)
       │
       ▼
[ Fetch POST Request ] ──► [ Google Apps Script API ]
                                  │
                                  ▼
                         [ Telegram Bot API ] ──► 📲 Manager Notification