"use strict";

const SUPABASE_URL = "https://zywwypqddnvslgqztnep.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_fDRyejheqSBrLQcBe8KpQw_L76yFtp8";

// Lambarka WhatsApp ee IGA KEEN
const IGA_KEEN_WHATSAPP = "252907825640";

const $ = (id) => document.getElementById(id);
const views = [...document.querySelectorAll(".view")];
const navItems = [...document.querySelectorAll(".nav-item")];

let db = null;
let gps = {
  latitude: null,
  longitude: null
};
let lastWhatsAppUrl = "";

if (window.supabase && window.supabase.createClient) {
  db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );
}

function showView(id) {
  views.forEach((view) => {
    view.classList.toggle("active", view.id === id);
  });

  navItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.view === id);
  });

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function selectService(service) {
  $("service-type").value = service;

  document.querySelectorAll(".service-tile").forEach((tile) => {
    tile.classList.toggle(
      "selected",
      tile.dataset.service === service
    );
  });

  $("passengers-row").style.display =
    service === "delivery" ? "none" : "grid";

  showView("order-view");
}

function feedback(message, type = "info") {
  const box = $("form-feedback");
  box.textContent = message;
  box.className = `feedback show ${type}`;
}

function clearFeedback() {
  const box = $("form-feedback");
  box.textContent = "";
  box.className = "feedback";
}

