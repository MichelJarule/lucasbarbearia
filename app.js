const STORAGE_KEY = "lucasBarbeariaAppointments";
const STOCK_KEY = "lucasBarbeariaStock";
const SALES_KEY = "lucasBarbeariaSales";
const SERVICES_KEY = "lucasBarbeariaServices";
const PAGE_CONFIG_KEY = "lucasBarbeariaPageConfig";
const MENU_ORDER_KEY = "lucasBarbeariaMenuOrder";
const AGENDA_LAYOUT_KEY = "lucasBarbeariaAgendaLayout";
const CALENDAR_LAYOUT_KEY = "lucasBarbeariaCalendarLayout";
const STOCK_LAYOUT_KEY = "lucasBarbeariaStockLayout";
const FIREBASE_COLLECTION = "lucasBarbeariaApp";
const CLOUD_DATA_KEYS = [STORAGE_KEY, STOCK_KEY, SALES_KEY, SERVICES_KEY, PAGE_CONFIG_KEY];
const APPOINTMENT_RESET_KEY = "lucasBarbeariaAppointmentResetVersion";
const APPOINTMENT_RESET_VERSION = "2026-05-01-clear-client-history";
const SALES_RESET_KEY = "lucasBarbeariaSalesResetVersion";
const SALES_RESET_VERSION = "2026-05-01-clear-sales-history";

const defaultServices = [
  { id: "corte", name: "Corte", description: "Corte de cabelo com estilo e precisão.", price: 40, duration: 40, image: "photo-1585747860715-2ba37e788b70(1)", featured: true },
  { id: "zero", name: "Corte na Zero", description: "Corte completo utilizando máquina zero.", price: 25, duration: 20, image: "photo-1532710093739-9470acff878f", featured: false },
  { id: "sobrancelha", name: "Sobrancelha", description: "Design e limpeza de sobrancelha na navalha.", price: 10, duration: 10, image: "photo-1516975080664-ed2fc6a32937", featured: false },
  { id: "corte-sobrancelha", name: "Corte + Sobrancelha", description: "Combo completo para cabelo e acabamento.", price: 45, duration: 50, image: "photo-1503951914875-452162b0f3f1", featured: true },
  { id: "barba", name: "Barba", description: "Modelagem com navalha e toalha quente.", price: 30, duration: 30, image: "photo-1560066984-138dadb4c035", featured: true },
  { id: "corte-barba", name: "Corte + Barba", description: "Visual completo com corte e barba alinhada.", price: 60, duration: 70, image: "photo-1585747860715-2ba37e788b70", featured: false },
  { id: "pigmentacao-cabelo", name: "Pigmentação + Cabelo", description: "Cobertura de falhas e realce da cor.", price: 20, duration: 40, image: "photo-1585747860715-2ba37e788b70(1)", featured: false },
  { id: "luzes", name: "Luzes", description: "Mechas para iluminar o visual.", price: 40, duration: 90, image: "photo-1562322140-8baeececf3df", featured: true }
];

const defaultPageConfig = {
  brandName: "Lucasbarbearia",
  logo: "logo-lucas-barbearia.jpeg",
  menuSobre: "Sobre Nós",
  menuServicos: "Serviços",
  menuProdutos: "Produtos",
  menuGaleria: "Galeria",
  menuDepoimentos: "Depoimentos",
  heroEyebrow: "Bem-vindo ao seu momento",
  heroTitle: "Uma experiência única em cuidado masculino",
  heroText: "Descubra o cuidado que você merece em um ambiente pensado para estilo, tranquilidade e renovação.",
  aboutEyebrow: "Sobre nós",
  aboutTitle: "Tradição, técnica e atenção em cada detalhe.",
  aboutText: "A Lucasbarbearia nasceu para ser mais que um lugar de corte. Aqui o atendimento é direto, o ambiente é acolhedor e cada serviço é feito com calma, precisão e respeito ao estilo de cada cliente.",
  aboutPointOneTitle: "Produtos de qualidade",
  aboutPointOneText: "Selecionados para acabamento e durabilidade.",
  aboutPointTwoTitle: "Tempo para você",
  aboutPointTwoText: "Atendimento com horário marcado e sem pressa.",
  aboutImageOne: "photo-1503951914875-452162b0f3f1",
  aboutImageTwo: "photo-1516975080664-ed2fc6a32937",
  servicesEyebrow: "Nossos serviços",
  servicesTitle: "Cuidados essenciais para realçar seu estilo",
  testimonialsEyebrow: "Depoimentos",
  testimonialsTitle: "O que nossos clientes dizem",
  testimonials: [
    { name: "Ricardo Mendes", text: "Atendimento pontual, corte muito bem feito e um ambiente tranquilo. Virei cliente." },
    { name: "André Oliveira", text: "O Lucas entende exatamente o estilo que a gente procura. Barba e cabelo ficaram impecáveis." },
    { name: "Marcos Vinícius", text: "Sempre sou bem atendido. O cuidado nos detalhes faz toda diferença no resultado." }
  ],
  ctaTitle: "Pronto para renovar seu visual?",
  ctaText: "Agende o seu horário e deixe-nos cuidar de você com a atenção que sua imagem merece.",
  footerDescription: "A sua experiência de cuidado, estilo e bem-estar em Guarulhos.",
  footerAddress: "Rua Hilários Pires de Freitas, 186\nJardim Fortaleza, Guarulhos - SP",
  footerPhone: "(11) 96719-8368",
  footerEmail: "lucas.barbearia.a.o@gmail.com",
  instagram: "https://www.instagram.com/lucas.barbearia.a.o/",
  facebook: "",
  tiktok: "",
  youtube: ""
};

let services = loadServices();
let pageConfig = loadPageConfig();
let cloudWritesEnabled = false;
let currentUser = null;
let pendingProtectedView = null;

const elements = {};
let currentCalendarDate = new Date();
let selectedCalendarDate = toDateInputValue(new Date());

document.addEventListener("DOMContentLoaded", () => {
  cacheElements();
  seedStock();
  applyAppointmentHistoryReset();
  applySalesHistoryReset();
  normalizeExistingAppointments();
  bindEvents();
  renderAll();
  startHeaderDateClock();
  updateShellMode(getActiveViewName());
  syncCloudData();
});

function cacheElements() {
  elements.sidebar = document.querySelector("#sidebar");
  elements.sideNav = document.querySelector(".side-nav");
  elements.agendaLayout = document.querySelector("#view-agenda .agenda-layout");
  elements.agendaResizer = document.querySelector("#view-agenda .panel-resizer");
  elements.calendarLayout = document.querySelector("#view-calendario .calendar-layout");
  elements.calendarResizer = document.querySelector("#view-calendario .panel-resizer");
  elements.stockLayout = document.querySelector("#view-estoque .stock-layout");
  elements.stockResizer = document.querySelector("#view-estoque .panel-resizer");
  elements.sidebarBackdrop = document.querySelector("#sidebar-backdrop");
  elements.viewTitle = document.querySelector("#view-title");
  elements.datePill = document.querySelector(".date-pill");
  elements.topPublicLinks = document.querySelector(".top-public-links");
  elements.bookingDialog = document.querySelector("#booking-dialog");
  elements.publicBookingForm = document.querySelector("#public-booking-form");
  elements.publicServiceSelect = elements.publicBookingForm.elements.service;
  elements.publicDateInput = elements.publicBookingForm.elements.date;
  elements.publicTimeSelect = elements.publicBookingForm.elements.time;
  elements.publicBookingSummary = document.querySelector("#public-booking-summary");
  elements.cancelBookingDialog = document.querySelector("#cancel-booking-dialog");
  elements.publicCancelForm = document.querySelector("#public-cancel-form");
  elements.publicCancelResults = document.querySelector("#public-cancel-results");
  elements.loginDialog = document.querySelector("#login-dialog");
  elements.loginForm = document.querySelector("#login-form");
  elements.loginOpen = document.querySelector("#login-open");
  elements.logoutButton = document.querySelector("#logout-button");
  elements.sidebarUserCard = document.querySelector("#sidebar-user-card");
  elements.sidebarUserName = document.querySelector("#sidebar-user-name");
  elements.sidebarUserEmail = document.querySelector("#sidebar-user-email");
  elements.productReserveDialog = document.querySelector("#product-reserve-dialog");
  elements.productReserveForm = document.querySelector("#reserve-product-form");
  elements.reserveProductTitle = document.querySelector("#reserve-product-title");
  elements.reserveProductSummary = document.querySelector("#reserve-product-summary");
  elements.bookingForm = document.querySelector("#booking-form");
  elements.serviceSelect = elements.bookingForm.elements.service;
  elements.dateInput = elements.bookingForm.elements.date;
  elements.timeSelect = elements.bookingForm.elements.time;
  elements.summary = document.querySelector("#booking-summary");
  elements.servicesGrid = document.querySelector("#services-grid");
  elements.publicServicesGrid = document.querySelector("#public-services-grid");
  elements.serviceForm = document.querySelector("#service-form");
  elements.serviceReset = document.querySelector("#service-reset");
  elements.appointmentsList = document.querySelector("#appointments-list");
  elements.calendarTitle = document.querySelector("#calendar-title");
  elements.calendarGrid = document.querySelector("#calendar-grid");
  elements.calendarAppointments = document.querySelector("#calendar-appointments");
  elements.cancelCount = document.querySelector("#cancel-count");
  elements.cancelList = document.querySelector("#cancel-list");
  elements.adminSearch = document.querySelector("#admin-search");
  elements.appointmentStatusFilter = document.querySelector("#appointment-status-filter");
  elements.clientSearch = document.querySelector("#client-search");
  elements.clientsList = document.querySelector("#clients-list");
  elements.dashboardMetrics = document.querySelector("#dashboard-metrics");
  elements.financeMetrics = document.querySelector("#finance-metrics");
  elements.revenueChart = document.querySelector("#revenue-chart");
  elements.timeline = document.querySelector("#timeline");
  elements.serviceDonut = document.querySelector("#service-donut");
  elements.todayTable = document.querySelector("#today-table");
  elements.testimonialGrid = document.querySelector("#testimonial-grid");
  elements.showMoreTestimonials = document.querySelector("#show-more-testimonials");
  elements.stockForm = document.querySelector("#stock-form");
  elements.stockPreview = document.querySelector("#stock-preview");
  elements.stockList = document.querySelector("#stock-list");
  elements.publicProductsGrid = document.querySelector("#public-products-grid");
  elements.saleForm = document.querySelector("#sale-form");
  elements.salePreview = document.querySelector("#sale-preview");
  elements.salesList = document.querySelector("#sales-list");
  elements.financeList = document.querySelector("#finance-list");
  elements.financeBars = document.querySelector("#finance-bars");
  elements.financeChart = document.querySelector("#finance-chart");
  elements.companyConfigForm = document.querySelector("#company-config-form");
  elements.pageConfigForm = document.querySelector("#page-config-form");
  elements.toast = document.querySelector("#toast");
}

