/**
 * Simulated codebase architecture representing a high-security microservices ledger system.
 * Contains structural dependencies, metrics representing evolutionary trends, and metadata.
 */
export const mockCodebase = {
  components: [
    {
      id: "Database",
      name: "database.js",
      layer: "Core Database",
      loc: 1250,
      complexity: 18,
      churnRate: 0.12, // Code churn % per release
      changeFrequency: 14, // Times modified in last 50 commits
      owner: "Sarah Connor",
      dependencies: []
    },
    {
      id: "SecurityAuditor",
      name: "security_auditor.js",
      layer: "Security Layer",
      loc: 820,
      complexity: 24,
      churnRate: 0.08,
      changeFrequency: 6,
      owner: "John Connor",
      dependencies: ["Database"]
    },
    {
      id: "AuthService",
      name: "auth_service.js",
      layer: "Security Layer",
      loc: 950,
      complexity: 15,
      churnRate: 0.22,
      changeFrequency: 21,
      owner: "Sarah Connor",
      dependencies: ["Database", "SecurityAuditor"]
    },
    {
      id: "UserService",
      name: "user_service.js",
      layer: "Business Logic",
      loc: 1100,
      complexity: 12,
      churnRate: 0.18,
      changeFrequency: 19,
      owner: "Elena Rostova",
      dependencies: ["Database"]
    },
    {
      id: "PaymentGateway",
      name: "payment_gateway.js",
      layer: "Integration",
      loc: 1450,
      complexity: 28,
      churnRate: 0.35,
      changeFrequency: 32,
      owner: "Marcus Wright",
      dependencies: ["SecurityAuditor"]
    },
    {
      id: "TransactionEngine",
      name: "transaction_engine.js",
      layer: "Business Logic",
      loc: 2400,
      complexity: 32,
      churnRate: 0.40,
      changeFrequency: 41,
      owner: "Marcus Wright",
      dependencies: ["Database", "PaymentGateway"]
    },
    {
      id: "NotificationAPI",
      name: "notification_api.js",
      layer: "Integration",
      loc: 600,
      complexity: 8,
      churnRate: 0.05,
      changeFrequency: 5,
      owner: "Elena Rostova",
      dependencies: ["Database"]
    },
    {
      id: "ReportingService",
      name: "reporting_service.js",
      layer: "Analytics",
      loc: 1500,
      complexity: 20,
      churnRate: 0.15,
      changeFrequency: 11,
      owner: "John Connor",
      dependencies: ["Database", "TransactionEngine"]
    },
    {
      id: "WebDashboard",
      name: "web_dashboard.jsx",
      layer: "Frontend Presentation",
      loc: 3100,
      complexity: 16,
      churnRate: 0.55,
      changeFrequency: 47,
      owner: "David K.",
      dependencies: ["AuthService", "UserService", "TransactionEngine", "NotificationAPI"]
    },
    {
      id: "AdminPanel",
      name: "admin_panel.jsx",
      layer: "Frontend Presentation",
      loc: 1800,
      complexity: 14,
      churnRate: 0.25,
      changeFrequency: 18,
      owner: "David K.",
      dependencies: ["AuthService", "UserService", "ReportingService", "SecurityAuditor"]
    }
  ],
  // Pre-configured coordinates for visual graph layout (beautifully balanced node positions)
  layout: {
    Database: { x: 100, y: 300 },
    SecurityAuditor: { x: 260, y: 150 },
    AuthService: { x: 420, y: 100 },
    UserService: { x: 420, y: 250 },
    PaymentGateway: { x: 420, y: 400 },
    TransactionEngine: { x: 580, y: 500 },
    NotificationAPI: { x: 420, y: 520 },
    ReportingService: { x: 740, y: 420 },
    WebDashboard: { x: 900, y: 200 },
    AdminPanel: { x: 900, y: 380 }
  }
};
