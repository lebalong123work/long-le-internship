document
  .getElementById("signupForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    let emailValue = document.getElementById("emailInput").value;
    let usernameValue = document.getElementById("usernameInput").value;
    let passwordValue = document.getElementById("passwordInput").value;
    let confirmPasswordValue = document.getElementById("confirmInput").value;

    document.getElementById("emailError").innerHTML = "";
    document.getElementById("usernameError").innerHTML = "";
    document.getElementById("passwordError").innerHTML = "";
    document.getElementById("confirmError").innerHTML = "";

    document.getElementById("successInfo").innerHTML = "";

    let isValid = true;
    let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailValue === "" || !emailRegex.test(emailValue)) {
      document.getElementById("emailError").innerHTML =
        "Email address empty or wrong format. example: username@somewhere.sth";
      isValid = false;
    }

    let usernameRegex = /^\S(.*\S)?$/;
    if (usernameValue === "" || !usernameRegex.test(usernameValue)) {
      document.getElementById("usernameError").innerHTML =
        "Please enter the correct format for Username. (No leading or trailing spaces)";
      isValid = false;
    }

    let passRegex = /(?=.*[^a-zA-Z]).{8,}/;
    if (!passRegex.test(passwordValue)) {
      document.getElementById("passwordError").innerHTML =
        "Please enter the correct format for password. (8 characters at least one non-letter)";
      isValid = false;
    }

    if (confirmPasswordValue !== passwordValue || confirmPasswordValue === "") {
      document.getElementById("confirmError").innerHTML =
        "Make sure password and confirm passwords match";
      isValid = false;
    }

    if (isValid === true) {
      document.getElementById("successInfo").innerHTML =
        "<h3>Thông tin đã nhập:</h3>" +
        "Email: " + emailValue + "<br>" +
        "Username: " + usernameValue + "<br>" +
        "Password: " + passwordValue + "<br>" +
        "Confirm Password: " + confirmPasswordValue;
    }
  });
