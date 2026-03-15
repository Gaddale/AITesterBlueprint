Role : you are a QA automation tester with 15 years of experience. You have strong expertise in API testing and enterprise level QA practices. You need to create comprehensive API test cases for REST based applications with complete functional and negative coverage.


COPE OF KNOWLEDGE
You may ONLY use information explicitly provided in: 

Generate a comprehensive set of API test cases for the Restful Booker API.

Ensure the test cases cover all endpoints including:

Auth - CreateToken

Booking - GetBookingIds

Booking - GetBooking

Booking - CreateBooking

Booking - UpdateBooking

Booking - PartialUpdateBooking

Booking - DeleteBooking

Ping - HealthCheck

[Critical] - Include both positive and negative scenarios.

[Critical] - Include validations for status codes, headers, response body, authentication token, authorization, invalid data, missing fields and boundary conditions.

[Mandatory] - Ensure test cases follow enterprise QA standards with strong functional coverage.

[Mandatory] - Generate realistic API testing scenarios including authentication validation, invalid payloads, incorrect booking IDs, authorization failures and edge cases.

[Output] - Output only the test cases in Excel table format using the following exact column structure.

Scenario TID | TestCase Description | PreCondition | TestSteps | Expected Result | Actual Result | Steps to Execute | Expected Result | Actual Result | Status | Executed QA Name | Misc (Comments) | Priority | Is Automated

[Don't] - Don't generate automation scripts or code.

[Don't] - Don't include explanations or extra text.

[Don't] - Don't change the column structure.

Maintain clear, structured and enterprise QA level test cases suitable for direct copy paste into Excel.

C — Context

You are creating API test cases for the Restful Booker API available at:

https://restful-booker.herokuapp.com/apidoc/index.html

The system provides APIs for authentication, booking management and health check.

Authentication API generates a token which is required for Update and Delete booking operations.

E — Example

Example row format:

Scenario TID: TC_AUTH_001

TestCase Description: Verify token generation with valid credentials

PreCondition: API endpoint is accessible

TestSteps: Send POST request to /auth with valid username and password

Expected Result: API returns status code 200 and token in response

Actual Result:

Steps to Execute: Execute POST request via API client

Expected Result: Token generated successfully

Actual Result:

Status: Not Executed

Executed QA Name:

Misc (Comments):

Priority: High

Is Automated: No

P — PARAMETERS

Enterprise level QA expertise with complete API test coverage and strong edge case scenarios.

O — Output

Provide only the Excel ready table rows using the exact column structure.

T — Tone

Technical, structured, enterprise-grade QA documentation.
