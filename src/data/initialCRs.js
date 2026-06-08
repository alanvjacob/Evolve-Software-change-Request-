/**
 * Initial historical set of Change Requests representing the evolution of the ledger system.
 */
export const initialCRs = [
  {
    id: "CR-402",
    title: "Implement Multi-Factor Authentication (MFA) via SMS/Email",
    description: "To comply with new security guidelines, we must add SMS and email-based two-factor authentication. This will require updates to the authentication service and integration with NotificationAPI for code deliveries.",
    priority: "Critical",
    status: "In Progress",
    category: "Feature",
    affectedComponents: ["AuthService", "NotificationAPI", "WebDashboard"],
    submitter: "John Connor",
    assignedTo: "Sarah Connor",
    createdDate: "2026-05-20",
    diffs: {
      "AuthService": `// auth_service.js - Multi-Factor Authentication addition
@@ -48,5 +48,15 @@
 function validateCredentials(user, password) {
-  return db.query("SELECT * FROM users WHERE user = ?", [user]);
+  const userData = db.query("SELECT * FROM users WHERE user = ?", [user]);
+  if (userData && userData.mfaEnabled) {
+    const tempToken = generateTemporaryMFAToken(user);
+    notificationApi.sendSMS(userData.phone, \`Your security verification token is: \${tempToken}\`);
+    return { status: "MFA_PENDING", tokenRef: tempToken };
+  }
+  return userData;
 }`,
      "NotificationAPI": `// notification_api.js - Added direct SMS dispatcher method
@@ -12,2 +12,6 @@
+export function sendSMS(phoneNumber, messageContent) {
+  logAuditTrigger("SMS_OUTBOUND", phoneNumber);
+  return smsProviderGateway.deliver(phoneNumber, messageContent);
+}`
    }
  },
  {
     id: "CR-401",
     title: "Optimize ledger batch processing queries",
     description: "The TransactionEngine batch operations query triggers full-table scans. We need to introduce composite index searches and paginate results to optimize system load.",
     priority: "High",
     status: "Merged",
     category: "Optimization",
     affectedComponents: ["Database", "TransactionEngine"],
     submitter: "Marcus Wright",
     assignedTo: "Marcus Wright",
     createdDate: "2026-05-18",
     diffs: {
       "Database": `// database.js - Optimizing SQL indexes
@@ -101,2 +101,5 @@
+  // Added composite index for fast transaction lookups
+  this.execute("CREATE INDEX IF NOT EXISTS idx_tx_status_timestamp ON transactions(status, timestamp);");
+  
   this.pool.execute("SELECT * FROM transactions WHERE status = 'PENDING' LIMIT 100");`
     }
  },
  {
    id: "CR-399",
    title: "Refactor database query pooling and reconnection logic",
    description: "When the database experiences high peak loads, connection timeouts occur. Refactor current pooling parameters to dynamically scale, and add a retry backoff loop.",
    priority: "Medium",
    status: "Merged",
    category: "Refactoring",
    affectedComponents: ["Database"],
    submitter: "Sarah Connor",
    assignedTo: "Elena Rostova",
    createdDate: "2026-05-12",
    diffs: {
      "Database": `// database.js - Robust reconnection mechanism
@@ -12,4 +12,12 @@
 function establishConnection() {
-  return mysql.createConnection(this.config);
+  const pool = mysql.createPool({
+    ...this.config,
+    connectionLimit: 50,
+    queueLimit: 0,
+    waitForConnections: true
+  });
+  pool.on('error', (err) => {
+    if (err.code === 'PROTOCOL_CONNECTION_LOST') handleReconnection();
+  });
+  return pool;
 }`
    }
  },
  {
    id: "CR-405",
    title: "SQL injection vulnerability in SecurityAuditor filter",
    description: "Security auditor filter parameters are directly concatenated into the SQL statement, leading to a high-severity vulnerability. We must sanitize parameters immediately.",
    priority: "Critical",
    status: "Impact Analysis",
    category: "Bug Fix",
    affectedComponents: ["SecurityAuditor", "Database"],
    submitter: "John Connor",
    assignedTo: "John Connor",
    createdDate: "2026-05-25",
    diffs: {
      "SecurityAuditor": `// security_auditor.js - Vulnerability remediation
@@ -8,3 +8,3 @@
 function auditFilter(ipAddress) {
-  return db.query("SELECT * FROM logs WHERE ip = '" + ipAddress + "'");
+  return db.query("SELECT * FROM logs WHERE ip = ?", [ipAddress]);
 }`
    }
  },
  {
    id: "CR-406",
    title: "Export transaction history as PDF/CSV report",
    description: "Add a button to the client dashboard that requests a consolidated report of transaction ledger history in either PDF or CSV. This will query the reporting service.",
    priority: "Medium",
    status: "Draft",
    category: "Feature",
    affectedComponents: ["ReportingService", "WebDashboard"],
    submitter: "David K.",
    assignedTo: "David K.",
    createdDate: "2026-05-26",
    diffs: {
      "ReportingService": `// reporting_service.js - CSV/PDF builder addition
@@ -42,3 +42,9 @@
+export function generateFormattedReport(transactions, formatType) {
+  if (formatType === 'pdf') {
+    return PDFGenerator.build(transactions);
+  } else {
+    return CSVGenerator.build(transactions);
+  }
+}`
    }
  }
];