function bindEvents() {
  restoreMenuOrder();
  bindMenuReorder();
  bindPanelResizer(elements.agendaLayout, elements.agendaResizer, AGENDA_LAYOUT_KEY, "--agenda-left", 42, 78);
  bindPanelResizer(elements.calendarLayout, elements.calendarResizer, CALENDAR_LAYOUT_KEY, "--calendar-left", 48, 78);
  bindPanelResizer(elements.stockLayout, elements.stockResizer, STOCK_LAYOUT_KEY, "--stock-left", 48, 78);

  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => showView(button.dataset.view));
  });

  bindAuthEvents();

  document.querySelectorAll("[data-view-link]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      showView(link.dataset.viewLink);
    });
  });

  document.querySelectorAll("[data-public-anchor]").forEach((button) => {
    button.addEventListener("click", () => {
      showView("divulgacao");
      const target = document.querySelector(`#${button.dataset.publicAnchor}`);
      if (target) setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
    });
  });

  document.querySelector(".sidebar-toggle")?.addEventListener("click", () => {
    toggleSidebar();
  });

  elements.sidebarBackdrop.addEventListener("click", closeSidebar);

  document.querySelectorAll("[data-open-booking]").forEach((button) => {
    button.addEventListener("click", openPublicBooking);
  });

  document.querySelectorAll("[data-open-cancel]").forEach((button) => {
    button.addEventListener("click", openPublicCancel);
  });

  document.querySelectorAll("[data-open-login]").forEach((button) => {
    button.addEventListener("click", () => {
      if (currentUser) showView("dashboard", { skipAuth: true });
      else {
        pendingProtectedView = "dashboard";
        openLoginDialog();
      }
    });
  });

  document.querySelectorAll("[data-close-dialog]").forEach((button) => {
    button.addEventListener("click", () => button.closest("dialog").close());
  });

  document.querySelectorAll("[data-view-shortcut]").forEach((button) => {
    button.addEventListener("click", () => {
      if (elements.bookingDialog.open) elements.bookingDialog.close();
      showView(button.dataset.viewShortcut);
    });
  });

  document.querySelector("#prev-month").addEventListener("click", () => {
    currentCalendarDate = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() - 1, 1);
    renderCalendar();
  });

  document.querySelector("#next-month").addEventListener("click", () => {
    currentCalendarDate = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 1);
    renderCalendar();
  });

  elements.bookingForm.addEventListener("submit", handleBookingSubmit);
  elements.publicBookingForm.addEventListener("submit", handlePublicBookingSubmit);
  elements.publicCancelForm.addEventListener("submit", handlePublicCancelSearch);
  elements.publicServiceSelect.addEventListener("change", () => { updatePublicTimeOptions(); updatePublicBookingSummary(); });
  elements.publicDateInput.addEventListener("change", () => { updatePublicTimeOptions(); updatePublicBookingSummary(); });
  elements.publicTimeSelect.addEventListener("change", updatePublicBookingSummary);
  elements.serviceSelect.addEventListener("change", () => { updateTimeOptions(); updateBookingSummary(); });
  elements.dateInput.addEventListener("change", () => { updateTimeOptions(); updateBookingSummary(); });
  elements.timeSelect.addEventListener("change", updateBookingSummary);
  elements.serviceForm.addEventListener("submit", handleServiceSubmit);
  elements.serviceForm.addEventListener("reset", () => {
    setTimeout(() => {
      elements.serviceForm.elements.id.value = "";
      elements.serviceForm.querySelector(".panel-title")?.remove();
    }, 0);
  });
  elements.adminSearch.addEventListener("input", renderAppointments);
  elements.appointmentStatusFilter.addEventListener("change", renderAppointments);
  elements.clientSearch.addEventListener("input", renderClients);
  elements.stockForm.addEventListener("input", updateStockPreview);
  elements.stockForm.addEventListener("submit", handleStockSubmit);
  elements.saleForm.addEventListener("input", updateSalePreview);
  elements.saleForm.addEventListener("submit", handleSaleSubmit);
  elements.productReserveForm.addEventListener("submit", handleProductReserveSubmit);
  elements.productReserveForm.addEventListener("input", updateReserveProductSummary);
  elements.showMoreTestimonials.addEventListener("click", showAllTestimonials);
  document.querySelector("#export-json").addEventListener("click", exportJson);
  elements.companyConfigForm.addEventListener("submit", handleCompanyConfigSubmit);
  elements.pageConfigForm.addEventListener("submit", handlePageConfigSubmit);
}

function renderAll() {
  applyPageConfig();
  updateHeaderDate();
  renderServices();
  populateServiceSelect();
  populatePublicServiceSelect();
  setMinimumDate();
  updateTimeOptions();
  updatePublicTimeOptions();
  updateBookingSummary();
  updatePublicBookingSummary();
  renderAppointments();
  renderCalendar();
  renderCancelReport();
  renderClients();
  renderStock();
  renderDashboard();
  renderFinance();
  renderTestimonials();
  populateConfigForms();
}

function startHeaderDateClock() {
  updateHeaderDate();
  setInterval(updateHeaderDate, 60 * 1000);
}

function updateHeaderDate() {
  if (!elements.datePill) return;
  elements.datePill.textContent = formatHeaderDate(new Date());
}

function showView(name, options = {}) {
  if (!options.skipAuth && isProtectedView(name) && !currentUser) {
    pendingProtectedView = name;
    openLoginDialog();
    return;
  }
  document.querySelectorAll(".view").forEach((view) => view.classList.remove("active"));
  document.querySelector(`#view-${name}`).classList.add("active");
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === name));
  elements.viewTitle.textContent = document.querySelector(`#view-${name}`).dataset.title;
  elements.viewTitle.classList.toggle("brand-gradient-text", name === "divulgacao");
  elements.topPublicLinks.classList.toggle("is-hidden", name !== "divulgacao");
  updateShellMode(name);
  closeSidebar();
  renderAll();
}

function updateShellMode(name) {
  document.body.classList.toggle("public-mode", name === "divulgacao");
}

function toggleSidebar() {
  const isOpen = elements.sidebar.classList.toggle("open");
  elements.sidebarBackdrop.classList.toggle("open", isOpen);
}

function closeSidebar() {
  elements.sidebar.classList.remove("open");
  elements.sidebarBackdrop.classList.remove("open");
}

function openPublicBooking() {
  populatePublicServiceSelect();
  setMinimumDate();
  updatePublicTimeOptions();
  updatePublicBookingSummary();
  if (!elements.bookingDialog.open) elements.bookingDialog.showModal();
}

function openPublicCancel() {
  elements.publicCancelForm.reset();
  elements.publicCancelResults.innerHTML = `<div class="summary-box">Digite o telefone usado no agendamento.</div>`;
  if (!elements.cancelBookingDialog.open) elements.cancelBookingDialog.showModal();
}

function bindAuthEvents() {
  elements.loginOpen.addEventListener("click", openLoginDialog);
  elements.loginForm.addEventListener("submit", handleLoginSubmit);
  elements.logoutButton.addEventListener("click", handleLogout);
  const auth = getFirebaseAuth();
  if (!auth) {
    updateAuthUI();
    return;
  }
  auth.onAuthStateChanged((user) => {
    currentUser = user;
    updateAuthUI();
    if (user && pendingProtectedView) {
      const nextView = pendingProtectedView;
      pendingProtectedView = null;
      if (elements.loginDialog.open) elements.loginDialog.close();
      showView(nextView, { skipAuth: true });
    }
    if (!user && isProtectedView(getActiveViewName())) {
      showView("divulgacao", { skipAuth: true });
    }
  });
}

function openLoginDialog() {
  const auth = getFirebaseAuth();
  if (!auth) {
    showToast("Firebase Auth não carregou. Verifique a publicação e a internet.");
    return;
  }
  if (!elements.loginDialog.open) elements.loginDialog.showModal();
}

function handleLoginSubmit(event) {
  event.preventDefault();
  const auth = getFirebaseAuth();
  if (!auth) return showToast("Firebase Auth não disponível.");
  const data = new FormData(elements.loginForm);
  auth.signInWithEmailAndPassword(String(data.get("email")).trim(), String(data.get("password")))
    .then(() => {
      elements.loginForm.reset();
      showToast("Login realizado.");
    })
    .catch((error) => {
      console.warn("Falha no login:", error);
      showToast("E-mail ou senha inválidos.");
    });
}

function handleLogout() {
  const auth = getFirebaseAuth();
  if (!auth) return;
  auth.signOut().then(() => {
    pendingProtectedView = null;
    showToast("Você saiu do app.");
    showView("divulgacao", { skipAuth: true });
  });
}

