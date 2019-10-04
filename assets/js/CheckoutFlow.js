import axios from "axios";
import uuid from "uuid/v4";

export default class {
  constructor() {
    if (typeof Stripe === "undefined") return;

    this.form = document.getElementById("paymentForm");
    this.displayedTotal = document.getElementById("total");

    if (!this.form) return;

    this.stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
    this.alert = document.getElementById("alert");
    this.submitButton = document.getElementById("submitButton");
    this.rand = uuid();

    this.setUpStripeElements();
    this.watchForTotalUpdate();
    this.watchForSubmit();
  }

  refreshDisplayedTotal() {
    this.displayedTotal.innerHTML = `$${this.getCurrentTotal() / 100}`;
  }

  setUpStripeElements() {
    const elements = this.stripe.elements({
      fonts: [
        {
          cssSrc: "https://fonts.googleapis.com/css?family=Roboto"
        }
      ]
    });

    const style = {
      base: {
        color: "#32325d",
        fontFamily: '"Montserrat", sans-serif',
        fontSmoothing: "antialiased",
        fontSize: "18px",
        "::placeholder": {
          color: "#aab7c4"
        }
      },
      invalid: {
        color: "#fa755a",
        iconColor: "#fa755a"
      }
    };

    this.card = elements.create("card", {
      style
    });

    this.card.mount("#cardElement");

    this.card.addEventListener("change", ({ error }) => {
      const displayError = document.getElementById("cardErrors");
      if (error) {
        displayError.textContent = error.message;
      } else {
        displayError.textContent = "";
      }
    });
  }

  getCurrentTotal() {
    let formData = this.getFormData();
    let orderData = this.getOrderData(formData);
    let additionalDonationValue =
      document.getElementById("additional_donation").value * 100;
    let shippingValue = formData.should_ship ? 800 : 0;
    return orderData.total + additionalDonationValue + shippingValue;
  }

  watchForTotalUpdate() {
    let numberInputs = document.querySelectorAll('[type="number"]');
    let shippingTotal = document.getElementById('shipping_total');
    let paymentRow = document.getElementById('payment_row');

    [].slice.call(numberInputs).forEach(input => {
      input.addEventListener("input", e => {
        this.refreshDisplayedTotal();
      });
    });

    document
      .getElementById("additional_donation")
      .addEventListener("input", e => {
        this.refreshDisplayedTotal();
      });

    // Display shipping total, if checked.
    document
      .getElementById("should_ship")
      .addEventListener("input", e => {
        shippingTotal.style.display = e.target.checked ? 'block' : 'none';
        paymentRow.style.display = e.target.checked ? 'none' : 'block';
        this.refreshDisplayedTotal();
      });
  }

  getFormData() {
    let data = {};

    [].slice.call(this.form.elements).forEach(input => {
      if (!!input.name) {
        if(input.type === "checkbox") {
          data[input.name] = input.checked;
        } else if (input.type !== "submit") {
          data[input.name] = input.value;
        }
      }
    });

    return data;
  }

  getOrderData(formData) {
    let data = {
      total: 0,
      items: {}
    };

    for (let key in formData) {
      if (key.startsWith("blend")) {
        let blendName = key.replace("blend_", "");

        //-- Add up the total.
        data.total = data.total + formData[key] * COFFEE_PRICING[blendName];

        //-- Add the quantity.
        data.items[blendName] = Number(formData[key]);
      }
    }

    return data;
  }

  setAlert({ message = false, isBad = true, nuke = false }) {
    if (!message) {
      this.alert.style.display = "none";
      return;
    }

    this.alert.style.display = "";
    this.alert.innerHTML = message;
    this.alert.classList.remove(isBad ? "is-success" : "is-error");
    this.alert.classList.add(isBad ? "is-error" : "is-success");

    if (nuke) {
      this.form.classList.add("no-border");
      [].slice.call(document.querySelectorAll(".BarSeparator")).forEach(row => {
        row.remove();
      });
    }
  }

  watchForSubmit() {
    this.form.addEventListener("submit", async event => {
      event.preventDefault();

      let token, error;
      let formData = this.getFormData();
      let shouldProcessViaStripe = !formData.should_ship;
      let orderData = this.getOrderData(formData);
      let requestPayload = {
        total: this.getCurrentTotal(),
        items: orderData.items,
        email: formData.email,
        address: formData.address,
        phone: formData.phone,
        additional_donation: formData.additional_donation,
        message: formData.message !== undefined ? formData.message : "",
        name: formData.name,
        grind: formData.grind,
        should_ship: formData.should_ship
      };

      this.setAlert({
        message: "Processing...",
        isBad: false
      });

      if (shouldProcessViaStripe) {
        let tokenCreationResult = await this.stripe.createToken(this.card);
        token = tokenCreationResult.token;
        error = tokenCreationResult.error;
      }

      // We're only concerned with Stripe errors if we'll be processing via Stripe.
      if (shouldProcessViaStripe && error) {
        this.setAlert({
          message: false
        });

        const errorElement = document.getElementById("cardErrors");
        errorElement.textContent = error.message;

      } else {

        if (orderData.total < 1) {
          this.setAlert({
            message: "You need to choose at least one bag of coffee.",
            isBad: true
          });
          return;
        }

        // We're processing this w/ Stripe, so we need to add on a couple of Stripe-specific things.
        if (shouldProcessViaStripe) {
          requestPayload = Object.assign({}, requestPayload, {
            token: token,
            idempotency_key: this.rand
          });
        }

        let response = await axios.post(
          `${LAMBDA_ENDPOINT}purchase`,
          requestPayload,
          {
            headers: {
              "Content-Type": "application/json"
            }
          }
        );

        if (response.data === "succeeded") {
          this.setAlert({
            message:
              "Payment successful. We'll let you know when your order is ready within a few weeks!",
            isBad: false,
            nuke: true
          });

          return;
        }

        this.setAlert({
          message:
            "Something got messed up. Email <a href='mailto:ahmacarthur@gmail.com'>ahmacarthur@gmail.com</a> and we'll do this the old-fashioned way.",
          isBad: true
        });
      }
    });
  }
}
