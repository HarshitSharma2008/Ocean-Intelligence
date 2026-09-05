
const password = document.getElementById("password");
const passwordToggle = document.getElementById("passwordToggle");
const strengthBar = document.querySelector(".strength-bar span");
const strengthText = document.getElementById("strengthText");

passwordToggle.addEventListener("click", function () {
    if (password.type === "password") {
        password.type = "text";
        passwordToggle.textContent = "HIDE";
    } else {
        password.type = "password";
        passwordToggle.textContent = "SHOW";
    }
});

password.addEventListener("input", function () {
    const value = password.value;
    let strength = 0;

    if (value.length >= 6) {
        strength++;
    }

    if (/[A-Z]/.test(value)) {
        strength++;
    }

    if (/[0-9]/.test(value)) {
        strength++;
    }

    if (/[^A-Za-z0-9]/.test(value)) {
        strength++;
    }

    if (strength === 0) {
        strengthBar.style.width = "0%";
        strengthText.textContent = "Password strength";
    } else if (strength === 1) {
        strengthBar.style.width = "25%";
        strengthText.textContent = "Weak password";
    } else if (strength === 2) {
        strengthBar.style.width = "50%";
        strengthText.textContent = "Fair password";
    } else if (strength === 3) {
        strengthBar.style.width = "75%";
        strengthText.textContent = "Good password";
    } else {
        strengthBar.style.width = "100%";
        strengthText.textContent = "Strong password";
    }
});

