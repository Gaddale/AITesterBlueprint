# Project Context File

## Application
**Name:** VWO Login Dashboard  
**Type:** Web Application  
**Domain:** Digital Experience Optimization / Analytics (SaaS)

---

## Tech Stack
**Frontend:** React (assumed modern SPA based on UX requirements)  
**Backend:** Node.js (authentication + session services)  
**Database:** PostgreSQL (user data, sessions, audit logs)  
**API Type:** REST (with support for OAuth / SAML for SSO)

---

## Environment

**Dev URL:** https://dev.app.vwo.com/login  
**Staging URL:** https://staging.app.vwo.com/login  
**Prod URL:** https://app.vwo.com/login  

---

## Key Constraints

### Security Constraints
- Must support enterprise-grade security (SSO, 2FA, OAuth, SAML)
- End-to-end encryption (HTTPS + secure token handling)
- Encrypted password storage using industry-standard hashing (e.g., bcrypt)
- Protection against brute force attacks via rate limiting
- GDPR and CCPA compliance for user data handling
- OWASP-compliant authentication mechanisms

### Performance Constraints
- Login page load time must be **< 2 seconds**
- System must support **thousands of concurrent login requests**
- Ensure **99.9% uptime** with high availability architecture
- CDN integration for global performance

### UX Constraints
- Minimal login friction for higher conversion and retention
- Real-time validation for inputs (email/password)
- Mobile-first, responsive design
- Accessibility compliance (WCAG 2.1 AA)
- Support for Light and Dark mode

### Functional Constraints
- Email + password authentication is mandatory
- Optional Multi-Factor Authentication (2FA)
- Enterprise Single Sign-On (SSO) support required
- “Remember Me” persistent sessions
- Secure password reset and recovery flow

### Integration Constraints
- Must integrate seamlessly with VWO core dashboard
- Support third-party identity providers (Google, Microsoft, etc.)
- Analytics tracking for login success/failure
- Integration with customer support systems

### Scalability Constraints
- Multi-region deployment required
- Auto-scaling to handle traffic spikes
- Must support global user base across 90+ countries

### Compliance Constraints
- GDPR compliance mandatory
- Accessibility standards (WCAG 2.1 AA)
- Enterprise audit logs and traceability

---

## Additional Context

### Target Users
- Digital marketers
- Product managers
- UX designers
- Developers
- Enterprise teams and analysts

### Core Features
- Secure login (email/password)
- SSO (SAML, OAuth)
- Multi-factor authentication
- Password reset & recovery
- Real-time validation & error handling
- Responsive and accessible UI

### Success Metrics
- ≥ 95% login success rate
- ≤ 2s page load time
- ≥ 90% user satisfaction
- 0 security breaches
- 20% reduction in login-related support tickets

### Future Enhancements
- Biometric authentication (fingerprint, face ID)
- Adaptive/risk-based authentication
- Progressive Web App (PWA) support
- Personalization based on user behavior
- A/B testing of login experience

---