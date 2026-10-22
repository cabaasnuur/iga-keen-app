"use strict";

/*
|--------------------------------------------------------------------------
| IGA KEEN CONFIGURATION
|--------------------------------------------------------------------------
| Beddel lambarkan marka aad haysato WhatsApp Business number-ka dhabta ah.
| Ku qor country code-ka, adigoon isticmaalin + ama spaces.
|
| Tusaale:
| const IGA_KEEN_WHATSAPP = "252907825640";
|--------------------------------------------------------------------------
*/

const IGA_KEEN_WHATSAPP = "252907825640";


/*
|--------------------------------------------------------------------------
| DOM ELEMENTS
|--------------------------------------------------------------------------
*/

const orderForm = document.getElementById("order-form");
const menuToggle = document.getElementById("menu-toggle");
const mainNavigation = document.getElementById("main-navigation");

const getLocationButton = document.getElementById("get-location-btn");
const locationStatus = document.getElementById("location-status");
const locationDetails = document.getElementById("location-details");
const locationError = document.getElementById("location-error");

const latitudeValue = document.getElementById("latitude-value");
const longitudeValue = document.getElementById("longitude-value");

const mapLink = document.getElementById("map-link");
const summaryMapLink = document.getElementById("summary-map-link");

const manualLocationInput = document.getElementById("manual-location");

const dynamicFields = document.getElementById("dynamic-fields");
const selectedServiceDisplay = document.getElementById(
    "selected-service-display"
);

const summaryButton = document.getElementById("summary-btn");
const whatsappSubmit = document.getElementById("whatsapp-submit");

const summaryCard = document.getElementById("summary-card");
const summaryList = document.getElementById("summary-list");

const successModal = document.getElementById("success-modal");
const modalClose = document.getElementById("modal-close");
const backHomeButton = document.getElementById("back-home-btn");

const contactWhatsapp = document.getElementById("contact-whatsapp");


/*
|--------------------------------------------------------------------------
| APPLICATION STATE
|--------------------------------------------------------------------------
*/

const state = {
    latitude: null,
    longitude: null,
    mapsUrl: "",
    locationMethod: "",
    locationAvailable: false,
    currentService: "Taxi"
};


/*
|--------------------------------------------------------------------------
| SERVICE DEFINITIONS
|--------------------------------------------------------------------------
*/

