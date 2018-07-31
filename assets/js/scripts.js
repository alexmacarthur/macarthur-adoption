import 'intersection-observer';
import jump from 'jump.js';
import lozad from 'lozad';

class AdoptionSite {
  constructor() {
    this.initLazyLoading();
    this.initSmoothScrolling();
  }

  initLazyLoading() {

    const observer = lozad('.lazy-load', {
      "rootMargin": "500px 0px",
      loaded: function (el) {
        if (el.tagName === "IMG" && !el.complete) {

          el.onload = function () {
            this.classList.add("is-loaded");
          }

          return;
        }

        el.classList.add("is-loaded");
      },
    });

    observer.observe();
  }

  initSmoothScrolling() {
    [].slice.call(document.querySelectorAll('[href^="#"]')).forEach((link) => {

      link.addEventListener('click', (e) => {
        e.preventDefault();
        jump(link.getAttribute('href'));
      });
    });
  }
}

new AdoptionSite();
