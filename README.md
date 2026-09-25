# FinXGuard

## 📌 Project Description

This project is developed as a college project to solve a real-world problem using modern technologies.

The main goal of this project is to provide an easy-to-use, efficient, and reliable solution. The project includes a user-friendly interface, backend functionality, database management, and proper testing.

## ✨ Features

- 🔐 User Authentication
- 👤 User Management
- 📊 Dashboard
- ⚡ Fast and responsive interface
- 🗄️ Database Management
- 🔍 Data Processing
- 🛡️ Secure data handling
- 📱 User-friendly design

#### 🛠️ Technologies Use

### 🖥️ Frontend
- React.js
- Tailwind CSS
- JavaScript
- Recharts

### ⚙️Backend & Services
- Java
- Spring Boot
- Spring Kafka
- REST API

### 🚀Event Streaming
- Apache Kafka
- Redpanda

### Fraud Detection
- Redis
- Smile
- Logistic Regression

### 🗄️Database
- PostgreSQL

### 🐳Infrastructure
- Docker
- Docker Compose

### 🧪Tools
- Git
- GitHub
- Postman
- IntelliJ IDEA
- VS Code






## 📂 Project Structure

fraud-detection-system/
│
├── frontend/                         # 👨‍💻 React UI
│   ├── public/
│   │   └── logo.png
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── StatCard.jsx
│   │   │   ├── TransactionTable.jsx
│   │   │   └── FraudAlert.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── LiveTransactions.jsx
│   │   │   ├── FraudAlerts.jsx
│   │   │   └── Analytics.jsx
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── README.md
│
│
├── producer-service/                  # 👨‍💻 Member 1
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── com/fraud/producer/
│   │       │       ├── controller/
│   │       │       ├── service/
│   │       │       ├── model/
│   │       │       └── ProducerApplication.java
│   │       │
│   │       └── resources/
│   │           └── application.properties
│   │
│   └── pom.xml
│
│
├── consumer-service/                  # 👨‍💻 Member 2
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── com/fraud/consumer/
│   │       │       ├── consumer/
│   │       │       │   └── TransactionConsumer.java
│   │       │       │
│   │       │       ├── service/
│   │       │       │   └── FraudDetectionService.java
│   │       │       │
│   │       │       ├── model/
│   │       │       │   └── Transaction.java
│   │       │       │
│   │       │       ├── repository/
│   │       │       │   └── TransactionRepository.java
│   │       │       │
│   │       │       └── ConsumerApplication.java
│   │       │
│   │       └── resources/
│   │           └── application.properties
│   │
│   └── pom.xml
│
│
├── rules-engine/                      # 👨‍💻 Member 3
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── com/fraud/rules/
│   │       │       ├── RedisConfig.java
│   │       │       ├── VelocityChecker.java
│   │       │       └── RulesApplication.java
│   │       │
│   │       └── resources/
│   │           └── application.properties
│   │
│   └── pom.xml
│
│
├── ml-service/                        # 🤖 Member 4
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── com/fraud/ml/
│   │       │       ├── data/
│   │       │       │   └── DatasetLoader.java
│   │       │       │
│   │       │       ├── model/
│   │       │       │   └── FraudModel.java
│   │       │       │
│   │       │       ├── training/
│   │       │       │   └── ModelTrainer.java
│   │       │       │
│   │       │       ├── prediction/
│   │       │       │   └── FraudPredictor.java
│   │       │       │
│   │       │       └── MLApplication.java
│   │       │
│   │       └── resources/
│   │           └── application.properties
│   │
│   ├── data/
│   │   └── creditcard.csv
│   │
│   └── pom.xml
│
│
├── analytics-service/                 # 📊 Analytics API
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── com/fraud/analytics/
│   │       │       ├── controller/
│   │       │       │   └── AnalyticsController.java
│   │       │       │
│   │       │       ├── service/
│   │       │       │   └── AnalyticsService.java
│   │       │       │
│   │       │       └── AnalyticsApplication.java
│   │       │
│   │       └── resources/
│   │           └── application.properties
│   │
│   └── pom.xml
│
│
├── database/                          # 🗄️ PostgreSQL
│   ├── schema.sql
│   └── sample-data.sql
│
│
├── docker/
│   └── Dockerfile
│
├── docker-compose.yml                 # 🐳 Runs infrastructure
│
├── docs/                              # 📚 Documentation
│   ├── architecture.png
│   ├── er-diagram.png
│   ├── api-documentation.md
│   ├── project-report.pdf
│   └── presentation.pptx
│
├── .gitignore
└── README.md
