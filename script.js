"use strict";


/* =========================================================
   IGA KEEN CONFIG
========================================================= */

const SUPABASE_URL =
  "https://zywwypqddnvslgqztnep.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_fDRyejheqSBrLQcBe8KpQw_L76yFtp8";

const IGA_KEEN_WHATSAPP =
  "252907825640";


/* =========================================================
   SUPABASE
========================================================= */

let db = null;

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
   HELPERS
========================================================= */

const $ = (id) =>
  document.getElementById(id);

const views =
  [...document.querySelectorAll(".view")];

let navItems =
  [...document.querySelectorAll(".nav-item")];

let currentUser = null;

let currentSession = null;

let authMode = "login";

let gps = {
  latitude: null,
  longitude: null
};

let lastWhatsAppUrl = "";


/* =========================================================
   VIEW SYSTEM
========================================================= */

function showView(id) {

  const target = $(id);

  if (!target) return;

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

function setFeedback(
  element,
  message,
  type = "info"
) {

  if (!element) return;

  element.textContent = message;

  element.className =
    `feedback show ${type}`;
}


function clearFeedback(element) {

  if (!element) return;

  element.textContent = "";

  element.className = "feedback";
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
   AUTH UI
========================================================= */

function updateAuthUI() {

  const loginNavLabel =
    $("login-nav-label");

  const loginNavButton =
    $("login-nav-button");

  if (!loginNavLabel || !loginNavButton) {
    return;
  }


  if (currentUser) {

    loginNavLabel.textContent =
      "Account";

    loginNavButton.dataset.view =
      "account-view";

  } else {

    loginNavLabel.textContent =
      "Login";

    loginNavButton.dataset.view =
      "auth-view";

  }


  navItems =
    [...document.querySelectorAll(".nav-item")];

}


function setAuthMode(mode) {

  authMode = mode;

  const signupFields =
    $("signup-fields");

  const title =
    $("auth-title");

  const subtitle =
    $("auth-subtitle");

  const submit =
    $("auth-submit");

  const forgot =
    $("forgot-password");

  const switchText =
    $("auth-switch-text");

  const switchButton =
    $("switch-auth-mode");

  const overline =
    $("auth-overline");


  clearFeedback(
    $("auth-feedback")
  );


  if (mode === "signup") {

    signupFields.classList.remove(
      "hidden"
    );

    title.textContent =
      "Samee Account";

    subtitle.textContent =
      "Samee account bilaash ah si aad u isticmaasho IGA KEEN.";

    submit.innerHTML =
      'Isdiiwaangeli <span>→</span>';

    forgot.style.display =
      "none";

    switchText.textContent =
      "Account hore ma leedahay?";

    switchButton.textContent =
      "Soo gal";

    overline.textContent =
      "CREATE ACCOUNT";

  } else {

    signupFields.classList.add(
      "hidden"
    );

    title.textContent =
      "Soo gal";

    subtitle.textContent =
      "Soo gal si aad u dalbato adeegga IGA KEEN.";

    submit.innerHTML =
      'Soo gal <span>→</span>';

    forgot.style.display =
      "block";

    switchText.textContent =
      "Account ma lihid?";

    switchButton.textContent =
      "Isdiiwaangeli";

    overline.textContent =
      "IGA KEEN ACCOUNT";

  }

}


/* =========================================================
   AUTH: SIGN UP
========================================================= */

async function signUp() {

  if (!db) {

    setFeedback(
      $("auth-feedback"),
      "Supabase ma furmin. Hubi internet-ka.",
      "error"
    );

    return;
  }


  const fullName =
    $("auth-full-name").value.trim();

  const phone =
    $("auth-phone").value.trim();

  const email =
    $("auth-email").value.trim();

  const password =
    $("auth-password").value;


  if (!fullName) {

    setFeedback(
      $("auth-feedback"),
      "Fadlan geli magacaaga.",
      "error"
    );

    return;
  }


  if (!email) {

    setFeedback(
      $("auth-feedback"),
      "Fadlan geli email-kaaga.",
      "error"
    );

    return;
  }


  if (password.length < 8) {

    setFeedback(
      $("auth-feedback"),
      "Password-ku waa inuu ahaadaa ugu yaraan 8 xaraf.",
      "error"
    );

    return;
  }


  const button =
    $("auth-submit");

  button.disabled = true;

  button.textContent =
    "Account ayaa la sameynayaa…";


  try {

    const {
      data,
      error
    } = await db.auth.signUp({

      email,

      password,

      options: {

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

      setFeedback(
        $("auth-feedback"),
        "Account-ka waa la sameeyay. Waad soo gashay.",
        "success"
      );

    } else {

      setFeedback(
        $("auth-feedback"),
        "Account-ka waa la sameeyay. Email-kaaga ka xaqiiji kadibna soo gal.",
        "success"
      );

      setAuthMode("login");

    }

  } catch (error) {

    console.error(
      "IGA KEEN signup error:",
      error
    );

    setFeedback(
      $("auth-feedback"),
      authErrorMessage(error),
      "error"
    );

  } finally {

    button.disabled = false;

    if (authMode === "signup") {

      button.innerHTML =
        'Isdiiwaangeli <span>→</span>';

    } else {

      button.innerHTML =
        'Soo gal <span>→</span>';

    }

  }

}


/* =========================================================
   AUTH: LOGIN
========================================================= */

async function login() {

  if (!db) {

    setFeedback(
      $("auth-feedback"),
      "Supabase ma furmin. Hubi internet-ka.",
      "error"
    );

    return;
  }


  const email =
    $("auth-email").value.trim();

  const password =
    $("auth-password").value;


  if (!email || !password) {

    setFeedback(
      $("auth-feedback"),
      "Fadlan geli email iyo password.",
      "error"
    );

    return;
  }


  const button =
    $("auth-submit");

  button.disabled = true;

  button.textContent =
    "Soo galaya…";


  try {

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

    fillUserData();

    setFeedback(
      $("auth-feedback"),
      "Si guul leh ayaad u soo gashay.",
      "success"
    );


    setTimeout(() => {

      showView("home-view");

    }, 500);


  } catch (error) {

    console.error(
      "IGA KEEN login error:",
      error
    );

    setFeedback(
      $("auth-feedback"),
      authErrorMessage(error),
      "error"
    );

  } finally {

    button.disabled = false;

    button.innerHTML =
      'Soo gal <span>→</span>';

  }

}


/* =========================================================
   AUTH ERROR MESSAGE
========================================================= */

function authErrorMessage(error) {

  const message =
    String(
      error?.message || ""
    ).toLowerCase();


  if (
    message.includes("invalid login") ||
    message.includes("invalid credentials")
  ) {

    return "Email ama password waa khaldan yahay.";

  }


  if (
    message.includes("user already registered")
  ) {

    return "Email-kan hore ayaa account loogu sameeyay. Soo gal.";

  }


  if (
    message.includes("email not confirmed")
  ) {

    return "Fadlan marka hore email-kaaga xaqiiji.";

  }


  if (
    message.includes("password should be at least")
  ) {

    return "Password-ku waa inuu ahaadaa ugu yaraan 8 xaraf.";

  }


  return (
    error?.message ||
    "Khalad ayaa dhacay. Isku day mar kale."
  );

}


/* =========================================================
   AUTH: FORGOT PASSWORD
========================================================= */

async function forgotPassword() {

  if (!db) return;


  const email =
    $("auth-email").value.trim();


  if (!email) {

    setFeedback(
      $("auth-feedback"),
      "Marka hore geli email-kaaga.",
      "error"
    );

    return;
  }


  try {

    const redirectUrl =
      window.location.origin +
      window.location.pathname;


    const {
      error
    } = await db.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: redirectUrl
      }
    );


    if (error) {
      throw error;
    }


    setFeedback(
      $("auth-feedback"),
      "Email reset password ah ayaa laguu diray. Hubi inbox-kaaga.",
      "success"
    );

  } catch (error) {

    console.error(
      "IGA KEEN password reset error:",
      error
    );

    setFeedback(
      $("auth-feedback"),
      authErrorMessage(error),
      "error"
    );

  }

}


/* =========================================================
   AUTH: LOGOUT
========================================================= */

async function logout() {

  if (!db) return;


  const button =
    $("logout-button");

  button.disabled = true;

  button.textContent =
    "Ka baxaya…";


  try {

    const {
      error
    } = await db.auth.signOut();


    if (error) {
      throw error;
    }


    currentUser = null;

    currentSession = null;

    updateAuthUI();

    showView("home-view");

  } catch (error) {

    console.error(
      "IGA KEEN logout error:",
      error
    );

    setFeedback(
      $("account-feedback"),
      error?.message ||
      "Logout-ka wuu fashilmay.",
      "error"
    );

  } finally {

    button.disabled = false;

    button.textContent =
      "Ka bax Account-ka";

  }

}


/* =========================================================
   USER DATA
========================================================= */

function fillUserData() {

  if (!currentUser) return;


  const metadata =
    currentUser.user_metadata || {};


  const name =
    metadata.full_name || "";

  const phone =
    metadata.phone || "";


  if (name) {

    $("customer-name").value =
      name;

  }


  if (phone) {

    $("customer-phone").value =
      phone;

  }


  $("account-email").textContent =
    currentUser.email || "—";


  $("account-status").textContent =
    "Logged in";

}


/* =========================================================
   REQUIRE LOGIN
========================================================= */

function requireLogin() {

  if (currentUser) {

    return true;

  }


  setAuthMode("login");

  setFeedback(
    $("auth-feedback"),
    "Fadlan marka hore soo gal ama samee Account si aad u dalbato.",
    "info"
  );

  showView("auth-view");

  return false;

}


/* =========================================================
   SERVICE
========================================================= */

function selectService(service) {

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


  if (requireLogin()) {

    showView("order-view");

  }

}


/* =========================================================
   NAVIGATION
========================================================= */

document
  .querySelectorAll(".nav-item")
  .forEach((item) => {

    item.addEventListener(
      "click",
      () => {

        const view =
          item.dataset.view;


        if (
          view === "order-view"
        ) {

          if (!requireLogin()) {
            return;
          }

        }


        if (
          view === "auth-view"
        ) {

          setAuthMode("login");

        }


        if (
          view === "account-view"
        ) {

          if (!currentUser) {

            setAuthMode("login");

            showView("auth-view");

            return;

          }

        }


        showView(view);

      }
    );

  });


/* =========================================================
   HOME BUTTON
========================================================= */

$("start-order-button")
  .addEventListener(
    "click",
    () => {

      if (requireLogin()) {

        showView("order-view");

      }

    }
  );


$("help-button")
  .addEventListener(
    "click",
    () => {

      showView("contact-view");

    }
  );


$("back-home")
  .addEventListener(
    "click",
    () => {

      showView("home-view");

    }
  );


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
   AUTH EVENTS
========================================================= */

$("auth-form")
  .addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();

      clearFeedback(
        $("auth-feedback")
      );


      if (
        authMode === "signup"
      ) {

        await signUp();

      } else {

        await login();

      }

    }
  );