function updateAuthUI() {
  const isLogged = Boolean(currentUser);
  elements.loginOpen.classList.toggle("is-hidden", isLogged);
  document.querySelectorAll("[data-open-login]").forEach((button) => {
    button.textContent = isLogged ? "Abrir app" : "Entrar no app";
  });
  elements.sidebarUserCard.classList.toggle("is-hidden", !isLogged);
  if (!isLogged) return;
  elements.sidebarUserName.textContent = currentUser.displayName || "Administrador";
  elements.sidebarUserEmail.textContent = currentUser.email || "ADMIN";
}

function getFirebaseAuth() {
  return window.lucasFirebase?.ready ? window.lucasFirebase.auth : null;
}

function isProtectedView(name) {
  return name && name !== "divulgacao";
}

function getActiveViewName() {
  return document.querySelector(".view.active")?.id?.replace("view-", "") || "divulgacao";
}

function bindPanelResizer(layout, resizer, storageKey, cssVariable, minPercent, maxPercent) {
  if (!layout || !resizer) return;
  const saved = localStorage.getItem(storageKey);
  if (saved) layout.style.setProperty(cssVariable, saved);

  let isDragging = false;

  resizer.addEventListener("pointerdown", (event) => {
    isDragging = true;
    resizer.classList.add("is-dragging");
    resizer.setPointerCapture(event.pointerId);
  });

  resizer.addEventListener("pointermove", (event) => {
    if (!isDragging) return;
    const rect = layout.getBoundingClientRect();
    const percent = ((event.clientX - rect.left) / rect.width) * 100;
    const clamped = Math.max(minPercent, Math.min(maxPercent, percent));
    layout.style.setProperty(cssVariable, `${clamped}%`);
  });

  resizer.addEventListener("pointerup", (event) => {
    if (!isDragging) return;
    isDragging = false;
    resizer.classList.remove("is-dragging");
    resizer.releasePointerCapture(event.pointerId);
    localStorage.setItem(storageKey, layout.style.getPropertyValue(cssVariable));
  });
}

function bindMenuReorder() {
  const menuItems = [...elements.sideNav.querySelectorAll(".nav-section .nav-item[data-view]")];
  menuItems.forEach((item) => {
    item.draggable = true;
    item.addEventListener("dragstart", () => {
      item.classList.add("dragging");
      item.closest(".nav-section")?.classList.add("is-reordering");
    });
    item.addEventListener("dragend", () => {
      item.classList.remove("dragging");
      item.closest(".nav-section")?.classList.remove("is-reordering");
      saveMenuOrder();
    });
  });

  elements.sideNav.querySelectorAll(".nav-section").forEach((section) => {
    section.addEventListener("dragover", (event) => {
      event.preventDefault();
      const dragging = section.querySelector(".nav-item.dragging");
      if (!dragging) return;
      const afterElement = getDragAfterElement(section, event.clientY);
      if (afterElement) {
        section.insertBefore(dragging, afterElement);
      } else {
        section.appendChild(dragging);
      }
    });
  });
}

function getDragAfterElement(section, y) {
  const draggableItems = [...section.querySelectorAll(".nav-item[data-view]:not(.dragging)")];
  return draggableItems.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) return { offset, element: child };
    return closest;
  }, { offset: Number.NEGATIVE_INFINITY, element: null }).element;
}

function saveMenuOrder() {
  const order = {};
  elements.sideNav.querySelectorAll(".nav-section").forEach((section) => {
    order[section.dataset.menuGroup] = [...section.querySelectorAll(".nav-item[data-view]")].map((item) => item.dataset.view);
  });
  localStorage.setItem(MENU_ORDER_KEY, JSON.stringify(order));
}

function restoreMenuOrder() {
  const order = loadMenuOrder();
  elements.sideNav.querySelectorAll(".nav-section").forEach((section) => {
    const groupOrder = order[section.dataset.menuGroup] || [];
    if (!groupOrder.length) return;
    const items = new Map([...section.querySelectorAll(".nav-item[data-view]")].map((item) => [item.dataset.view, item]));
    groupOrder.forEach((view) => {
      const item = items.get(view);
      if (item) section.appendChild(item);
    });
    [...items.entries()].forEach(([view, item]) => {
      if (!groupOrder.includes(view)) section.appendChild(item);
    });
  });
}

function legacyMenuOrderToGroups(order) {
  if (!Array.isArray(order)) return order || {};
  const principal = ["divulgacao", "dashboard", "calendario", "agenda"];
  const gestao = ["servicos", "estoque", "financeiro", "configuracao"];
  return {
    principal: order.filter((item) => principal.includes(item)),
    gestao: order.filter((item) => gestao.includes(item))
  };
}

function renderServices() {
  elements.servicesGrid.innerHTML = services.map((service) => `
    <article class="service-card ${service.featured ? "featured-service" : ""}">
      <button class="service-star ${service.featured ? "active" : ""}" type="button" data-feature-service="${service.id}" title="Marcar como principal">★</button>
      <img src="${service.image}" alt="">
      <div class="service-body">
        <h3>${escapeHtml(service.name)}</h3>
        <p>${escapeHtml(service.description)}</p>
        <span class="price">${formatCurrency(service.price)}</span>
        <p>${service.duration} min</p>
        <div class="service-actions">
          <button class="mini-button" type="button" data-edit-service="${service.id}">Editar</button>
          <button class="mini-button danger" type="button" data-delete-service="${service.id}">Excluir</button>
        </div>
      </div>
    </article>
  `).join("");

  elements.servicesGrid.querySelectorAll("[data-edit-service]").forEach((button) => button.addEventListener("click", () => editService(button.dataset.editService)));
  elements.servicesGrid.querySelectorAll("[data-delete-service]").forEach((button) => button.addEventListener("click", () => deleteService(button.dataset.deleteService)));
  elements.servicesGrid.querySelectorAll("[data-feature-service]").forEach((button) => button.addEventListener("click", () => toggleFeaturedService(button.dataset.featureService)));
  renderPublicServices();
}

function renderPublicServices() {
  const featured = services.filter((service) => service.featured);
  const homepageServices = (featured.length ? featured : services).slice(0, 4);
  elements.publicServicesGrid.innerHTML = homepageServices.map((service) => `
    <article>
      <img src="${service.image}" alt="${escapeHtml(service.name)}">
      <h3>${escapeHtml(service.name)}</h3>
      <p>${escapeHtml(service.description)}</p>
      <strong>${formatCurrency(service.price)}</strong>
    </article>
  `).join("");
}

function populateServiceSelect() {
  elements.serviceSelect.innerHTML = services.map((service) => (
    `<option value="${service.id}">${service.name} - ${formatCurrency(service.price)} (${service.duration} min)</option>`
  )).join("");
}

function populatePublicServiceSelect() {
  elements.publicServiceSelect.innerHTML = services.map((service) => (
    `<option value="${service.id}">${service.name} - ${formatCurrency(service.price)} (${service.duration} min)</option>`
  )).join("");
}

function handleServiceSubmit(event) {
  event.preventDefault();
  const data = new FormData(elements.serviceForm);
  const id = data.get("id") || createId();
  const service = {
    id,
    name: String(data.get("name")).trim(),
    description: String(data.get("description")).trim(),
    price: Number(data.get("price")) || 0,
    duration: Number(data.get("duration")) || 30,
    image: data.get("image") || "photo-1585747860715-2ba37e788b70(1)",
    featured: data.get("featured") === "on"
  };

  const index = services.findIndex((item) => item.id === id);
  if (index >= 0) services[index] = service; else services.push(service);
  saveServices();
  elements.serviceForm.reset();
  elements.serviceForm.elements.id.value = "";
  renderAll();
  showToast("Serviço salvo.");
}

function editService(id) {
  const service = getService(id);
  if (!service) return;
  Object.entries(service).forEach(([key, value]) => {
    if (!elements.serviceForm.elements[key]) return;
    if (key === "featured") elements.serviceForm.elements[key].checked = Boolean(value);
    else elements.serviceForm.elements[key].value = value;
  });
  showToast("Serviço carregado para edição.");
}

function deleteService(id) {
  if (services.length <= 1) return showToast("Mantenha pelo menos um serviço cadastrado.");
  services = services.filter((service) => service.id !== id);
  saveServices();
  if (elements.serviceForm.elements.id.value === id) elements.serviceForm.reset();
  renderAll();
  showToast("Serviço excluído.");
}

function toggleFeaturedService(id) {
  const service = getService(id);
  if (!service) return;
  service.featured = !service.featured;
  saveServices();
  renderAll();
}

async function handleCompanyConfigSubmit(event) {
  event.preventDefault();
  const data = new FormData(elements.companyConfigForm);
  updateConfigFromForm(data, [
    "brandName", "menuSobre", "menuServicos", "menuProdutos", "menuGaleria", "menuDepoimentos",
    "footerDescription", "footerAddress", "footerPhone", "footerEmail", "instagram", "facebook", "tiktok", "youtube"
  ]);
  const logoFile = data.get("logoFile");
  if (logoFile && logoFile.size) pageConfig.logo = await fileToDataUrl(logoFile);
  savePageConfig();
  applyPageConfig();
  populateConfigForms();
  showToast("Dados da empresa salvos.");
}

