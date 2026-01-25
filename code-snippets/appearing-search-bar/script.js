const input = document.querySelector("input");
const button = document.querySelector("button");
const container = document.querySelector(".container");

button.addEventListener("click", function() {
    container.classList.toggle("active");
});