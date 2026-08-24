import { loginUser } from "./logic/authLogic.js";

const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("usernameInput");
const passwordInput = document.getElementById("passwordInput");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const usernameVal = usernameInput.value.trim();
    const passwordVal = passwordInput.value.trim();

    const isSuccess = await loginUser(usernameVal, passwordVal);
    
    if (isSuccess === true){
      window.location.href = "index.html";
    } else {
      alert("Invalid username or password. Please try again");
      usernameInput.value = "";
      passwordInput.value = "";
      passwordInput.focus();
    }
  });
}