# 1. Verified Facts
- **F1:** Application Name — VWO Login Dashboard (Source: vwo_prd.md)
- **F2:** Target Users — Digital marketers, Product managers, UX designers, Developers, Enterprise teams and analysts (Source: vwo_prd.md)
- **F3:** URLs — Dev: https://dev.app.vwo.com/login, Staging: https://staging.app.vwo.com/login, Prod: https://app.vwo.com/login (Source: vwo_prd.md)
- **F4:** Core Features — Secure login (email/password), SSO (SAML, OAuth), Multi-factor authentication, Password reset & recovery, Real-time validation & error handling, Responsive and accessible UI (Source: vwo_prd.md)
- **F5:** Allowed Login Methods identified in UI — Email/Password, Google, SSO, Passkey (Source: loginPage.png)
- **F6:** Security Constraints — SSO, 2FA, OAuth, SAML, HTTPS end-to-end encryption, bcrypt password storage, rate limiting, GDPR, CCPA, OWASP-compliant mechanisms (Source: vwo_prd.md)
- **F7:** Performance Constraints — Load time < 2 seconds, thousands of concurrent requests, 99.9% uptime, CDN integration (Source: vwo_prd.md)
- **F8:** UX Constraints — Real-time validation, Mobile-first design, WCAG 2.1 AA accessibility, Light and Dark mode options (Source: vwo_prd.md)
- **F9:** Success Metrics — ≥ 95% login success rate, ≤ 2s page load, ≥ 90% user satisfaction, 0 security breaches, 20% reduction in login related support tickets (Source: vwo_prd.md)
- **F10:** Error Message — Expected text triggers "Your email, password, IP address or location did not match" (Source: login_error.png)
- **F11:** Recommended Tools from Template — JIRA, Mind Mapping Tool, Snipping Tool, Microsoft Word, Microsoft Excel (Source: prdToTestPlanTemplate.md)

# 2. Missing / Unknown Information
- Explicit Testing Tools (e.g. explicit automation tools like Selenium or Cypress, or performance tools like JMeter): **UNKNOWN**
- Test Data / Explicit Test Credentials: **UNKNOWN**
- Release Timelines and Specific Test Schedules: **UNKNOWN**
- API Documentation / Payload structure: **UNKNOWN**
- Specific Third-party SSO Integrations configurations beyond typical specs: **UNKNOWN**

# 3. Generated Output

## Test Plan for VWO Login Dashboard

**Product:** VWO Login Dashboard (app.vwo.com/login)
**Created by:** QA Team

---

### 1. Objective
This document outlines the **test plan for the VWO Login Dashboard available at app.vwo.com/login**. The objective is to ensure that all features and functionalities (Secure login, SSO, MFA, Password reset, and responsive UI) work as expected for the target audience: digital marketers, product managers, UX designers, developers, and enterprise teams.

---

### 2. Scope
#### Features to be Tested
- Email and password authentication 
- Single Sign-On (SAML, OAuth)
- Multi-factor authentication
- Password reset and recovery flow
- Real-time validation and error handling (e.g., "Your email, password, IP address or location did not match" message validation)
- "Remember me" functionality
- Third-party identity providers ("Sign in with Google", "Sign in using SSO")
- Passkey authentication ("Sign in with Passkey")
- UI Elements (Start a FREE TRIAL, Privacy policy, Terms links, Password visibility toggle)

#### Types of Testing
- Manual Testing
- Automated Testing
- Performance Testing (to verify < 2s load time and thousands of concurrent requests constraint)
- Accessibility Testing (WCAG 2.1 AA constraint)
- Security Testing (OWASP-compliant, rate limiting, HTTPS connection, bcrypt)

#### Environments
- URLs: dev.app.vwo.com/login, staging.app.vwo.com/login, app.vwo.com/login
- Browsers: Google Chrome, Mozilla Firefox, Microsoft Edge, Safari
- Operating Systems / Devices types: Windows 10/11, macOS, Linux, Desktop, Laptops, Tablets, Smartphones

#### Evaluation Criteria
- ≥ 95% login success rate
- ≤ 2s page load time
- 0 security breaches
- Number of defects found

#### Team Roles and Responsibilities
- Test Lead
- Test Engineers
- Developers
- Product Managers
- Stakeholders

---

### 3. Inclusions
#### Introduction
Overview of the test plan including purpose, scope, and goals of testing the VWO Login Dashboard application.

#### Test Objectives
- Identify defects in the application (Validation and error handling constraints)
- Ensure stability and reliability of Login features
- Ensure the system meets performance expectations (< 2s load, thousands of concurrent requests)
- Maintain enterprise-level security and GDPR/CCPA compliance.

---

### 4. Exclusions
- Third-party integrations not owned by VWO
- Infrastructure-level testing
- Production deployment verification
- Non-supported browsers or legacy environments