async function handlePageConfigSubmit(event) {
  event.preventDefault();
  const data = new FormData(elements.pageConfigForm);
  updateConfigFromForm(data, [
    "heroEyebrow", "heroTitle", "heroText", "aboutEyebrow", "aboutTitle", "aboutText",
    "aboutPointOneTitle", "aboutPointOneText", "aboutPointTwoTitle", "aboutPointTwoText",
    "servicesEyebrow", "servicesTitle", "testimonialsEyebrow", "testimonialsTitle", "ctaTitle", "ctaText"
  ]);
  pageConfig.testimonials = [
    { name: data.get("testimonialOneName") || "", text: data.get("testimonialOneText") || "" },
    { name: data.get("testimonialTwoName") || "", text: data.get("testimonialTwoText") || "" },
    { name: data.get("testimonialThreeName") || "", text: data.get("testimonialThreeText") || "" }
  ].filter((item) => item.name || item.text);
  const aboutImageOneFile = data.get("aboutImageOneFile");
  const aboutImageTwoFile = data.get("aboutImageTwoFile");
  if (aboutImageOneFile && aboutImageOneFile.size) pageConfig.aboutImageOne = await fileToDataUrl(aboutImageOneFile);
  if (aboutImageTwoFile && aboutImageTwoFile.size) pageConfig.aboutImageTwo = await fileToDataUrl(aboutImageTwoFile);
  savePageConfig();
  applyPageConfig();
  renderTestimonials();
  populateConfigForms();
  showToast("Informações da página salvas.");
}

function updateConfigFromForm(data, keys) {
  keys.forEach((key) => {
    pageConfig[key] = String(data.get(key) || "").trim();
  });
}

function applyPageConfig() {
  document.title = `${pageConfig.brandName} | Gestão`;
  document.querySelectorAll(".brand-logo").forEach((image) => { image.src = pageConfig.logo; });
  const brandText = document.querySelector(".brand > span:last-child");
  if (brandText) brandText.innerHTML = brandNameHtml(pageConfig.brandName);
  document.querySelector("#view-divulgacao").dataset.title = pageConfig.brandName;
  const activeView = document.querySelector(".view.active");
  if (activeView) document.querySelector("#view-title").textContent = activeView.dataset.title;

  setText(".top-public-links [data-public-anchor='sobre-nos']", pageConfig.menuSobre);
  setText(".top-public-links [data-public-anchor='servicos-inicial']", pageConfig.menuServicos);
  setText(".top-public-links [data-public-anchor='produtos-inicial']", pageConfig.menuProdutos);
  setText(".top-public-links [data-public-anchor='galeria-inicial']", pageConfig.menuGaleria);
  setText(".top-public-links [data-public-anchor='depoimentos-inicial']", pageConfig.menuDepoimentos);

  setText(".public-hero-content .eyebrow", pageConfig.heroEyebrow);
  setText(".public-hero-content h2", pageConfig.heroTitle);
  setText(".public-hero-content p:not(.eyebrow)", pageConfig.heroText);
  setText(".about-copy .eyebrow", pageConfig.aboutEyebrow);
  setText(".about-copy h2", pageConfig.aboutTitle);
  setText(".about-copy > p:not(.eyebrow)", pageConfig.aboutText);
  setText(".about-points article:nth-child(1) strong", pageConfig.aboutPointOneTitle);
  setText(".about-points article:nth-child(1) span", pageConfig.aboutPointOneText);
  setText(".about-points article:nth-child(2) strong", pageConfig.aboutPointTwoTitle);
  setText(".about-points article:nth-child(2) span", pageConfig.aboutPointTwoText);
  setImage(".about-media > img:first-child", pageConfig.aboutImageOne);
  setImage(".about-media .floating-photo", pageConfig.aboutImageTwo);
  setText("#servicos-inicial .eyebrow", pageConfig.servicesEyebrow);
  setText("#servicos-inicial h2", pageConfig.servicesTitle);
  setText("#depoimentos-inicial .eyebrow", pageConfig.testimonialsEyebrow);
  setText("#depoimentos-inicial h2", pageConfig.testimonialsTitle);
  setText(".public-cta h2", pageConfig.ctaTitle);
  setText(".public-cta p", pageConfig.ctaText);
  renderFooterConfig();
}

function renderFooterConfig() {
  const footer = document.querySelector(".public-footer");
  if (!footer) return;
  const socialLinks = [
    ["Instagram", pageConfig.instagram],
    ["Facebook", pageConfig.facebook],
    ["TikTok", pageConfig.tiktok],
    ["YouTube", pageConfig.youtube]
  ].filter(([, url]) => url);
  footer.innerHTML = `
    <div class="footer-brand-block">
      <img class="brand-logo footer-logo" src="${escapeHtml(pageConfig.logo)}" alt="${escapeHtml(pageConfig.brandName)}">
      <div>
        <h3>${escapeHtml(pageConfig.brandName)}</h3>
        <p>${escapeHtml(pageConfig.footerDescription)}</p>
        <div class="social-links">${socialLinks.map(([label, url]) => `<a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${label}</a>`).join("")}</div>
      </div>
    </div>
    <div>
      <h3>Links rápidos</h3>
      <button type="button" data-view-shortcut="divulgacao">Início</button>
      <button type="button" data-view-shortcut="servicos">Serviços</button>
      <button type="button" data-open-booking>Agendar</button>
      <button type="button" data-view-shortcut="dashboard">Área restrita</button>
    </div>
    <div>
      <h3>Serviços</h3>
      ${services.slice(0, 4).map((service) => `<p>${escapeHtml(service.name)}</p>`).join("")}
    </div>
    <div>
      <h3>Contato</h3>
      <p>${escapeHtml(pageConfig.footerAddress).replace(/\n/g, "<br>")}</p>
      <p>${escapeHtml(pageConfig.footerPhone)}</p>
      <p>${escapeHtml(pageConfig.footerEmail)}</p>
    </div>`;
  footer.querySelectorAll("[data-view-shortcut]").forEach((button) => {
    button.addEventListener("click", () => showView(button.dataset.viewShortcut));
  });
  footer.querySelectorAll("[data-open-booking]").forEach((button) => {
    button.addEventListener("click", openPublicBooking);
  });
}

function populateConfigForms() {
  fillForm(elements.companyConfigForm, pageConfig);
  fillForm(elements.pageConfigForm, pageConfig);
  const testimonials = pageConfig.testimonials.length ? pageConfig.testimonials : defaultPageConfig.testimonials;
  elements.pageConfigForm.elements.testimonialOneName.value = testimonials[0]?.name || "";
  elements.pageConfigForm.elements.testimonialOneText.value = testimonials[0]?.text || "";
  elements.pageConfigForm.elements.testimonialTwoName.value = testimonials[1]?.name || "";
  elements.pageConfigForm.elements.testimonialTwoText.value = testimonials[1]?.text || "";
  elements.pageConfigForm.elements.testimonialThreeName.value = testimonials[2]?.name || "";
  elements.pageConfigForm.elements.testimonialThreeText.value = testimonials[2]?.text || "";
}

function fillForm(form, values) {
  Object.entries(values).forEach(([key, value]) => {
    if (!form.elements[key] || form.elements[key].type === "file") return;
    form.elements[key].value = Array.isArray(value) ? "" : value;
  });
}

function brandNameHtml(name) {
  const words = String(name || "Lucasbarbearia").trim().split(/\s+/);
  if (words.length < 2) return escapeHtml(words[0] || "Lucasbarbearia");
  const strong = words.pop();
  return `${escapeHtml(words.join(" "))} <strong>${escapeHtml(strong)}</strong>`;
}

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.textContent = value || "";
}

function setImage(selector, src) {
  const image = document.querySelector(selector);
  if (image && src) image.src = src;
}

function setMinimumDate() {
  const today = new Date();
  elements.dateInput.min = toDateInputValue(today);
  if (!elements.dateInput.value) elements.dateInput.value = toDateInputValue(today);
  elements.publicDateInput.min = toDateInputValue(today);
  if (!elements.publicDateInput.value) elements.publicDateInput.value = toDateInputValue(today);
}

function handleBookingSubmit(event) {
  event.preventDefault();
  const formData = new FormData(elements.bookingForm);
  const appointment = createAppointmentFromForm(formData);
  if (!appointment) return;
  elements.bookingForm.reset();
  setMinimumDate();
  updateTimeOptions();
  updateBookingSummary();
  showToast(`Agendamento confirmado. Código: ${appointment.id}`);
}

function handlePublicBookingSubmit(event) {
  event.preventDefault();
  const formData = new FormData(elements.publicBookingForm);
  const appointment = createAppointmentFromForm(formData);
  if (!appointment) return;
  elements.publicBookingForm.reset();
  setMinimumDate();
  updatePublicTimeOptions();
  updatePublicBookingSummary();
  if (elements.bookingDialog.open) elements.bookingDialog.close();
  showToast(`Agendamento confirmado. Código: ${appointment.id}`);
}

function handlePublicCancelSearch(event) {
  event.preventDefault();
  const phone = normalizePhone(new FormData(elements.publicCancelForm).get("phone"));
  renderPublicCancelResults(phone);
}

function renderPublicCancelResults(phone) {
  if (phone.length < 10) {
    elements.publicCancelResults.innerHTML = `<div class="summary-box">Informe um telefone válido.</div>`;
    return;
  }

  const matches = loadAppointments()
    .filter((appointment) => appointment.status === "active" && normalizePhone(appointment.phone) === phone)
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

  elements.publicCancelResults.innerHTML = matches.length ? matches.map((appointment) => `
    <article class="list-item cancel-result-item">
      <div>
        <h3>${escapeHtml(appointment.serviceName)}</h3>
        <p>${formatDate(appointment.date)} às ${appointment.time}</p>
        <p>${escapeHtml(appointment.name)} - ${formatPhone(appointment.phone)}</p>
      </div>
      <button class="mini-button danger" type="button" data-public-cancel="${appointment.id}">Cancelar</button>
    </article>
  `).join("") : `<div class="summary-box">Nenhum agendamento ativo encontrado para esse telefone.</div>`;

  elements.publicCancelResults.querySelectorAll("[data-public-cancel]").forEach((button) => {
    button.addEventListener("click", () => cancelPublicAppointment(button.dataset.publicCancel, phone));
  });
}

