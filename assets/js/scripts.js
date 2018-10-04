import 'intersection-observer';
import jump from 'jump.js';
import lozad from 'lozad';
import Turbolinks from 'turbolinks';

class AdoptionSite {

  constructor() {
    this.initLazyLoading();
    this.initSmoothScrolling();
    this.initDropdownMenu();
  }

  initDropdownMenu() {
    let navList = document.querySelector('.Nav-list');
    let toggleElement = document.getElementById('menuToggle');

    if(toggleElement === null) return;

    toggleElement.addEventListener('click', e => {
      let toggle = e.target;

      if (navList.classList.contains('is-open')) {
        navList.classList.remove('is-open');
        toggle.innerHTML = 'Open Menu';
      } else {
        navList.classList.add('is-open');
        toggle.innerHTML = 'Close Menu';
      }
    });
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
    let links = document.querySelectorAll('[href^="#"]');

    if(links === null) return;

    [].slice.call(links).forEach((link) => {

      link.addEventListener('click', (e) => {
        e.preventDefault();
        jump(link.getAttribute('href'));
      });
    });
  }
}

Turbolinks.start();

//-- On each load, initialize JS.
window.addEventListener('turbolinks:load', (e) => {
  new AdoptionSite();
});