---

### 5. Test Environments
- **Operating Systems:** Windows 10 / Windows 11, macOS, Linux
- **Browsers:** Google Chrome, Mozilla Firefox, Microsoft Edge, Safari
- **Devices:** Desktop Computers, Laptops, Tablets, Smartphones
- **Network Connectivity:** Wi-Fi, Cellular Networks, Wired Connections
- **Hardware/Software Requirements:** Minimum processor, Adequate memory, Required storage capacity
- **Security Protocols:** HTTPS, Password authentication, Access tokens, Security certificates (SAML/OAuth)
- **Access Permissions:** Testers, Developers, Product stakeholders, Administrators

---

### 6. Defect Reporting Procedure
#### Criteria for Identifying Defects
- Deviation from PRD requirements (e.g. login failure contrary to success metric)
- User experience issues (e.g. failing WCAG 2.1 AA or Responsive mobile-first constraints)
- Technical errors
- Incorrect validations (Not showing the exact error: "Your email, password, IP address or location did not match")

#### Steps for Reporting Defects
1. Use the designated defect template.
2. Provide detailed reproduction steps.
3. Attach screenshots or logs where necessary.
4. Assign severity and priority.

#### Tracking Tools
- Bug Tracking Tool (JIRA)
- Project management tools

#### Roles and Responsibilities
- Testers log defects
- Developers fix defects
- Test Lead reviews and prioritizes issues

#### Communication Channels
- Daily stand-up meetings
- Email updates
- Status dashboards

#### Metrics
- Number of defects identified
- Defect resolution time
- Percentage of defects fixed

---

### 7. Test Strategy
#### Step 1: Test Scenario and Test Case Creation
- **Techniques Used:** Equivalence Class Partitioning, Boundary Value Analysis, Decision Table Testing, State Transition Testing, Use Case Testing.
- **Additional Methods:** Error Guessing, Exploratory Testing.

#### Step 2: Testing Procedure
- **Smoke Testing:** Verify critical functionalities after every new build.
- **In-depth Testing:** Execute detailed test cases after successful smoke testing.
- **Multiple Environments:** Conducted simultaneously on supported OS and browsers.
- **Defect Reporting:** Logging bugs in the tracking tool, Daily status updates.
- **Types of Testing:** Smoke, Sanity, Regression, Retesting, Usability, Functionality, UI (Light/Dark mode testing).

#### Step 3: Best Practices
- Context Driven Testing, Shift Left Testing, Exploratory Testing, End-to-End Flow Testing.

---

### 8. Test Schedule
- **Tasks:** Test Plan Creation, Test Case Creation, Test Case Execution, Test Summary Report Submission.
- **Timeline:** UNKNOWN. Specific dates and milestones will be defined for each testing phase.

---

### 9. Test Deliverables
- Test Plan Document, Test Scenarios, Test Cases, Test Execution Reports, Defect Reports, Test Summary Report.

---

### 10. Entry and Exit Criteria
#### Requirement Analysis
- **Entry Criteria:** Requirements documentation received (vwo_prd.md loaded).
- **Exit Criteria:** Requirements understood and clarified.

#### Test Execution
- **Entry Criteria:** Signed-off Test Scenarios and Test Cases, Application (dev/staging URL) ready for testing.
- **Exit Criteria:** Test case execution reports prepared, Defect reports generated.

#### Test Closure
- **Entry Criteria:** Test execution completed, Defect reports available.
- **Exit Criteria:** Test summary report prepared, Final approval obtained.

---

### 11. Tools
- **Bug Tracking Tool:** JIRA
- **Mind Mapping Tool:** UNKNOWN
- **Screenshot capture:** Snipping Tool
- **Documentation:** Microsoft Word, Microsoft Excel
- **Automation / Performance Tools:** UNKNOWN (Not provided in PRD or Template)

---

### 12. Risks and Mitigations
- **Possible Risks:** Non-availability of resources, Build URL not working, Limited time for testing.
- **Mitigation Strategies:** Backup resource planning, Working on parallel task when blocked, Dynamically ramp up resources when required.

---

### 13. Approvals
Documents requiring client or stakeholder approval:
- Test Plan
- Test Scenarios
- Test Cases
- Test Reports

**Approved By:** ________________________
**Date:** ________________________

# 4. Self-Validation Check
- Invented features: **NONE** (All features traced to vwo_prd.md and UI screenshots)
- Tool assumptions: **NONE** (Used explicitly listed tools from template. Custom automation tools marked UNKNOWN)
- Architecture assumptions: **NONE** (No assumptions beyond Node.js, PostgreSQL, REST APIs from PRD)
- Fabricated metrics: **NONE** (Metrics are strictly 95% login rate, 2s load time, etc. from PRD)
- Timeline assumptions: **NONE** (Marked UNKNOWN)
- Traceability to source facts: **PASS**