function cancelPublicAppointment(id, phone) {
  const appointments = loadAppointments();
  const appointment = appointments.find((item) => item.id === id && item.status === "active" && normalizePhone(item.phone) === phone);
  if (!appointment) return showToast("Agendamento não encontrado para esse telefone.");
  appointment.status = "cancelled";
  appointment.cancelledAt = new Date().toISOString();
  saveAppointments(appointments);
  renderAll();
  renderPublicCancelResults(phone);
  showToast("Agendamento cancelado.");
}

function createAppointmentFromForm(formData) {
  const service = getService(formData.get("service"));
  if (!service) {
    showToast("Selecione um serviço válido.");
    return null;
  }
  const appointment = {
    id: createCode(),
    name: String(formData.get("name")).trim(),
    phone: normalizePhone(formData.get("phone")),
    serviceId: service.id,
    serviceName: service.name,
    price: service.price,
    duration: service.duration,
    date: formData.get("date"),
    time: formData.get("time"),
    notes: String(formData.get("notes") || "").trim(),
    status: "active",
    createdAt: new Date().toISOString()
  };

  if (!appointment.name || !appointment.phone || !appointment.date || !appointment.time) {
    showToast("Preencha nome, telefone, data e horário.");
    return null;
  }
  if (!isWorkingDate(appointment.date)) {
    showToast("Segunda-feira não tem atendimento.");
    return null;
  }
  if (isSlotTaken(appointment.date, appointment.time)) {
    updateTimeOptions();
    updatePublicTimeOptions();
    showToast("Esse horário já está ocupado.");
    return null;
  }

  const appointments = loadAppointments();
  appointments.push(appointment);
  saveAppointments(appointments);
  renderAll();
  return appointment;
}

function updateTimeOptions() {
  const times = getAvailableTimes(elements.dateInput.value);
  elements.timeSelect.innerHTML = times.length ? times.map((time) => `<option value="${time}">${time}</option>`).join("") : `<option value="">Sem horários</option>`;
  elements.timeSelect.disabled = !times.length;
}

function updatePublicTimeOptions() {
  const times = getAvailableTimes(elements.publicDateInput.value);
  elements.publicTimeSelect.innerHTML = times.length ? times.map((time) => `<option value="${time}">${time}</option>`).join("") : `<option value="">Sem horários</option>`;
  elements.publicTimeSelect.disabled = !times.length;
}

function updateBookingSummary() {
  const service = getService(elements.serviceSelect.value) || services[0];
  const date = elements.dateInput.value;
  const time = elements.timeSelect.value;
  if (!date || !time) {
    elements.summary.textContent = "Selecione serviço, data e horário.";
    return;
  }
  elements.summary.innerHTML = `<strong>${service.name}</strong><br>${formatDate(date)} às ${time}<br>${service.duration} min - ${formatCurrency(service.price)}`;
}

function updatePublicBookingSummary() {
  const service = getService(elements.publicServiceSelect.value) || services[0];
  const date = elements.publicDateInput.value;
  const time = elements.publicTimeSelect.value;
  if (!service || !date || !time) {
    elements.publicBookingSummary.textContent = "Selecione serviço, data e horário.";
    return;
  }
  elements.publicBookingSummary.innerHTML = `<strong>${service.name}</strong><br>${formatDate(date)} às ${time}<br>${service.duration} min - ${formatCurrency(service.price)}`;
}

function renderAppointments() {
  const query = normalizeLookup(elements.adminSearch.value || "");
  const statusFilter = elements.appointmentStatusFilter.value || "all";
  const appointments = loadAppointments()
    .filter((appointment) => normalizeLookup(`${appointment.id} ${appointment.name} ${appointment.phone} ${appointment.serviceName}`).includes(query))
    .filter((appointment) => statusFilter === "all" || appointment.status === statusFilter)
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

  elements.appointmentsList.innerHTML = appointments.length ? appointments.map(renderAppointmentCard).join("") : `<div class="summary-box">Nenhum agendamento encontrado.</div>`;
  bindAppointmentButtons(elements.appointmentsList);
}

function renderAppointmentCard(appointment) {
  const canUpdateStatus = appointment.status === "active";
  return `
    <article class="appointment-item">
      <div class="appointment-top">
        <div>
          <h3>${escapeHtml(appointment.name)}</h3>
          <p>${escapeHtml(appointment.serviceName)} - ${formatCurrency(appointment.price)} - ${appointment.duration} min</p>
          <p>${formatDate(appointment.date)} às ${appointment.time}</p>
          <p>${formatPhone(appointment.phone)}${appointment.notes ? ` - ${escapeHtml(appointment.notes)}` : ""}</p>
          <p>Código: <strong>${appointment.id}</strong></p>
        </div>
        ${statusPill(appointment.status)}
      </div>
      ${canUpdateStatus ? `<div class="appointment-actions">
        <button class="mini-button ok" type="button" data-complete="${appointment.id}">Realizado</button>
        <button class="mini-button" type="button" data-noshow="${appointment.id}">Ñ realizado</button>
        <button class="mini-button danger" type="button" data-cancel="${appointment.id}">Cancelar</button>
      </div>` : ""}
    </article>
  `;
}

function bindAppointmentButtons(container) {
  container.querySelectorAll("[data-complete]").forEach((button) => button.addEventListener("click", () => updateAppointmentStatus(button.dataset.complete, "completed")));
  container.querySelectorAll("[data-noshow]").forEach((button) => button.addEventListener("click", () => updateAppointmentStatus(button.dataset.noshow, "no-show")));
  container.querySelectorAll("[data-cancel]").forEach((button) => button.addEventListener("click", () => updateAppointmentStatus(button.dataset.cancel, "cancelled")));
}

function updateAppointmentStatus(id, status) {
  const appointments = loadAppointments();
  const appointment = appointments.find((item) => item.id === id);
  if (!appointment) return;
  appointment.status = status;
  if (status === "cancelled") appointment.cancelledAt = new Date().toISOString();
  if (status === "completed") appointment.completedAt = new Date().toISOString();
  if (status === "no-show") appointment.noShowAt = new Date().toISOString();
  saveAppointments(appointments);
  renderAll();
  showToast("Status atualizado.");
}

function renderCalendar() {
  const appointments = loadAppointments().filter((item) => item.status !== "cancelled");
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayValue = toDateInputValue(new Date());

  elements.calendarTitle.textContent = firstDay.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const cells = [];
  for (let i = 0; i < firstDay.getDay(); i += 1) cells.push(`<div class="calendar-day empty"></div>`);

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateValue = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayAppointments = appointments.filter((item) => item.date === dateValue).sort((a, b) => a.time.localeCompare(b.time));
    cells.push(`
      <article class="calendar-day ${dateValue === todayValue ? "today" : ""} ${dateValue === selectedCalendarDate ? "selected" : ""}" data-calendar-date="${dateValue}">
        <div class="calendar-number"><span>${day}</span>${dayAppointments.length ? `<span class="calendar-count">${dayAppointments.length}</span>` : ""}</div>
        <div class="calendar-slots">
          ${dayAppointments.slice(0, 3).map((item) => `<div class="calendar-slot">${item.time} - ${escapeHtml(item.name)}<span>${escapeHtml(item.serviceName)}</span></div>`).join("")}
          ${dayAppointments.length > 3 ? `<div class="calendar-more">+${dayAppointments.length - 3} horário(s)</div>` : ""}
        </div>
      </article>
    `);
  }
  elements.calendarGrid.innerHTML = cells.join("");
  elements.calendarGrid.querySelectorAll("[data-calendar-date]").forEach((day) => {
    day.addEventListener("click", () => {
      selectedCalendarDate = day.dataset.calendarDate;
      renderCalendar();
    });
  });

  const selectedAppointments = appointments.filter((item) => item.date === selectedCalendarDate);
  elements.calendarAppointments.innerHTML = selectedAppointments.length ? selectedAppointments
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
    .map(renderAppointmentCard).join("") : `<div class="summary-box">Nenhum serviço agendado para ${formatDate(selectedCalendarDate)}.</div>`;
  bindAppointmentButtons(elements.calendarAppointments);
}

function renderCancelReport() {
  const appointments = loadAppointments();
  const cancelled = appointments.filter((item) => item.status === "cancelled").sort((a, b) => (b.cancelledAt || "").localeCompare(a.cancelledAt || ""));
  elements.cancelCount.textContent = String(cancelled.length);
  elements.cancelList.innerHTML = cancelled.length ? cancelled.map((item) => {
    const rebooked = hasRebookingByPhone(item, appointments);
    return `<article class="cancel-item">
      <p><strong>${escapeHtml(item.name)}</strong> - ${formatPhone(item.phone)}</p>
      <p>${formatDate(item.date)} às ${item.time}</p>
      <p>${escapeHtml(item.serviceName)} - Código ${item.id}</p>
      <span class="rebooked ${rebooked ? "" : "no"}">${rebooked ? "Novo agendamento encontrado pelo telefone" : "Sem novo agendamento pelo telefone"}</span>
    </article>`;
  }).join("") : `<div class="summary-box">Nenhum cancelamento realizado.</div>`;
}

