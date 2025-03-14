// Initialisation de la carte
var map = L.map('map').setView([36.741666, 3.0499219], 13);

// Ajouter une couche OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Liste des arrêts avec leurs coordonnées et noms
var stops = [
    { name: "Aïn Naâdja", coords: [36.7056, 3.0819] },
    { name: "Marché Aïn Naâdja", coords: [36.7030, 3.0800] },
    { name: "Château d'eau", coords: [36.7018, 3.0723] },
    { name: "Cité 720 Logements (2)", coords: [36.7060, 3.0820] },
    { name: "Hôpital Militaire", coords: [36.7267, 3.0635] },
    { name: "Ruisseau", coords: [36.7372, 3.0865] },
    { name: "Place du 1er Mai", coords: [36.7620, 3.0571] }
];

// Configuration des icônes
var startIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

var endIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

var regularIcon = L.icon({
    iconUrl: 'image/arretsbus.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Placer les marqueurs sur la carte
stops.forEach(function(stop, index) {
    var icon;
    if (index === 0) {
        icon = startIcon;
    } else if (index === stops.length - 1) {
        icon = endIcon;
    } else {
        icon = regularIcon;
    }
    
    var marker = L.marker(stop.coords, {icon: icon})
        .addTo(map)
        .bindPopup("<b>" + stop.name + "</b>");
    
    if (index === 0 || index === stops.length - 1) {
        marker.openPopup();
    }
});

// Tracer la ligne d'itinéraire
var latlngs = stops.map(function(stop) {
    return stop.coords;
});

var polyline = L.polyline(latlngs, {
    color: 'blue',
    weight: 4,
    opacity: 0.7,
    smoothFactor: 1
}).addTo(map);

// NOMMER LA LIGNE - Cette partie est importante
polyline.bindTooltip("Ligne Bus 42: Aïn Naâdja - Place du 1er Mai", {
    permanent: true,
    direction: 'center',
    className: 'bus-line-label'
});


// Ajuster la vue
map.fitBounds(polyline.getBounds(), {
    padding: [50, 50]
});
 
// ligne metro :
var stops2=[
    { name: "Aïn Naâdja", coords: [36.7105, 3.0975] },
    { name: "Gué de Constantine", coords: [36.7150, 3.0948] },
    { name: "Les Ateliers", coords: [36.7195, 3.0910] },
    { name: "Haï el Badr", coords: [36.7249, 3.0875] },
    { name: "Cité Mer et Soleil", coords: [36.7308, 3.0839] },
    { name: "Cité Amirouche", coords: [36.7358, 3.0783] },
    { name: "Les Fusillés", coords: [36.7400, 3.0733] },
    { name: "Jardin d'Essai", coords: [36.7467, 3.0686] },
    { name: "Hamma", coords: [36.7506, 3.0642] },
    { name: "Aïssat Idir", coords: [36.7553, 3.0578] },
    { name: "1er Mai", coords: [36.7605, 3.0586] }]
    var regularIcon2 = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
    stops2.forEach(function(stop, index) {
        var icon;
        if (index === 0) {
            icon = startIcon;
        } else if (index === stops2.length - 1) {
            icon = endIcon;
        } else {
            icon = regularIcon2;  
        }
        
        var marker = L.marker(stop.coords, {icon: icon})
            .addTo(map)
            .bindPopup("<b>" + stop.name + "</b>");
        
        if (index === 0 || index === stops2.length - 1) {
            marker.openPopup();
        }
    });
    var latlngs2 = stops2.map(function(stop) {
        return stop.coords;
    });
    var polyline2 = L.polyline(latlngs2, {
        color: 'orange',  
        weight: 4,
        opacity: 0.7,
        smoothFactor: 1
    }).addTo(map);
    polyline2.bindTooltip("Ligne Metro", {
        permanent: true,
        direction: 'center',
        className: 'metro-ligne'
    });


    map.fitBounds([
        polyline.getBounds(),
        polyline2.getBounds()
    ], {
        padding: [50, 50]
    });
    // ligne train tram metro
    var stops3=[
        { name: "Aïn Naâdja", coords: [36.689049 , 3.0759443] },
        { name: "Gué de Constantine", coords: [36.6968477, 3.094913899999999  ] },
        { name: "EL Harrach", coords: [36.72151359999999 ,3.1328614 ] },
        { name: "Caroubier", coords: [36.7350706  , 3.1195576  ] },
        { name: "H.Day", coords: [36.7454351, 3.0940193] }
        ];
        var regularIcon3 = L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
        
        stops3.forEach(function(stop, index) {
            var icon;
            if (index === 0) {
                icon = startIcon;
            } else if (index === stops3.length - 1) {
                icon = endIcon;
            } else {
                icon = regularIcon3; 
            }
            
            var marker = L.marker(stop.coords, {icon: icon})
                .addTo(map)
                .bindPopup("<b>" + stop.name + "</b>");
            
            if (index === 0 || index === stops3.length - 1) {
                marker.openPopup();
            }
        });
        var latlngs3 = stops3.map(function(stop) {
            return stop.coords;
        });
        var polyline3 = L.polyline(latlngs3, {
            color: 'purple',  
            weight: 4,
            opacity: 0.7,
            smoothFactor: 1
        }).addTo(map);
        
     
        polyline3.bindTooltip("Train", {
            permanent: true,
            direction: 'center',
            className: 'train'
        });
        map.fitBounds([
            polyline.getBounds(),
            polyline2.getBounds(),
            polyline3.getBounds()
        ], {
            padding: [50, 50]
        });
        var stops3=[
           
            { name: "Tripoli-Mosquée", coords: [36.7450, 3.0785] },
            { name: "Tripoli-Thaalibia", coords: [36.7440, 3.0760] },
            { name: "Les Fusillés", coords: [36.7430, 3.0735] },
            
            
        ]
        var regularIcon3 = L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
        stops3.forEach(function(stop, index) {
            var icon;
            if (index === 0) {
                icon = startIcon;
            } else if (index === stops3.length - 1) {
                icon = endIcon;
            } else {
                icon = regularIcon3; 
            }
            
            var marker = L.marker(stop.coords, {icon: icon})
                .addTo(map)
                .bindPopup("<b>" + stop.name + "</b>");
            
            if (index === 0 || index === stops3.length - 1) {
                marker.openPopup();
            }
        });
        var latlngs3 = stops3.map(function(stop) {
            return stop.coords;
        });
        var polyline3 = L.polyline(latlngs3, {
            color: 'purple',  
            weight: 4,
            opacity: 0.7,
            smoothFactor: 1
        }).addTo(map);
        
        polyline3.bindTooltip("Tram", {
            permanent: true,
            direction: 'center',
            className: 'train'
        });
        map.fitBounds([
            polyline.getBounds(),
            polyline2.getBounds(),
            polyline3.getBounds()
        ], {
            padding: [50, 50]
        });
        var stops3=[
            { name: "Les Fusillés", coords: [36.7400, 3.0733] },
            { name: "Les Fusillés", coords: [36.7400, 3.0733] },
            { name: "Jardin d'Essai", coords: [36.7467, 3.0686] },
            { name: "Hamma", coords: [36.7506, 3.0642] },
            { name: "Aïssat Idir", coords: [36.7553, 3.0578] },
            { name: "1er Mai", coords: [36.7605, 3.0586] }
        ];
        var regularIcon3 = L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
        stops3.forEach(function(stop, index) {
            var icon;
            if (index === 0) {
                icon = startIcon;
            } else if (index === stops3.length - 1) {
                icon = endIcon;
            } else {
                icon = regularIcon3; 
            }
            
            var marker = L.marker(stop.coords, {icon: icon})
                .addTo(map)
                .bindPopup("<b>" + stop.name + "</b>");
            
            if (index === 0 || index === stops3.length - 1) {
                marker.openPopup();
            }
        });
        var latlngs3 = stops3.map(function(stop) {
            return stop.coords;
        });
        var polyline3 = L.polyline(latlngs3, {
            color: 'purple',  
            weight: 4,
            opacity: 0.7,
            smoothFactor: 1
        }).addTo(map);
        
        polyline3.bindTooltip("Metro", {
            permanent: true,
            direction: 'center',
            className: 'train'
        });
        map.fitBounds([
            polyline.getBounds(),
            polyline2.getBounds(),
            polyline3.getBounds()
        ], {
            padding: [50, 50]
        });
      // Première correspondance
var connectionPoints1 = [
    [36.7454351, 3.0940193],    
    [36.7450, 3.0785]   
];

var dashedLine1 = L.polyline(connectionPoints1, {
    color: 'black',       
    weight: 3,            
    opacity: 0.7,         
    dashArray: '10, 10',  
    smoothFactor: 1
}).addTo(map);

dashedLine1.bindTooltip("Correspondance", {
    permanent: true,
    direction: 'center', 
    className: 'connection-label'
});

// Deuxième correspondance
var connectionPoints2 = [
    [36.7430, 3.0735],    
    [36.7400, 3.0733]  
];

var dashedLine2 = L.polyline(connectionPoints2, {
    color: 'black',       
    weight: 3,            
    opacity: 0.7,         
    dashArray: '10, 10',  
    smoothFactor: 1
}).addTo(map);

dashedLine2.bindTooltip("Correspondance", {
    permanent: true,
    direction: 'center', 
    className: 'connection-label'
});
