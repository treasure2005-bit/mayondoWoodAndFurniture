// Form Validation Script
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("salesForm");

  // Add error message spans to each form group
  const formGroups = form.querySelectorAll(".form-group");
  formGroups.forEach((group) => {
    const input = group.querySelector("input, select");
    if (input && input.type !== "checkbox") {
      const errorSpan = document.createElement("span");
      errorSpan.className = "error-message";
      group.appendChild(errorSpan);
    }
  });

  // Validation functions
  function validateField(field) {
    const formGroup = field.closest(".form-group");
    const errorMessage = formGroup.querySelector(".error-message");
    let isValid = true;
    let message = "";

    // Check if field is empty
    if (field.value.trim() === "" || field.value === "") {
      isValid = false;
      message = `${field.previousElementSibling.textContent.replace(
        ":",
        ""
      )} is required`;
    }
    // Validate number fields
    else if (field.type === "number") {
      if (parseFloat(field.value) <= 0) {
        isValid = false;
        message = "Value must be greater than 0";
      }
    }
    // Validate date field
    else if (field.type === "date") {
      const selectedDate = new Date(field.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate > today) {
        isValid = false;
        message = "Date cannot be in the future";
      }
    }

    // Update UI based on validation
    if (!isValid) {
      field.classList.add("error");
      field.classList.remove("success");
      if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.classList.add("show");
      }
    } else {
      field.classList.remove("error");
      field.classList.add("success");
      if (errorMessage) {
        errorMessage.classList.remove("show");
      }
    }

    return isValid;
  }

  // Real-time validation on blur
  const fields = form.querySelectorAll('input:not([type="checkbox"]), select');
  fields.forEach((field) => {
    field.addEventListener("blur", function () {
      validateField(this);
    });

    // Remove error on input
    field.addEventListener("input", function () {
      if (this.classList.contains("error")) {
        const formGroup = this.closest(".form-group");
        const errorMessage = formGroup.querySelector(".error-message");
        this.classList.remove("error");
        if (errorMessage) {
          errorMessage.classList.remove("show");
        }
      }
    });
  });

  // Form submission validation
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    let isFormValid = true;
    const fields = form.querySelectorAll(
      'input:not([type="checkbox"]), select'
    );

    fields.forEach((field) => {
      if (!validateField(field)) {
        isFormValid = false;
      }
    });

    if (isFormValid) {
      // If all validations pass, submit the form
      console.log("Form is valid, submitting...");
      this.submit();
    } else {
      // Scroll to first error
      const firstError = form.querySelector(".error");
      if (firstError) {
        firstError.focus();
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  });

  // Product Type and Name dependency
  const productType = document.getElementById("salesProductType");
  const productName = document.getElementById("salesProductName");

  const productOptions = {
    wood: ["Timber", "Poles", "Hard Wood", "Soft Wood"],
    furniture: [
      "Beds",
      "Sofa",
      "Dining Tables",
      "Cupboards",
      "Drawers",
      "Home Furniture",
      "Office Furniture",
    ],
  };

  productType.addEventListener("change", function () {
    const selectedType = this.value;
    productName.innerHTML = '<option value="">Select Product</option>';

    if (selectedType && productOptions[selectedType]) {
      productOptions[selectedType].forEach((product) => {
        const option = document.createElement("option");
        option.value = product.toLowerCase().replace(/ /g, "_");
        option.textContent = product;
        productName.appendChild(option);
      });
      productName.disabled = false;
    } else {
      productName.disabled = true;
    }
  });

  // Initial state
  productName.disabled = true;
});
