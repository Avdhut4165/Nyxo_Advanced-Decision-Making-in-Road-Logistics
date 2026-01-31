class AdaptiveLogFrontend {
  constructor() {
    this.truckMarkers = new Map();
    this.initialize();
  }

  async initialize() {
    this.bindEvents();
    this.initializeMap();
    await this.refreshDashboard();
    document.getElementById('dashboard').style.display = 'block'; // Direct show for testing
    document.getElementById('loginScreen').classList.add('hidden');
  }

  async refreshDashboard() {
    await Promise.all([this.loadTrucksData(), this.updateDashboardStats()]);
  }

  async loadTrucksData() {
    const response = await fetch('/api/trucks'); // Real API call
    const trucks = await response.json();
    const grid = document.getElementById('trucksGrid');
    grid.innerHTML = '';
    
    trucks.forEach(truck => {
      this.renderTruckCard(truck);
      this.addTruckMarker(truck);
    });
  }

  async updateDashboardStats() {
    const response = await fetch('/api/stats');
    const stats = await response.json();
    document.getElementById('fleetUtilization').textContent = `${stats.utilization}%`;
    document.getElementById('emptyMiles').textContent = `${stats.emptyMilesReduction}%`;
    document.getElementById('revenueTrip').textContent = `$${stats.revenuePerTrip}`;
    document.getElementById('aiRecommendations').textContent = stats.aiRecommendations;
  }

  // ... (Keep your existing renderTruckCard, addTruckMarker, and initializeMap methods)
}