Title: Login attempt fails with "did not match" error message
Environment: Production (app.vwo.com/#/login)
Severity: [UNKNOWN] (Severity depends on whether valid or invalid credentials were used, which is not verifiable from the screenshot)
Steps to Reproduce:
1. Navigate to the login page (app.vwo.com/#/login).
2. Enter email ID and password [UNKNOWN if valid or invalid].
3. Click the "Sign in" button.
Expected Result: If credentials are valid, the user is redirected to the dashboard. (Source: Test Plan)
Actual Result: User is not redirected to the dashboard. An orange error banner appears displaying the message: "Your email, password, IP address or location did not match". (Source: login_error.png)
Evidence: login_error.png