function renderClients() {
  const query = normalizeLookup(elements.clientSearch.value || "");
  const groups = new Map();
  loadAppointments().forEach((item) => {
    const phone = normalizePhone(item.phone);
    if (!groups.has(phone)) groups.set(phone, { name: item.name, phone, total: 0, completed: 0, spent: 0, last: "" });
    const client = groups.get(phone);
    client.name = item.name || client.name;
    client.total += 1;
    if (item.status === "completed") {
      client.completed += 1;
      client.spent += Number(item.price) || 0;
    }
    if (`${item.date} ${item.time}` > client.last) client.last = `${item.date} ${item.time}`;
  });
  const clients = [...groups.values()].filter((client) => normalizeLookup(`${client.name} ${client.phone}`).includes(query));
  elements.clientsList.innerHTML = clients.length ? clients.map((client) => `
    <article class="list-item">
      <div class="item-top">
        <div>
          <h3>${escapeHtml(client.name)}</h3>
          <p>${formatPhone(client.phone)}</p>
          <p>${client.total} agendamento(s), ${client.completed} realizado(s)</p>
        </div>
        <span class="price">${formatCurrency(client.spent)}</span>
      </div>
    </article>
  `).join("") : `<div class="summary-box">Nenhum cliente encontrado.</div>`;
}

function renderTestimonials() {
  const testimonials = pageConfig.testimonials.length ? pageConfig.testimonials : defaultPageConfig.testimonials;

  elements.testimonialGrid.innerHTML = testimonials.map((item, index) => `
    <article class="static-testimonial ${index >= 3 ? "testimonial-hidden" : ""}">
      <div aria-label="5 estrelas">★★★★★</div>
      <p>"${escapeHtml(item.text)}"</p>
      <strong>${escapeHtml(item.name)}</strong>
    </article>
  `).join("");

  elements.showMoreTestimonials.classList.toggle("is-hidden", testimonials.length <= 3);
  elements.showMoreTestimonials.textContent = "+ mais";
}

function showAllTestimonials() {
  document.querySelectorAll(".testimonial-hidden").forEach((item) => item.classList.remove("testimonial-hidden"));
  elements.showMoreTestimonials.classList.add("is-hidden");
}

function seedStock() {
  if (loadStock().length) return;
  saveStock([
    { id: createId(), name: "Pomada modeladora", category: "Venda", cost: 18, qty: 12, margin: 80, image: "" },
    { id: createId(), name: "Óleo para barba", category: "Venda", cost: 22, qty: 8, margin: 70, image: "" },
    { id: createId(), name: "Lâmina navalha", category: "Estoque", cost: 1.2, qty: 100, margin: 0, image: "" }
  ]);
}

async function handleStockSubmit(event) {
  event.preventDefault();
  const data = new FormData(elements.stockForm);
  const stock = loadStock();
  const id = data.get("id") || createId();
  const existing = stock.find((entry) => entry.id === id);
  const imageFile = data.get("imageFile");
  const item = {
    id,
    name: String(data.get("name")).trim(),
    category: data.get("category"),
    cost: Number(data.get("cost")) || 0,
    qty: Number(data.get("qty")) || 0,
    margin: Number(data.get("margin")) || 0,
    image: existing?.image || ""
  };
  if (imageFile && imageFile.size) item.image = await fileToDataUrl(imageFile);
  const index = stock.findIndex((entry) => entry.id === id);
  if (index >= 0) stock[index] = item; else stock.push(item);
  saveStock(stock);
  elements.stockForm.reset();
  renderAll();
  showToast("Item salvo no estoque.");
}

function renderStock() {
  const stock = loadStock().filter((item) => item.category === "Estoque");
  elements.stockList.innerHTML = stock.length ? stock.map(renderProductCard).join("") : `<div class="summary-box">Nenhum item cadastrado em estoque.</div>`;

  elements.stockList.querySelectorAll("[data-edit-stock]").forEach((button) => button.addEventListener("click", () => editStock(button.dataset.editStock)));
  elements.stockList.querySelectorAll("[data-delete-stock]").forEach((button) => button.addEventListener("click", () => deleteStock(button.dataset.deleteStock)));
  populateSaleSelect();
  renderPublicProducts();
  updateStockPreview();
  updateSalePreview();
}

function renderProductCard(item, options = {}) {
  const sellButton = options.showSellButton ? `<button class="mini-button ok" type="button" data-sell-stock="${item.id}">Vender</button>` : "";
  return `
    <article class="product-card">
      <button class="figure-button product-image-button" type="button" data-edit-stock="${item.id}" title="Editar ${escapeHtml(item.name)}">${item.image ? `<img src="${item.image}" alt="">` : "＋"}</button>
      <h3>${escapeHtml(item.name)}</h3>
      <p>${escapeHtml(item.category)} - ${item.qty} un.</p>
      <p>Custo: ${formatCurrency(item.cost)} | Margem: ${item.margin}%</p>
      <span class="price">${formatCurrency(salePrice(item))}</span>
      <div class="product-actions">
        ${sellButton}
        <button class="mini-button" type="button" data-edit-stock="${item.id}">Editar</button>
        <button class="mini-button danger" type="button" data-delete-stock="${item.id}">Remover</button>
      </div>
    </article>
  `;
}

function editStock(id) {
  const item = loadStock().find((entry) => entry.id === id);
  if (!item) return;
  Object.entries(item).forEach(([key, value]) => {
    if (key === "image") return;
    if (elements.stockForm.elements[key]) elements.stockForm.elements[key].value = value;
  });
  showToast("Item carregado para edição.");
}

function deleteStock(id) {
  saveStock(loadStock().filter((item) => item.id !== id));
  renderAll();
}

function updateStockPreview() {
  const data = new FormData(elements.stockForm);
  const cost = Number(data.get("cost")) || 0;
  const margin = Number(data.get("margin")) || 0;
  elements.stockPreview.textContent = `Valor final: ${formatCurrency(cost * (1 + margin / 100))}`;
}

function populateSaleSelect() {
  const stock = loadStock().filter((item) => item.category === "Venda" && item.qty > 0);
  elements.saleForm.elements.item.innerHTML = stock.map((item) => `<option value="${item.id}">${item.name} - ${formatCurrency(salePrice(item))}</option>`).join("");
  renderPdvProducts(stock);
}

function renderPdvProducts(stock) {
  const html = stock.length ? stock.map((item) => renderProductCard(item, { showSellButton: true })).join("") : `<div class="summary-box">Nenhum item cadastrado para venda.</div>`;
  elements.salesList.innerHTML = `<h3 class="stock-subtitle">Lista do PDV</h3><div class="product-grid pdv-product-grid">${html}</div><h3 class="stock-subtitle">Vendas realizadas</h3><div id="sales-history-list"></div>`;
  elements.salesList.querySelectorAll("[data-sell-stock]").forEach((button) => button.addEventListener("click", () => sellStockItem(button.dataset.sellStock, 1)));
  elements.salesList.querySelectorAll("[data-edit-stock]").forEach((button) => button.addEventListener("click", () => editStock(button.dataset.editStock)));
  elements.salesList.querySelectorAll("[data-delete-stock]").forEach((button) => button.addEventListener("click", () => deleteStock(button.dataset.deleteStock)));
  renderSales();
}

function renderPublicProducts() {
  const products = loadStock().filter((item) => item.category === "Venda" && item.qty > 0).slice(0, 4);
  elements.publicProductsGrid.innerHTML = products.length ? products.map((item) => `
    <article class="public-product-card">
      ${item.image ? `<img src="${item.image}" alt="${escapeHtml(item.name)}">` : `<span>＋</span>`}
      <h3>${escapeHtml(item.name)}</h3>
      <p>${item.qty} unidade(s) disponível(is)</p>
      <strong>${formatCurrency(salePrice(item))}</strong>
      <button class="secondary-button wide" type="button" data-reserve-product="${item.id}">Reservar</button>
    </article>
  `).join("") : `<article><span>＋</span><h3>Produtos em breve</h3><p>Cadastre itens como Venda no menu PDV/Estoque.</p><strong>--</strong></article>`;
  elements.publicProductsGrid.querySelectorAll("[data-reserve-product]").forEach((button) => {
    button.addEventListener("click", () => openProductReserve(button.dataset.reserveProduct));
  });
}

function openProductReserve(itemId) {
  const item = loadStock().find((entry) => entry.id === itemId);
  if (!item) return showToast("Produto não encontrado.");
  elements.productReserveForm.reset();
  elements.productReserveForm.elements.item.value = item.id;
  elements.productReserveForm.elements.qty.max = item.qty;
  elements.reserveProductTitle.textContent = item.name;
  updateReserveProductSummary();
  elements.productReserveDialog.showModal();
}

function updateReserveProductSummary() {
  const item = loadStock().find((entry) => entry.id === elements.productReserveForm.elements.item.value);
  const qty = Number(elements.productReserveForm.elements.qty.value) || 1;
  elements.reserveProductSummary.textContent = item ? `Total da reserva: ${formatCurrency(salePrice(item) * qty)} | Disponível: ${item.qty}` : "Selecione um produto.";
}

function handleProductReserveSubmit(event) {
  event.preventDefault();
  const data = new FormData(elements.productReserveForm);
  const item = loadStock().find((entry) => entry.id === data.get("item"));
  if (!item) return showToast("Produto não encontrado.");
  if (elements.productReserveDialog.open) elements.productReserveDialog.close();
  showToast("Reserva recebida. Venda será computada somente ao clicar em Vender no PDV.");
}

function handleSaleSubmit(event) {
  event.preventDefault();
  showToast("Use o botão Vender no card do item para registrar a venda.");
}

function sellStockItem(itemId, qty = 1) {
  const stock = loadStock();
  const item = stock.find((entry) => entry.id === itemId);
  if (!item || item.qty < qty) return showToast("Estoque insuficiente.");
  item.qty -= qty;
  const sale = { id: createId(), itemId: item.id, name: item.name, qty, unitPrice: salePrice(item), total: salePrice(item) * qty, cost: item.cost * qty, date: new Date().toISOString(), source: "PDV", customer: null };
  const sales = loadSales();
  sales.push(sale);
  saveStock(stock);
  saveSales(sales);
  renderAll();
  showToast("Venda registrada no PDV.");
}