$("switch-auth-mode")
  .addEventListener(
    "click",
    () => {

      setAuthMode(
        authMode === "login"
          ? "signup"
          : "login"
      );

    }
  );


$("forgot-password")
  .addEventListener(
    "click",
    forgotPassword
  );


$("logout-button")
  .addEventListener(
    "click",
    logout
  );


$("account-order-button")
  .addEventListener(
    "click",
    () => {

      if (requireLogin()) {

        showView("order-view");

      }

    }
  );


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
  .addEventListener(
    "click",
    () => {

      if (!requireLogin()) {
        return;
      }

      showView("order-view");

      getGPS();

    }
  );


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
  .addEventListener(
    "change",
    () => {

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

    }
  );


/* =========================================================
   NEW ORDER
========================================================= */

$("new-order")
  .addEventListener(
    "click",
    () => {

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


      fillUserData();


      clearFeedback(
        $("form-feedback")
      );


      if (requireLogin()) {

        showView("order-view");

      }

    }
  );


/* =========================================================
   SUCCESS WHATSAPP
========================================================= */

$("success-whatsapp")
  .addEventListener(
    "click",
    () => {

      openWhatsApp(
        lastWhatsAppUrl ||
        whatsappUrl(
          "Asc IGA KEEN, waxaan rabaa inaan wax ka weydiiyo adeegga."
        )
      );

    }
  );


