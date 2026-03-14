package com.salesforce.tests;

import com.salesforce.pages.LoginPage;
import org.testng.Assert;
import org.testng.annotations.Test;

public class LoginTest extends BaseTest {

    @Test
    public void testValidLogin() {
        LoginPage loginPage = new LoginPage(driver);
        loginPage.login("valid.user@salesforce.com", "SecurePassword123");
        Assert.assertTrue(driver.getTitle().contains("Salesforce"));
    }

    @Test
    public void testInvalidLogin() {
        LoginPage loginPage = new LoginPage(driver);
        loginPage.login("invalid.user@salesforce.com", "WrongPassword");
        String actualErrorMessage = loginPage.getErrorMessage();
        Assert.assertEquals(actualErrorMessage, "Error: Please check your username and password. If you still can't log in, contact your Salesforce administrator.");
    }
}
