document.addEventListener("DOMContentLoaded", function () {
    // Retrieve the event price from the data attribute
    const eventPrice = parseFloat(document.body.getAttribute("data-event-price"));
    const taxRate = 0.13; 
    const serviceChargePerTicket = 2;
    
    const numTicketsInput = document.getElementById("numTickets");
    const taxAmountInput = document.getElementById("taxAmount");
    const serviceChargeInput = document.getElementById("serviceCharge");
    const totalCostInput = document.getElementById("totalCost");
    const bookingForm = document.getElementById("bookingForm");
  
    function updateCosts() {
      let numTickets = parseInt(numTicketsInput.value);
      if (!numTickets || numTickets < 1) {
        taxAmountInput.value = "";
        serviceChargeInput.value = "";
        totalCostInput.value = "";
        return;
      }
      let taxAmount = numTickets * eventPrice * taxRate;
      let serviceCharge = numTickets * serviceChargePerTicket;
      let totalCost = (numTickets * eventPrice * (1 + taxRate)) + serviceCharge;
  
      taxAmountInput.value = `$${taxAmount.toFixed(2)}`;
      serviceChargeInput.value = `$${serviceCharge.toFixed(2)}`;
      totalCostInput.value = `$${totalCost.toFixed(2)}`;
    }
  
    numTicketsInput.addEventListener("input", updateCosts);
  
    bookingForm.addEventListener("submit", function(e) {
      let numTickets = parseInt(numTicketsInput.value);
      if (!numTickets || numTickets < 1) {
        alert("Please enter a valid number of tickets.");
        e.preventDefault();
        return;
      }
      let taxAmount = numTickets * eventPrice * taxRate;
      let serviceCharge = numTickets * serviceChargePerTicket;
      let totalCost = (numTickets * eventPrice * (1 + taxRate)) + serviceCharge;
      
      let confirmation = confirm(`Do you want to book ${numTickets} ticket(s) for a total of $${totalCost.toFixed(2)}?`);
      if (!confirmation) {
        e.preventDefault();
      }
    });
  });
  