import { loginUser } from "./logic/authLogic.js";

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const emailVal = emailInput.value.trim();
    const passwordVal = passwordInput.value.trim();

    const isSuccess = await loginUser(emailVal, passwordVal);

    if (isSuccess === true) {
      window.location.href = "index.html";
    } else {
      alert("Invalid email or password. Please try again");
      emailInput.value = "";
      passwordInput.value = "";
      passwordInput.focus();
    }
  });
}
