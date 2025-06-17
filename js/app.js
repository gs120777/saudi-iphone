const selectOne = (selector) => document.querySelector(selector);
const selectAll = (selector) => document.querySelectorAll(selector);

const on = (element, eventName, selector, eventHandler, noSelector) => {
  if (!element) {
    return;
  }

  if (!eventHandler) {
    eventHandler = selector;
    noSelector = true;
  }
  if (selector && !noSelector) {
    const wrappedHandler = (e) => {
      if (!e.target) return;
      const el = e.target.closest(selector);
      if (el) {
        eventHandler.call(el, e);
      }
    };
    element.addEventListener(eventName, wrappedHandler);
    return wrappedHandler;
  }

  const wrappedHandler = (e) => {
    eventHandler.call(element, e);
  };
  element.addEventListener(eventName, wrappedHandler);
  return wrappedHandler;
};

const fadeIn = (element, fn) => {
  element.addEventListener(
    "animationend",
    (event) => {
      fn && fn(event.target);
    },
    { once: true },
  );
  element.style.opacity = 0;
  element.classList.remove("is-hidden");
  element.classList.add(
    "animate__animated",
    "animate__faster",
    "animate__fadeIn",
  );
  return element;
};

const fadeOut = (element, fn) => {
  element.addEventListener(
    "animationend",
    (event) => {
      fn && fn(event.target);
    },
    { once: true },
  );
  element.classList.add(
    "animate__animated",
    "animate__faster",
    "animate__fadeOut",
  );
  return element;
};

const blockUI = (selector) => {
  const svgColor = window.baseBColor || "black";
  const options = { svgColor };
  //Notiflix.Block.dots(selector, options);
};

const unblockUI = (selector) => {
  //Notiflix.Block.remove(selector);
};

const hideSections = () => {
  selectAll("section").forEach((section) => section.classList.add("is-hidden"));
};

const showLoadingSection = () => {
  const ms = 1000;
  hideSections();
  fadeIn(selectOne("#loading"));

  const steps = [1, 2, 3];

  steps.map((n, i) => {
    setTimeout(() => fadeIn(selectOne(`#loading-${n}-step`)), i * ms);
  });

  return setTimeout(() => {
    if (selectOne("#choices")) {
      showChoicesSection();
    } else {
      showPrefillOrRedirect();
    }
  }, steps.length * ms);
};

const showChoicesSection = () => {
  hideSections();
  fadeIn(selectOne("#choices"), () => showWelcomeModal());
};

const showPrefillSection = () => {
  hideSections();
  fadeIn(selectOne("#prefill"));
};

const questionOnClick = (e) => {
  blockUI("#questions");
  fadeOut(e.target.closest(".question"), (element) => {
    element.classList.add("is-hidden");
    const next = element.nextElementSibling;
    if (next && next.classList.contains("question")) {
      const next = element.nextElementSibling;
      fadeIn(next, () => {
        unblockUI("#questions");
      });
    } else {
      showLoadingSection();
    }
  });
};

let isWin = false;
const choiceOnClick = (e) => {
  const choiceBlock = e.target.closest(".choice");

  if (choiceBlock.classList.contains("is-disabled")) {
    return;
  }

  choiceBlock.classList.add("is-disabled");

  if (isWin) {
    selectAll(".choice").forEach((c) => c.classList.add("is-disabled"));
    choiceBlock.classList.add("is-box-opened", "is-box-won");
    setTimeout(showWinModal, 2000);
  } else {
    isWin = true;
    choiceBlock.classList.add("is-box-opened");
    setTimeout(showTryAgainModal, 2000);
  }
};

const init = (fn) => {
  if (document.readyState !== "loading") {
    return fn();
  }

  document.addEventListener("DOMContentLoaded", fn, { once: true });
};

const initRedirectURL = () => {
  const redirectURL = selectOne("#redirect-url").getAttribute("href");
  if (redirectURL === "{offer}") {
    return redirectURL;
  }

  try {
    if (redirectURL.startsWith("http")) {
      return new URL(redirectURL);
    }

    if (redirectURL.startsWith("/")) {
      return new URL(redirectURL, window.location.origin);
    }
  } catch {}

  return redirectURL;
};

