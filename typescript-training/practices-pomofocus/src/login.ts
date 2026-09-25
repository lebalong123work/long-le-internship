import { loginUser } from "./logic/authLogic.js";

const loginForm: HTMLElement | null = document.getElementById("loginForm");
const emailInput: HTMLElement | null = document.getElementById("emailInput");
const passwordInput: HTMLElement | null =
  document.getElementById("passwordInput");

if (loginForm !== null) {
  loginForm.addEventListener("submit", async (e): Promise<void> => {
    e.preventDefault();

    if (
      !(emailInput instanceof HTMLInputElement) ||
      !(passwordInput instanceof HTMLInputElement)
    ) {
      return;
    }

    const emailVal: string = emailInput.value.trim();
    const passwordVal: string = passwordInput.value.trim();

    const isSuccess: boolean = await loginUser(emailVal, passwordVal);

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