const serviceFields = {
    Taxi: `
        <div class="dynamic-section">
            <div class="dynamic-section-title">4. Faahfaahinta Taxi-ga</div>

            <div class="dynamic-grid">
                <div class="field">
                    <label for="destination">Xaggee loo socdaa?</label>
                    <input
                        id="destination"
                        name="destination"
                        type="text"
                        placeholder="Geli meesha loo socdo"
                        required
                    >
                    <div class="field-error" id="destination-error"></div>
                </div>

                <div class="field">
                    <label for="passengers">Tirada dadka</label>
                    <input
                        id="passengers"
                        name="passengers"
                        type="number"
                        min="1"
                        max="20"
                        inputmode="numeric"
                        placeholder="Tusaale: 2"
                        required
                    >
                    <div class="field-error" id="passengers-error"></div>
                </div>

                <div class="field full-field">
                    <label for="additional-note">Additional note</label>
                    <textarea
                        id="additional-note"
                        name="additionalNote"
                        placeholder="Faahfaahin kale haddii loo baahdo..."
                    ></textarea>
                </div>
            </div>
        </div>
    `,

    Bajaaj: `
        <div class="dynamic-section">
            <div class="dynamic-section-title">4. Faahfaahinta Bajaaj-ka</div>

            <div class="dynamic-grid">
                <div class="field">
                    <label for="destination">Xaggee loo socdaa?</label>
                    <input
                        id="destination"
                        name="destination"
                        type="text"
                        placeholder="Geli meesha loo socdo"
                        required
                    >
                    <div class="field-error" id="destination-error"></div>
                </div>

                <div class="field">
                    <label for="passengers">Tirada dadka</label>
                    <input
                        id="passengers"
                        name="passengers"
                        type="number"
                        min="1"
                        max="10"
                        inputmode="numeric"
                        placeholder="Tusaale: 2"
                        required
                    >
                    <div class="field-error" id="passengers-error"></div>
                </div>

                <div class="field full-field">
                    <label for="additional-note">Additional note</label>
                    <textarea
                        id="additional-note"
                        name="additionalNote"
                        placeholder="Faahfaahin kale haddii loo baahdo..."
                    ></textarea>
                </div>
            </div>
        </div>
    `,

    Delivery: `
        <div class="dynamic-section">
            <div class="dynamic-section-title">4. Faahfaahinta Delivery-ga</div>

            <div class="dynamic-grid">
                <div class="field">
                    <label for="delivery-destination">
                        Delivery destination
                    </label>
                    <input
                        id="delivery-destination"
                        name="deliveryDestination"
                        type="text"
                        placeholder="Meesha loo geynayo"
                        required
                    >
                    <div
                        class="field-error"
                        id="delivery-destination-error"
                    ></div>
                </div>

                <div class="field">
                    <label for="item">Maxaa la keenayaa?</label>
                    <input
                        id="item"
                        name="item"
                        type="text"
                        placeholder="Tusaale: Cunto, alaab..."
                        required
                    >
                    <div class="field-error" id="item-error"></div>
                </div>

                <div class="field">
                    <label for="receiver-name">Receiver name</label>
                    <input
                        id="receiver-name"
                        name="receiverName"
                        type="text"
                        placeholder="Magaca qaataha"
                        required
                    >
                    <div class="field-error" id="receiver-name-error"></div>
                </div>

                <div class="field">
                    <label for="receiver-phone">Receiver phone</label>
                    <input
                        id="receiver-phone"
                        name="receiverPhone"
                        type="tel"
                        placeholder="Telefoonka qaataha"
                        required
                    >
                    <div class="field-error" id="receiver-phone-error"></div>
                </div>

                <div class="field full-field">
                    <label for="additional-note">Additional note</label>
                    <textarea
                        id="additional-note"
                        name="additionalNote"
                        placeholder="Faahfaahin kale haddii loo baahdo..."
                    ></textarea>
                </div>
            </div>
        </div>
    `,

    Safar: `
        <div class="dynamic-section">
            <div class="dynamic-section-title">4. Faahfaahinta Safarka</div>

            <div class="dynamic-grid">
                <div class="field">
                    <label for="departure-city">
                        Magaalada laga baxayo
                    </label>
                    <input
                        id="departure-city"
                        name="departureCity"
                        type="text"
                        placeholder="Tusaale: Goldogob"
                        required
                    >
                    <div class="field-error" id="departure-city-error"></div>
                </div>

                <div class="field">
                    <label for="travel-destination">
                        Magaalada loo socdo
                    </label>
                    <input
                        id="travel-destination"
                        name="travelDestination"
                        type="text"
                        placeholder="Tusaale: Gaalkacyo"
                        required
                    >
                    <div
                        class="field-error"
                        id="travel-destination-error"
                    ></div>
                </div>

                <div class="field">
                    <label for="passengers">Tirada dadka</label>
                    <input
                        id="passengers"
                        name="passengers"
                        type="number"
                        min="1"
                        max="100"
                        inputmode="numeric"
                        placeholder="Tusaale: 3"
                        required
                    >
                    <div class="field-error" id="passengers-error"></div>
                </div>

                <div class="field">
                    <label for="travel-date">Taariikhda safarka</label>
                    <input
                        id="travel-date"
                        name="travelDate"
                        type="date"
                        required
                    >
                    <div class="field-error" id="travel-date-error"></div>
                </div>

                <div class="field full-field">
                    <label for="additional-note">Additional note</label>
                    <textarea
                        id="additional-note"
                        name="additionalNote"
                        placeholder="Faahfaahin kale haddii loo baahdo..."
                    ></textarea>
                </div>
            </div>
        </div>
    `
};