const initSlider = () => {
  const count = +selectOne("#slider-count").value;
  if (!count) {
    return;
  }
  const microSwiper = new Swiper("#micro-swiper", {
    spaceBetween: 3,
    slidesPerView: Math.min(count, 4),
    freeMode: true,
    watchSlidesProgress: true,
  });

  new Swiper("#big-swiper", {
    direction: "horizontal",
    autoplay: Boolean(selectOne("#slider-autoplay").value),
    loop: true,
    pagination: {
      enabled: true,
      el: ".swiper-pagination",
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    scrollbar: {
      el: ".swiper-scrollbar",
    },
    thumbs: {
      swiper: microSwiper,
    },
  });

  const pagination = selectOne("#swiper-pagination");
  pagination
    .querySelectorAll(".swiper-pagination-bullet")
    .forEach((element) => {
      element.style.backgroundColor = pagination.style.color;
    });

  selectAll("#micro-swiper img").forEach((element) => {
    on(element, "mouseenter", (e) => {
      e.target.style.border = e.target.getAttribute("data-enter");
    });
    on(element, "mouseleave", (e) => {
      e.target.style.border = e.target.getAttribute("data-leave");
    });
  });
};

const initCountDown = () => {
  const container = selectOne("#countdown-container");
  if (!container) {
    return;
  }

  const countDownElement = selectOne("#countdown-value");
  const countDownTimeTime = countDownElement.getAttribute("data-time");
  const timeSplit = countDownTimeTime.split(":");

  const seconds = +timeSplit[0] * 3600 + +timeSplit[1] * 60 + +timeSplit[2];

  const countdownTo = new Date(new Date().getTime() + seconds * 1000);
  const countdownTime = countdownTo.getTime();

  countdown(countdownTime, (ts) => {
    if (ts.value < 0 && (ts.minutes || ts.seconds)) {
      countDownElement.textContent = [
        String(ts.hours).padStart(2, "0"),
        String(ts.minutes).padStart(2, "0"),
        String(ts.seconds).padStart(2, "0"),
      ].join(":");
    }
  });
};

const fireModal = (template, options = {}) => {
  const confirmButtonFontColor = selectOne("#modal-buttons-font-color").value;
  const confirmButtonBackgroundColor = selectOne(
    "#modal-buttons-background-color",
  ).value;
  return Swal.fire(
    Object.assign(
      {},
      {
        html: selectOne(template).innerHTML,
        confirmButtonColor: confirmButtonBackgroundColor,
        confirmButtonText: `<span style="color: ${confirmButtonFontColor}">OK</span>`,
        allowOutsideClick: false,
        allowEscapeKey: false,
        heightAuto: false,
      },
      options,
    ),
  );
};

const showWelcomeModal = () => {
  return fireModal("#modal-welcome");
};

const showTryAgainModal = () => {
  return fireModal("#modal-try-again");
};

const showFaqModal = () => {
  return fireModal("#modal-faq");
};

const showPrefillOrRedirect = () => {
  const prefill = selectOne("#prefill");

  if (!prefill) {
    const url = initRedirectURL();
    if (typeof url === "string") {
      window.location.replace(decodeURIComponent(url));
    }
    if (url instanceof URL) {
      window.location.replace(decodeURIComponent(url.toString()));
    }
    return;
  }

  showPrefillSection();
};

const showWinModal = async () => {
  return fireModal("#modal-win").then(() => {
    fadeOut(selectOne("#choices"));
    showPrefillOrRedirect();
  });
};

const initQuestions = () => {
  on(selectOne("#questions"), "click", "button", questionOnClick);
};

const toggleFaq = (el) => {
  let activeAnswer = document.querySelector(".faq-answer.faq-active");
  let activeArrow = document.querySelector(
    ".faq-question .faq-arrow.faq-rotate",
  );

  if (activeAnswer && activeAnswer !== el.nextElementSibling) {
    activeAnswer.style.display = "none";
    activeAnswer.classList.remove("faq-active");
  }

  if (activeArrow && activeArrow !== el.querySelector(".faq-arrow")) {
    activeArrow.classList.remove("faq-rotate");
  }

  let answer = el.nextElementSibling;
  let arrow = el.querySelector(".faq-arrow");

  if (answer.style.display === "block") {
    answer.style.display = "none";
    answer.classList.remove("faq-active");
    arrow.classList.remove("faq-rotate");
  } else {
    answer.style.display = "block";
    answer.classList.add("faq-active");
    arrow.classList.add("faq-rotate");
  }
};

const initFaq = () => {
  if (!selectOne("#faq")) {
    return;
  }

  on(selectOne("#faq"), "click", "#show-faq", () => {
    showFaqModal();
  });

  on(selectOne("body"), "click", ".faq-question", (e) => {
    toggleFaq(e.target);
  });
};

const initChoices = () => {
  on(selectOne("#choices"), "click", ".choice", choiceOnClick);
};

const formatToday = (str) => {
  if (!str) {
    return "";
  }

  const padNumberStart = (num) => num.toString().padStart(2, "0");

  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();

  return str.replaceAll(
    /\{today:((dd|mm|yyyy)([.\- :])(dd|mm|yyyy)([.\- :])(dd|mm|yyyy))}/g,
    (match, format) =>
      format
        .replace("dd", padNumberStart(day))
        .replace("mm", padNumberStart(month))
        .replace("yyyy", year),
  );
};

const initTodayDates = (selector) => {
  selectAll(selector).forEach((element) => {
    element.innerHTML = formatToday(element.innerHTML);
  });
};

const showPopup = () => {
  const toast = selectOne("#toast");
  const popup = window.popups.shift();
  if (popup) {
    toast.querySelector("#toast-title").textContent = formatToday(popup.title);
    toast.querySelector("#toast-message").textContent = formatToday(
      popup.message,
    );
    toast.querySelector("#toast-note").textContent = formatToday(popup.note);
    toast.querySelector("#toast-image").classList.add("is-invisible");
    if (popup.image) {
      toast.querySelector("#toast-image").setAttribute("src", popup.image);
      toast.querySelector("#toast-image").classList.remove("is-hidden");
    } else {
      toast.querySelector("#toast-image").classList.add("is-hidden");
    }

    toast.classList.remove("is-hidden");
    toast.classList.remove("animate__fadeOut");

    const autocloseDelay = Number.parseInt(
      popupsTiming["popups-autoclose-delay"],
      10,
    );
    const nextDelay = Number.parseInt(
      popupsTiming["popups-show-next-delay"],
      10,
    );

    let toastTimeout;

    on(selectOne("#toast-close"), "click", () => {
      clearTimeout(toastTimeout);
      toast &&
        fadeOut(toast, () => {
          setTimeout(
            showPopup,
            (Number.isInteger(nextDelay) ? nextDelay : 10) * 1000,
          );
        });
    });

    toastTimeout = setTimeout(
      () => {
        toast &&
          fadeOut(toast, () => {
            setTimeout(
              showPopup,
              (Number.isInteger(nextDelay) ? nextDelay : 10) * 1000,
            );
          });
      },
      (Number.isInteger(autocloseDelay) ? autocloseDelay : 6) * 1000,
    );
  }
};

const initPopups = () => {
  const toast = selectOne("#toast");
  if (!toast) {
    return;
  }

  if (!Array.isArray(window.popups)) {
    return;
  }

  const firstDelay = Number.parseInt(popupsTiming["popups-first-delay"], 10);

  setTimeout(showPopup, (Number.isInteger(firstDelay) ? firstDelay : 0) * 1000);
};

const initPrefill = () => {
  selectAll(".prefill-form").forEach((form) => {
    const validator = new JustValidate(form, {
      errorFieldCssClass: ["is-danger"],
      successFieldCssClass: ["is-success"],
    });
    const fields = form.querySelectorAll("input");

    fields.forEach((field) => {
      const rules = [
        {
          rule: "required",
          errorMessage: field.getAttribute("data-error-required-message"),
        },
      ];

      if (field.getAttribute("type") === "email") {
        rules.push({
          rule: "email",
          errorMessage: field.getAttribute("data-error-email-message"),
        });
      }

      if (field.hasAttribute("data-phone-code")) {
        rules.push({
          rule: "minLength",
          value: 10,
          errorMessage: field.getAttribute("data-error-phone-message"),
        });
        rules.push({
          rule: "customRegexp",
          value: /^\+[1-9]\d{9,14}$/,
          errorMessage: field.getAttribute("data-error-phone-message"),
        });
      }

      validator.addField(field, rules);
    });

    form.querySelectorAll("[data-phone-code]").forEach((field) => {
      const code = field.getAttribute("data-phone-code") || "";
      new Maska.MaskInput(field, {
        mask: code.padEnd(16, "#"),
        eager: true,
      });
    });

    validator.onSuccess((e) => {
      const url = initRedirectURL();
      if (typeof url === "string") {
        window.location.replace(decodeURIComponent(url));
      }
      if (url instanceof URL) {
        const mapping = window.prefillMapping || {};
        e.currentTarget.querySelectorAll("input").forEach((input) => {
          let value = input.value.trim().replace(/^\+/, "");
          if (input.getAttribute("type") === "email") {
            value = value.toLowerCase();
          }
          const token = mapping[input.getAttribute("name")];
          if (token) {
            url.searchParams.set(token, value);
          }
        });
        window.location.replace(decodeURIComponent(url.toString()));
      }
    });
  });
};

init(() => {
  initSlider();
  initCountDown();
  initQuestions();
  initFaq();
  initChoices();
  initPrefill();
  initPopups();
  initTodayDates(".date-macro");
});
