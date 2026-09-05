document.addEventListener("DOMContentLoaded", function () {

    const body = document.body;
    const navbar = document.querySelector(".navbar");
    const heroContent = document.querySelector(".hero-content");
    const ocean = document.querySelector(".ocean-background");
    const cards = document.querySelectorAll(".feature-card");
    const animatedElements = document.querySelectorAll(
        ".feature-card, .section-heading, .about-content, .contact-content"
    );
    const navLinks = document.querySelectorAll(".nav-links a");
    const sections = document.querySelectorAll("section[id]");

    const cursorLight = document.createElement("div");
    cursorLight.id = "cursor-light";
    body.appendChild(cursorLight);

    const depthOverlay = document.createElement("div");
    depthOverlay.className = "depth-overlay";
    body.appendChild(depthOverlay);

    const progress = document.createElement("div");
    progress.className = "scroll-progress";
    progress.innerHTML = "<span></span>";
    body.appendChild(progress);

    const progressBar = progress.querySelector("span");

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
            }
        });
    }, {
        threshold: 0.15
    });

    animatedElements.forEach(function (element) {
        observer.observe(element);
    });

    cards.forEach(function (card) {

        card.addEventListener("mousemove", function (event) {

            const rect = card.getBoundingClientRect();

            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -7;
            const rotateY = ((x - centerX) / centerX) * 7;

            const mouseX = (x / rect.width) * 100;
            const mouseY = (y / rect.height) * 100;

            card.style.setProperty("--mouse-x", mouseX + "%");
            card.style.setProperty("--mouse-y", mouseY + "%");

            card.style.transform =
                "translateY(-12px) perspective(1200px) rotateX(" +
                rotateX +
                "deg) rotateY(" +
                rotateY +
                "deg) scale(1.025)";
        });

        card.addEventListener("mouseleave", function () {
            card.style.transform = "";
        });
    });

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let lightX = mouseX;
    let lightY = mouseY;

    window.addEventListener("mousemove", function (event) {
        mouseX = event.clientX;
        mouseY = event.clientY;
    });

    function animateCursorLight() {
        lightX += (mouseX - lightX) * 0.08;
        lightY += (mouseY - lightY) * 0.08;

        cursorLight.style.transform =
            "translate(" +
            lightX +
            "px, " +
            lightY +
            "px) translate(-50%, -50%)";

        requestAnimationFrame(animateCursorLight);
    }

    animateCursorLight();

    function createParticles() {

        for (let i = 0; i < 45; i++) {

            const particle = document.createElement("div");

            particle.className = "particle";

            const size = Math.random() * 3 + 1;

            particle.style.width = size + "px";
            particle.style.height = size + "px";
            particle.style.left = Math.random() * 100 + "vw";
            particle.style.top = Math.random() * 100 + "vh";
            particle.style.animationDuration =
                Math.random() * 10 + 8 + "s";
            particle.style.animationDelay =
                Math.random() * 8 + "s";

            body.appendChild(particle);
        }
    }

    function createBubbles() {

        for (let i = 0; i < 18; i++) {

            const bubble = document.createElement("div");

            bubble.className = "bubble";

            const size = Math.random() * 15 + 5;

            bubble.style.width = size + "px";
            bubble.style.height = size + "px";
            bubble.style.left = Math.random() * 100 + "vw";
            bubble.style.animationDuration =
                Math.random() * 12 + 10 + "s";
            bubble.style.animationDelay =
                Math.random() * 12 + "s";

            body.appendChild(bubble);
        }
    }

    createParticles();
    createBubbles();

    let ticking = false;

    window.addEventListener("scroll", function () {

        if (!ticking) {

            window.requestAnimationFrame(function () {

                const scrollY = window.scrollY;
                const windowHeight = window.innerHeight;
                const documentHeight =
                    document.documentElement.scrollHeight -
                    windowHeight;

                const percentage =
                    documentHeight > 0
                        ? (scrollY / documentHeight) * 100
                        : 0;

                progressBar.style.height = percentage + "%";

                if (scrollY > 50) {
                    navbar.classList.add("scrolled");
                } else {
                    navbar.classList.remove("scrolled");
                }

                if (scrollY < windowHeight) {

                    if (heroContent) {
                        heroContent.style.transform =
                            "translateY(" +
                            scrollY * 0.18 +
                            "px) scale(" +
                            (1 - scrollY * 0.00008) +
                            ")";

                        heroContent.style.opacity =
                            Math.max(
                                0,
                                1 - scrollY / windowHeight * 1.15
                            );
                    }

                    if (ocean) {
                        ocean.style.transform =
                            "scale(" +
                            (1.05 + scrollY * 0.00008) +
                            ") translateY(" +
                            scrollY * 0.08 +
                            "px)";
                    }
                }

                sections.forEach(function (section) {

                    const rect = section.getBoundingClientRect();

                    if (
                        rect.top <= windowHeight * 0.45 &&
                        rect.bottom >= windowHeight * 0.45
                    ) {

                        navLinks.forEach(function (link) {

                            link.classList.remove("active");

                            if (
                                link.getAttribute("href") ===
                                "#" + section.id
                            ) {
                                link.classList.add("active");
                            }
                        });
                    }
                });

                ticking = false;
            });

            ticking = true;
        }
    });

    const smoothLinks = document.querySelectorAll(
        '.nav-links a[href^="#"], .secondary-btn[href^="#"]'
    );

    smoothLinks.forEach(function (link) {

        link.addEventListener("click", function (event) {

            event.preventDefault();

            const targetId = link.getAttribute("href");
            const target = document.querySelector(targetId);

            if (target) {

                const offset = 60;

                const targetPosition =
                    target.getBoundingClientRect().top +
                    window.scrollY -
                    offset;

                window.scrollTo({
                    top: targetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    window.dispatchEvent(new Event("scroll"));

});

/* ADVANCED CURSOR */

const cursorRing = document.createElement("div");
cursorRing.className = "cursor-ring";
document.body.appendChild(cursorRing);

let ringX = window.innerWidth / 2;
let ringY = window.innerHeight / 2;
let targetRingX = ringX;
let targetRingY = ringY;

window.addEventListener("mousemove", function (event) {
    targetRingX = event.clientX;
    targetRingY = event.clientY;
});

function moveCursorRing() {

    ringX += (targetRingX - ringX) * 0.16;
    ringY += (targetRingY - ringY) * 0.16;

    cursorRing.style.left = ringX + "px";
    cursorRing.style.top = ringY + "px";

    requestAnimationFrame(moveCursorRing);

}

moveCursorRing();

/* MAGNETIC INTERACTION */

const magneticElements = document.querySelectorAll(
    ".primary-btn, .secondary-btn, .login-btn, .nav-links a, .feature-card"
);

magneticElements.forEach(function (element) {

    element.classList.add("magnetic-element");

    element.addEventListener("mouseenter", function () {
        cursorRing.classList.add("hover");
    });

    element.addEventListener("mouseleave", function () {

        cursorRing.classList.remove("hover");

        element.style.transform = "";
    });

    element.addEventListener("mousemove", function (event) {

        const rect = element.getBoundingClientRect();

        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const moveX = (event.clientX - centerX) * 0.12;
        const moveY = (event.clientY - centerY) * 0.12;

        if (element.classList.contains("feature-card")) {

            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            const rotateX =
                ((y - rect.height / 2) / (rect.height / 2)) * -7;

            const rotateY =
                ((x - rect.width / 2) / (rect.width / 2)) * 7;

            element.style.transform =
                "translate(" +
                moveX +
                "px," +
                moveY +
                "px) perspective(1200px) rotateX(" +
                rotateX +
                "deg) rotateY(" +
                rotateY +
                "deg) scale(1.025)";

        } else {

            element.style.transform =
                "translate(" +
                moveX +
                "px," +
                moveY +
                "px) scale(1.04)";
        }
    });
});

/* ORIGINAL OCEAN LOADING SCREEN */

const loader = document.getElementById("loader");

if (loader) {

    window.addEventListener("load", function () {

        setTimeout(function () {
            loader.classList.add("hidden");
        }, 900);

    });

}