/*
|--------------------------------------------------------------------------
| INITIALIZATION
|--------------------------------------------------------------------------
*/

document.addEventListener("DOMContentLoaded", () => {
    updateServiceForm();
    setupNavigation();
    setupServiceCards();
    setupServiceSelection();
    setupLocation();
    setupForm();
    setupContactWhatsApp();
    setupModal();
    setMinimumTravelDate();
});


/*
|--------------------------------------------------------------------------
| MOBILE NAVIGATION
|--------------------------------------------------------------------------
*/

function setupNavigation() {
    if (!menuToggle || !mainNavigation) {
        return;
    }

    menuToggle.addEventListener("click", () => {
        const isOpen = mainNavigation.classList.toggle("open");

        menuToggle.classList.toggle("active", isOpen);
        menuToggle.setAttribute("aria-expanded", String(isOpen));

        menuToggle.setAttribute(
            "aria-label",
            isOpen ? "Xir menu-ga" : "Fur menu-ga"
        );
    });

    mainNavigation.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            mainNavigation.classList.remove("open");
            menuToggle.classList.remove("active");
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Fur menu-ga");
        });
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            mainNavigation.classList.remove("open");
            menuToggle.classList.remove("active");
            menuToggle.setAttribute("aria-expanded", "false");
        }
    });
}


/*
|--------------------------------------------------------------------------
| SERVICE CARDS
|--------------------------------------------------------------------------
*/

function setupServiceCards() {
    document.querySelectorAll(".service-card").forEach((card) => {
        card.addEventListener("click", () => {
            const service = card.dataset.service;

            const radio = document.querySelector(
                `input[name="service"][value="${service}"]`
            );

            if (radio) {
                radio.checked = true;
                updateServiceForm();
            }

            document.getElementById("order")?.scrollIntoView({
                behavior: "smooth"
            });
        });
    });
}


/*
|--------------------------------------------------------------------------
| SERVICE SELECTION
|--------------------------------------------------------------------------
*/

function setupServiceSelection() {
    document.querySelectorAll('input[name="service"]').forEach((radio) => {
        radio.addEventListener("change", updateServiceForm);
    });
}


function getSelectedService() {
    const selected = document.querySelector(
        'input[name="service"]:checked'
    );

    return selected ? selected.value : "";
}


function updateServiceForm() {
    const service = getSelectedService();

    if (!service) {
        return;
    }

    state.currentService = service;

    dynamicFields.innerHTML = serviceFields[service] || "";

    selectedServiceDisplay.textContent = service;

    document.querySelectorAll(".service-option").forEach((option) => {
        const radio = option.querySelector('input[type="radio"]');

        option.classList.toggle(
            "active",
            radio && radio.checked
        );
    });

    clearAllErrors();
}


/*
|--------------------------------------------------------------------------
| LOCATION SYSTEM
|--------------------------------------------------------------------------
*/

function setupLocation() {
    if (!getLocationButton) {
        return;
    }

    getLocationButton.addEventListener("click", getUserLocation);

    manualLocationInput.addEventListener("input", () => {
        if (manualLocationInput.value.trim()) {
            clearError(manualLocationInput);
            clearFieldError(locationError);
        }
    });
}


function getUserLocation() {
    clearFieldError(locationError);

    if (!navigator.geolocation) {
        showLocationError(
            "Browser-kanagu ma taageerayo GPS. Fadlan meesha gacanta ku qor."
        );
        return;
    }

    getLocationButton.disabled = true;
    getLocationButton.innerHTML = "<span>⌛</span> Location ayaa la raadinayaa...";

    navigator.geolocation.getCurrentPosition(
        handleLocationSuccess,
        handleLocationError,
        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        }
    );
}