function whatsappUrl(message) {
  return `https://wa.me/${IGA_KEEN_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

function openWhatsApp(url) {
  if (url) {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

// Navigation-ka hoose
navItems.forEach((item) => {
  item.addEventListener("click", () => {
    showView(item.dataset.view);
  });
});

// Adeegyada
document.querySelectorAll(".service-tile").forEach((tile) => {
  tile.addEventListener("click", () => {
    selectService(tile.dataset.service);
  });
});

$("start-order-button").addEventListener("click", () => {
  showView("order-view");
});

$("back-home").addEventListener("click", () => {
  showView("home-view");
});

$("help-button").addEventListener("click", () => {
  showView("contact-view");
});

$("new-order").addEventListener("click", () => {
  $("order-form").reset();

  gps = {
    latitude: null,
    longitude: null
  };

  $("location-message").textContent =
    "Ama goobta gacanta ku qor sanduuqa kore.";

  $("passengers-row").style.display = "grid";

  document.querySelectorAll(".service-tile").forEach((tile) => {
    tile.classList.toggle(
      "selected",
      tile.dataset.service === "taxi"
    );
  });

  clearFeedback();
  showView("order-view");
});

$("success-whatsapp").addEventListener("click", () => {
  openWhatsApp(
    lastWhatsAppUrl ||
    whatsappUrl("Asc IGA KEEN, waxaan rabaa inaan wax ka weydiiyo adeegga.")
  );
});

// GPS
function getGPS() {
  const msg = $("location-message");

  if (!navigator.geolocation) {
    msg.textContent =
      "Telefoonkaagu ma taageerayo GPS browser-ka. Fadlan goobta gacanta ku qor.";
    return;
  }

  msg.textContent = "GPS ayaa la raadinayaa…";

  navigator.geolocation.getCurrentPosition(
    (position) => {
      gps.latitude = position.coords.latitude;
      gps.longitude = position.coords.longitude;

      if (!$("pickup-address").value.trim()) {
        $("pickup-address").value = "Goobta GPS-kayga";
      }

      msg.textContent =
        `Location waa la helay (${gps.latitude.toFixed(5)}, ${gps.longitude.toFixed(5)}).`;
    },
    (error) => {
      const messages = {
        1: "GPS waa la diiday. Oggolow Location-ka ama goobta gacanta ku qor.",
        2: "GPS lama helin. Isku day mar kale ama goobta gacanta ku qor.",
        3: "GPS-ku waqti ayuu qaatay. Isku day mar kale."
      };

      msg.textContent =
        messages[error.code] ||
        "GPS lama helin. Geli goobta gacanta.";
    },
    {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 60000
    }
  );
}

$("get-location-button").addEventListener("click", getGPS);

$("home-location-button").addEventListener("click", () => {
  showView("order-view");
  getGPS();
});

// WhatsApp-ka xiriirka
$("contact-whatsapp").href = whatsappUrl(
  "Asc IGA KEEN, waxaan rabaa inaan wax ka weydiiyo adeegyada."
);

// Marka adeegga la beddelo
$("service-type").addEventListener("change", () => {
  const service = $("service-type").value;

  document.querySelectorAll(".service-tile").forEach((tile) => {
    tile.classList.toggle(
      "selected",
      tile.dataset.service === service
    );
  });

  $("passengers-row").style.display =
    service === "delivery" ? "none" : "grid";
});

// Gudbinta dalabka
$("order-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  clearFeedback();

  const submit = $("submit-order");
  const service = $("service-type").value;
  const name = $("customer-name").value.trim();
  const phone = $("customer-phone").value.trim();
  const pickup = $("pickup-address").value.trim();
  const destination = $("destination-address").value.trim();
  const notes = $("notes").value.trim();
  const scheduledValue = $("scheduled-at").value;

  if (!name || !phone || !pickup || !destination) {
    feedback(
      "Fadlan buuxi magaca, telefoonka, goobta lagaa qaadayo iyo meesha loo socdo.",
      "error"
    );
    return;
  }

  if (!db) {
    feedback(
      "Supabase ma furmin. Hubi internet-ka oo bogga dib u fur.",
      "error"
    );
    return;
  }

  // Macluumaadka dalabka oo keliya ayaa la dirayaa.
  // Khidmadaha gudaha looma dirayo browser-ka.
  const payload = {
    service_type: service,
    customer_name: name,
    customer_phone: phone,
    pickup_address: pickup,
    destination_address: destination,
    notes: notes || null,
    passengers:
      service === "delivery"
        ? null
        : (Number.parseInt($("passengers").value, 10) || 1),
    pickup_latitude: gps.latitude,
    pickup_longitude: gps.longitude
  };

  if (scheduledValue) {
    payload.scheduled_at =
      new Date(scheduledValue).toISOString();
  }

  submit.disabled = true;
  submit.textContent = "Waa la kaydinayaa…";

  feedback(
    "Dalabkaaga ayaa lagu kaydinayaa IGA KEEN…",
    "info"
  );

  try {
    const { error } = await db
      .from("orders")
      .insert(payload);

    if (error) {
      throw error;
    }

    const serviceNames = {
      taxi: "Taxi",
      bajaaj: "Bajaaj",
      delivery: "Delivery",
      safar: "Safar"
    };

    const maps =
      gps.latitude !== null && gps.longitude !== null
        ? `https://maps.google.com/?q=${gps.latitude},${gps.longitude}`
        : "GPS lama darin; goobta qoraalka ah ayaa la isticmaalay.";

    const message = [
      "*Dalab cusub — IGA KEEN*",
      `Adeeg: ${serviceNames[service] || service}`,
      `Magac: ${name}`,
      `Telefoon: ${phone}`,
      `Laga qaadayo: ${pickup}`,
      `Loo socdo: ${destination}`,
      service !== "delivery"
        ? `Rakaab: ${payload.passengers}`
        : null,
      scheduledValue
        ? `Waqti: ${new Date(scheduledValue).toLocaleString()}`
        : null,
      notes ? `Faahfaahin: ${notes}` : null,
      `GPS/Map: ${maps}`
    ].filter(Boolean).join("\n");

    lastWhatsAppUrl = whatsappUrl(message);

    $("order-reference").textContent =
      `Adeegga: ${serviceNames[service] || service} · Kaydinta waa guul`;

    $("success-message").textContent =
      "Dalabkaaga waxaa lagu kaydiyey Supabase. WhatsApp ayaad ka sii xaqiijin kartaa IGA KEEN.";

    showView("success-view");

    const waWindow = window.open(
      lastWhatsAppUrl,
      "_blank",
      "noopener,noreferrer"
    );

    if (!waWindow) {
      $("success-message").textContent +=
        " Taabo badhanka WhatsApp si aad u furto.";
    }

  } catch (error) {
    console.error("IGA KEEN order save failed:", error);

    const message =
      error?.message ||
      "Khalad aan la garanayn ayaa dhacay.";

    feedback(
      `Dalabka lama kaydin: ${message}. Hubi internet-ka iyo dejinta Supabase.`,
      "error"
    );

  } finally {
    submit.disabled = false;
    submit.innerHTML = 'Dir dalabka <span>→</span>';
  }
});