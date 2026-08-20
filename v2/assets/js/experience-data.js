/**
 * Unified Experience & Career Data Layer for Sohel Ahammad Portfolio v2
 * Connects Admin Panel, Timeline (skills.html), and ATS Resume (resume.html)
 */

window.DEFAULT_EXPERIENCES = [
  {
    id: "exp-1",
    title: "Electrical Terminator & Field Specialist",
    company: "Seder Group (Sadawi PV 380/115 kV BSP Substation)",
    location: "Riyadh, Saudi Arabia 🇸🇦",
    period: "04-2026 to Present",
    tag: "Current Role",
    tagColor: "#10b981",
    icon: "fa-bolt",
    category: "electrical",
    description: "Installing, glanding, terminating, and testing HV/LV power and control cables adhering to SEC (Saudi Electricity Company) 380/115 kV substation technical specifications. Performing cable continuity and insulation resistance megger testing.",
    skills: ["SEC 380/115 kV", "Cable Glanding & Termination", "Continuity & Megger", "Substation T&C"]
  },
  {
    id: "exp-2",
    title: "Sole Developer & Mobile Architect",
    company: "Delux Telecom (Live Android Mobile Application)",
    location: "Self-Developed & Maintained 📱",
    period: "01-2024 to Present",
    tag: "Android Platform",
    tagColor: "#3b82f6",
    icon: "fa-android",
    category: "it",
    description: "Engineered and deployed a custom Android mobile application and automated telecom web portal (deluxtelecom.pp.ua) for automated digital recharges, instant user ledger tracking, and secure POS operations.",
    skills: ["Android App Dev", "Mobile Architecture", "REST API", "Database Management"]
  },
  {
    id: "exp-3",
    title: "Electrical Terminator (Industrial Maintenance)",
    company: "Seder Group (Saudi Aramco Oil Plant Project)",
    location: "Al-Khafji, Saudi Arabia 🇸🇦",
    period: "09-2023 to 11-2023",
    tag: "Aramco Project",
    tagColor: "#ef4444",
    icon: "fa-fire-extinguisher",
    category: "electrical",
    description: "Exposed and diagnosed burnt electrical wiring in oil plant systems. Replaced faulty lines with certified Aramco-standard cabling, performing high-precision glanding and terminations under strict site safety permits.",
    skills: ["Saudi Aramco Standards", "Industrial Wiring Overhaul", "Safety Work Permits", "Hazard Isolation"]
  },
  {
    id: "exp-4",
    title: "T&C Technician & Electrical Terminator",
    company: "Eman Contracting (Jubail 3B IWP Desalination Plant)",
    location: "Jubail Industrial City, Saudi Arabia 🇸🇦",
    period: "08-2022 to 08-2023",
    tag: "Mega Water Project",
    tagColor: "#06b6d4",
    icon: "fa-check-circle",
    category: "testing",
    description: "Conducted Testing & Commissioning (T&C) on electrical switchgear and SCADA telemetry systems for the major desalination water plant. Executed multi-core signal cable termination, loop checks, and insulation megger testing.",
    skills: ["Testing & Commissioning", "SCADA Telemetry", "Desalination Switchgear", "Loop Checking"]
  },
  {
    id: "exp-5",
    title: "Store Keeper & Material Controller",
    company: "Gulf Contracting (Shapoorji Pallonji Industrial Project)",
    location: "King Abdullah Economic City (KAEC), Saudi Arabia 🇸🇦",
    period: "03-2020 to 09-2020",
    tag: "Warehouse Logistics",
    tagColor: "#f59e0b",
    icon: "fa-archive",
    category: "store",
    description: "Managed central warehouse storage, organized electrical and construction materials, handled incoming/outgoing shipments with MRIR verification, and maintained real-time audit stock registers.",
    skills: ["Material Control", "MRIR Verification", "Stock Auditing", "Warehouse Logistics"]
  },
  {
    id: "exp-6",
    title: "Computer Operator & Office Admin",
    company: "Delux Computer Services",
    location: "Riyadh, Saudi Arabia 🇸🇦",
    period: "08-2018 to 02-2020",
    tag: "Office Administration",
    tagColor: "#8b5cf6",
    icon: "fa-desktop",
    category: "it",
    description: "Created and managed digital documents, spreadsheets, data entry records, official correspondence, and client reports using Microsoft Office, Excel, and fast Bengali/English/Arabic typing.",
    skills: ["MS Office & Excel", "Data Entry", "Official Correspondence", "Multi-Language Typing"]
  },
  {
    id: "exp-7",
    title: "Hotel Waiter & Cashier",
    company: "Al Khozama Management Hotel (Delux Hotel)",
    location: "Riyadh, Saudi Arabia 🇸🇦",
    period: "03-2016 to 07-2018",
    tag: "Hospitality & POS",
    tagColor: "#ec4899",
    icon: "fa-cutlery",
    category: "hospitality",
    description: "Delivered high-standard dining service, managed order taking, operated POS cash registers, balanced daily sales accounts, and communicated with multicultural guests in Arabic, English, and Bengali.",
    skills: ["POS Cash Register", "Customer Service", "Sales Balancing", "Guest Communication"]
  }
];

window.ExperienceDataManager = {
  getExperiences: function() {
    try {
      const stored = localStorage.getItem('sohel_custom_experiences');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return window.DEFAULT_EXPERIENCES;
  },

  saveExperiences: function(data) {
    try {
      localStorage.setItem('sohel_custom_experiences', JSON.stringify(data));
      return true;
    } catch (e) {
      return false;
    }
  },

  resetToDefault: function() {
    localStorage.removeItem('sohel_custom_experiences');
  },

  renderTimeline: function(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const list = this.getExperiences();

    container.innerHTML = list.map((item, idx) => `
      <div class="timeline-item revealed" data-category="${item.category || 'all'}">
        <div class="timeline-dot">
          <i class="fa ${item.icon || 'fa-briefcase'}"></i>
        </div>
        <div class="timeline-content">
          <div class="timeline-date-badge">${item.period}</div>
          <h3 class="timeline-title">${item.title}</h3>
          <h4 class="timeline-company"><i class="fa fa-building-o"></i> ${item.company} &middot; <span style="color:var(--text-muted);">${item.location}</span></h4>
          <p class="timeline-desc">${item.description}</p>
          <div class="timeline-tags">
            ${(item.skills || []).map(s => `<span class="timeline-tag">${s}</span>`).join('')}
          </div>
        </div>
      </div>
    `).join('');
  },

  renderCvExperiences: function(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const list = this.getExperiences();

    container.innerHTML = list.map(item => `
      <div class="cv-job">
        <div class="cv-job-header">
          <div class="cv-job-title">${item.title}</div>
          <div class="cv-job-period">${item.period}</div>
        </div>
        <div class="cv-job-company">${item.company} &middot; ${item.location}</div>
        <div class="cv-job-desc">${item.description}</div>
      </div>
    `).join('');
  }
};