function handleLocationSuccess(position) {
    const latitude = Number(position.coords.latitude.toFixed(6));
    const longitude = Number(position.coords.longitude.toFixed(6));

    state.latitude = latitude;
    state.longitude = longitude;
    state.mapsUrl =
        `https://www.google.com/maps?q=${latitude},${longitude}`;
    state.locationMethod = "GPS Location";
    state.locationAvailable = true;

    latitudeValue.textContent = latitude;
    longitudeValue.textContent = longitude;

    mapLink.href = state.mapsUrl;
    summaryMapLink.href = state.mapsUrl;

    locationStatus.classList.add("hidden");
    locationDetails.classList.remove("hidden");

    getLocationButton.disabled = false;
    getLocationButton.innerHTML =
        "<span>✓</span> Location waa la helay";

    clearFieldError(locationError);

    if (manualLocationInput) {
        manualLocationInput.value = "";
    }
}


function handleLocationError(error) {
    state.latitude = null;
    state.longitude = null;
    state.mapsUrl = "";
    state.locationMethod = "";
    state.locationAvailable = false;

    getLocationButton.disabled = false;
    getLocationButton.innerHTML =
        "<span>📍</span> Hel Location-kayga";

    locationDetails.classList.add("hidden");
    locationStatus.classList.remove("hidden");

    let message =
        "Location-ka lama heli karin. Fadlan oggolow GPS-ka ama meesha gacanta ku qor.";

    switch (error.code) {
        case error.PERMISSION_DENIED:
            message =
                "Location-ka lama heli karin. Fadlan oggolow GPS-ka ama meesha gacanta ku qor.";
            break;

        case error.POSITION_UNAVAILABLE:
            message =
                "GPS-ka hadda lama heli karo. Fadlan isku day mar kale ama meesha gacanta ku qor.";
            break;

        case error.TIMEOUT:
            message =
                "GPS-ku waqti ayuu ka dhacay. Fadlan isku day mar kale ama meesha gacanta ku qor.";
            break;

        default:
            message =
                "Location-ka lama heli karin. Fadlan meesha gacanta ku qor.";
    }

    showLocationError(message);
}


function showLocationError(message) {
    locationError.textContent = message;
}


/*
|--------------------------------------------------------------------------
| FORM SUBMISSION
|--------------------------------------------------------------------------
*/

function setupForm() {
    summaryButton.addEventListener("click", () => {
        clearAllErrors();

        if (!validateOrder()) {
            return;
        }

        showOrderSummary();

        summaryCard.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    });

    orderForm.addEventListener("submit", (event) => {
        event.preventDefault();

        clearAllErrors();

        if (!validateOrder()) {
            return;
        }

        sendToWhatsApp();
    });
}


/*
|--------------------------------------------------------------------------
| VALIDATION
|--------------------------------------------------------------------------
*/

