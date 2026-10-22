"use strict";

/* =========================================================
   IGA KEEN
   Supabase Auth + Orders + GPS + WhatsApp
   ========================================================= */

const SUPABASE_URL =
  "https://zywwypqddnvslgqztnep.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_fDRyejheqSBrLQcBe8KpQw_L76yFtp8";

const IGA_KEEN_WHATSAPP = "252907825640";

const ADMIN_UID =
  "85282aac-7813-442f-a51b-6d43e3eccf1e";


/* =========================================================
   ELEMENTS
   ========================================================= */

const $ = (id) => document.getElementById(id);

const views = [...document.querySelectorAll(".view")];

const navItems = [
  ...document.querySelectorAll(".nav-item")
];

let db = null;

let currentUser = null;
let currentSession = null;

let gps = {
  latitude: null,
  longitude: null
};

let lastWhatsAppUrl = "";

let authMode = "login";

let pendingService = null;


/* =========================================================
   SUPABASE
   ========================================================= */

if (
  window.supabase &&
  window.supabase.createClient
) {
  db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );
}


/* =========================================================
   VIEW SYSTEM
   ========================================================= */

function showView(id) {
  views.forEach((view) => {
    view.classList.toggle(
      "active",
      view.id === id
    );
  });

  navItems.forEach((item) => {
    item.classList.toggle(
      "active",
      item.dataset.view === id
    );
  });

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* =========================================================
   FEEDBACK
   ========================================================= */

function feedback(
  message,
  type = "info",
  elementId = "form-feedback"
) {
  const box = $(elementId);

  if (!box) return;

  box.textContent = message;
  box.className = `feedback show ${type}`;
}


function clearFeedback(elementId = "form-feedback") {
  const box = $(elementId);

  if (!box) return;

  box.textContent = "";
  box.className = "feedback";
}


/* =========================================================
   AUTH MODE
   ========================================================= */

function setAuthMode(mode) {
  authMode = mode;

  const signup = $("signup-fields");
  const title = $("auth-title");
  const subtitle = $("auth-subtitle");
  const submit = $("auth-submit");
  const switchText = $("auth-switch-text");
  const switchButton = $("switch-auth-mode");
  const forgot = $("forgot-password");

  clearFeedback("auth-feedback");

  if (mode === "signup") {

    signup.classList.remove("hidden");

    title.textContent = "Samee akoon";
    subtitle.textContent =
      "Samee akoon bilaash ah si aad adeeg u dalbato.";

    submit.innerHTML =
      'Samee akoon <span>→</span>';

    switchText.textContent =
      "Akoon hore ma leedahay?";

    switchButton.textContent =
      "Soo gal";

    forgot.classList.add("hidden");

    $("auth-password").autocomplete =
      "new-password";

  } else {

    signup.classList.add("hidden");

    title.textContent =
      "Soo gal akoonkaaga";

    subtitle.textContent =
      "Si aad u dalbato adeeg, marka hore gal ama samee akoon.";

    submit.innerHTML =
      'Soo gal <span>→</span>';

    switchText.textContent =
      "Akoon ma lihid?";

    switchButton.textContent =
      "Samee akoon";

    forgot.classList.remove("hidden");

    $("auth-password").autocomplete =
      "current-password";
  }
}


/* =========================================================
   OPEN AUTH
   ========================================================= */

function openAuth(message = null) {

  setAuthMode("login");

  showView("auth-view");

  if (message) {
    feedback(
      message,
      "info",
      "auth-feedback"
    );
  }
}


/* =========================================================
   AUTH STATE
   ========================================================= */

async function loadAuthState() {

  if (!db) return;

  const {
    data,
    error
  } = await db.auth.getSession();

  if (error) {
    console.error(
      "getSession error:",
      error
    );
    return;
  }

  currentSession = data.session;
  currentUser = data.session?.user || null;

  updateAuthUI();
}


function updateAuthUI() {

  const navLabel =
    $("login-nav-label");

  const navButton =
    $("login-nav-button");

  if (currentUser) {

    navLabel.textContent =
      "Akoon";

    navButton.dataset.view =
      "account-view";

    const email =
      currentUser.email || "Email lama helin";

    $("account-email").textContent =
      email;

    const fullName =
      currentUser.user_metadata?.full_name;

    if (fullName) {
      $("account-status").textContent =
        `Ku soo dhawoow, ${fullName}`;
    } else {
      $("account-status").textContent =
        "Waad soo gashay";
    }

    prefillCustomerInfo();

  } else {

    navLabel.textContent =
      "Login";

    navButton.dataset.view =
      "auth-view";

    $("account-email").textContent =
      "—";

    $("account-status").textContent =
      "Ma soo gelin";

  }
}


/* =========================================================
   AUTH LISTENER
   ========================================================= */

if (db) {

  db.auth.onAuthStateChange(
    async (event, session) => {

      currentSession = session;
      currentUser =
        session?.user || null;

      updateAuthUI();

      if (
        event === "SIGNED_IN" &&
        currentUser &&
        pendingService
      ) {

        const service =
          pendingService;

        pendingService = null;

        setTimeout(() => {
          selectService(service);
        }, 100);
      }

      if (event === "SIGNED_OUT") {
        showView("home-view");
      }
    }
  );
}


/* =========================================================
   PREFILL CUSTOMER
   ========================================================= */

function prefillCustomerInfo() {

  if (!currentUser) return;

  const metadata =
    currentUser.user_metadata || {};

  const name =
    metadata.full_name || "";

  const phone =
    metadata.phone || "";

  if (
    name &&
    !$("customer-name").value.trim()
  ) {
    $("customer-name").value =
      name;
  }

  if (
    phone &&
    !$("customer-phone").value.trim()
  ) {
    $("customer-phone").value =
      phone;
  }
}


/* =========================================================
   SERVICE
   ========================================================= */

function selectService(service) {

  if (!currentUser) {

    pendingService = service;

    openAuth(
      "Si aad u dalbato adeeggan, marka hore gal ama samee akoon."
    );

    return;
  }

  $("service-type").value =
    service;

  document
    .querySelectorAll(".service-tile")
    .forEach((tile) => {

      tile.classList.toggle(
        "selected",
        tile.dataset.service === service
      );

    });

  $("passengers-row").style.display =
    service === "delivery"
      ? "none"
      : "grid";

  prefillCustomerInfo();

  showView("order-view");
}


/* =========================================================
   WHATSAPP
   ========================================================= */

function whatsappUrl(message) {

  return (
    `https://wa.me/${IGA_KEEN_WHATSAPP}` +
    `?text=${encodeURIComponent(message)}`
  );
}


function openWhatsApp(url) {

  if (!url) return;

  window.open(
    url,
    "_blank",
    "noopener,noreferrer"
  );
}


/* =========================================================
   NAVIGATION
   ========================================================= */

navItems.forEach((item) => {

  item.addEventListener("click", () => {

    const target =
      item.dataset.view;

    if (
      target === "order-view"
    ) {

      if (!currentUser) {

        pendingService = null;

        openAuth(
          "Si aad u dalbato, marka hore gal ama samee akoon."
        );

        return;
      }

      prefillCustomerInfo();

      showView("order-view");

      return;
    }

    if (
      target === "auth-view" &&
      currentUser
    ) {

      showView("account-view");

      return;
    }

    showView(target);
  });
});


/* =========================================================
   HOME ORDER
   ========================================================= */

$("start-order-button")
  .addEventListener("click", () => {

    if (!currentUser) {

      pendingService = null;

      openAuth(
        "Si aad u dalbato, marka hore gal ama samee akoon."
      );

      return;
    }

    prefillCustomerInfo();

    showView("order-view");
  });


/* =========================================================
   SERVICE BUTTONS
   ========================================================= */

document
  .querySelectorAll(".service-tile")
  .forEach((tile) => {

    tile.addEventListener(
      "click",
      () => {

        selectService(
          tile.dataset.service
        );

      }
    );
  });


/* =========================================================
   BACK
   ========================================================= */

$("back-home")
  .addEventListener("click", () => {

    showView("home-view");

  });


/* =========================================================
   HELP
   ========================================================= */

$("help-button")
  .addEventListener("click", () => {

    showView("contact-view");

  });


/* =========================================================
   AUTH SWITCH
   ========================================================= */

$("switch-auth-mode")
  .addEventListener("click", () => {

    if (authMode === "login") {
      setAuthMode("signup");
    } else {
      setAuthMode("login");
    }

  });


/* =========================================================
   SIGN UP / LOGIN
   ========================================================= */

$("auth-form")
  .addEventListener("submit", async (event) => {

    event.preventDefault();

    clearFeedback("auth-feedback");

    if (!db) {

      feedback(
        "Supabase ma furmin. Hubi internet-ka.",
        "error",
        "auth-feedback"
      );

      return;
    }

    const email =
      $("auth-email").value.trim();

    const password =
      $("auth-password").value;

    if (!email || !password) {

      feedback(
        "Fadlan geli email iyo password.",
        "error",
        "auth-feedback"
      );

      return;
    }

    if (password.length < 8) {

      feedback(
        "Password-ku waa inuu ahaadaa ugu yaraan 8 xaraf.",
        "error",
        "auth-feedback"
      );

      return;
    }

    const button =
      $("auth-submit");

    button.disabled = true;

    button.textContent =
      authMode === "signup"
        ? "Akoonka ayaa la sameynayaa…"
        : "Soo gelayaa…";

    try {

      if (authMode === "signup") {

        const fullName =
          $("auth-full-name").value.trim();

        const phone =
          $("auth-phone").value.trim();

        if (!fullName || !phone) {

          throw new Error(
            "Fadlan geli magaca iyo telefoonka."
          );
        }

        const {
          data,
          error
        } = await db.auth.signUp({

          email,
          password,

          options: {
            emailRedirectTo:
              "https://cabaasnuur.github.io/iga-keen-app/",

            data: {
              full_name: fullName,
              phone: phone
            }
          }

        });

        if (error) {
          throw error;
        }

        if (data.session) {

          currentSession =
            data.session;

          currentUser =
            data.user;

          updateAuthUI();

          feedback(
            "Akoonka waa la sameeyay.",
            "success",
            "auth-feedback"
          );

          setTimeout(() => {

            if (pendingService) {

              const service =
                pendingService;

              pendingService = null;

              selectService(service);

            } else {

              showView("account-view");

            }

          }, 500);

        } else {

          feedback(
            "Akoonka waa la sameeyay. Fadlan email-kaaga xaqiiji, kadibna soo gal.",
            "success",
            "auth-feedback"
          );

          $("auth-password").value = "";

        }

      } else {

        const {
          data,
          error
        } = await db.auth.signInWithPassword({

          email,
          password

        });

        if (error) {
          throw error;
        }

        currentSession =
          data.session;

        currentUser =
          data.user;

        updateAuthUI();

        feedback(
          "Si guul leh ayaad u soo gashay.",
          "success",
          "auth-feedback"
        );

        setTimeout(() => {

          if (pendingService) {

            const service =
              pendingService;

            pendingService = null;

            selectService(service);

          } else {

            showView("account-view");

          }

        }, 350);
      }

    } catch (error) {

      console.error(
        "IGA KEEN Auth error:",
        error
      );

      let message =
        error?.message ||
        "Khalad ayaa dhacay.";

      if (
        message.toLowerCase()
          .includes("invalid login credentials")
      ) {
        message =
          "Email ama password ayaa khaldan.";
      }

      if (
        message.toLowerCase()
          .includes("user already registered")
      ) {
        message =
          "Email-kan hore ayaa akoon loogu sameeyay. Soo gal halkii aad akoon cusub ka samayn lahayd.";
      }

      feedback(
        message,
        "error",
        "auth-feedback"
      );

    } finally {

      button.disabled = false;

      button.innerHTML =
        authMode === "signup"
          ? 'Samee akoon <span>→</span>'
          : 'Soo gal <span>→</span>';
    }

  });


/* =========================================================
   FORGOT PASSWORD
   ========================================================= */

$("forgot-password")
  .addEventListener("click", async () => {

    clearFeedback("auth-feedback");

    if (!db) {

      feedback(
        "Supabase ma furmin.",
        "error",
        "auth-feedback"
      );

      return;
    }

    const email =
      $("auth-email").value.trim();

    if (!email) {

      feedback(
        "Marka hore geli email-kaaga.",
        "error",
        "auth-feedback"
      );

      $("auth-email").focus();

      return;
    }

    try {

      const redirectTo =
        "https://cabaasnuur.github.io/iga-keen-app/";

      const {
        error
      } = await db.auth.resetPasswordForEmail(
        email,
        {
          redirectTo
        }
      );

      if (error) {
        throw error;
      }

      feedback(
        "Email-ka reset password-ka ayaa laguu diray. Hubi inbox-kaaga.",
        "success",
        "auth-feedback"
      );

    } catch (error) {

      console.error(
        "Password reset error:",
        error
      );

      feedback(
        error?.message ||
        "Password reset lama dirin.",
        "error",
        "auth-feedback"
      );
    }

  });


/* =========================================================
   ACCOUNT ORDER
   ========================================================= */

$("account-order-button")
  .addEventListener("click", () => {

    if (!currentUser) {

      openAuth(
        "Fadlan marka hore soo gal."
      );

      return;
    }

    prefillCustomerInfo();

    showView("order-view");

  });


/* =========================================================
   LOGOUT
   ========================================================= */

$("logout-button")
  .addEventListener("click", async () => {

    if (!db) return;

    const {
      error
    } = await db.auth.signOut();

    if (error) {

      feedback(
        error.message ||
        "Ka bixitaanka akoonka wuu fashilmay.",
        "error",
        "account-feedback"
      );

      return;
    }

    currentUser = null;
    currentSession = null;

    feedback(
      "Waad ka baxday akoonka.",
      "success",
      "account-feedback"
    );

    showView("home-view");

  });


/* =========================================================
   NEW ORDER
   ========================================================= */

$("new-order")
  .addEventListener("click", () => {

    if (!currentUser) {

      openAuth(
        "Fadlan marka hore soo gal."
      );

      return;
    }

    $("order-form").reset();

    gps = {
      latitude: null,
      longitude: null
    };

    $("location-message").textContent =
      "Ama goobta gacanta ku qor sanduuqa kore.";

    $("passengers-row").style.display =
      "grid";

    document
      .querySelectorAll(".service-tile")
      .forEach((tile) => {

        tile.classList.toggle(
          "selected",
          tile.dataset.service === "taxi"
        );

      });

    clearFeedback();

    prefillCustomerInfo();

    showView("order-view");

  });


/* =========================================================
   SUCCESS WHATSAPP
   ========================================================= */

$("success-whatsapp")
  .addEventListener("click", () => {

    openWhatsApp(
      lastWhatsAppUrl ||
      whatsappUrl(
        "Asc IGA KEEN, waxaan rabaa inaan wax ka weydiiyo adeegga."
      )
    );

  });


/* =========================================================
   GPS
   ========================================================= */

function getGPS() {

  const msg =
    $("location-message");

  if (!navigator.geolocation) {

    msg.textContent =
      "Telefoonkaagu ma taageerayo GPS browser-ka. Fadlan goobta gacanta ku qor.";

    return;
  }

  msg.textContent =
    "GPS ayaa la raadinayaa…";

  navigator.geolocation.getCurrentPosition(

    (position) => {

      gps.latitude =
        position.coords.latitude;

      gps.longitude =
        position.coords.longitude;

      if (
        !$("pickup-address")
          .value
          .trim()
      ) {

        $("pickup-address").value =
          "Goobta GPS-kayga";
      }

      msg.textContent =
        `Location waa la helay (${gps.latitude.toFixed(5)}, ${gps.longitude.toFixed(5)}).`;

    },

    (error) => {

      const messages = {

        1:
          "GPS waa la diiday. Oggolow Location-ka ama goobta gacanta ku qor.",

        2:
          "GPS lama helin. Isku day mar kale ama goobta gacanta ku qor.",

        3:
          "GPS-ku waqti ayuu qaatay. Isku day mar kale."

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


$("get-location-button")
  .addEventListener(
    "click",
    getGPS
  );


$("home-location-button")
  .addEventListener("click", () => {

    if (!currentUser) {

      openAuth(
        "Si aad u isticmaasho dalabka, marka hore gal ama samee akoon."
      );

      return;
    }

    showView("order-view");

    getGPS();

  });


/* =========================================================
   CONTACT WHATSAPP
   ========================================================= */

$("contact-whatsapp").href =
  whatsappUrl(
    "Asc IGA KEEN, waxaan rabaa inaan wax ka weydiiyo adeegyada."
  );


/* =========================================================
   SERVICE SELECT CHANGE
   ========================================================= */

$("service-type")
  .addEventListener("change", () => {

    const service =
      $("service-type").value;

    document
      .querySelectorAll(".service-tile")
      .forEach((tile) => {

        tile.classList.toggle(
          "selected",
          tile.dataset.service === service
        );

      });

    $("passengers-row").style.display =
      service === "delivery"
        ? "none"
        : "grid";
  });


/* =========================================================
   ORDER SUBMIT
   ========================================================= */

$("order-form")
  .addEventListener("submit", async (event) => {

    event.preventDefault();

    clearFeedback();

    if (!currentUser) {

      openAuth(
        "Si aad u dirto dalabka, marka hore soo gal ama samee akoon."
      );

      return;
    }

    if (!currentSession) {

      const {
        data
      } = await db.auth.getSession();

      currentSession =
        data.session;

      currentUser =
        data.session?.user || null;
    }

    if (!currentUser) {

      openAuth(
        "Session-kaaga wuu dhammaaday. Fadlan mar kale soo gal."
      );

      return;
    }

    const submit =
      $("submit-order");

    const service =
      $("service-type").value;

    const name =
      $("customer-name")
        .value
        .trim();

    const phone =
      $("customer-phone")
        .value
        .trim();

    const pickup =
      $("pickup-address")
        .value
        .trim();

    const destination =
      $("destination-address")
        .value
        .trim();

    const notes =
      $("notes")
        .value
        .trim();

    const scheduledValue =
      $("scheduled-at").value;


    if (
      !name ||
      !phone ||
      !pickup ||
      !destination
    ) {

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


    const payload = {

      user_id:
        currentUser.id,

      service_type:
        service,

      customer_name:
        name,

      customer_phone:
        phone,

      pickup_address:
        pickup,

      destination_address:
        destination,

      notes:
        notes || null,

      passengers:
        service === "delivery"
          ? null
          : (
              Number.parseInt(
                $("passengers").value,
                10
              ) || 1
            ),

      pickup_latitude:
        gps.latitude,

      pickup_longitude:
        gps.longitude
    };


    if (scheduledValue) {

      payload.scheduled_at =
        new Date(
          scheduledValue
        ).toISOString();

    }


    submit.disabled = true;

    submit.textContent =
      "Waa la kaydinayaa…";

    feedback(
      "Dalabkaaga ayaa lagu kaydinayaa IGA KEEN…",
      "info"
    );


    try {

      const {
        data,
        error
      } = await db
        .from("orders")
        .insert(payload)
        .select()
        .single();


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
        gps.latitude !== null &&
        gps.longitude !== null

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

        notes
          ? `Faahfaahin: ${notes}`
          : null,

        `GPS/Map: ${maps}`

      ]
        .filter(Boolean)
        .join("\n");


      lastWhatsAppUrl =
        whatsappUrl(message);


      $("order-reference")
        .textContent =
        data?.id
          ? `Order ID: ${data.id}`
          : `Adeegga: ${serviceNames[service] || service}`;


      $("success-message")
        .textContent =
        "Dalabkaaga waxaa lagu kaydiyey Supabase. WhatsApp ayaad ka sii xaqiijin kartaa IGA KEEN.";


      showView("success-view");


      const waWindow =
        window.open(
          lastWhatsAppUrl,
          "_blank",
          "noopener,noreferrer"
        );


      if (!waWindow) {

        $("success-message")
          .textContent +=
          " Taabo badhanka WhatsApp si aad u furto.";

      }

    } catch (error) {

      console.error(
        "IGA KEEN order save failed:",
        error
      );


      let message =
        error?.message ||
        "Khalad aan la garanayn ayaa dhacay.";


      if (
        message
          .toLowerCase()
          .includes("row-level security")
      ) {

        message =
          "Dalabka lama oggolaan. Hubi in account-kaagu soo galay iyo user_id policy-ga Supabase.";

      }


      feedback(
        `Dalabka lama kaydin: ${message}`,
        "error"
      );

    } finally {

      submit.disabled = false;

      submit.innerHTML =
        'Dir dalabka <span>→</span>';

    }

  });


/* =========================================================
   INITIALIZE
   ========================================================= */

(async function init() {

  setAuthMode("login");

  if (!db) {

    console.error(
      "Supabase client lama abuurin."
    );

    return;
  }

  await loadAuthState();

})();