const foodGrid = document.getElementById("foodGrid");
const vendorGrid = document.getElementById("vendorGrid");
const foodSearch = document.getElementById("foodSearch");
const headerSearch = document.getElementById("headerSearch");
const emptyState = document.getElementById("emptyState");
const modal = document.getElementById("foodModal");
const modalContent = document.getElementById("modalContent");
const toast = document.getElementById("toast");
let activeCategory = "All";
let favorites = [];
try {
  favorites = JSON.parse(
    localStorage.getItem("streetFoodsFavorites") || "[]",
  );
} catch (e) {
  favorites = [];
}
let toastTimer;

function money(value) {
  return "₱" + Number(value).toFixed(2).replace(".00", "");
}
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}
function renderFoods() {
  const query = (foodSearch.value || headerSearch.value || "")
    .trim()
    .toLowerCase();
  const filtered = foods.filter(
    (food) =>
      (activeCategory === "All" || food.category === activeCategory) &&
      [food.name, food.vendor, food.category].some((v) =>
        v.toLowerCase().includes(query),
      ),
  );
  foodGrid.innerHTML = filtered
    .map(
      (food, i) =>
        `<article class="food-card reveal" style="--reveal-delay:${(i % 3) * 90}ms"><div class="food-image"><img src="${food.image}" alt="${food.name}" loading="lazy"><span class="food-category">${food.category}</span><button class="favorite-btn ${favorites.includes(food.id) ? "saved" : ""}" data-favorite="${food.id}" aria-label="Save ${food.name}">${favorites.includes(food.id) ? "♥" : "♡"}</button></div><div class="food-info"><div class="food-info-top"><h3>${food.name}</h3><span class="food-price">${money(food.price)}</span></div><p>${food.description}</p><div class="food-meta"><span>⌖ ${food.vendor}</span><button data-details="${food.id}">View details ↗</button></div></div></article>`,
    )
    .join("");
  emptyState.hidden = filtered.length > 0;
  trackReveals(foodGrid);
}
function renderVendors() {
  vendorGrid.innerHTML = vendors
    .map(
      (v, i) =>
        `<article class="vendor-card reveal" style="--reveal-delay:${(i % 3) * 90}ms"><div class="vendor-avatar"><img src="${v.image}" alt="${v.name}"></div><div><h3>${v.name}</h3><small>${v.type}</small><p>${v.description}</p><small class="vendor-loc"><span>⌖ ${v.location}</span><a href="${directionsQuery(v.name)}" target="_blank" rel="noopener noreferrer">Directions ↗</a></small></div></article>`,
    )
    .join("");
  trackReveals(vendorGrid);
}
function toggleFavorite(id) {
  favorites = favorites.includes(id)
    ? favorites.filter((x) => x !== id)
    : [...favorites, id];
  try {
    localStorage.setItem("streetFoodsFavorites", JSON.stringify(favorites));
  } catch (e) {}
  renderFoods();
  showToast(
    favorites.includes(id) ? "Added to favorites" : "Removed from favorites",
  );
}
foodGrid.addEventListener("click", (e) => {
  const fav = e.target.closest("[data-favorite]");
  const details = e.target.closest("[data-details]");
  if (fav) toggleFavorite(Number(fav.dataset.favorite));
  if (details) openFood(Number(details.dataset.details));
});
function openFood(id) {
  const f = foods.find((x) => x.id === id);
  if (!f) return;
  modalContent.innerHTML = `<img src="${f.image}" alt="${f.name}"><div class="modal-body"><span class="eyebrow">${f.category.toUpperCase()}</span><h3>${f.name}</h3><p>${f.description}</p><p><strong>Price:</strong> ${money(f.price)}<br><strong>Vendor:</strong> ${f.vendor}<br><strong>Area:</strong> Bayawan City</p><p class="modal-dir-wrap"><a class="modal-dir" href="${directionsQuery(f.vendor)}" target="_blank" rel="noopener noreferrer">Get directions on Google Maps ↗</a></p><button class="btn btn-primary" id="modalFavorite">${favorites.includes(id) ? "♥ Saved to favorites" : "♡ Add to favorites"}</button></div>`;
  modal.showModal();
  document.getElementById("modalFavorite").addEventListener("click", () => {
    toggleFavorite(id);
    document.getElementById("modalFavorite").textContent = favorites.includes(
      id,
    )
      ? "♥ Saved to favorites"
      : "♡ Add to favorites";
  });
}
document
  .getElementById("modalClose")
  .addEventListener("click", () => modal.close());
modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.close();
});
document.getElementById("categoryFilters").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-category]");
  if (!btn) return;
  activeCategory = btn.dataset.category;
  document
    .querySelectorAll(".filter-pill")
    .forEach((x) => x.classList.toggle("selected", x === btn));
  renderFoods();
});
foodSearch.addEventListener("input", () => {
  headerSearch.value = foodSearch.value;
  renderFoods();
});
headerSearch.addEventListener("input", () => {
  foodSearch.value = headerSearch.value;
  document.querySelector("#foods").scrollIntoView({ behavior: "smooth" });
  renderFoods();
});
document.querySelectorAll(".gallery-item").forEach((item) =>
  item.addEventListener("click", () => {
    document.getElementById("lightboxImage").src = item.dataset.full;
    document.getElementById("lightbox").showModal();
  }),
);
document
  .getElementById("lightboxClose")
  .addEventListener("click", () => document.getElementById("lightbox").close());
document.getElementById("lightbox").addEventListener("click", (e) => {
  if (e.target.id === "lightbox") e.currentTarget.close();
});
const menuToggle = document.getElementById("menuToggle"),
  navLinks = document.getElementById("navLinks");
menuToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", open);
});
navLinks.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  }),
);
const themeToggle = document.getElementById("themeToggle");
const savedTheme = (() => {
  try {
    return localStorage.getItem("streetFoodsTheme");
  } catch (e) {
    return null;
  }
})();
if (savedTheme === "light") {
  document.body.classList.add("light");
  themeToggle.textContent = "☾";
}
themeToggle.addEventListener("click", () => {
  const light = document.body.classList.toggle("light");
  themeToggle.textContent = light ? "☾" : "☼";
  try {
    localStorage.setItem("streetFoodsTheme", light ? "light" : "dark");
  } catch (e) {}
  showToast(light ? "Light theme enabled" : "Dark theme enabled");
});
const backTop = document.getElementById("backTop"),
  siteHeader = document.querySelector(".site-header");
const onScroll = () => {
  backTop.classList.toggle("visible", window.scrollY > 500);
  siteHeader.classList.toggle("scrolled", window.scrollY > 14);
};
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();
backTop.addEventListener("click", () =>
  window.scrollTo({ top: 0, behavior: "smooth" }),
);
document.getElementById("year").textContent = new Date().getFullYear();

/* ----- Google Maps directions helper ----- */
function directionsQuery(name) {
  return (
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(name + " Bayawan City, Negros Oriental")
  );
}

/* ----- Scroll-reveal animations ----- */
const revealObserver =
  "IntersectionObserver" in window
    ? new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("revealed");
              revealObserver.unobserve(entry.target);
              if (
                entry.target.contains(document.getElementById("cityMap")) &&
                window.cityMap
              )
                setTimeout(() => window.cityMap.invalidateSize(), 240);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -36px 0px" },
      )
    : null;
function trackReveals(scope) {
  const items = scope.querySelectorAll(".reveal:not(.revealed)");
  if (!revealObserver) {
    items.forEach((el) => el.classList.add("revealed"));
    return;
  }
  items.forEach((el) => revealObserver.observe(el));
}

/* ----- Active nav link while scrolling ----- */
const spyObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        document
          .querySelectorAll(".nav-links a")
          .forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + id));
      }
    });
  },
  { rootMargin: "-40% 0px -55% 0px" },
);
document.querySelectorAll("main section[id]").forEach((sec) => spyObserver.observe(sec));

/* ----- Map: Google Maps embed ----- */
function initMap() {
  const el = document.getElementById("cityMap");
  if (!el) return;

  // Google Maps embed centred on Bayawan City, Negros Oriental
  el.innerHTML = `
    <iframe
      class="map-embed"
      title="Street-food hubs in Bayawan City"
      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31537.08!2d122.79!3d9.37!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33aa30c88f0c3e77%3A0x1234567890abcdef!2sBayawan%20City%2C%20Negros%20Oriental!5e0!3m2!1sen!2sph!4v1700000000000!5m2!1sen!2sph"
      width="100%"
      height="100%"
      style="border:0; display:block; min-height:430px;"
      allowfullscreen=""
      loading="lazy"
      referrerpolicy="no-referrer-when-downgrade"
    ></iframe>
  `;

  window.cityMap = { invalidateSize() {} };
}

renderFoods();
renderVendors();
trackReveals(document);
initMap();
window.addEventListener("load", () => {
  if (window.cityMap) setTimeout(() => window.cityMap.invalidateSize(), 300);
});