function validateOrder() {
    let valid = true;

    const service = getSelectedService();

    if (!service) {
        showSimpleError(
            document.getElementById("service-error"),
            "Fadlan dooro adeeg."
        );

        valid = false;
    }

    const nameInput = document.getElementById("customer-name");
    const phoneInput = document.getElementById("customer-phone");

    if (!nameInput.value.trim()) {
        showInputError(
            nameInput,
            "Fadlan geli magacaaga."
        );

        valid = false;
    }

    if (!phoneInput.value.trim()) {
        showInputError(
            phoneInput,
            "Fadlan geli phone number-kaaga."
        );

        valid = false;
    } else if (phoneInput.value.trim().length < 7) {
        showInputError(
            phoneInput,
            "Fadlan geli phone number sax ah."
        );

        valid = false;
    }

    const hasManualLocation =
        manualLocationInput.value.trim().length > 0;

    const hasGPSLocation =
        state.locationAvailable &&
        state.latitude !== null &&
        state.longitude !== null;

    if (!hasGPSLocation && !hasManualLocation) {
        showLocationError(
            "Pickup location waa required. Hel GPS ama meesha gacanta ku qor."
        );

        valid = false;
    }

    if (service === "Taxi" || service === "Bajaaj") {
        const destination = document.getElementById("destination");
        const passengers = document.getElementById("passengers");

        if (!destination.value.trim()) {
            showInputError(
                destination,
                "Fadlan geli meesha loo socdo."
            );

            valid = false;
        }

        if (
            !passengers.value.trim() ||
            Number(passengers.value) < 1
        ) {
            showInputError(
                passengers,
                "Fadlan geli tirada dadka."
            );

            valid = false;
        }
    }

    if (service === "Delivery") {
        const deliveryDestination =
            document.getElementById("delivery-destination");

        const item = document.getElementById("item");
        const receiverName =
            document.getElementById("receiver-name");
        const receiverPhone =
            document.getElementById("receiver-phone");

        if (!deliveryDestination.value.trim()) {
            showInputError(
                deliveryDestination,
                "Fadlan geli meesha delivery-ga loo geynayo."
            );

            valid = false;
        }

        if (!item.value.trim()) {
            showInputError(
                item,
                "Fadlan sheeg waxa la keenayo."
            );

            valid = false;
        }

        if (!receiverName.value.trim()) {
            showInputError(
                receiverName,
                "Fadlan geli magaca qaataha."
            );

            valid = false;
        }

        if (!receiverPhone.value.trim()) {
            showInputError(
                receiverPhone,
                "Fadlan geli telefoonka qaataha."
            );

            valid = false;
        }
    }

    if (service === "Safar") {
        const departureCity =
            document.getElementById("departure-city");

        const travelDestination =
            document.getElementById("travel-destination");

        const passengers =
            document.getElementById("passengers");

        const travelDate =
            document.getElementById("travel-date");

        if (!departureCity.value.trim()) {
            showInputError(
                departureCity,
                "Fadlan geli magaalada laga baxayo."
            );

            valid = false;
        }

        if (!travelDestination.value.trim()) {
            showInputError(
                travelDestination,
                "Fadlan geli magaalada loo socdo."
            );

            valid = false;
        }

        if (
            !passengers.value.trim() ||
            Number(passengers.value) < 1
        ) {
            showInputError(
                passengers,
                "Fadlan geli tirada dadka."
            );

            valid = false;
        }

        if (!travelDate.value) {
            showInputError(
                travelDate,
                "Fadlan dooro taariikhda safarka."
            );

            valid = false;
        }
    }

    const consent = document.getElementById("order-consent");

    if (!consent.checked) {
        showSimpleError(
            document.getElementById("consent-error"),
            "Fadlan xaqiiji in xogta dalabku sax tahay."
        );

        valid = false;
    }

    if (!valid) {
        const firstError = document.querySelector(
            ".input-error, .field-error:not(:empty)"
        );

        if (firstError) {
            const target =
                firstError.classList.contains("input-error")
                    ? firstError
                    : firstError.previousElementSibling;

            if (target && typeof target.focus === "function") {
                target.focus();
            }
        }
    }

    return valid;
}


/*
|--------------------------------------------------------------------------
| SUMMARY
|--------------------------------------------------------------------------
*/

