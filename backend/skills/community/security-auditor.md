---
name: security-auditor
description: Code security review, vulnerability assessment, OWASP Top 10, and secure coding practices. Use when reviewing code for security issues or hardening an application.
---
# Security Auditor

Review code for security vulnerabilities and suggest remediations.

## OWASP Top 10 Checklist
1. **Injection** — SQL, NoSQL, command injection
2. **Broken Auth** — weak passwords, token leakage, missing expiry
3. **Sensitive Data Exposure** — logging secrets, unencrypted storage
4. **XXE / SSRF** — external entity injection, server-side request forgery
5. **Broken Access Control** — missing authorization checks
6. **Security Misconfiguration** — default creds, verbose errors
7. **XSS** — unescaped user input in HTML
8. **Insecure Deserialization** — untrusted data deserialization
9. **Using Components with Known Vulnerabilities** — outdated deps
10. **Insufficient Logging** — missing audit trails

## Reporting Format
For each finding: severity (Critical/High/Medium/Low), location, impact, and remediation.
