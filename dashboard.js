    // --- CONFIGURE YOUR SUPABASE PROJECT ---
// Configuration is now loaded from config.js (not committed to version control)
if (typeof CONFIG === 'undefined') {
    console.error('CONFIG object not found! Make sure config.js is loaded before dashboard.js');
    alert('Configuration error: Please ensure config.js file exists and is properly configured.');
}

const SUPABASE_URL = CONFIG.SUPABASE_URL;
const SUPABASE_ANON_KEY = CONFIG.SUPABASE_ANON_KEY;

// Validate configuration
if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL.includes('YOUR_') || SUPABASE_ANON_KEY.includes('YOUR_')) {
    console.error('Invalid configuration: Please update config.js with your actual Supabase credentials');
    alert('Configuration error: Please update config.js with your actual Supabase credentials');
}

const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // --- CUSTOM PLACES FOR SEARCH ---
    let customPlaces = [
      {
        name: 'Farm 1',
        lat: 22.619045,
        lng: 88.464126,
        farmId: '5cb900a2-939e-414f-96ab-ad6e8cda2b63'
      },
      {
        name: ' Eco Valley',
        lat: 22.610131,
        lng: 88.466111,
        farmId: 'cca2a61a-e1c5-4139-8c8a-aba7f3cd7942'
      },
      {
        name: 'Farm 2',
        lat: 22.59062,
        lng: 88.476222,
        farmId: 'c73b3ee3-cb0b-4ce4-bd38-1e9fa5a7ecfa'
      },
      {
        name: 'Farm 2.1',
        lat: 22.59052,
        lng: 88.477222,
        farmId: 'e95f4ee6-cb0b-4ce4-bd38-1e9fa5a7ecfe',
        isSmall: true  // Flag for smaller marker
      },
      {
        name: 'Farm 4',
        lat: 22.590416,
        lng: 88.485826,
        farmId: 'd84f3ee5-cb0b-4ce4-bd38-1e9fa5a7ecfd'
      },
      {
        name: 'Farm 5',
        lat: 22.590457,
        lng: 88.488839,
        farmId: 'b7180290-648a-4f08-912d-a5ce3274edaa'
      }
    ];

    // Custom marker icons
    const greenIcon = new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const yellowIcon = new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const redIcon = new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const farmIcon = new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const currentLocationIcon = new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    // --- MAP SETUP ---
    const DEFAULT_CENTER = [22.5726, 88.3639]; // Kolkata coordinates
    const DEFAULT_ZOOM = 12;
    let map = null;
    let userMarker = null;
    let searchMarker = null;
    let routeControl = null;
    let userLatLng = null;
    let destLatLng = null;

    // Add polling variables
    let markerUpdateInterval;
    let markers = new Map(); // Store markers by farmId for easy updates

    // Define custom zones with coordinates and styles
    const customZones = [
      {
        name: "Phase 1",
        coordinates: [
          [22.608911, 88.457807],
          [22.61794, 88.454545],
          [22.621266, 88.454717],
          [22.634175, 88.457292],
          [22.632433, 88.482016]
        ],
        labelPosition: {
          lat: 22.627,
          lng: 88.465
        },
        style: {
          color: '#FF6B6B', // Lighter red color
          fillColor: '#FFE4E1',
          weight: 2, // Thinner line
          opacity: 0.8,
          fillOpacity: 0.35,
          dashArray: '5, 10' // Adding dotted line effect
        },
        farms: ['5cb900a2-939e-414f-96ab-ad6e8cda2b63'] // Add farm IDs for this phase
      },
      {
        name: "Phase 2",
        coordinates: [
          [22.612901, 88.46303],
          [22.609229, 88.459348],
          [22.606325, 88.458052],
          [22.600619, 88.458394],
          [22.596737, 88.460455],
          [22.592852, 88.464661],
          [22.595073, 88.472901],
          [22.598555, 88.477708],
          [22.602522, 88.481741],
          [22.607505, 88.481913],
          [22.612822, 88.478651],
          [22.615586, 88.474614],
          [22.616308, 88.470926],
          [22.615437, 88.467232]
        ],
        style: {
          color: '#4169E1', // Royal blue - lighter than deep blue
          fillColor: 'rgba(65, 105, 225, 0.25)', // More visible transparent blue
          weight: 3,
          opacity: 0.8,
          fillOpacity: 0.25,
          dashArray: '5, 10' // This creates the dotted line effect
        },
        farms: ['cca2a61a-e1c5-4139-8c8a-aba7f3cd7942'] // Add farm IDs for this phase
      },
      {
        name: "Phase 3",
        coordinates: [
          [22.58381, 88.472903],  // Starting point
          [22.590068, 88.46806],  // Moving clockwise
          [22.596167, 88.47703],
          [22.595811, 88.489306],
          [22.5888, 88.493298],   // Original endpoint
          [22.58896, 88.493163],  // New coordinates
          [22.583573, 88.494193],
          [22.579295, 88.480973],
          [22.58381, 88.472903]   // Back to start to close the polygon
        ],
        style: {
          color: '#8B008B', // Darker violet/purple color
          fillColor: 'rgba(139, 0, 139, 0.3)', // Darker transparent violet
          weight: 2,
          opacity: 0.8,
          fillOpacity: 0.3,
          dashArray: '5, 10' // Dotted line effect
        },
        farms: ['c73b3ee3-cb0b-4ce4-bd38-1e9fa5a7ecfa', 'd84f3ee5-cb0b-4ce4-bd38-1e9fa5a7ecfd', 'e95f4ee6-cb0b-4ce4-bd38-1e9fa5a7ecfe', 'b7180290-648a-4f08-912d-a5ce3274edaa'] // Add farm IDs for this phase
      }
    ];

    // Function to add zone polygons and labels to the map
    function addCustomZones() {
      if (!map) return;

      customZones.forEach(zone => {
        try {
          // Create polygon with initial style
          const polygon = L.polygon(zone.coordinates, {
            color: zone.style.color,
            fillColor: zone.style.fillColor,
            weight: 3, // Increased border weight
            opacity: 0.9, // More prominent border
            fillOpacity: 0.1, // Slightly more visible initial fill
            dashArray: '8, 12' // Larger dash pattern
          }).addTo(map);

          // Store the zone's farms in the polygon object
          polygon.farms = zone.farms;
          polygon.farmsVisible = false;

          // Create initial hotspot overlay with clipping
          createHotspotOverlay(zone);

          // Use custom label position if provided, otherwise calculate centroid
          let labelLat, labelLng;
          if (zone.labelPosition) {
            labelLat = zone.labelPosition.lat;
            labelLng = zone.labelPosition.lng;
          } else {
            const points = zone.coordinates;
            labelLat = points.reduce((sum, point) => sum + point[0], 0) / points.length;
            labelLng = points.reduce((sum, point) => sum + point[1], 0) / points.length;
          }

          // Create label container with enhanced styling
          const labelDiv = document.createElement('div');
          labelDiv.className = 'zone-label';
          labelDiv.textContent = zone.name;

          // Create custom icon for label with improved visibility
          const labelIcon = L.divIcon({
            className: 'zone-label-container',
            html: labelDiv,
            iconSize: [100, 40],
            iconAnchor: [50, 20]
          });

          // Add label marker at specified position
          const label = L.marker([labelLat, labelLng], {
            icon: labelIcon,
            interactive: false
          }).addTo(map);

          // Add hover interaction
          polygon.on('mouseover', () => {
            polygon.setStyle({ fillOpacity: 0.5 });
            labelDiv.classList.add('zone-label-hover');
          });

          polygon.on('mouseout', () => {
            polygon.setStyle({ fillOpacity: 0.35 });
            labelDiv.classList.remove('zone-label-hover');
          });

          // Add click handler for the polygon
          polygon.on('click', () => {
            // Toggle farms visibility
            polygon.farmsVisible = !polygon.farmsVisible;
            
            if (polygon.farmsVisible) {
              // Hide farms from other phases first
              hideAllFarms();
              // Show farms for this phase
              showFarmsInPhase(zone.farms);
              // Fit map to polygon bounds
              map.fitBounds(polygon.getBounds());
            } else {
              // Hide farms for this phase
              hideFarmsInPhase(zone.farms);
            }
          });

        } catch (error) {
          console.error(`Error adding zone ${zone.name}:`, error);
        }
      });

      // Add zoom handler to show/hide farms and adjust label opacity based on zoom level
      map.on('zoomend', () => {
        const currentZoom = map.getZoom();
        const bounds = map.getBounds();
        
        // Calculate opacity based on zoom level
        const baseZoom = 11;
        const maxZoom = 18;
        let labelOpacity = 1;
        
        if (currentZoom > baseZoom) {
          // Gradually reduce opacity as zoom increases
          labelOpacity = Math.max(0.2, 1 - ((currentZoom - baseZoom) / (maxZoom - baseZoom)));
        }
        
        // Update all zone labels opacity
        document.querySelectorAll('.zone-label').forEach(label => {
          label.style.opacity = labelOpacity;
        });
        
        // Show farms only for phases that are zoomed in (zoom level > 12)
        if (currentZoom > 13) {
          customZones.forEach(zone => {
            const polygon = L.polygon(zone.coordinates);
            if (bounds.intersects(polygon.getBounds())) {
              showFarmsInPhase(zone.farms);
            }
          });
        } else {
          // Hide all farms when zoomed out
          hideAllFarms();
          // Reset all polygon farm visibility flags
          customZones.forEach(zone => {
            const polygon = L.polygon(zone.coordinates);
            polygon.farmsVisible = false;
          });
        }
      });
    }

    // Function to show farms for a specific phase
    function showFarmsInPhase(phaseFarms) {
      markers.forEach((marker, farmId) => {
        if (phaseFarms.includes(farmId)) {
          if (!map.hasLayer(marker)) {
            marker.addTo(map);
          }
        }
      });
    }

    // Function to hide farms for a specific phase
    function hideFarmsInPhase(phaseFarms) {
      markers.forEach((marker, farmId) => {
        if (phaseFarms.includes(farmId)) {
          if (map.hasLayer(marker)) {
            marker.remove();
          }
        }
      });
    }

    // Function to hide all farms
    function hideAllFarms() {
      markers.forEach(marker => {
        if (map.hasLayer(marker)) {
          marker.remove();
        }
      });
    }

    // Function to check sensor values and return appropriate icon
    function getMarkerIcon(sensorData) {
      if (!sensorData) return farmIcon;

      // Define warning and critical thresholds
      const thresholds = {
        temperature: { warning: 30, critical: 35 },
        humidity: { warning: 60, critical: 70 },
        Ammonia: { warning: 12, critical: 14 },
        ph: { warningLow: 6, warningHigh: 8 }
      };

      // Check if any value exceeds critical threshold
      if (sensorData.temperature > thresholds.temperature.critical ||
          sensorData.humidity > thresholds.humidity.critical ||
          sensorData.Ammonia > thresholds.Ammonia.critical ||
          sensorData.ph < thresholds.ph.warningLow ||
          sensorData.ph > thresholds.ph.warningHigh) {
        return redIcon;
      }

      // Check if any value exceeds warning threshold
      if (sensorData.temperature > thresholds.temperature.warning ||
          sensorData.humidity > thresholds.humidity.warning ||
          sensorData.Ammonia > thresholds.Ammonia.warning ||
          (sensorData.ph > thresholds.ph.warningHigh || sensorData.ph < thresholds.ph.warningLow)) {
        return yellowIcon;
      }

      // If all values are normal
      return greenIcon;
    }

    // Function to get status class based on value and thresholds
    function getStatusClass(value, type) {
      const thresholds = {
        temperature: { warning: 30, critical: 35 },
        humidity: { warning: 60, critical: 70 },
        Ammonia: { warning: 12, critical: 14 },
        ph: { warningLow: 6, warningHigh: 8 }
      };

      if (type === 'ph') {
        if (value < thresholds.ph.warningLow || value > thresholds.ph.warningHigh) {
          return 'critical';
        } else if (value < thresholds.ph.warningLow || value > thresholds.ph.warningHigh) {
          return 'warning';
        }
      } else {
        if (value > thresholds[type].critical) {
          return 'critical';
        } else if (value > thresholds[type].warning) {
          return 'warning';
        }
      }
      return '';
    }

    // Update fetchSensorDataAndUpdateMarkers function
    async function fetchSensorDataAndUpdateMarkers() {
      console.log('Updating sensor data for markers...');
      for (const [farmId, marker] of markers.entries()) {
        try {
          const sensorData = await getLatestFarmData(farmId);
          const place = customPlaces.find(p => p.farmId === farmId);
          
          if (!place) continue;
          
          console.log('Updated sensor data for', place.name, ':', sensorData);
          
          // Get appropriate icon URL based on sensor data
          let iconUrl;
          if (sensorData) {
            const statusIcon = getMarkerIcon(sensorData);
            iconUrl = statusIcon.options.iconUrl;
          } else {
            iconUrl = farmIcon.options.iconUrl;
          }

          // Set icon size based on isSmall flag
          const iconSize = place.isSmall ? [20, 33] : [25, 41];
          const iconAnchor = place.isSmall ? [10, 33] : [12, 41];
          const labelClass = place.isSmall ? 'marker-label small' : 'marker-label';

          // Update marker icon while preserving label and size
          const updatedIcon = L.divIcon({
            className: 'marker-container',
            html: `
              <div class="${labelClass}">${place.name}</div>
              <div class="marker-icon-custom${isCritical(sensorData) ? ' critical' : ''}" style="background-image: url('${iconUrl}'); ${place.isSmall ? 'transform: scale(0.8);' : ''}""></div>
            `,
            iconSize: iconSize,
            iconAnchor: iconAnchor,
            popupAnchor: [1, -34]
          });
          
          marker.setIcon(updatedIcon);

          // Update popup content
          let popupContent = `
            <div class="farm-popup">
              <div class="farm-popup-title" onclick="showFarmDetails('${place.farmId}', '${place.name}')">
                <i class="fas fa-warehouse"></i> ${place.name}
              </div>
          `;

          if (sensorData) {
            const timestamp = new Date(sensorData.created_at).toLocaleString();
            popupContent += `
              <div class="sensor-data">
                <div class="sensor-row">
                  <i class="fas fa-thermometer-half"></i>
                  <span class="sensor-label">Temperature:</span>
                  <span class="sensor-value ${getStatusClass(sensorData.temperature, 'temperature')}">${sensorData.temperature}°C</span>
                </div>
                <div class="sensor-row">
                  <i class="fas fa-tint"></i>
                  <span class="sensor-label">Humidity:</span>
                  <span class="sensor-value ${getStatusClass(sensorData.humidity, 'humidity')}">${sensorData.humidity}%</span>
                </div>
                <div class="sensor-row">
                  <i class="fas fa-flask"></i>
                  <span class="sensor-label">pH Level:</span>
                  <span class="sensor-value ${getStatusClass(sensorData.ph, 'ph')}">${sensorData.ph}</span>
                </div>
                <div class="sensor-row">
                  <i class="fas fa-wind"></i>
                  <span class="sensor-label">Ammonia:</span>
                  <span class="sensor-value ${getStatusClass(sensorData.Ammonia, 'Ammonia')}">${sensorData.Ammonia} ppm</span>
                </div>
                <div class="sensor-timestamp">
                  <i class="fas fa-clock"></i> ${timestamp}
                </div>
              </div>
            `;
          } else {
            popupContent += `
              <div class="no-data">
                <i class="fas fa-exclamation-circle"></i> Waiting for sensor data...
              </div>
            `;
          }

          popupContent += '</div>';

          // Update popup content if popup is open
          if (marker.isPopupOpen()) {
            marker.setPopupContent(popupContent);
          } else {
            marker.bindPopup(popupContent, {
              maxWidth: 300,
              className: 'farm-popup-container'
            });
          }

        } catch (error) {
          console.error(`Error updating marker for farm ${farmId}:`, error);
        }
      }

      // Update hotspots for each phase
      customZones.forEach(zone => {
        createHotspotOverlay(zone);
      });

      // Update phase colors after updating all markers
      updatePhaseColors();
    }

    // Function to check if sensor values are at critical levels
    function isCritical(sensorData) {
      if (!sensorData) return false;

      const thresholds = {
        temperature: { critical: 35 },
        humidity: { critical: 70 },
        Ammonia: { critical: 14 },
        ph: { warningLow: 6, warningHigh: 8 }
      };

      return sensorData.temperature > thresholds.temperature.critical ||
             sensorData.humidity > thresholds.humidity.critical ||
             sensorData.Ammonia > thresholds.Ammonia.critical ||
             sensorData.ph < thresholds.ph.warningLow ||
             sensorData.ph > thresholds.ph.warningHigh;
    }

    // Update addFarmMarkers function to initially hide markers
    async function addFarmMarkers() {
      console.log('Adding farm markers...');
      markers.clear();
      
      for (const place of customPlaces) {
        try {
          console.log('Processing place:', place.name);
          
          const sensorData = await getLatestFarmData(place.farmId);
          console.log('Sensor data for', place.name, ':', sensorData);
          
          let iconUrl;
          if (sensorData) {
            const statusIcon = getMarkerIcon(sensorData);
            iconUrl = statusIcon.options.iconUrl;
          } else {
            iconUrl = farmIcon.options.iconUrl;
          }

          // Set consistent icon sizes
          const iconSize = place.isSmall ? [20, 33] : [25, 41];
          const iconAnchor = place.isSmall ? [10, 33] : [12, 41];
          const labelClass = place.isSmall ? 'marker-label small' : 'marker-label';
          
          const combinedIcon = L.divIcon({
            className: 'marker-container',
            html: `
              <div class="${labelClass}">${place.name}</div>
              <div class="marker-icon-custom${isCritical(sensorData) ? ' critical' : ''}" style="background-image: url('${iconUrl}'); ${place.isSmall ? 'transform: scale(0.8);' : ''}""></div>
            `,
            iconSize: iconSize,
            iconAnchor: iconAnchor,
            popupAnchor: [1, -34]
          });

          let popupContent = `
            <div class="farm-popup">
              <div class="farm-popup-title" onclick="showFarmDetails('${place.farmId}', '${place.name}')">
                <i class="fas fa-warehouse"></i> ${place.name}
              </div>
          `;

          if (sensorData) {
            const timestamp = new Date(sensorData.created_at).toLocaleString();
            popupContent += `
              <div class="sensor-data">
                <div class="sensor-row">
                  <i class="fas fa-thermometer-half"></i>
                  <span class="sensor-label">Temperature:</span>
                  <span class="sensor-value ${getStatusClass(sensorData.temperature, 'temperature')}">${sensorData.temperature}°C</span>
                </div>
                <div class="sensor-row">
                  <i class="fas fa-tint"></i>
                  <span class="sensor-label">Humidity:</span>
                  <span class="sensor-value ${getStatusClass(sensorData.humidity, 'humidity')}">${sensorData.humidity}%</span>
                </div>
                <div class="sensor-row">
                  <i class="fas fa-flask"></i>
                  <span class="sensor-label">pH Level:</span>
                  <span class="sensor-value ${getStatusClass(sensorData.ph, 'ph')}">${sensorData.ph}</span>
                </div>
                <div class="sensor-row">
                  <i class="fas fa-wind"></i>
                  <span class="sensor-label">Ammonia:</span>
                  <span class="sensor-value ${getStatusClass(sensorData.Ammonia, 'Ammonia')}">${sensorData.Ammonia} ppm</span>
                </div>
                <div class="sensor-timestamp">
                  <i class="fas fa-clock"></i> ${timestamp}
                </div>
              </div>
            `;
          } else {
            popupContent += `
              <div class="no-data">
                <i class="fas fa-exclamation-circle"></i> Waiting for sensor data...
              </div>
            `;
          }

          popupContent += '</div>';

          // Create marker but don't add to map yet
          const marker = L.marker([place.lat, place.lng], { 
            icon: combinedIcon,
            riseOnHover: true
          })
          .bindPopup(popupContent, {
            maxWidth: 300,
            className: 'farm-popup-container'
          });

          marker.on('click', () => {
            console.log('Marker clicked for:', place.name);
          });

          // Store marker reference
          markers.set(place.farmId, marker);

        } catch (error) {
          console.error(`Error adding marker for ${place.name}:`, error);
        }
      }

      // Start polling for updates
      if (markerUpdateInterval) {
        clearInterval(markerUpdateInterval);
      }
      markerUpdateInterval = setInterval(fetchSensorDataAndUpdateMarkers, 5000);
    }

    // Update initMap to clear interval when map is destroyed
    async function initMap() {
      console.log('InitMap called');
      const mapContainer = document.getElementById('map');

      if (!mapContainer) {
        console.error('Map container not found');
        return;
      }

      // Clear existing map instance and polling interval
      if (map) {
        console.log('Removing existing map');
        if (markerUpdateInterval) {
          clearInterval(markerUpdateInterval);
        }
        markers.clear();
        map.remove();
        map = null;
      }

      try {
        console.log('Creating new map instance');
        map = L.map('map', {
          zoomControl: true,
          scrollWheelZoom: true,
          tap: true // Enable tap for touch devices
        }).setView(DEFAULT_CENTER, DEFAULT_ZOOM);

        // Add tile layer
        L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
          attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>',
          id: 'mapbox/streets-v11',
          tileSize: 512,
          zoomOffset: -1,
          accessToken: 'pk.eyJ1IjoicHJha2FzaDIyMSIsImEiOiJjbWNtdGxiNWUwYzNuMmtzOHJ2Ym5icjB2In0.RhRBMWIGdcO-XYrFN3EfaQ'
        }).addTo(map);

        // Initialize draw controls
        const drawnItems = new L.FeatureGroup().addTo(map);
        
        const drawControl = new L.Control.Draw({
          position: 'topleft',
          draw: {
            polyline: false, // Disable line drawing
            circle: false,   // Disable circle drawing
            circlemarker: false, // Disable circle marker
            marker: false,   // Disable markers (we have our own marker system)
            polygon: {
              allowIntersection: false,
              drawError: {
                color: '#e1e100',
                message: '<strong>Error:</strong> Shape edges cannot cross!'
              },
              shapeOptions: {
                color: '#dc3545',
                fillColor: '#dc3545',
                fillOpacity: 0.2,
                weight: 3
              }
            },
            rectangle: {
              shapeOptions: {
                color: '#2c3e50',
                fillColor: '#2c3e50',
                fillOpacity: 0.2,
                weight: 3
              }
            }
          },
          edit: {
            featureGroup: drawnItems,
            remove: true,
            edit: {
              selectedPathOptions: {
                maintainColor: true,
                fillOpacity: 0.3
              }
            }
          }
        }).addTo(map);

        // Event handler for when a shape is created
        map.on(L.Draw.Event.CREATED, function(event) {
          const layer = event.layer;
          drawnItems.addLayer(layer);

          // Get coordinates of the drawn shape
          let coordinates;
          if (layer instanceof L.Polygon || layer instanceof L.Rectangle) {
            const latlngs = layer.getLatLngs();
            // Handle both flat and nested arrays using isFlat
            coordinates = L.LineUtil.isFlat(latlngs) ? 
              latlngs.map(latlng => [latlng.lat, latlng.lng]) :
              latlngs[0].map(latlng => [latlng.lat, latlng.lng]);
            
            // Display coordinates
            showCoordinates({
              type: event.layerType,
              coordinates: coordinates
            });
          }
        });

        // Event handler for when a shape is edited
        map.on(L.Draw.Event.EDITED, function(event) {
          const layers = event.layers;
          const updatedShapes = [];
          
          layers.eachLayer(function(layer) {
            if (layer instanceof L.Polygon || layer instanceof L.Rectangle) {
              const latlngs = layer.getLatLngs();
              // Handle both flat and nested arrays using isFlat
              const coordinates = L.LineUtil.isFlat(latlngs) ? 
                latlngs.map(latlng => [latlng.lat, latlng.lng]) :
                latlngs[0].map(latlng => [latlng.lat, latlng.lng]);
              
              updatedShapes.push({
                type: layer instanceof L.Rectangle ? 'rectangle' : 'polygon',
                coordinates: coordinates
              });
            }
          });

          // Display coordinates of all updated shapes
          if (updatedShapes.length > 0) {
            showCoordinates(updatedShapes.length === 1 ? updatedShapes[0] : updatedShapes);
          }
        });

        // Event handler for when a shape is deleted
        map.on(L.Draw.Event.DELETED, function(event) {
          hideCoordinatesPanel();
          console.log('Shape(s) deleted');
        });

        // Function to show coordinates panel
        function showCoordinates(data) {
          const panel = document.getElementById('coordinatesPanel');
          const display = document.getElementById('coordinatesDisplay');
          
          // Format coordinates with 6 decimal places
          const formattedData = JSON.stringify(data, (key, value) => {
            if (typeof value === 'number') {
              return Number(value.toFixed(6));
            }
            return value;
          }, 2);
          
          display.textContent = formattedData;
          panel.style.display = 'block';
        }

        // Function to hide coordinates panel
        function hideCoordinatesPanel() {
          document.getElementById('coordinatesPanel').style.display = 'none';
        }

        // Function to copy coordinates to clipboard
        function copyCoordinates() {
          const display = document.getElementById('coordinatesDisplay');
          const text = display.textContent;
          
          navigator.clipboard.writeText(text).then(() => {
            // Show temporary success message
            const copyBtn = document.querySelector('.copy-btn');
            const originalHTML = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            copyBtn.style.color = '#28a745';
            
            setTimeout(() => {
              copyBtn.innerHTML = originalHTML;
              copyBtn.style.color = '';
            }, 2000);
          }).catch(err => {
            console.error('Failed to copy coordinates:', err);
            // Show error message
            const copyBtn = document.querySelector('.copy-btn');
            const originalHTML = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error';
            copyBtn.style.color = '#dc3545';
            
            setTimeout(() => {
              copyBtn.innerHTML = originalHTML;
              copyBtn.style.color = '';
            }, 2000);
          });
        }

        // Add custom zones to the map
        addCustomZones();

        // Add farm markers directly here instead of using fetchFarmsAndSensors
        await addFarmMarkers();

        // Set up search inputs
        setupSearchInputs();

        // Check if running in emulator/devtools
        const isEmulator = window.navigator.userAgent.includes('Chrome DevTools');
        console.log('Running in emulator:', isEmulator);

        // Request user's location with better error handling
        if (navigator.geolocation) {
          console.log('Checking location permission...');

          const geolocationOptions = {
            enableHighAccuracy: !isEmulator, // Disable high accuracy in emulator
            timeout: isEmulator ? 5000 : 30000, // Shorter timeout for emulator
            maximumAge: isEmulator ? 0 : 5000 // No cache for emulator
          };

          // Function to handle successful location
          const handleLocation = (position) => {
            try {
              console.log('Got location:', position);
              const latlng = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              };
              
              // Create/update marker
              if (userMarker) userMarker.remove();
              userMarker = L.marker([latlng.lat, latlng.lng], {
                icon: currentLocationIcon
              })
              .addTo(map)
              .bindPopup('Your Current Location')
              .openPopup();
              
              userLatLng = latlng;

              // Calculate bounds for 2km × 2km area (approximately 0.018 degrees)
              const offset = 0.009; // ~1km in degrees
              const bounds = L.latLngBounds(
                [latlng.lat - offset, latlng.lng - offset], // Southwest corner
                [latlng.lat + offset, latlng.lng + offset]  // Northeast corner
              );

              // Fit map to bounds with slight padding
              map.fitBounds(bounds, {
                padding: [20, 20], // Add 20px padding
                maxZoom: 16 // Prevent zooming in too close
              });
              
              return true;
            } catch (error) {
              console.error('Error handling location:', error);
              showLocationError('Error setting up map view');
              return false;
            }
          };

          // Function to handle location error
          const handleError = (error) => {
            console.error('Geolocation error:', error);
            let errorMessage = '';
            
            // Special handling for emulator
            if (isEmulator) {
              errorMessage = 'Location not available in emulator mode.\n' +
                           'Please test on a real device or use the search box to enter locations.';
            } else {
              switch(error.code) {
                case error.PERMISSION_DENIED:
                  errorMessage = 'Location access denied. Please enable location services.';
                  break;
                case error.POSITION_UNAVAILABLE:
                  errorMessage = 'Location information unavailable. Please try again.';
                  break;
                case error.TIMEOUT:
                  errorMessage = 'Location request timed out. Please try again.';
                  break;
                default:
                  errorMessage = 'Error getting location. Please try again.';
              }
            }
            
            // Show error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'location-error';
            errorDiv.textContent = errorMessage;
            mapContainer.appendChild(errorDiv);
            
            // Remove error message after 5 seconds
            setTimeout(() => {
              errorDiv.remove();
            }, 5000);
          };

          // Try to get location
          navigator.geolocation.getCurrentPosition(
            handleLocation,
            handleError,
            geolocationOptions
          );

        } else {
          console.error('Geolocation is not supported');
          alert('Your browser doesn\'t support geolocation. Please use the search box.');
        }

        // Force map to update its size
        setTimeout(() => {
          console.log('Forcing map resize');
          map.invalidateSize(true);
        }, 200);

      } catch (error) {
        console.error('Error creating map:', error);
      }
    }

    // Start the map when switching to map tab
    function switchTab(tabName) {
      console.log('Switching to tab:', tabName);
      
      // Hide all tab contents
      document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
        tab.style.display = 'none';
      });
      
      // Show selected tab content
      const selectedTab = document.getElementById(tabName + 'Tab');
      if (selectedTab) {
        selectedTab.classList.add('active');
        selectedTab.style.display = 'block';
      }
      
      // Update tab buttons
      document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
      });
      const selectedTabBtn = document.querySelector(`.tab[onclick="switchTab('${tabName}')"]`);
      if (selectedTabBtn) {
        selectedTabBtn.classList.add('active');
      }

      // Update sidebar
      document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
      });
      const sidebarItem = document.querySelector(`.nav-item[onclick="switchTab('${tabName}')"]`);
      if (sidebarItem) {
        sidebarItem.classList.add('active');
      }

      // Special handling for map tab
      if (tabName === 'map') {
        console.log('Map tab selected');
        // Make sure the map container is visible first
        selectedTab.style.display = 'block';
        // Initialize map
        setTimeout(() => {
          console.log('Initializing map...');
          initMap();
        }, 100);
      } else if (tabName === 'analytics') {
        updateAnalytics();
      } else if (tabName === 'farmOwner') {
        loadPersonalInfo();
      } else if (tabName === 'overview') {
        fetchData();
      } else if (tabName === 'settings') {
        loadSettings();
      }

      // Clear polling interval when switching away from map tab
      if (tabName !== 'map' && markerUpdateInterval) {
        clearInterval(markerUpdateInterval);
        markerUpdateInterval = null;
      }

      // Clear watch position if leaving map tab
      if (tabName !== 'map' && map && map.watchId) {
        navigator.geolocation.clearWatch(map.watchId);
        map.watchId = null;
      }
    }

    async function fetchHistoricalData(timeRange) {
      const now = new Date();
      let startTime;

      switch(timeRange) {
        case '24h':
          startTime = new Date(now - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startTime = new Date(now - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startTime = new Date(now - 30 * 24 * 60 * 60 * 1000);
          break;
      }

      const { data, error } = await client
        .from('sensor_data')
        .select('*')
        .gte('created_at', startTime.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    }

    function calculateStats(data, field) {
      const values = data.map(row => row[field]);
      return {
        min: Math.min(...values).toFixed(1),
        max: Math.max(...values).toFixed(1),
        avg: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)
      };
    }

    function updateChart(chartId, label, data, color) {
      const ctx = document.getElementById(chartId).getContext('2d');
      
      if (charts[chartId]) {
        charts[chartId].destroy();
      }

      charts[chartId] = new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.map(row => new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
          datasets: [{
            label: label,
            data: data.map(row => {
              if (label === 'Ammonia') {
                return row['Ammonia'];
              }
              return row[label.toLowerCase()];
            }),
            borderColor: color,
            tension: 0.4,
            fill: false,
            pointRadius: 2,
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              titleColor: '#333',
              bodyColor: '#666',
              borderColor: '#ddd',
              borderWidth: 1,
              padding: 8,
              displayColors: false,
              callbacks: {
                title: (tooltipItems) => {
                  return tooltipItems[0].label;
                },
                label: (context) => {
                  return `${label}: ${context.parsed.y}${getUnit(label)}`;
                }
              }
            }
          },
          scales: {
            x: {
              grid: {
                display: false
              },
              ticks: {
                maxRotation: 0,
                maxTicksLimit: 6,
                font: {
                  size: 10
                }
              }
            },
            y: {
              beginAtZero: true,
              grid: {
                color: '#f0f0f0'
              },
              ticks: {
                font: {
                  size: 10
                }
              }
            }
          },
          interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
          }
        }
      });
    }

    function getUnit(label) {
      switch(label) {
        case 'Temperature':
          return '°C';
        case 'Humidity':
          return '%';
        case 'Ammonia':
          return 'ppm';
        case 'Ph':
          return '';
        default:
          return '';
      }
    }

    async function updateAnalytics() {
      try {
        const timeRange = document.getElementById('timeRange').value;
        const data = await fetchHistoricalData(timeRange);

        // Update charts
        updateChart('temperatureChart', 'Temperature', data, '#ff6b6b');
        updateChart('humidityChart', 'Humidity', data, '#4dabf7');
        updateChart('ammoniaChart', 'Ammonia', data, '#51cf66');
        updateChart('phChart', 'Ph', data, '#ffd43b');

        // Update statistics
        const tempStats = calculateStats(data, 'temperature');
        const humidityStats = calculateStats(data, 'humidity');
        const ammoniaStats = calculateStats(data, 'Ammonia');
        const phStats = calculateStats(data, 'ph');

        document.getElementById('tempStats').innerHTML = `
          <div class="stat-item">
            <span class="stat-label">Average Temperature</span>
            <span class="stat-value">${tempStats.avg}°C</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Min Temperature</span>
            <span class="stat-value">${tempStats.min}°C</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Max Temperature</span>
            <span class="stat-value">${tempStats.max}°C</span>
          </div>
        `;

        // Calculate alert statistics
        const totalAlerts = data.reduce((count, row) => {
          let alerts = 0;
          if (row.temperature > 35) alerts++;
          if (row.humidity > 70) alerts++;
          if (row.Ammonia > 40) alerts++;
          if (row.ph < 6 || row.ph > 8) alerts++;
          return count + alerts;
        }, 0);

        document.getElementById('alertStats').innerHTML = `
          <div class="stat-item">
            <span class="stat-label">Total Alerts</span>
            <span class="stat-value">${totalAlerts}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Alert Rate</span>
            <span class="stat-value">${((totalAlerts / data.length) * 100).toFixed(1)}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Data Points</span>
            <span class="stat-value">${data.length}</span>
          </div>
        `;

      } catch (error) {
        showError('Error updating analytics: ' + error.message);
      }
    }

    // Add CSS for photo display
    const style = document.createElement('style');
    style.textContent = `
      @keyframes markerBlink {
        0% { transform: scale(1); opacity: 1; }
        20% { transform: scale(1.4); opacity: 0.7; }
        100% { transform: scale(1); opacity: 1; }
      }

      /* Bell shake animation - temporarily disabled
      @keyframes bellShake {
        0% { transform: rotate(0); }
        25% { transform: rotate(10deg); }
        50% { transform: rotate(0); }
        75% { transform: rotate(-10deg); }
        100% { transform: rotate(0); }
      }
      */

      .marker-icon-custom.critical {
        animation: markerBlink 1s infinite;
      }

      .profile-photo {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 15px;
      }

      .photo-container {
        width: 150px;
        height: 150px;
        border-radius: 50%;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f8f9fa;
        border: 2px solid #dee2e6;
        position: relative;
      }

      .photo-container img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        position: absolute;
        top: 0;
        left: 0;
      }

      .photo-container i {
        font-size: 60px;
        color: #adb5bd;
      }

      .upload-btn {
        background: #007bff;
        color: white;
        border: none;
        border-radius: 5px;
        padding: 8px 15px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 14px;
      }

      .upload-btn:hover {
        background: #0056b3;
      }

      .loading-spinner {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        width: 100%;
        position: absolute;
        top: 0;
        left: 0;
        background: rgba(255, 255, 255, 0.8);
      }

      .loading-spinner i {
        font-size: 2em;
        color: #007bff;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);

    async function handlePhotoUpload(event) {
      try {
        const file = event.target.files[0];
        if (!file) return;

        // Check file type
        if (!file.type.startsWith('image/')) {
          alert('Please upload an image file');
          return;
        }

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('Please upload an image smaller than 5MB');
          return;
        }

        // Show loading state
        const photoPreview = document.getElementById('photoPreview');
        photoPreview.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i></div>';

        // Read and display the image
        const reader = new FileReader();
        reader.onload = async function(e) {
          try {
            // Get existing data first
            const { data: existingData, error: fetchError } = await client
              .from('sensor_data')
              .select('*')
              .order('created_at', { ascending: false })
              .limit(1);

            if (fetchError) throw fetchError;

            // Create a temporary image to get dimensions
            const img = new Image();
            img.onload = async function() {
              try {
                // Prepare update data
                const updateData = {
                  ...(existingData && existingData[0] ? existingData[0] : {}),
                  owner_name: document.getElementById('ownerName').value,
                  aadhaar_number: document.getElementById('aadhaarNumber').value,
                  contact_number: document.getElementById('contactNumber').value,
                  email: document.getElementById('email').value,
                  photo: e.target.result
                };

                // Save to Supabase
                const { error: saveError } = await client
                  .from('sensor_data')
                  .upsert([updateData]);

                if (saveError) throw saveError;

                // Update preview only after successful save
                photoPreview.innerHTML = `
                  <img 
                    src="${e.target.result}" 
                    alt="Profile Photo" 
                    style="width: 100%; height: 100%; object-fit: cover;"
                  >`;
              } catch (error) {
                showError('Error saving photo: ' + error.message);
                loadPersonalInfo();
              }
            };
            img.src = e.target.result;
          } catch (error) {
            showError('Error processing photo: ' + error.message);
            loadPersonalInfo();
          }
        };

        reader.onerror = function() {
          showError('Error reading file');
          loadPersonalInfo();
        };

        reader.readAsDataURL(file);

      } catch (error) {
        showError('Error handling photo upload: ' + error.message);
        loadPersonalInfo();
      }
    }

    async function loadPersonalInfo() {
      try {
        const { data, error } = await client
          .from('sensor_data')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) throw error;
        
        if (data && data.length > 0) {
          const info = data[0];
          document.getElementById('ownerName').value = info.owner_name || '';
          document.getElementById('aadhaarNumber').value = info.aadhaar_number || '';
          document.getElementById('contactNumber').value = info.contact_number || '';
          document.getElementById('email').value = info.email || '';
        } else {
          // Reset form if no data
          document.getElementById('ownerName').value = '';
          
          document.getElementById('aadhaarNumber').value = '';
          document.getElementById('contactNumber').value = '';
          document.getElementById('email').value = '';
        }
      } catch (error) {
        showError('Error loading personal information: ' + error.message);
      }
    }

    async function savePersonalInfo() {
      try {
        const formData = {
          owner_name: document.getElementById('ownerName').value,
          
          aadhaar_number: document.getElementById('aadhaarNumber').value,
          contact_number: document.getElementById('contactNumber').value,
          email: document.getElementById('email').value
        };

        // Get existing data first
        const { data: existingData, error: fetchError } = await client
          .from('sensor_data')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1);

        if (fetchError) throw fetchError;

        // Prepare update data with existing data
        const updateData = {
          ...(existingData && existingData[0] ? existingData[0] : {}),
          ...formData
        };

        // Save to Supabase
        const { error: saveError } = await client
          .from('sensor_data')
          .upsert([updateData]);

        if (saveError) throw saveError;

        alert('Personal information saved successfully!');
        toggleEditMode('personal');
      } catch (error) {
        showError('Error saving personal information: ' + error.message);
      }
    }

    function toggleEditMode(section) {
      const form = document.getElementById('personalInfoForm');
      const inputs = form.getElementsByTagName('input');
      const buttons = form.getElementsByTagName('button');
      
      for (let input of inputs) {
        input.disabled = !input.disabled;
      }
      
      for (let button of buttons) {
        button.disabled = !button.disabled;
      }

      // Toggle edit button text
      const editBtn = document.querySelector('.edit-btn');
      if (editBtn) {
        if (inputs[0].disabled) {
          editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
        } else {
          editBtn.innerHTML = '<i class="fas fa-times"></i> Cancel';
        }
      }
    }

    // Settings related functions
    let refreshInterval;
    let currentSettings = {
      emailNotifications: false,
      smsNotifications: false,
      tempThreshold: 35,
      humidityThreshold: 70,
      ammoniaThreshold: 40,
      phThreshold: 8,
      refreshRate: 5000,
      darkMode: false,
      tempUnit: 'celsius'
    };

    // Load settings from localStorage
    async function loadSettings() {
      // First check if user is authenticated
      const { data: { user }, error } = await client.auth.getUser();
      if (error || !user) {
        console.error('User not authenticated:', error);
        window.location.href = 'Index.html?logout=true';
        return;
      }

      const savedSettings = localStorage.getItem('dashboardSettings');
      if (savedSettings) {
        currentSettings = { ...currentSettings, ...JSON.parse(savedSettings) };
        
        // Apply saved settings to UI
        document.getElementById('emailNotifications').checked = currentSettings.emailNotifications;
        document.getElementById('smsNotifications').checked = currentSettings.smsNotifications;
        document.getElementById('tempThreshold').value = currentSettings.tempThreshold;
        document.getElementById('humidityThreshold').value = currentSettings.humidityThreshold;
        document.getElementById('ammoniaThreshold').value = currentSettings.ammoniaThreshold;
        document.getElementById('phThreshold').value = currentSettings.phThreshold;
        document.getElementById('refreshRate').value = currentSettings.refreshRate;
        document.getElementById('darkMode').checked = currentSettings.darkMode;
        document.getElementById('tempUnit').value = currentSettings.tempUnit;

        // Apply dark mode if enabled
        if (currentSettings.darkMode) {
          document.body.classList.add('dark-mode');
        }

        // Update refresh interval
        updateRefreshRate();
      }

      // Update last updated time
      document.getElementById('lastUpdated').textContent = new Date().toLocaleString();
    }

    // Save settings to localStorage
    function saveSettings() {
      localStorage.setItem('dashboardSettings', JSON.stringify(currentSettings));
    }

    // Update notification settings
    function updateNotificationSettings() {
      currentSettings.emailNotifications = document.getElementById('emailNotifications').checked;
      currentSettings.smsNotifications = document.getElementById('smsNotifications').checked;
      saveSettings();
      
      // Show confirmation message
      showToast('Notification settings updated');
    }

    // Update alert thresholds
    function updateThresholds() {
      currentSettings.tempThreshold = parseFloat(document.getElementById('tempThreshold').value);
      currentSettings.humidityThreshold = parseFloat(document.getElementById('humidityThreshold').value);
      currentSettings.ammoniaThreshold = parseFloat(document.getElementById('ammoniaThreshold').value);
      currentSettings.phThreshold = parseFloat(document.getElementById('phThreshold').value);
      saveSettings();
      
      // Update the alerts system with new thresholds
      fetchData();
      showToast('Alert thresholds updated');
    }

    // Update data refresh rate
    function updateRefreshRate() {
      const newRate = parseInt(document.getElementById('refreshRate').value);
      currentSettings.refreshRate = newRate;
      saveSettings();

      // Clear existing interval and set new one
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
      refreshInterval = setInterval(fetchData, newRate);
      showToast(`Refresh rate updated to ${newRate/1000} seconds`);
    }

    // Toggle dark mode
    function toggleDarkMode() {
      currentSettings.darkMode = document.getElementById('darkMode').checked;
      if (currentSettings.darkMode) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
      saveSettings();
      showToast('Display mode updated');
    }

    // Update temperature unit
    function updateTempUnit() {
      currentSettings.tempUnit = document.getElementById('tempUnit').value;
      saveSettings();
      
      // Refresh data to update temperature displays
      fetchData();
      showToast('Temperature unit updated');
    }

    // Toast notification function
    function showToast(message) {
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = message;
      document.body.appendChild(toast);

      // Remove toast after 3 seconds
      setTimeout(() => {
        toast.remove();
      }, 3000);
    }

    // Initialize settings on page load
    window.addEventListener('load', () => {
      loadSettings();
    });

    // Update getLatestFarmData to fetch from Supabase for all farms
    async function getLatestFarmData(farmId) {
      if (!farmId) return null;
      
      try {
        console.log('Fetching data for farm:', farmId);
        const { data, error } = await client
          .from('sensor_data')
          .select('*')
          .eq('farm_id', farmId)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error('Error fetching farm data:', error);
          return null;
        }

        console.log('Received sensor data:', data);
        return data && data.length > 0 ? data[0] : null;
      } catch (error) {
        console.error('Error in getLatestFarmData:', error);
        return null;
      }
    }

    // Modified searchLocation function
    async function searchLocation(query, isStart) {
      console.log('Searching for:', query, 'isStart:', isStart);
      if (!query || !map) {
        console.error('No query or map not initialized');
        return;
      }

      const inputField = isStart ? document.getElementById('startLocation') : document.getElementById('destLocation');
      inputField.blur(); // Hide mobile keyboard after search

      try {
        // Show loading state
        inputField.style.backgroundColor = '#f0f0f0';
        
        // First check custom places
        const searchQuery = query.toLowerCase().trim();
        const customPlace = customPlaces.find(place => 
          place.name.toLowerCase().includes(searchQuery)
        );

        if (customPlace) {
          console.log('Found custom place:', customPlace);
          const latlng = { lat: customPlace.lat, lng: customPlace.lng };
          if (isStart) {
            setUserLocation(latlng, true);
          } else {
            setDestinationLocation(latlng, true);
          }
          inputField.style.backgroundColor = '';
          return;
        }

        // If not a custom place, use Nominatim geocoding with better parameters for India
        console.log('Using Nominatim for:', query);
        const searchParams = new URLSearchParams({
          format: 'json',
          q: query + ', Kolkata, West Bengal, India', // Add city and state context
          addressdetails: 1,
          countrycodes: 'in',
          limit: 5, // Get more results to find best match
          namedetails: 1
        });

        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?${searchParams.toString()}`,
          {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'PoultryFarmMonitor/1.0'
            }
          }
        );

        if (!response.ok) {
          throw new Error('Geocoding request failed');
        }

        const data = await response.json();
        console.log('Geocoding response:', data);

        // Filter results to prioritize exact matches and locations in Kolkata
        const results = data.filter(result => {
          const inKolkata = result.address && 
            (result.address.city === 'Kolkata' || 
             result.address.state_district === 'Kolkata' ||
             result.address.suburb?.includes('Kolkata'));
          return inKolkata;
        });

        if (results.length > 0) {
          const result = results[0]; // Take the best match
          const latlng = {
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon)
          };
          console.log('Found location:', latlng);
          
          if (isStart) {
            setUserLocation(latlng, true);
          } else {
            setDestinationLocation(latlng, true);
          }

          // Format display name more naturally
          let displayName = '';
          if (result.address) {
            const parts = [];
            if (result.address.road) parts.push(result.address.road);
            if (result.address.suburb) parts.push(result.address.suburb);
            if (result.address.city) parts.push(result.address.city);
            displayName = parts.join(', ');
          } else {
            displayName = result.display_name.split(',')[0];
          }
          inputField.value = displayName || query;

          // Zoom to location with appropriate bounds
          const bounds = L.latLngBounds(
            [latlng.lat - 0.01, latlng.lng - 0.01],
            [latlng.lat + 0.01, latlng.lng + 0.01]
          );
          map.fitBounds(bounds);

          // Clear any existing error messages
          const existingError = document.querySelector('.location-error');
          if (existingError) {
            existingError.remove();
          }
        } else {
          console.log('No results found in Kolkata');
          showLocationError('Location not found in Kolkata. Please try a more specific search term.');
        }
      } catch (error) {
        console.error('Search error:', error);
        showLocationError('Error searching for location. Please try again.');
      } finally {
        // Reset loading state
        inputField.style.backgroundColor = '';
      }
    }

    // Helper function to show location errors
    function showLocationError(message) {
      // Remove any existing error message
      const existingError = document.querySelector('.location-error');
      if (existingError) {
        existingError.remove();
      }

      // Create and show new error message
      const errorDiv = document.createElement('div');
      errorDiv.className = 'location-error';
      errorDiv.textContent = message;
      document.querySelector('.map-wrapper').appendChild(errorDiv);

      // Remove error message after 3 seconds
      setTimeout(() => {
        if (errorDiv.parentNode) {
          errorDiv.remove();
        }
      }, 3000);
    }

    // Add predefined locations for Kolkata
    const kolkataLocations = {
      'Eco Park': { lat: 22.6025, lng: 88.4661 },
      'Science City': { lat: 22.5401, lng: 88.3965 },
      'Victoria Memorial': { lat: 22.5448, lng: 88.3426 },
      'Salt Lake': { lat: 22.5806, lng: 88.4106 },
      'New Town': { lat: 22.5802, lng: 88.4594 }
    };

    // Update setupSearchInputs to include location suggestions
    function setupSearchInputs() {
      console.log('Setting up search inputs');
      const startInput = document.getElementById('startLocation');
      const destInput = document.getElementById('destLocation');

      if (!startInput || !destInput) {
        console.error('Search inputs not found');
        return;
      }

      // Create datalist for suggestions
      const datalist = document.createElement('datalist');
      datalist.id = 'locationSuggestions';
      
      // Add predefined locations to datalist
      Object.keys(kolkataLocations).forEach(location => {
        const option = document.createElement('option');
        option.value = location;
        datalist.appendChild(option);
      });

      // Add datalist to document
      document.body.appendChild(datalist);

      // Connect inputs to datalist
      [startInput, destInput].forEach(input => {
        input.setAttribute('list', 'locationSuggestions');
      });

      // Function to handle search
      const handleSearch = (input, isStart) => {
        const query = input.value.trim();
        if (query) {
          // Check if it's a predefined location first
          if (kolkataLocations[query]) {
            const latlng = kolkataLocations[query];
            if (isStart) {
              setUserLocation(latlng, true);
            } else {
              setDestinationLocation(latlng, true);
            }
          } else {
            // Show loading indicator
            input.style.backgroundColor = '#f0f0f0';
            searchLocation(query, isStart);
          }
        }
      };

      // Add input event listeners for both inputs
      [startInput, destInput].forEach((input, index) => {
        const isStart = index === 0;
        const form = document.createElement('form');
        form.className = 'search-form';
        
        // Replace input with form wrapper
        input.parentNode.insertBefore(form, input);
        form.appendChild(input);

        // Add form submit handler
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          handleSearch(input, isStart);
        });

        // Add input event listeners
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch(input, isStart);
          }
        });

        // Add search button
        const searchButton = document.createElement('button');
        searchButton.type = 'submit';
        searchButton.className = 'search-button';
        searchButton.innerHTML = '<i class="fas fa-search"></i>';
        form.appendChild(searchButton);
      });

      // Add CSS for improved search experience
      const style = document.createElement('style');
      style.textContent = `
        .search-form {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
        }
        .search-button {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          padding: 5px;
        }
        .search-button:hover {
          color: #333;
        }
        .search-form input[type="search"] {
          padding-right: 35px;
        }
        input[list] {
          background-color: #fff;
        }
        @media (max-width: 768px) {
          .search-button {
            padding: 8px;
          }
        }
      `;
      document.head.appendChild(style);
    }

    // Improved setUserLocation function
    function setUserLocation(latlng, openPopup = true) {
      console.log('Setting user location:', latlng);
      if (!map) {
        console.error('Map not initialized');
        return;
      }

      try {
        userLatLng = latlng;

        // Remove existing marker if it exists
        if (userMarker) {
          map.removeLayer(userMarker);
        }

        // Create new marker
        userMarker = L.marker([latlng.lat, latlng.lng], {
          icon: currentLocationIcon,
          draggable: true,
          title: 'Start Location'
        }).addTo(map);

        // Add drag event listener
        userMarker.on('dragend', function(e) {
          const newLatLng = e.target.getLatLng();
          userLatLng = { lat: newLatLng.lat, lng: newLatLng.lng };
          if (destLatLng) {
            drawRoute(userLatLng, destLatLng);
          }
        });

        // Update popup content
        userMarker.bindPopup('<b>Start Location</b><br>Drag to adjust position');
        if (openPopup) {
          userMarker.openPopup();
        }

        // Center map on marker with appropriate zoom
        if (!destLatLng) {
          map.setView([latlng.lat, latlng.lng], 15);
        } else {
          // If we have both points, fit bounds to show both
          const bounds = L.latLngBounds(
            [userLatLng.lat, userLatLng.lng],
            [destLatLng.lat, destLatLng.lng]
          );
          map.fitBounds(bounds, { padding: [50, 50] });
          drawRoute(userLatLng, destLatLng);
        }

        console.log('User marker added at:', latlng);
      } catch (error) {
        console.error('Error in setUserLocation:', error);
        showLocationError('Error setting start location marker');
      }
    }

    // Improved setDestinationLocation function
    function setDestinationLocation(latlng, openPopup = true) {
      console.log('Setting destination location:', latlng);
      if (!map) {
        console.error('Map not initialized');
        return;
      }

      try {
        destLatLng = latlng;

        // Remove existing marker if it exists
        if (searchMarker) {
          map.removeLayer(searchMarker);
        }

        // Create new marker
        searchMarker = L.marker([latlng.lat, latlng.lng], {
          icon: redIcon,
          draggable: true,
          title: 'Destination'
        }).addTo(map);

        // Add drag event listener
        searchMarker.on('dragend', function(e) {
          const newLatLng = e.target.getLatLng();
          destLatLng = { lat: newLatLng.lat, lng: newLatLng.lng };
          if (userLatLng) {
            drawRoute(userLatLng, destLatLng);
          }
        });

        // Update popup content
        searchMarker.bindPopup('<b>Destination</b><br>Drag to adjust position');
        if (openPopup) {
          searchMarker.openPopup();
        }

        // Adjust map view
        if (userLatLng) {
          // If we have both points, fit bounds to show both
          const bounds = L.latLngBounds(
            [userLatLng.lat, userLatLng.lng],
            [latlng.lat, latlng.lng]
          );
          map.fitBounds(bounds, { padding: [50, 50] });
          drawRoute(userLatLng, destLatLng);
        } else {
          // If only destination, center on it
          map.setView([latlng.lat, latlng.lng], 15);
        }

        console.log('Destination marker added at:', latlng);
      } catch (error) {
        console.error('Error in setDestinationLocation:', error);
        showLocationError('Error setting destination marker');
      }
    }

    // Improved drawRoute function
    function drawRoute(start, dest) {
      console.log('Drawing route from', start, 'to', dest);
      
      if (!start || !dest) {
        console.error('Invalid start or destination points');
        return;
      }

      try {
        if (routeControl) {
          map.removeControl(routeControl);
        }

        routeControl = L.Routing.control({
          waypoints: [
            L.latLng(start.lat, start.lng),
            L.latLng(dest.lat, dest.lng)
          ],
          lineOptions: {
            styles: [{ 
              color: '#0066FF',
              weight: 6,
              opacity: 0.8
            }],
            addWaypoints: false,
            extendToWaypoints: true,
            missingRouteTolerance: 0
          },
          routeWhileDragging: true,
          fitSelectedRoutes: false,
          showAlternatives: false,
          createMarker: function() { return null; }
        }).addTo(map);

        routeControl.on('routesfound', function(e) {
          console.log('Route found');
          const routes = e.routes;
          const summary = routes[0].summary;
          const distance = Math.round((summary.totalDistance / 1000) * 10) / 10;
          const time = Math.round(summary.totalTime / 60);

          const existingInfo = document.getElementById('routeInfo');
          if (existingInfo) {
            existingInfo.remove();
          }

          const routeInfo = document.createElement('div');
          routeInfo.id = 'routeInfo';
          routeInfo.innerHTML = `
            <i class="fas fa-road"></i>
            <span>Distance: ${distance} km (${time} mins)</span>
          `;
          document.querySelector('.map-wrapper').appendChild(routeInfo);

          // Adjust map bounds to show the entire route
          const bounds = L.latLngBounds([start, dest]);
          map.fitBounds(bounds, { 
            padding: [50, 50],
            maxZoom: 15
          });
        });

        routeControl.on('routingerror', function(e) {
          console.error('Routing error:', e);
          showLocationError('Could not calculate route between these points');
        });

      } catch (error) {
        console.error('Error drawing route:', error);
        showLocationError('Error drawing route');
      }
    }

    // Add this CSS for better marker visibility
    const markerStyle = document.createElement('style');
    markerStyle.textContent = `
      .leaflet-marker-icon {
        filter: drop-shadow(0 2px 2px rgba(0,0,0,0.5));
      }
      .leaflet-popup-content {
        font-size: 14px;
        line-height: 1.4;
      }
      .leaflet-popup-content b {
        display: block;
        margin-bottom: 4px;
        color: #333;
      }
    `;
    document.head.appendChild(markerStyle);

    // Add toggle function
    function toggleSearch() {
      const container = document.querySelector('.search-container');
      const toggle = document.querySelector('.search-toggle');
      container.classList.toggle('hidden');
      toggle.classList.toggle('collapsed');
      
      // Store preference
      const isHidden = container.classList.contains('hidden');
      localStorage.setItem('searchContainerHidden', isHidden);
    }

    // Add to window load event
    window.addEventListener('load', () => {
      // ... existing load handlers ...
      
      // Restore search container state
      const isHidden = localStorage.getItem('searchContainerHidden') === 'true';
      if (isHidden) {
        document.querySelector('.search-container').classList.add('hidden');
        document.querySelector('.search-toggle').classList.add('collapsed');
      }
    });

    // Function to calculate phase color based on majority marker condition
    function calculatePhaseColor(markers, phaseFarms) {
      // Filter markers for this phase
      const phaseMarkers = Array.from(markers.entries())
        .filter(([farmId]) => phaseFarms.includes(farmId));
      
      if (phaseMarkers.length === 0) return null;

      // Count markers by condition
      let redCount = 0, yellowCount = 0, greenCount = 0;
      
      phaseMarkers.forEach(([_, marker]) => {
        const iconUrl = marker.getIcon().options.html.match(/url\('([^']+)'\)/)[1];
        if (iconUrl.includes('red')) redCount++;
        else if (iconUrl.includes('yellow')) yellowCount++;
        else if (iconUrl.includes('green')) greenCount++;
      });

      const total = phaseMarkers.length;
      const redPercent = (redCount / total) * 100;
      const yellowPercent = (yellowCount / total) * 100;
      const greenPercent = (greenCount / total) * 100;

      // Determine majority color with slightly more saturated colors
      let majorityColor, borderColor;
      if (redCount >= yellowCount && redCount >= greenCount) {
        majorityColor = 'rgba(255, 180, 180, 1)'; // Slightly more saturated light red
        borderColor = 'rgba(255, 0, 0, 1)'; // Solid red for border
        majorityPercent = redPercent;
      } else if (yellowCount >= redCount && yellowCount >= greenCount) {
        majorityColor = 'rgba(255, 255, 180, 1)'; // Slightly more saturated light yellow
        borderColor = 'rgba(255, 255, 0, 1)'; // Solid yellow for border
        majorityPercent = yellowPercent;
      } else {
        majorityColor = 'rgba(180, 255, 180, 1)'; // Slightly more saturated light green
        borderColor = 'rgba(0, 255, 0, 1)'; // Solid green for border
        majorityPercent = greenPercent;
      }

      // Calculate opacity based on how dominant the majority is
      // Minimum 0.1 opacity, maximum 0.2 opacity for phases
      const opacity = 0.1 + (majorityPercent / 100) * 0.1;

      return {
        color: borderColor, // Use solid color for border
        fillColor: majorityColor,
        opacity: 0.9, // More prominent border
        fillOpacity: opacity,
        weight: 3, // Increased border weight
        dashArray: '8, 12' // Larger dash pattern
      };
    }

    // Function to update phase colors
    function updatePhaseColors() {
      customZones.forEach(zone => {
        const style = calculatePhaseColor(markers, zone.farms);
        if (style && map) {
          // Find and update the polygon for this zone
          map.eachLayer(layer => {
            if (layer instanceof L.Polygon && layer.farms && 
                JSON.stringify(layer.farms) === JSON.stringify(zone.farms)) {
              layer.setStyle(style);
            }
          });
        }
      });
    }

    // Function to create gradient overlay for hotspots
    function createHotspotOverlay(phase) {
      // Remove existing hotspot layer if any
      if (phase.hotspotLayer && map.hasLayer(phase.hotspotLayer)) {
        map.removeLayer(phase.hotspotLayer);
      }

      // Get markers in this phase
      const phaseMarkers = Array.from(markers.entries())
        .filter(([farmId]) => phase.farms.includes(farmId));
      
      if (phaseMarkers.length === 0) return;

      // Create a container for clipped hotspots
      const container = L.featureGroup();

      // Create the phase polygon for clipping
      const clipPolygon = L.polygon(phase.coordinates);
      const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
      clipPath.id = `clip-${phase.farms.join('-')}`;

      // Convert polygon coordinates to SVG path
      const points = clipPolygon.getLatLngs()[0].map(latLng => {
        const point = map.latLngToLayerPoint(latLng);
        return `${point.x},${point.y}`;
      }).join(' ');
      
      const clipShape = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      clipShape.setAttribute('points', points);
      clipPath.appendChild(clipShape);

      // Add the clipPath to the map's SVG
      const mapSvg = document.querySelector('.leaflet-overlay-pane svg');
      const defs = mapSvg.querySelector('defs') || mapSvg.insertBefore(
        document.createElementNS('http://www.w3.org/2000/svg', 'defs'),
        mapSvg.firstChild
      );
      defs.appendChild(clipPath);

      // Process each marker
      phaseMarkers.forEach(([_, marker]) => {
        const iconUrl = marker.getIcon().options.html.match(/url\('([^']+)'\)/)[1];
        let color, opacity;

        if (iconUrl.includes('red')) {
          color = '#8B0000'; // Dark red
          opacity = 0.85;
        } else if (iconUrl.includes('yellow')) {
          color = '#FF8C00'; // Dark orange
          opacity = 0.75;
        } else if (iconUrl.includes('green')) {
          color = '#006400'; // Dark green
          opacity = 0.65;
        }

        if (color) {
          const hotspot = L.circle(marker.getLatLng(), {
            radius: 90,
            color: color,
            fillColor: color,
            fillOpacity: opacity,
            opacity: 0.9,
            weight: 1,
            interactive: false,
            className: `clipped-hotspot-${phase.farms.join('-')}`
          });

          // Add gradient effect using CSS
          const circleElement = hotspot.getElement();
          if (circleElement) {
            circleElement.style.background = `radial-gradient(circle at center, 
              ${color} 0%, 
              ${color}cc 40%, // More opaque middle for darker colors
              ${color}00 100%
            )`;
          }

          container.addLayer(hotspot);
        }
      });

      // Add CSS for clipping
      const style = document.createElement('style');
      style.textContent = `
        .clipped-hotspot-${phase.farms.join('-')} {
          clip-path: url(#clip-${phase.farms.join('-')});
        }
      `;
      document.head.appendChild(style);

      // Add the container to the map
      container.addTo(map);
      phase.hotspotLayer = container;

      // Update clip path on zoom/pan
      map.on('zoom moveend', () => {
        const updatedPoints = clipPolygon.getLatLngs()[0].map(latLng => {
          const point = map.latLngToLayerPoint(latLng);
          return `${point.x},${point.y}`;
        }).join(' ');
        clipShape.setAttribute('points', updatedPoints);
      });
    }

    // Add map zoom handler to update hotspot positions
    map.on('zoomend moveend', () => {
      customZones.forEach(zone => {
        createHotspotOverlay(zone);
      });
    });

    async function logout() {
      try {
        // Check if client is initialized
        if (!client) {
          console.error('Supabase client not initialized');
          window.location.replace('Index.html');
          return;
        }

        // Clear all storage
        localStorage.clear();
        sessionStorage.clear();
        
        // Sign out from Supabase and kill the session
        const { error } = await client.auth.signOut();
        
        if (error) {
          console.error('Logout error:', error);
        }

        // Force clear the Supabase session
        await client.auth.setSession(null);
        
        // Add a parameter to prevent automatic login
        window.location.replace('Index.html?logout=true');
      } catch (err) {
        console.error('Unexpected logout error:', err);
        // Still try to redirect with logout parameter
        window.location.replace('Index.html?logout=true');
      }
    }

    // Add these variables at the top with other chart-related variables
    let farmDetailsCharts = {
      temperature: null,
      humidity: null,
      ammonia: null,
      ph: null
    };

    // Add this function to get farm details from customPlaces array
    function getFarmDetails(farmId) {
      return customPlaces.find(place => place.farmId === farmId);
    }

    // Add this function to fetch farm details from database
    async function getFarmDetailsFromDB(farmId) {
      try {
        const { data, error } = await client
          .from('farms')
          .select(`
            *,
            owner:farm_owners(
              name,
              contact_number,
              email,
              aadhaar_number
            )
          `)
          .eq('id', farmId)
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error fetching farm details:', error);
        return null;
      }
    }

    // Add this function to show farm details
    async function showFarmDetails(farmId, farmName) {
      // Show the farm details tab
      const farmDetailsTab = document.getElementById('farmDetailsTab');
      farmDetailsTab.style.display = 'inline-block';
      switchTab('farmDetails');

      try {
        // Fetch farm details from database
        const farmData = await getFarmDetailsFromDB(farmId);
        
        // Update basic farm information
        document.getElementById('farmDetailsName').textContent = farmName;
        document.getElementById('farmDetailsId').textContent = farmId;
        document.getElementById('farmCoordinates').textContent = `${farmData.latitude}, ${farmData.longitude}`;
        
        // Fetch latest sensor data
        const { data: sensorData, error: sensorError } = await supabase
            .from('sensor_data')
            .select('*')
            .eq('farm_id', farmId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (sensorError) throw sensorError;

        // Update current sensor data display
        const sensorGrid = document.getElementById('currentSensorData');
        sensorGrid.innerHTML = `
            <div class="sensor-item ${getStatusClass(sensorData.temperature, 'temperature')}">
                <i class="fas fa-thermometer-half"></i>
                <span class="sensor-label">Temperature</span>
                <span class="sensor-value">${sensorData.temperature}°C</span>
            </div>
            <div class="sensor-item ${getStatusClass(sensorData.humidity, 'humidity')}">
                <i class="fas fa-tint"></i>
                <span class="sensor-label">Humidity</span>
                <span class="sensor-value">${sensorData.humidity}%</span>
            </div>
            <div class="sensor-item ${getStatusClass(sensorData.ph, 'ph')}">
                <i class="fas fa-flask"></i>
                <span class="sensor-label">pH Level</span>
                <span class="sensor-value">${sensorData.ph}</span>
            </div>
            <div class="sensor-item ${getStatusClass(sensorData.ammonia, 'ammonia')}">
                <i class="fas fa-smog"></i>
                <span class="sensor-label">Ammonia</span>
                <span class="sensor-value">${sensorData.ammonia} ppm</span>
            </div>
        `;

        // Fetch and display historical data
        const historicalData = await fetchFarmHistoricalData(farmId, '24h');
        
        // Update charts with historical data
        updateFarmChart('farmTempChart', 'Temperature', historicalData, '#ff6b6b', '°C', 'temperature');
        updateFarmChart('farmHumidityChart', 'Humidity', historicalData, '#4dabf7', '%', 'humidity');
        updateFarmChart('farmAmmoniaChart', 'Ammonia', historicalData, '#fab005', 'ppm', 'ammonia');
        updateFarmChart('farmPhChart', 'pH Level', historicalData, '#82c91e', '', 'ph');

        // Fetch and display recent alerts
        const alerts = await fetchFarmAlerts(farmId);
        displayFarmAlerts(alerts);

        // Calculate and display performance metrics
        const metrics = calculateFarmMetrics(historicalData);
        const performanceMetrics = document.getElementById('performanceMetrics');
        performanceMetrics.innerHTML = `
            <div class="metric-item">
                <span class="metric-label">Avg Temperature</span>
                <span class="metric-value">${metrics.avgTemp.toFixed(1)}°C</span>
            </div>
            <div class="metric-item">
                <span class="metric-label">Avg Humidity</span>
                <span class="metric-value">${metrics.avgHumidity.toFixed(1)}%</span>
            </div>
            <div class="metric-item">
                <span class="metric-label">Alert Frequency</span>
                <span class="metric-value">${metrics.alertCount} / day</span>
            </div>
            <div class="metric-item">
                <span class="metric-label">Sensor Uptime</span>
                <span class="metric-value">${metrics.uptime}%</span>
            </div>
        `;

    } catch (error) {
        console.error('Error showing farm details:', error);
        showToast('Error loading farm details. Please try again.');
    }
}

    // Helper function to calculate farm metrics
    function calculateFarmMetrics(data) {
      if (!data || data.length === 0) {
        return {
          avgTemp: 0,
          avgHumidity: 0,
          alertCount: 0,
          uptime: 100
        };
      }

      const metrics = {
        avgTemp: data.reduce((sum, d) => sum + d.temperature, 0) / data.length,
        avgHumidity: data.reduce((sum, d) => sum + d.humidity, 0) / data.length,
        alertCount: data.filter(d => 
            d.temperature > 35 || 
            d.humidity > 70 || 
            d.ammonia > 40 || 
            d.ph > 8
        ).length,
        uptime: 100 // Assuming 100% uptime for now
      };

      return metrics;
    }

    // Helper function to update farm charts
    function updateFarmChart(canvasId, label, data, color, unit, field) {
      const ctx = document.getElementById(canvasId).getContext('2d');
      
      if (farmDetailsCharts[field]) {
        farmDetailsCharts[field].destroy();
      }
      
      farmDetailsCharts[field] = new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.map(row => new Date(row.created_at).toLocaleTimeString()),
          datasets: [{
            label: label,
            data: data.map(row => row[field]),
            borderColor: color,
            backgroundColor: color + '20',
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: value => value + unit
              }
            }
          }
        }
      });
    }

    // Helper function to fetch farm historical data
    async function fetchFarmHistoricalData(farmId, timeRange = '24h') {
      let hours = 24;
      if (timeRange === '7d') hours = 168;
      if (timeRange === '30d') hours = 720;

      const { data, error } = await supabase
          .from('sensor_data')
          .select('*')
          .eq('farm_id', farmId)
          .gte('created_at', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    }

    // Helper function to fetch farm alerts
    async function fetchFarmAlerts(farmId) {
      // For now, we'll generate alerts based on sensor data
      const { data, error } = await supabase
          .from('sensor_data')
          .select('*')
          .eq('farm_id', farmId)
          .order('created_at', { ascending: false })
          .limit(10);

      if (error) throw error;

      return data.map(reading => ({
          timestamp: reading.created_at,
          type: getAlertType(reading),
          message: getAlertMessage(reading),
          severity: getAlertSeverity(reading)
      })).filter(alert => alert.type !== 'normal');
    }

    function getAlertType(reading) {
      if (reading.temperature > 35) return 'temperature';
      if (reading.humidity > 70) return 'humidity';
      if (reading.ammonia > 40) return 'ammonia';
      if (reading.ph > 8) return 'ph';
      return 'normal';
    }

    function getAlertMessage(reading) {
      if (reading.temperature > 35) return `High temperature detected: ${reading.temperature}°C`;
      if (reading.humidity > 70) return `High humidity detected: ${reading.humidity}%`;
      if (reading.ammonia > 40) return `High ammonia levels: ${reading.ammonia} ppm`;
      if (reading.ph > 8) return `Abnormal pH level: ${reading.ph}`;
      return '';
    }

    function getAlertSeverity(reading) {
      if (reading.temperature > 40 || reading.humidity > 85 || reading.ammonia > 50 || reading.ph > 9) {
          return 'critical';
      }
      return 'warning';
    }

    function displayFarmAlerts(alerts) {
      const alertsContainer = document.getElementById('farmAlerts');
      if (!alerts || alerts.length === 0) {
          alertsContainer.innerHTML = '<div class="no-alerts">No recent alerts</div>';
          return;
      }

      alertsContainer.innerHTML = alerts.map(alert => `
          <div class="alert-item ${alert.severity}">
              <div class="alert-icon">
                  <i class="fas ${getAlertIcon(alert.type)}"></i>
              </div>
              <div class="alert-content">
                  <div class="alert-message">${alert.message}</div>
                  <div class="alert-time">${new Date(alert.timestamp).toLocaleString()}</div>
              </div>
          </div>
      `).join('');
    }

    function getAlertIcon(type) {
      switch (type) {
          case 'temperature': return 'fa-thermometer-high';
          case 'humidity': return 'fa-tint';
          case 'ammonia': return 'fa-smog';
          case 'ph': return 'fa-flask';
          default: return 'fa-exclamation-circle';
      }
    }
  