function showOrderSummary() {
    const service = getSelectedService();

    const name =
        document.getElementById("customer-name").value.trim();

    const phone =
        document.getElementById("customer-phone").value.trim();

    const manualLocation =
        manualLocationInput.value.trim();

    const rows = [];

    rows.push({
        label: "Adeeg",
        value: service
    });

    rows.push({
        label: "Magac",
        value: name
    });

    rows.push({
        label: "Telefoon",
        value: phone
    });

    if (service === "Taxi" || service === "Bajaaj") {
        rows.push({
            label: "Destination",
            value: getValue("destination")
        });

        rows.push({
            label: "Dadka",
            value: getValue("passengers")
        });

        const note = getValue("additional-note");

        if (note) {
            rows.push({
                label: "Details",
                value: note
            });
        }
    }

    if (service === "Delivery") {
        rows.push({
            label: "Delivery",
            value: getValue("delivery-destination")
        });

        rows.push({
            label: "Wax la keenayo",
            value: getValue("item")
        });

        rows.push({
            label: "Qaataha",
            value: getValue("receiver-name")
        });

        rows.push({
            label: "Phone qaataha",
            value: getValue("receiver-phone")
        });

        const note = getValue("additional-note");

        if (note) {
            rows.push({
                label: "Details",
                value: note
            });
        }
    }

    if (service === "Safar") {
        rows.push({
            label: "Laga baxayo",
            value: getValue("departure-city")
        });

        rows.push({
            label: "Loo socdo",
            value: getValue("travel-destination")
        });

        rows.push({
            label: "Dadka",
            value: getValue("passengers")
        });

        rows.push({
            label: "Taariikh",
            value: getValue("travel-date")
        });

        const note = getValue("additional-note");

        if (note) {
            rows.push({
                label: "Details",
                value: note
            });
        }
    }

    summaryList.innerHTML = rows.map((row) => {
        return `
            <div class="summary-row">
                <span>${escapeHTML(row.label)}</span>
                <strong>${escapeHTML(row.value)}</strong>
            </div>
        `;
    }).join("");

    const summaryLocation =
        document.getElementById("summary-location");

    if (state.locationAvailable) {
        summaryLocation.innerHTML = `
            <span>📍</span>
            <div>
                <strong>GPS Location</strong>
                <a
                    href="${escapeAttribute(state.mapsUrl)}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    ${escapeHTML(state.mapsUrl)}
                </a>
            </div>
        `;
    } else {
        summaryLocation.innerHTML = `
            <span>📍</span>
            <div>
                <strong>Pickup Location</strong>
                <span>${escapeHTML(manualLocation)}</span>
            </div>
        `;
    }

    summaryCard.classList.remove("hidden");
    summaryButton.classList.add("hidden");
    whatsappSubmit.classList.remove("hidden");
}


/*
|--------------------------------------------------------------------------
| WHATSAPP MESSAGE
|--------------------------------------------------------------------------
*/

function generateWhatsAppMessage() {
    const service = getSelectedService();

    const name =
        document.getElementById("customer-name").value.trim();

    const phone =
        document.getElementById("customer-phone").value.trim();

    const manualLocation =
        manualLocationInput.value.trim();

    let pickupLocation = manualLocation;

    let latitude = "N/A";
    let longitude = "N/A";

    if (state.locationAvailable) {
        pickupLocation = state.mapsUrl;
        latitude = state.latitude;
        longitude = state.longitude;
    }

    let destination = "";
    let details = "";

    if (service === "Taxi" || service === "Bajaaj") {
        destination = getValue("destination");

        const passengers = getValue("passengers");
        const note = getValue("additional-note");

        details =
            `Tirada dadka: ${passengers}` +
            (note ? `\nAdditional note: ${note}` : "");
    }

    if (service === "Delivery") {
        destination = getValue("delivery-destination");

        const item = getValue("item");
        const receiverName = getValue("receiver-name");
        const receiverPhone = getValue("receiver-phone");
        const note = getValue("additional-note");

        details =
            `Wax la keenayo: ${item}\n` +
            `Receiver name: ${receiverName}\n` +
            `Receiver phone: ${receiverPhone}` +
            (note ? `\nAdditional note: ${note}` : "");
    }

    if (service === "Safar") {
        const departureCity = getValue("departure-city");
        const travelDestination = getValue("travel-destination");
        const passengers = getValue("passengers");
        const travelDate = getValue("travel-date");
        const note = getValue("additional-note");

        destination =
            `${departureCity} → ${travelDestination}`;

        details =
            `Tirada dadka: ${passengers}\n` +
            `Taariikhda safarka: ${travelDate}` +
            (note ? `\nAdditional note: ${note}` : "");
    }

    return `IGA KEEN — DALAB CUSUB

---

Adeeg: ${service}

Magac: ${name}

Phone: ${phone}

Pickup Location:
${pickupLocation}

Latitude:
${latitude}

Longitude:
${longitude}

Destination:
${destination}

Details:
${details}

---

Fadlan la xiriir macaamilka si aad u xaqiijiso dalabka.`;
}