function updateSalePreview() {
  const item = loadStock().find((entry) => entry.id === elements.saleForm.elements.item.value);
  const qty = Number(elements.saleForm.elements.qty.value) || 1;
  elements.salePreview.textContent = item ? `Total: ${formatCurrency(salePrice(item) * qty)} | Estoque: ${item.qty}` : "Nenhum produto disponível para venda.";
}

function renderSales() {
  const sales = loadSales().slice().reverse();
  const salesHistory = elements.salesList.querySelector("#sales-history-list");
  if (!salesHistory) return;
  salesHistory.innerHTML = sales.length ? sales.slice(0, 8).map((sale) => `
    <article class="list-item">
      <h3>${escapeHtml(sale.name)}</h3>
      <p>${sale.qty} un. - ${formatCurrency(sale.total)}</p>
      ${sale.source ? `<p>${escapeHtml(sale.source)}${sale.customer?.name ? ` - ${escapeHtml(sale.customer.name)} (${formatPhone(sale.customer.phone)})` : ""}</p>` : ""}
      <p>${new Date(sale.date).toLocaleString("pt-BR")}</p>
    </article>
  `).join("") : `<div class="summary-box">Nenhuma venda registrada.</div>`;
}

function renderDashboard() {
  const appointments = loadAppointments();
  const sales = loadSales();
  const finance = getFinanceTotals();
  const today = toDateInputValue(new Date());
  const todayAppointments = appointments.filter((item) => item.date === today && item.status !== "cancelled");
  const completed = appointments.filter((item) => item.status === "completed");
  elements.dashboardMetrics.innerHTML = metricCards([
    ["Agendamentos hoje", todayAppointments.length, "Total do dia", "▦"],
    ["Receita do mês", formatCurrency(finance.month), "Mês atual", "$"],
    ["Clientes atendidos", uniqueClients(completed), "Total histórico", "◉"],
    ["Serviços realizados", completed.length, "Concluídos", "✂"]
  ]);
  renderRevenueChart();
  renderServiceDonut();
  renderTodayTable(todayAppointments);
}

function renderFinance() {
  const finance = getFinanceTotals();
  elements.financeMetrics.innerHTML = metricCards([
    ["Receita hoje", formatCurrency(finance.today), "", "▥"],
    ["Receita mensal", formatCurrency(finance.month), "", "▦"],
    ["Receita anual", formatCurrency(finance.year), "", "🏆"],
    ["Clientes atendidos", uniqueClients(loadAppointments().filter((item) => item.status === "completed")), "", "◉"]
  ]);
  const serviceRows = loadAppointments().filter((item) => item.status === "completed").map((item) => ({ label: `${item.serviceName} - ${item.name}`, value: item.price, date: item.completedAt || item.createdAt }));
  const saleRows = loadSales().map((item) => ({ label: `PDV - ${item.name}`, value: item.total, date: item.date }));
  elements.financeList.innerHTML = [...serviceRows, ...saleRows].sort((a, b) => (b.date || "").localeCompare(a.date || "")).map((row) => `<article class="list-item"><div class="item-top"><h3>${escapeHtml(row.label)}</h3><span class="price">${formatCurrency(row.value)}</span></div><p>${row.date ? new Date(row.date).toLocaleString("pt-BR") : ""}</p></article>`).join("") || `<div class="summary-box">Nada computado no financeiro.</div>`;
  renderFinanceLineChart();
  renderFinanceBars(finance);
}

function renderRevenueChart() {
  const rows = lastMonths(7).map((month) => ({ label: month.label, value: revenueForMonth(month.key) }));
  const max = Math.max(...rows.map((row) => row.value), 1);
  elements.revenueChart.innerHTML = `<div class="bar-visual">
    ${rows.map((row) => `<div class="chart-bar" style="height:${Math.max(4, (row.value / max) * 100)}%"><span>${formatCurrency(row.value)}</span></div>`).join("")}
  </div><div class="chart-months">${rows.map((row) => `<span>${row.label}</span>`).join("")}</div>`;
}

function renderServiceDonut() {
  const counts = new Map();
  loadAppointments().filter((item) => item.status !== "cancelled").forEach((item) => {
    counts.set(item.serviceName, (counts.get(item.serviceName) || 0) + 1);
  });
  const rows = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const total = rows.reduce((sum, row) => sum + row[1], 0) || 1;
  let current = 0;
  const colors = ["#1f62ff", "#e33232", "#4f8cff", "#ff4b4b", "#8aaeff"];
  const gradient = rows.map((row, index) => {
    const start = current;
    current += (row[1] / total) * 100;
    return `${colors[index]} ${start}% ${current}%`;
  }).join(", ");
  elements.serviceDonut.innerHTML = `
    <div class="donut" style="background: conic-gradient(${gradient || "#2b2b2b 0 100%"});"></div>
    <div class="donut-legend">
      ${rows.length ? rows.map((row, index) => `<span><i style="background:${colors[index]}"></i>${escapeHtml(row[0])}</span>`).join("") : "<span>Sem dados</span>"}
    </div>`;
}

function renderTodayTable(rows) {
  const sorted = rows.slice().sort((a, b) => a.time.localeCompare(b.time));
  elements.todayTable.innerHTML = `
    <div class="admin-table-head"><span>Cliente</span><span>Serviço</span><span>Horário</span><span>Status</span></div>
    ${sorted.length ? sorted.map((item) => `<div class="admin-table-row"><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.serviceName)}</span><b>${item.time}</b>${statusPill(item.status)}</div>`).join("") : `<div class="summary-box">Nenhum agendamento para hoje.</div>`}`;
}

function renderFinanceBars(finance) {
  const total = Math.max(finance.total, 1);
  elements.financeBars.innerHTML = [
    ["Serviços", finance.services],
    ["PDV", finance.sales]
  ].map(([label, value]) => `<div class="bar-row"><div class="bar-top"><span>${label}</span><span>${formatCurrency(value)}</span></div><div class="bar-track"><div class="bar-fill" style="width:${(value / total) * 100}%"></div></div></div>`).join("");
}

