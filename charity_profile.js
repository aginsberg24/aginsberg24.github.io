document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll(".volunteer-btn");
    const forms = document.querySelectorAll(".volunteer-form");
  
    buttons.forEach((btn, index) => {
      btn.addEventListener("click", () => {
        forms.forEach(form => form.style.display = "none");
        
        forms[index].style.display = "block";
      });
    });
  
    forms.forEach(form => {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        alert("Thanks for signing up to volunteer!");
        form.reset();
        form.style.display = "none";
      });
    });
  
    const cards = document.querySelectorAll(".charity-card");
    cards.forEach(card => {
      card.addEventListener("mouseenter", () => {
        card.style.backgroundColor = "white";
      });
      card.addEventListener("mouseleave", () => {
        card.style.backgroundColor = "#8ac99b";
      });
    });
  
    const toggleBtns = document.querySelectorAll(".toggle-details-btn");
    const readMoreSections = document.querySelectorAll(".read-more");
  
    toggleBtns.forEach((btn, index) => {
      btn.addEventListener("click", () => {
        const section = readMoreSections[index];
        const isVisible = section.style.display === "block";
        section.style.display = isVisible ? "none" : "block";
        btn.textContent = isVisible ? "Read More" : "Read Less";
      });
    });
  });
  
