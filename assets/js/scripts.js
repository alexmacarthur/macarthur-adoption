import "intersection-observer";
import jump from "jump.js";
import lozad from "lozad";
import Turbolinks from "turbolinks";
import CheckoutFlow from "./CheckoutFlow";

class AdoptionSite {
  constructor() {
    this.preload();
    this.initLazyLoading();
    this.initSmoothScrolling();
    this.initDropdownMenu();

    new CheckoutFlow();
  }

  preload() {
    let links = document.querySelectorAll("a[href]");
    let loadedLinks = [];

    [].slice.call(links).forEach(link => {
      let href = link.getAttribute("href");

      if (!href.match(/^\//)) {
        return;
      }

      if (loadedLinks.indexOf(href) > -1) {
        return;
      }

      let prefetchLink = document.createElement("link");
      prefetchLink.setAttribute("rel", "prefetch");
      prefetchLink.setAttribute("as", "document");
      prefetchLink.setAttribute("href", href);

      document.head.appendChild(prefetchLink);

      loadedLinks.push(href);
    });
  }

  initDropdownMenu() {
    let navList = document.querySelector(".Nav-list");
    let navItems = document.querySelectorAll(".Nav-item a");
    let toggleElement = document.getElementById("menuToggle");

    if (toggleElement === null) return;

    toggleElement.addEventListener("click", e => {
      let toggle = e.target;

      if (navList.classList.contains("is-open")) {
        navList.classList.remove("is-open");
        toggle.innerHTML = "Open Menu";
      } else {
        navList.classList.add("is-open");
        toggle.innerHTML = "Close Menu";
      }
    });

    [].slice.call(navItems).forEach(link => {
      link.addEventListener("click", e => {
        navList.classList.remove("is-open");
      });
    });
  }

  initLazyLoading() {
    const observer = lozad(".lazy-load", {
      rootMargin: "500px 0px",
      loaded: function(el) {
        if (el.tagName === "IMG" && !el.complete) {
          el.onload = function() {
            this.classList.add("is-loaded");
          };

          return;
        }

        el.classList.add("is-loaded");
      }
    });

    observer.observe();
  }

  initSmoothScrolling() {
    let links = document.querySelectorAll('[href^="#"]');

    if (links === null) return;

    [].slice.call(links).forEach(link => {
      link.addEventListener("click", e => {
        e.preventDefault();
        jump(link.getAttribute("href"));
      });
    });
  }
}

Turbolinks.start();

//-- On each load, initialize JS.
window.addEventListener("turbolinks:load", e => {
  new AdoptionSite();
});
