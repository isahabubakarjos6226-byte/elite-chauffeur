// Elite Chauffeur - Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initBookingForm();
    initModals();
    initTabs();
});

// Booking Form Price Calculator
function initBookingForm() {
    const bookingForm = document.getElementById('bookingForm');
    if (!bookingForm) return;

    const bookingType = document.getElementById('booking_type');
    const carSelect = document.getElementById('car_id');
    const distanceInput = document.getElementById('distance_km');
    const rentalDaysInput = document.getElementById('rental_days');
    const withDriverCheckbox = document.getElementById('with_driver');
    const priceBreakdown = document.getElementById('priceBreakdown');

    // Toggle sections based on booking type
    if (bookingType) {
        bookingType.addEventListener('change', function() {
            const transferSection = document.getElementById('transferSection');
            const dailySection = document.getElementById('dailySection');
            
            if (this.value === 'transfer') {
                if (transferSection) transferSection.style.display = 'block';
                if (dailySection) dailySection.style.display = 'none';
            } else {
                if (transferSection) transferSection.style.display = 'none';
                if (dailySection) dailySection.style.display = 'block';
            }
            
            calculatePrice();
        });
    }

    // Calculate price on any change
    [carSelect, distanceInput, rentalDaysInput, withDriverCheckbox].forEach(el => {
        if (el) {
            el.addEventListener('change', calculatePrice);
            el.addEventListener('input', calculatePrice);
        }
    });

    function calculatePrice() {
        if (!carSelect || !carSelect.value) {
            if (priceBreakdown) priceBreakdown.style.display = 'none';
            return;
        }

        const selectedOption = carSelect.options[carSelect.selectedIndex];
        const pricePerKm = parseFloat(selectedOption.dataset.pricePerKm) || 0;
        const baseFee = parseFloat(selectedOption.dataset.baseFee) || 0;
        const driverFee = parseFloat(selectedOption.dataset.driverFee) || 0;
        const pricePerDay = parseFloat(selectedOption.dataset.pricePerDay) || baseFee * 3;

        const type = bookingType ? bookingType.value : 'transfer';
        const distance = parseFloat(distanceInput?.value) || 0;
        const days = parseInt(rentalDaysInput?.value) || 1;
        const withDriver = withDriverCheckbox?.checked || false;

        let subtotal = 0;
        let driverCost = 0;

        if (type === 'transfer') {
            subtotal = baseFee + (distance * pricePerKm);
        } else {
            subtotal = pricePerDay * days;
        }

        if (withDriver) {
            driverCost = driverFee;
        }

        const total = subtotal + driverCost;

        // Update breakdown display
        if (priceBreakdown) {
            priceBreakdown.style.display = 'block';
            
            const baseRow = document.getElementById('baseRow');
            const distanceRow = document.getElementById('distanceRow');
            const daysRow = document.getElementById('daysRow');
            const driverRow = document.getElementById('driverRow');
            const totalRow = document.getElementById('totalValue');

            if (type === 'transfer') {
                if (baseRow) {
                    baseRow.style.display = 'flex';
                    baseRow.querySelector('.value').textContent = formatPrice(baseFee);
                }
                if (distanceRow) {
                    distanceRow.style.display = 'flex';
                    distanceRow.querySelector('.value').textContent = formatPrice(distance * pricePerKm);
                    distanceRow.querySelector('.label').textContent = `Distance (${distance} km × ${formatPrice(pricePerKm)}/km)`;
                }
                if (daysRow) daysRow.style.display = 'none';
            } else {
                if (baseRow) baseRow.style.display = 'none';
                if (distanceRow) distanceRow.style.display = 'none';
                if (daysRow) {
                    daysRow.style.display = 'flex';
                    daysRow.querySelector('.value').textContent = formatPrice(subtotal);
                    daysRow.querySelector('.label').textContent = `Daily Rate (${days} days × ${formatPrice(pricePerDay)}/day)`;
                }
            }

            if (driverRow) {
                driverRow.style.display = withDriver ? 'flex' : 'none';
                if (withDriver) {
                    driverRow.querySelector('.value').textContent = formatPrice(driverCost);
                }
            }

            if (totalRow) {
                totalRow.textContent = formatPrice(total);
            }
        }

        // Update hidden total field
        const totalInput = document.getElementById('total_price');
        if (totalInput) {
            totalInput.value = total.toFixed(2);
        }
    }

    // Initial calculation
    calculatePrice();
}

// Format price with currency
function formatPrice(amount) {
    const currency = window.siteCurrency || 'MAD';
    const position = window.currencyPosition || 'after';
    const formatted = parseFloat(amount).toFixed(2);
    
    if (position === 'before') {
        return currency + ' ' + formatted;
    }
    return formatted + ' ' + currency;
}

// Modal functionality
function initModals() {
    // Open modal
    document.querySelectorAll('[data-modal-open]').forEach(btn => {
        btn.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal-open');
            const modal = document.getElementById(modalId);
            if (modal) modal.classList.add('active');
        });
    });

    // Close modal
    document.querySelectorAll('[data-modal-close]').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) modal.classList.remove('active');
        });
    });

    // Close on backdrop click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    });
}

// Tab functionality
function initTabs() {
    document.querySelectorAll('[data-tab]').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabGroup = this.closest('.tabs');
            const targetId = this.getAttribute('data-tab');

            // Update active tab
            tabGroup.querySelectorAll('[data-tab]').forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            // Update content
            const tabContent = tabGroup.nextElementSibling;
            if (tabContent) {
                tabContent.querySelectorAll('.tab-pane').forEach(pane => {
                    pane.style.display = pane.id === targetId ? 'block' : 'none';
                });
            }
        });
    });
}

// Open modal function (for inline onclick)
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
}

// Close modal function
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
}

// Edit item function (populate modal with data)
function editItem(id, data) {
    for (const key in data) {
        const input = document.querySelector(`[name="${key}"]`);
        if (input) {
            if (input.type === 'checkbox') {
                input.checked = data[key] == 1;
            } else {
                input.value = data[key];
            }
        }
    }
    
    // Set the ID
    const idInput = document.querySelector('[name="id"]');
    if (idInput) idInput.value = id;
}

// Confirm delete
function confirmDelete(message, formId) {
    if (confirm(message || 'Are you sure you want to delete this item?')) {
        document.getElementById(formId).submit();
    }
}

// Image preview
function previewImage(input, previewId) {
    const preview = document.getElementById(previewId);
    if (!preview) return;

    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    }
}
