// JAVA SCRIPT FOR UNDERLINED ACTIVE OF NAV LINKS ANCHOR IN INDEX.HTML

  // Wait until DOM is fully loaded
  document.addEventListener("DOMContentLoaded", () => {
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(".nav-links a");

    window.addEventListener("scroll", () => {
      let current = "";

      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= sectionTop - 60) {
          current = section.getAttribute("id");
        }
      });

      navLinks.forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href").includes(current)) {
          link.classList.add("active");
        }
      });
    });
  });

// JAVA SCRIPT FOR UNDERLINED ACTIVE OF NAV LINKS FOR BAG.HTML, BRACELET.HTML, EARRING.HTML, KEYCHAIN.HTML, NECKLACE.HTML, PHONE.HTML
  document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".nav-links a");
  const currentPage = window.location.pathname.split("/").pop();

  navLinks.forEach(link => {
    const linkPage = link.getAttribute("href").split("/").pop();
    if (linkPage === currentPage) {
      link.classList.add("active");
    }
  });
});


