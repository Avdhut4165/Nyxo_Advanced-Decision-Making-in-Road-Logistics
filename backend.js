// =============================================
// ADAPTIVE LOGISTICS AI - BACKEND SIMULATION
// =============================================

class AdaptiveLogBackend {
  constructor() {
    this.users = new Map();
    this.trucks = new Map();
    this.weatherCache = new Map();
    this.initializeMockData();
  }

  initializeMockData() {
    // Mock users
    this.users.set("demo@adaptivelog.ai", {
      id: "user_001",
      name: "John Driver",
      email: "demo@adaptivelog.ai",
      avatar: "JD",
      company: "TransGlobal Logistics",
      role: "fleet_manager",
    });

    // Mock trucks with detailed analytics
    this.trucks.set("7821", {
      id: "7821",
      name: "Peterbilt 579",
      type: "Flatbed",
      capacity: 48000,
      currentLoad: 42000,
      status: "en_route",
      location: { lat: 41.8781, lng: -87.6298 },
      destination: "Chicago, IL",
      driver: "John Smith",
      fuelEfficiency: 6.5,
      maintenanceScore: 92,
      currentRoute: {
        start: "Dallas, TX",
        end: "Chicago, IL",
        distance: 967,
        waypoints: [],
      },
      metrics: {
        totalMiles: 125430,
        avgSpeed: 58,
        fuelConsumed: 19296,
        co2Emitted: 173,
      },
    });

    this.trucks.set("4512", {
      id: "4512",
      name: "Volvo VNL 760",
      type: "Reefer",
      capacity: 42000,
      currentLoad: 38000,
      status: "loading",
      location: { lat: 32.7767, lng: -96.797 },
      destination: "Atlanta, GA",
      driver: "Mike Johnson",
      fuelEfficiency: 7.2,
      maintenanceScore: 88,
      currentRoute: {
        start: "Dallas, TX",
        end: "Atlanta, GA",
        distance: 781,
        waypoints: [],
      },
    });

    this.trucks.set("3390", {
      id: "3390",
      name: "Freightliner Cascadia",
      type: "Dry Van",
      capacity: 45000,
      currentLoad: 0,
      status: "available",
      location: { lat: 39.7392, lng: -104.9903 },
      destination: "Denver, CO",
      driver: "Robert Brown",
      fuelEfficiency: 7.8,
      maintenanceScore: 95,
      currentRoute: null,
    });
  }

  // Authentication
  async authenticate(email) {
    await this.delay(500); // Simulate API delay

    const user = this.users.get(email) || {
      id: "user_" + Math.random().toString(36).substr(2, 9),
      name: email.split("@")[0],
      email: email,
      avatar: email[0].toUpperCase(),
      company: "Demo Logistics Inc.",
      role: "fleet_manager",
    };

    this.users.set(email, user);

    return {
      success: true,
      token: "mock_jwt_token_" + Date.now(),
      user: user,
    };
  }

  // Verify token
  async verifyToken(token) {
    await this.delay(200);
    return this.users.get("demo@adaptivelog.ai");
  }

  // Get weather data
  async getWeather(location) {
    const cacheKey = location.toLowerCase();

    if (this.weatherCache.has(cacheKey)) {
      const cached = this.weatherCache.get(cacheKey);
      if (Date.now() - cached.timestamp < 300000) {
        // 5 minutes cache
        return cached.data;
      }
    }

    await this.delay(800);

    // Mock weather data based on location
    const weatherData = {
      location: location,
      temperature: this.getRandom(15, 30),
      conditions: this.getRandomItem([
        "Sunny",
        "Partly Cloudy",
        "Cloudy",
        "Light Rain",
      ]),
      humidity: this.getRandom(40, 85),
      windSpeed: this.getRandom(5, 25),
      visibility: this.getRandom(5, 15) * 1000,
      timestamp: Date.now(),
    };

    // Calculate logistics impact
    weatherData.impact = this.calculateWeatherImpact(weatherData);

    this.weatherCache.set(cacheKey, {
      data: weatherData,
      timestamp: Date.now(),
    });

    return weatherData;
  }

  // Get traffic data
  async getTraffic(route) {
    await this.delay(600);

    return {
      route: route,
      congestionLevel: this.getRandom(10, 60),
      averageSpeed: this.getRandom(45, 70),
      incidents: this.getRandom(0, 3),
      delayMinutes: this.getRandom(5, 45),
    };
  }

  // Get truck analytics
  async getTruckAnalytics(truckId) {
    await this.delay(400);

    const truck = this.trucks.get(truckId);
    if (!truck) return null;

    // Get weather for current location
    const location = this.getLocationName(truck.location);
    const weather = await this.getWeather(location);

    // Get traffic data if en route
    let traffic = null;
    if (truck.status === "en_route" && truck.currentRoute) {
      traffic = await this.getTraffic(truck.currentRoute);
    }

    // Calculate all metrics
    return {
      ...truck,
      analytics: {
        loadFeasibility: this.calculateLoadFeasibility(truck),
        eta: this.calculateETA(truck, traffic, weather),
        fuelCost: this.calculateFuelCost(truck, traffic, weather),
        penaltyRisk: this.calculatePenaltyRisk(truck, traffic, weather),
        safetyScore: this.calculateSafetyScore(truck, traffic, weather),
        ecoScore: this.calculateEcoScore(truck, traffic, weather),
      },
      weather: weather,
      traffic: traffic,
    };
  }