/*
|--------------------------------------------------------------------------
| SEND TO WHATSAPP
|--------------------------------------------------------------------------
*/

function sendToWhatsApp() {
    if (!IGA_KEEN_WHATSAPP ||
        IGA_KEEN_WHATSAPP === "252XXXXXXXXX") {

        alert(
            "Fadlan marka hore script.js ku beddel IGA_KEEN_WHATSAPP lambarka WhatsApp-kaaga."
        );

        return;
    }

    const message = generateWhatsAppMessage();
    const encodedMessage = encodeURIComponent(message);

    const whatsappUrl =
        `https://wa.me/${IGA_KEEN_WHATSAPP}?text=${encodedMessage}`;

    showSuccessModal();

    setTimeout(() => {
        window.open(
            whatsappUrl,
            "_blank",
            "noopener,noreferrer"
        );
    }, 500);
}


/*
|--------------------------------------------------------------------------
| CONTACT WHATSAPP
|--------------------------------------------------------------------------
*/

function setupContactWhatsApp() {
    if (!contactWhatsapp) {
        return;
    }

    contactWhatsapp.addEventListener("click", (event) => {
        event.preventDefault();

        if (
            !IGA_KEEN_WHATSAPP ||
            IGA_KEEN_WHATSAPP === "252XXXXXXXXX"
        ) {
            alert(
                "Fadlan script.js ku beddel IGA_KEEN_WHATSAPP lambarka WhatsApp-kaaga."
            );

            return;
        }

        const message = encodeURIComponent(
            "Asc IGA KEEN, waxaan rabaa inaan wax ka ogaado adeegyada."
        );

        const url =
            `https://wa.me/${IGA_KEEN_WHATSAPP}?text=${message}`;

        window.open(
            url,
            "_blank",
            "noopener,noreferrer"
        );
    });
}


/*
|--------------------------------------------------------------------------
| SUCCESS MODAL
|--------------------------------------------------------------------------
*/

function setupModal() {
    modalClose.addEventListener("click", closeSuccessModal);

    backHomeButton.addEventListener("click", () => {
        closeSuccessModal();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

    successModal.addEventListener("click", (event) => {
        if (event.target === successModal) {
            closeSuccessModal();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (
            event.key === "Escape" &&
            !successModal.classList.contains("hidden")
        ) {
            closeSuccessModal();
        }
    });
}


function showSuccessModal() {
    successModal.classList.remove("hidden");
    modalClose.focus();
}


function closeSuccessModal() {
    successModal.classList.add("hidden");
}


/*
|--------------------------------------------------------------------------
| DATE
|--------------------------------------------------------------------------
*/

function setMinimumTravelDate() {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    const today = `${year}-${month}-${day}`;

    const travelDate = document.getElementById("travel-date");

    if (travelDate) {
        travelDate.min = today;
    }
}


/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function getValue(id) {
    const element = document.getElementById(id);

    if (!element) {
        return "";
    }

    return element.value.trim();
}


function showInputError(input, message) {
    if (!input) {
        return;
    }

    input.classList.add("input-error");

    const errorElement =
        document.getElementById(`${input.id}-error`);

    if (errorElement) {
        errorElement.textContent = message;
    }
}


function showSimpleError(element, message) {
    if (element) {
        element.textContent = message;
    }
}


function clearError(input) {
    if (!input) {
        return;
    }

    input.classList.remove("input-error");

    const errorElement =
        document.getElementById(`${input.id}-error`);

    if (errorElement) {
        errorElement.textContent = "";
    }
}


function clearFieldError(element) {
    if (element) {
        element.textContent = "";
    }
}


function clearAllErrors() {
    document.querySelectorAll(".input-error").forEach((element) => {
        element.classList.remove("input-error");
    });

    document.querySelectorAll(".field-error").forEach((element) => {
        element.textContent = "";
    });
}


function escapeHTML(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function escapeAttribute(value) {
    return escapeHTML(value);
}