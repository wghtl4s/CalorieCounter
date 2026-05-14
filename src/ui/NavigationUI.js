export default class NavigationUI {
    constructor(tabs, onTabChange) {
        this.tabs = tabs;
        this.onTabChange = onTabChange;
        this.activeTab = tabs[0].id;
    }

    render() {
        const tabsHtml = this.tabs.map(tab => `
            <button class="nav-tab ${tab.id === this.activeTab ? 'active' : ''}" data-tab="${tab.id}">
                <span class="nav-icon">${tab.icon}</span>
                <span class="nav-label">${tab.label}</span>
            </button>
        `).join('');

        return `<nav class="app-nav"><div class="nav-tabs">${tabsHtml}</div></nav>`;
    }

    init(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = this.render();

        container.querySelectorAll('.nav-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                this.activeTab = btn.dataset.tab;

                container.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                this.onTabChange(this.activeTab);
            });
        });
    }

    setActiveTab(tabId) {
        this.activeTab = tabId;
        document.querySelectorAll('.nav-tab').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });
        this.onTabChange(tabId);
    }
}