function renderFinanceLineChart() {
  const rows = lastMonths(12).map((month) => ({ label: month.label, value: revenueForMonth(month.key) }));
  const max = Math.max(...rows.map((row) => row.value), 1);
  const width = 1000;
  const height = 260;
  const points = rows.map((row, index) => {
    const x = 32 + index * ((width - 64) / Math.max(rows.length - 1, 1));
    const y = height - 24 - (row.value / max) * (height - 52);
    return `${x},${y}`;
  }).join(" ");
  const area = `32,${height - 24} ${points} ${width - 32},${height - 24}`;
  elements.financeChart.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Receita ao longo do tempo">
      <polygon points="${area}" fill="rgba(31, 98, 255, 0.14)"></polygon>
      <polyline points="${points}" fill="none" stroke="#1f62ff" stroke-width="4"></polyline>
      ${rows.map((row, index) => {
        const x = 32 + index * ((width - 64) / Math.max(rows.length - 1, 1));
        const y = height - 24 - (row.value / max) * (height - 52);
        return `<circle cx="${x}" cy="${y}" r="4" fill="#e33232"></circle><text x="${x}" y="${height - 4}" class="chart-label" text-anchor="middle">${row.label}</text>`;
      }).join("")}
    </svg>`;
}

function metricCards(items) {
  return items.map(([label, value, sublabel = "", icon = "•"]) => `<article class="metric-card"><div><span>${label}</span><strong>${value}</strong>${sublabel ? `<small>${sublabel}</small>` : ""}</div><em>${icon}</em></article>`).join("");
}

function getFinanceTotals() {
  const servicesTotal = loadAppointments().filter((item) => item.status === "completed").reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  const sales = loadSales();
  const salesTotal = sales.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  const salesCost = sales.reduce((sum, item) => sum + (Number(item.cost) || 0), 0);
  const today = toDateInputValue(new Date());
  const month = today.slice(0, 7);
  const year = today.slice(0, 4);
  const todayTotal = revenueForDate(today);
  const monthTotal = revenueForMonth(month);
  const yearTotal = revenueForYear(year);
  return { services: servicesTotal, sales: salesTotal, salesProfit: salesTotal - salesCost, total: servicesTotal + salesTotal, today: todayTotal, month: monthTotal, year: yearTotal };
}

function revenueForDate(date) {
  const serviceRevenue = loadAppointments().filter((item) => item.status === "completed" && (item.completedAt || item.createdAt || "").slice(0, 10) === date).reduce((sum, item) => sum + Number(item.price || 0), 0);
  const saleRevenue = loadSales().filter((item) => item.date.slice(0, 10) === date).reduce((sum, item) => sum + Number(item.total || 0), 0);
  return serviceRevenue + saleRevenue;
}

function revenueForMonth(month) {
  const serviceRevenue = loadAppointments().filter((item) => item.status === "completed" && (item.completedAt || item.createdAt || "").slice(0, 7) === month).reduce((sum, item) => sum + Number(item.price || 0), 0);
  const saleRevenue = loadSales().filter((item) => item.date.slice(0, 7) === month).reduce((sum, item) => sum + Number(item.total || 0), 0);
  return serviceRevenue + saleRevenue;
}

function revenueForYear(year) {
  const serviceRevenue = loadAppointments().filter((item) => item.status === "completed" && (item.completedAt || item.createdAt || "").slice(0, 4) === year).reduce((sum, item) => sum + Number(item.price || 0), 0);
  const saleRevenue = loadSales().filter((item) => item.date.slice(0, 4) === year).reduce((sum, item) => sum + Number(item.total || 0), 0);
  return serviceRevenue + saleRevenue;
}

function uniqueClients(appointments) {
  return new Set(appointments.map((item) => normalizePhone(item.phone)).filter(Boolean)).size;
}

function getAvailableTimes(date) {
  if (!date || !isWorkingDate(date)) return [];
  const start = "08:00";
  const end = "20:00";
  const slots = [];
  let cursor = timeToMinutes(start);
  const lastStart = timeToMinutes(end);
  while (cursor <= lastStart) {
    const time = minutesToTime(cursor);
    if (!isSlotTaken(date, time)) slots.push(time);
    cursor += 60;
  }
  return slots;
}

function isSlotTaken(date, time) {
  return loadAppointments().some((item) => item.status === "active" && item.date === date && item.time === time);
}

function isWorkingDate(date) { return getLocalDate(date).getDay() !== 1; }
function getService(id) { return services.find((service) => service.id === id); }
function salePrice(item) { return Number(item.cost || 0) * (1 + Number(item.margin || 0) / 100); }

function hasRebookingByPhone(cancelledAppointment, appointments) {
  const phone = normalizePhone(cancelledAppointment.phone);
  const cancelledAt = cancelledAppointment.cancelledAt || cancelledAppointment.createdAt || "";
  return appointments.some((item) => item.id !== cancelledAppointment.id && item.status !== "cancelled" && normalizePhone(item.phone) === phone && (!cancelledAt || (item.createdAt || "") > cancelledAt));
}

function statusPill(status) {
  const className = status === "completed" ? "" : status === "active" ? "pending" : status;
  return `<span class="status-pill ${className}">${statusLabel(status)}</span>`;
}

function statusLabel(status) {
  return ({ active: "Pendente", completed: "Realizado", "no-show": "Ñ realizado", cancelled: "Cancelado" })[status] || status;
}

async function applyAppointmentHistoryReset({ syncCloud = false } = {}) {
  const db = getFirestoreDb();
  if (syncCloud && db) {
    try {
      const resetDoc = await db.collection(FIREBASE_COLLECTION).doc(APPOINTMENT_RESET_KEY).get();
      if (resetDoc.exists && resetDoc.data()?.value === APPOINTMENT_RESET_VERSION) {
        localStorage.setItem(APPOINTMENT_RESET_KEY, APPOINTMENT_RESET_VERSION);
        return false;
      }
    } catch (error) {
      console.warn("Falha ao verificar limpeza de agendamentos no Firebase:", error);
    }
  }

  if (localStorage.getItem(APPOINTMENT_RESET_KEY) === APPOINTMENT_RESET_VERSION) return false;
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  if (!syncCloud || !db) return true;

  try {
    const updatedAt = firebase.firestore.FieldValue.serverTimestamp();
    await Promise.all([
      db.collection(FIREBASE_COLLECTION).doc(STORAGE_KEY).set({ value: [], updatedAt }, { merge: true }),
      db.collection(FIREBASE_COLLECTION).doc(APPOINTMENT_RESET_KEY).set({ value: APPOINTMENT_RESET_VERSION, updatedAt }, { merge: true })
    ]);
    localStorage.setItem(APPOINTMENT_RESET_KEY, APPOINTMENT_RESET_VERSION);
    return true;
  } catch (error) {
    console.warn("Falha ao zerar agendamentos no Firebase:", error);
    return true;
  }
}

async function applySalesHistoryReset({ syncCloud = false } = {}) {
  const db = getFirestoreDb();
  if (syncCloud && db) {
    try {
      const resetDoc = await db.collection(FIREBASE_COLLECTION).doc(SALES_RESET_KEY).get();
      if (resetDoc.exists && resetDoc.data()?.value === SALES_RESET_VERSION) {
        localStorage.setItem(SALES_RESET_KEY, SALES_RESET_VERSION);
        return false;
      }
    } catch (error) {
      console.warn("Falha ao verificar limpeza de vendas no Firebase:", error);
    }
  }

  if (localStorage.getItem(SALES_RESET_KEY) === SALES_RESET_VERSION) return false;
  localStorage.setItem(SALES_KEY, JSON.stringify([]));
  if (!syncCloud || !db) return true;

  try {
    const updatedAt = firebase.firestore.FieldValue.serverTimestamp();
    await Promise.all([
      db.collection(FIREBASE_COLLECTION).doc(SALES_KEY).set({ value: [], updatedAt }, { merge: true }),
      db.collection(FIREBASE_COLLECTION).doc(SALES_RESET_KEY).set({ value: SALES_RESET_VERSION, updatedAt }, { merge: true })
    ]);
    localStorage.setItem(SALES_RESET_KEY, SALES_RESET_VERSION);
    return true;
  } catch (error) {
    console.warn("Falha ao zerar vendas no Firebase:", error);
    return true;
  }
}

function normalizeExistingAppointments() {
  const appointments = loadAppointments().map((item) => ({ ...item, status: item.status || "active" }));
  saveAppointments(appointments);
}

function loadAppointments() { return loadJson(STORAGE_KEY); }
function saveAppointments(value) { saveJson(STORAGE_KEY, value); }
function loadStock() { return loadJson(STOCK_KEY); }
function saveStock(value) { saveJson(STOCK_KEY, value); }
function loadSales() { return loadJson(SALES_KEY); }
function saveSales(value) { saveJson(SALES_KEY, value); }
function loadServices() {
  const saved = loadJson(SERVICES_KEY);
  return saved.length ? saved : defaultServices.map((service) => ({ ...service }));
}
function saveServices() { saveJson(SERVICES_KEY, services); }
function loadPageConfig() {
  const config = { ...defaultPageConfig, ...loadObject(PAGE_CONFIG_KEY) };
  if (config.brandName === "Lucas Barbearia") config.brandName = "Lucasbarbearia";
  if (String(config.aboutText || "").includes("A Lucas Barbearia nasceu")) {
    config.aboutText = config.aboutText.replace("A Lucas Barbearia nasceu", "A Lucasbarbearia nasceu");
  }
  return config;
}
function savePageConfig() { saveJson(PAGE_CONFIG_KEY, pageConfig); }

function loadJson(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; }
}

function loadObject(key) {
  try { return JSON.parse(localStorage.getItem(key)) || {}; } catch { return {}; }
}

function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  saveCloudJson(key, value);
}

async function syncCloudData() {
  const db = getFirestoreDb();
  if (!db) {
    cloudWritesEnabled = true;
    return;
  }
  try {
    const docs = await Promise.all(CLOUD_DATA_KEYS.map((key) => db.collection(FIREBASE_COLLECTION).doc(key).get()));
    docs.forEach((doc, index) => {
      if (!doc.exists) return;
      const value = doc.data()?.value;
      if (value === undefined) return;
      localStorage.setItem(CLOUD_DATA_KEYS[index], JSON.stringify(value));
    });
    const appointmentsWereReset = await applyAppointmentHistoryReset({ syncCloud: true });
    const salesWereReset = await applySalesHistoryReset({ syncCloud: true });
    services = loadServices();
    pageConfig = loadPageConfig();
    renderAll();
    cloudWritesEnabled = true;
    showToast(appointmentsWereReset || salesWereReset ? "Históricos zerados com sucesso." : "Dados sincronizados com Firebase.");
  } catch (error) {
    console.warn("Falha ao sincronizar Firebase:", error);
    await applyAppointmentHistoryReset();
    await applySalesHistoryReset();
    cloudWritesEnabled = true;
    showToast("Firebase indisponível. Usando dados locais.");
  }
}

function saveCloudJson(key, value) {
  const db = getFirestoreDb();
  if (!cloudWritesEnabled || !db || !CLOUD_DATA_KEYS.includes(key)) return;
  db.collection(FIREBASE_COLLECTION).doc(key).set({
    value,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true }).catch((error) => {
    console.warn("Falha ao salvar no Firebase:", error);
  });
}

function getFirestoreDb() {
  return window.lucasFirebase?.ready ? window.lucasFirebase.db : null;
}

function loadMenuOrder() {
  try { return legacyMenuOrderToGroups(JSON.parse(localStorage.getItem(MENU_ORDER_KEY)) || {}); } catch { return {}; }
}

function exportJson() {
  const data = JSON.stringify({ appointments: loadAppointments(), stock: loadStock(), sales: loadSales() }, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "lucas-barbearia-dados.json";
  link.click();
  URL.revokeObjectURL(url);
}

function createCode() { return `LB-${Math.floor(1000 + Math.random() * 9000)}${Date.now().toString(36).slice(-3).toUpperCase()}`; }
function createId() { return `id-${Date.now().toString(36)}-${Math.floor(Math.random() * 999)}`; }
function normalizePhone(value) { return String(value || "").replace(/\D/g, ""); }
function normalizeLookup(value) { return String(value || "").trim().toLowerCase().replace(/[^\da-zà-ú-]/g, ""); }
function formatCurrency(value) { return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value) || 0); }
function formatDate(date) { return getLocalDate(date).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" }); }
function formatHeaderDate(date) {
  return date.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" }).replace(".", "");
}
function getLocalDate(date) { const [year, month, day] = date.split("-").map(Number); return new Date(year, month - 1, day); }
function toDateInputValue(date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
function timeToMinutes(time) { const [hours, minutes] = time.split(":").map(Number); return hours * 60 + minutes; }
function minutesToTime(total) { return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`; }
function lastDays(count) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (count - 1 - index));
    return toDateInputValue(date);
  });
}

function lastMonths(count) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (count - 1 - index));
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
    return { key, label };
  });
}
function formatPhone(value) {
  const phone = normalizePhone(value);
  if (phone.length === 11) return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`;
  if (phone.length === 10) return `(${phone.slice(0, 2)}) ${phone.slice(2, 6)}-${phone.slice(6)}`;
  return value || "";
}
function escapeHtml(value) {
  return String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", reject);
    reader.readAsDataURL(file);
  });
}
function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => elements.toast.classList.remove("show"), 3200);
}
