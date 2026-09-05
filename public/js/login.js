document.addEventListener("DOMContentLoaded", function () {

    const card = document.querySelector(".login-card");
    const page = document.querySelector(".login-page");
    const password = document.querySelector("#password");
    const toggle = document.querySelector("#passwordToggle");

    /* Password show hide */

    if (toggle && password) {

        toggle.addEventListener("click", function () {

            if (password.type === "password") {
                password.type = "text";
                toggle.textContent = "HIDE";
            } else {
                password.type = "password";
                toggle.textContent = "SHOW";
            }

        });

    }

    /* 3D card movement */

    if (card && page) {

        page.addEventListener("mousemove", function (event) {

            const x = event.clientX / window.innerWidth;
            const y = event.clientY / window.innerHeight;

            const rotateY = (x - 0.5) * 8;
            const rotateX = (y - 0.5) * -6;

            card.style.transform =
                "translateY(0) rotateX(" +
                rotateX +
                "deg) rotateY(" +
                rotateY +
                "deg)";

        });

        page.addEventListener("mouseleave", function () {

            card.style.transform =
                "translateY(0) rotateX(0deg) rotateY(0deg)";

        });

    }

    /* Input glow */

    const inputs = document.querySelectorAll(".input-box input");

    inputs.forEach(function (input) {

        input.addEventListener("focus", function () {

            const box = input.closest(".input-box");

            if (box) {
                box.classList.add("active");
            }

        });

        input.addEventListener("blur", function () {

            const box = input.closest(".input-box");

            if (box) {
                box.classList.remove("active");
            }

        });

    });

    /* Button loading effect */

    const form = document.querySelector("form");
    const loginButton = document.querySelector(".login-btn");
    const buttonText = document.querySelector(".btn-text");

    if (form && loginButton && buttonText) {

        form.addEventListener("submit", function () {

            buttonText.textContent = "ENTERING OCEAN INTELLIGENCE...";
            loginButton.style.pointerEvents = "none";

        });

    }

});