  // Calculate load feasibility
  calculateLoadFeasibility(truck) {
    const utilization = (truck.currentLoad / truck.capacity) * 100;

    let feasibility = "high";
    let score = 100;

    if (utilization > 100) {
      feasibility = "infeasible";
      score = 0;
    } else if (utilization > 95) {
      feasibility = "low";
      score = 60;
    } else if (utilization > 85) {
      feasibility = "medium";
      score = 75;
    }

    return { utilization, feasibility, score };
  }

  // Calculate ETA
  calculateETA(truck, traffic, weather) {
    if (!truck.currentRoute) return "N/A";

    let baseSpeed = 65; // MPH
    let distance = truck.currentRoute.distance;

    // Adjust for traffic
    if (traffic) {
      const speedReduction = traffic.congestionLevel / 100;
      baseSpeed *= 1 - speedReduction;
    }

    // Adjust for weather
    if (weather && weather.impact) {
      const weatherReduction = parseFloat(weather.impact.speedReduction) / 100;
      baseSpeed *= 1 - weatherReduction;
    }

    // Calculate hours
    const hours = distance / baseSpeed;
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);

    // Calculate confidence
    let confidence = 15; // minutes
    if (!traffic) confidence += 10;
    if (!weather) confidence += 10;

    return {
      base: `${h}h ${m}m`,
      confidence: `±${confidence}min`,
      adjustedSpeed: baseSpeed.toFixed(1),
    };
  }

  // Calculate fuel cost
  calculateFuelCost(truck, traffic, weather) {
    if (!truck.currentRoute) return 0;

    const distance = truck.currentRoute.distance;
    const fuelPrice = 3.85; // $ per gallon
    let efficiency = truck.fuelEfficiency;

    // Adjust for weather
    if (weather && weather.impact && weather.impact.fuelEfficiency) {
      const reduction = parseFloat(weather.impact.fuelEfficiency) / 100;
      efficiency *= 1 - reduction;
    }

    // Adjust for load
    const loadFactor = truck.currentLoad / truck.capacity;
    efficiency *= 1 - loadFactor * 0.15;

    const gallons = distance / efficiency;
    return gallons * fuelPrice;
  }

  // Calculate penalty risk
  calculatePenaltyRisk(truck, traffic, weather) {
    if (truck.status !== "en_route") return { level: "low", amount: 0 };

    let riskScore = 0;

    // Traffic delays
    if (traffic && traffic.delayMinutes > 30) {
      riskScore += 50;
    }

    // Weather impact
    if (weather && weather.impact.safetyScore < 70) {
      riskScore += 30;
    }

    // Time of day (simulated)
    const hour = new Date().getHours();
    if (hour >= 16 && hour <= 19) {
      // Rush hour
      riskScore += 20;
    }

    let level = "low";
    let amount = 0;

    if (riskScore > 70) {
      level = "high";
      amount = 1200;
    } else if (riskScore > 40) {
      level = "medium";
      amount = 450;
    }

    return { level, amount };
  }

  // Calculate safety score
  calculateSafetyScore(truck, traffic, weather) {
    let score = 100;
    const factors = [];

    // Weather impact
    if (weather && weather.impact) {
      score = Math.min(score, weather.impact.safetyScore);
      factors.push({
        factor: "Weather Conditions",
        impact: weather.impact.safetyScore,
        details: weather.impact.recommendations,
      });
    }

    // Truck maintenance
    score = Math.min(score, truck.maintenanceScore);
    factors.push({
      factor: "Vehicle Maintenance",
      impact: truck.maintenanceScore,
      details: ["Regular maintenance up to date"],
    });

    // Traffic conditions
    if (traffic && traffic.congestionLevel > 50) {
      const trafficImpact = 100 - traffic.congestionLevel / 2;
      score = Math.min(score, trafficImpact);
      factors.push({
        factor: "Traffic Congestion",
        impact: trafficImpact,
        details: [`${traffic.congestionLevel}% congestion level`],
      });
    }

    // Driver hours (simulated)
    const driverHours = this.getRandom(4, 12);
    if (driverHours > 8) {
      const fatigueImpact = Math.max(50, 100 - (driverHours - 8) * 10);
      score = Math.min(score, fatigueImpact);
      factors.push({
        factor: "Driver Fatigue",
        impact: fatigueImpact,
        details: [`Driver has been on duty for ${driverHours} hours`],
      });
    }

    return {
      score: Math.round(score),
      rating: this.getSafetyRating(score),
      factors: factors,
    };
  }

  // Calculate eco score
  calculateEcoScore(truck, traffic, weather) {
    let score = 100;
    const improvements = [];

    // Fuel efficiency
    const efficiency = truck.fuelEfficiency;
    if (efficiency < 6) {
      score -= 20;
      improvements.push("Consider upgrading to more fuel-efficient vehicle");
    } else if (efficiency > 7) {
      score += 10;
    }

    // Load optimization
    const loadRatio = truck.currentLoad / truck.capacity;
    if (loadRatio < 0.5) {
      score -= 15;
      improvements.push("Low load efficiency - consider combining loads");
    } else if (loadRatio > 0.9) {
      score += 5;
    }

    // Route optimization
    if (truck.currentRoute) {
      const detourScore = this.getRandom(70, 95);
      score = Math.min(score, detourScore);
      if (detourScore < 80) {
        improvements.push("Route could be optimized for fuel efficiency");
      }
    }

    // Weather impact
    if (weather && weather.conditions.toLowerCase().includes("rain")) {
      score -= 5;
    }

    score = Math.max(50, Math.min(100, score));

    return {
      score: Math.round(score),
      rating: this.getEcoRating(score),
      improvements: improvements,
    };
  }

  // Get AI recommendations
  async getAIRecommendations() {
    await this.delay(800);

    return [
      {
        id: 1,
        type: "route_optimization",
        priority: "high",
        title: "Reroute Truck #7821 for backhaul opportunity",
        description:
          "Detour adds 45min but picks up $1,870 load in Denver, reducing empty return by 520 miles.",
        impact: {
          financial: "+$1,240",
          time: "+45min",
          efficiency: "+42%",
        },
        actions: ["accept", "delay", "details"],
      },
      {
        id: 2,
        type: "fuel_savings",
        priority: "medium",
        title: "Refuel Truck #4512 at exit 132 for 8% fuel savings",
        description:
          "Current route has fuel at $3.42/gal vs $3.15/gal at exit 132.",
        impact: {
          financial: "-$47",
          time: "No change",
          efficiency: "+8%",
        },
        actions: ["accept", "details"],
      },
      {
        id: 3,
        type: "load_swap",
        priority: "medium",
        title: "Swap loads between Truck #3390 and #6712",
        description:
          "Optimizes delivery windows and reduces idle time by 3.5 hours combined.",
        impact: {
          financial: "+$320",
          time: "-3.5h",
          efficiency: "+15%",
        },
        actions: ["accept", "details"],
      },
    ];
  }

  // Get dashboard statistics
  async getDashboardStats() {
    await this.delay(300);

    return {
      utilization: Math.floor(Math.random() * 10) + 85,
      emptyMilesReduction: Math.floor(Math.random() * 10) + 35,
      revenuePerTrip: Math.floor(Math.random() * 200) + 1150,
      aiRecommendations: Math.floor(Math.random() * 5) + 12,
      activeTrucks: 14,
      totalTrucks: 16,
      loadsToday: 28,
      delayedDeliveries: 2,
      fuelSavings: 1250,
      co2Reduction: 8.5,
    };
  }

  // Helper methods
  calculateWeatherImpact(weather) {
    let safetyScore = 100;
    let speedReduction = "0%";
    let fuelEfficiency = "0% reduction";
    const recommendations = [];

    // Temperature impact
    if (weather.temperature < 0) {
      safetyScore -= 20;
      speedReduction = "15%";
      fuelEfficiency = "10% reduction";
      recommendations.push("Icy conditions - use winter tires");
    } else if (weather.temperature > 30) {
      safetyScore -= 10;
      fuelEfficiency = "5% reduction";
      recommendations.push("Hot weather - check engine temperature");
    }

    // Weather conditions
    if (weather.conditions.toLowerCase().includes("rain")) {
      safetyScore -= 15;
      speedReduction = "10%";
      recommendations.push("Wet roads - increase following distance");
    } else if (weather.conditions.toLowerCase().includes("snow")) {
      safetyScore -= 25;
      speedReduction = "20%";
      recommendations.push("Snowy conditions - use chains if required");
    }

    // Wind impact
    if (weather.windSpeed > 20) {
      safetyScore -= 10;
      recommendations.push("High winds - secure loads properly");
    }

    // Visibility impact
    if (weather.visibility < 5000) {
      safetyScore -= 15;
      speedReduction = "15%";
      recommendations.push("Reduced visibility - use caution");
    }

    return {
      safetyScore: Math.max(50, safetyScore),
      speedReduction,
      fuelEfficiency,
      recommendations,
    };
  }

  getLocationName(coords) {
    // Simplified location mapping
    const locations = {
      "41.8781,-87.6298": "Chicago",
      "32.7767,-96.7970": "Dallas",
      "39.7392,-104.9903": "Denver",
    };

    const key = `${coords.lat},${coords.lng}`;
    return locations[key] || "Unknown Location";
  }

  getSafetyRating(score) {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Good";
    if (score >= 70) return "Fair";
    return "Poor";
  }

  getEcoRating(score) {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Good";
    if (score >= 70) return "Average";
    return "Needs Improvement";
  }

  getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
