(() => {
  const year = document.querySelector("[data-year]");

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.querySelector(
        link.getAttribute("href")
      );

      if (!target) {
        return;
      }

      event.preventDefault();

      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  });
})();
