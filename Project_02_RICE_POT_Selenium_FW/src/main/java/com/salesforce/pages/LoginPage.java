package com.salesforce.pages;

import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class LoginPage {
    private WebDriver driver;
    private WebDriverWait wait;

    @FindBy(xpath = "//input[@type='email' and @name='username']")
    private WebElement usernameInput;

    @FindBy(xpath = "//input[@type='password' and @name='pw']")
    private WebElement passwordInput;

    @FindBy(xpath = "//input[@type='submit' and @name='Login']")
    private WebElement loginButton;

    @FindBy(xpath = "//div[@id='error']")
    private WebElement errorMessage;

    public LoginPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        PageFactory.initElements(driver, this);
    }

    public void enterUsername(String username) throws TimeoutException {
        try {
            wait.until(ExpectedConditions.visibilityOf(usernameInput)).sendKeys(username);
        } catch (TimeoutException e) {
            throw new TimeoutException("Exception: Username input field not visible", e);
        }
    }

    public void enterPassword(String password) throws TimeoutException {
        try {
            wait.until(ExpectedConditions.visibilityOf(passwordInput)).sendKeys(password);
        } catch (TimeoutException e) {
            throw new TimeoutException("Exception: Password input field not visible", e);
        }
    }

    public void clickLogin() throws TimeoutException {
        try {
            wait.until(ExpectedConditions.elementToBeClickable(loginButton)).click();
        } catch (TimeoutException e) {
            throw new TimeoutException("Exception: Login button not clickable", e);
        }
    }

    public void login(String username, String password) throws TimeoutException {
        enterUsername(username);
        enterPassword(password);
        clickLogin();
    }

    public String getErrorMessage() throws TimeoutException {
        try {
            return wait.until(ExpectedConditions.visibilityOf(errorMessage)).getText();
        } catch (TimeoutException e) {
            throw new TimeoutException("Exception: Error message not visible", e);
        }
    }
}