/* =========================================================
   ORDER SUBMISSION
========================================================= */

$("order-form")
  .addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      clearFeedback(
        $("form-feedback")
      );


      /* LOGIN CHECK */

      if (!currentUser) {

        requireLogin();

        return;

      }


      if (!db) {

        setFeedback(
          $("form-feedback"),
          "Supabase ma furmin. Hubi internet-ka.",
          "error"
        );

        return;

      }


      const submit =
        $("submit-order");


      const service =
        $("service-type").value;

      const name =
        $("customer-name").value.trim();

      const phone =
        $("customer-phone").value.trim();

      const pickup =
        $("pickup-address").value.trim();

      const destination =
        $("destination-address").value.trim();

      const notes =
        $("notes").value.trim();

      const scheduledValue =
        $("scheduled-at").value;


      if (
        !name ||
        !phone ||
        !pickup ||
        !destination
      ) {

        setFeedback(
          $("form-feedback"),
          "Fadlan buuxi magaca, telefoonka, goobta lagaa qaadayo iyo meesha loo socdo.",
          "error"
        );

        return;

      }


      const passengers =
        service === "delivery"
          ? null
          : (
              Number.parseInt(
                $("passengers").value,
                10
              ) || 1
            );


      const payload = {

        /* IMPORTANT:
           Dalabku wuxuu leeyahay user_id
           si Supabase u ogaato qofka dalbanaya.
        */

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
          passengers,

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


      setFeedback(
        $("form-feedback"),
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
          .select("id")
          .single();


        if (error) {

          throw error;

        }


        const serviceNames = {

          taxi:
            "Taxi",

          bajaaj:
            "Bajaaj",

          delivery:
            "Delivery",

          safar:
            "Safar"

        };


        const maps =
          gps.latitude !== null &&
          gps.longitude !== null

            ? `https://maps.google.com/?q=${gps.latitude},${gps.longitude}`

            : "GPS lama darin; goobta qoraalka ah ayaa la isticmaalay.";


        const message = [

          "*Dalab cusub — IGA KEEN*",

          `Order ID: ${data?.id || "N/A"}`,

          `Adeeg: ${serviceNames[service] || service}`,

          `Magac: ${name}`,

          `Telefoon: ${phone}`,

          `Laga qaadayo: ${pickup}`,

          `Loo socdo: ${destination}`,

          service !== "delivery"
            ? `Rakaab: ${passengers}`
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


        $("order-reference").textContent =
          `Order ID: ${data?.id || "—"} · ${serviceNames[service] || service}`;


        $("success-message").textContent =
          "Dalabkaaga waxaa lagu kaydiyey Supabase. WhatsApp ayaad ka sii xaqiijin kartaa IGA KEEN.";


        showView(
          "success-view"
        );


        const waWindow =
          window.open(
            lastWhatsAppUrl,
            "_blank",
            "noopener,noreferrer"
          );


        if (!waWindow) {

          $("success-message").textContent +=
            " Taabo badhanka WhatsApp si aad u furto.";

        }


      } catch (error) {

        console.error(
          "IGA KEEN order save failed:",
          error
        );


        setFeedback(
          $("form-feedback"),
          `Dalabka lama kaydin: ${error?.message || "Khalad aan la garanayn ayaa dhacay."}`,
          "error"
        );


      } finally {

        submit.disabled = false;

        submit.innerHTML =
          'Dir dalabka <span>→</span>';

      }

    }
  );


/* =========================================================
   SUPABASE AUTH SESSION
========================================================= */

async function initializeAuth() {

  if (!db) {

    console.error(
      "Supabase client lama abuurin."
    );

    return;

  }


  try {

    const {
      data,
      error
    } = await db.auth.getSession();


    if (error) {
      throw error;
    }


    currentSession =
      data.session;

    currentUser =
      data.session?.user || null;


    updateAuthUI();

    fillUserData();


  } catch (error) {

    console.error(
      "IGA KEEN session error:",
      error
    );

  }


  db.auth.onAuthStateChange(
    (event, session) => {

      currentSession =
        session;

      currentUser =
        session?.user || null;


      updateAuthUI();

      fillUserData();


      if (
        event === "SIGNED_OUT"
      ) {

        setAuthMode("login");

      }

    }
  );

}


/* =========================================================
   START APP
========================================================= */

setAuthMode("login");

initializeAuth();