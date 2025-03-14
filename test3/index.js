// Initialisation de la carte
var map = L.map('map').setView([36.741666, 3.0499219], 11);

// Ajouter une couche OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Liste des arrêts de bus avec leurs coordonnées et noms
var busStops = [
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
    iconUrl: 'image/star.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [40, 65],
    iconAnchor: [20, 65],
    popupAnchor: [1, -60],
    shadowSize: [70, 65]
});

var endIcon = L.icon({
    iconUrl: 'image/star.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [40, 65],
    iconAnchor: [20, 65],
    popupAnchor: [1, -60],
    shadowSize: [70, 65]
});

var regularIcon = L.icon({
    iconUrl: 'image/5390754.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

var busIcon = L.icon({
    iconUrl: 'image/bus.png',
    iconSize: [40, 40],
    iconAnchor: [12, 12],
    popupAnchor: [0, -20]  // Ajustement pour que le popup apparaisse au-dessus de l'icône du bus
});

// Fonction pour calculer l'ETA pour le prochain arrêt
function calculateETAToNextStop(currentPosition, nextStopPosition, busSpeed) {
    // Calculer la distance jusqu'au prochain arrêt
    const distance = currentPosition.distanceTo(nextStopPosition); // en mètres
    
    // Calculer le temps estimé (busSpeed est en m/s)
    const etaInSeconds = distance / busSpeed;
    const etaInMinutes = etaInSeconds / 60;
    
    return {
        distance: distance.toFixed(0),
        eta: etaInMinutes.toFixed(1)
    };
}

// Fonction pour calculer l'ETA jusqu'au terminus
function calculateETAToTerminus(currentPosition, busStops, currentStopIndex, busSpeed) {
    if (currentStopIndex >= busStops.length - 1) {
        return {
            distance: 0,
            eta: 0
        };
    }
    
    let totalDistance = 0;
    
    // Calculer d'abord la distance jusqu'au prochain arrêt
    const nextStopLatLng = L.latLng(busStops[currentStopIndex + 1].coords[0], busStops[currentStopIndex + 1].coords[1]);
    totalDistance += currentPosition.distanceTo(nextStopLatLng);
    
    // Puis ajouter toutes les distances entre les arrêts restants jusqu'au terminus
    for (let i = currentStopIndex + 1; i < busStops.length - 1; i++) {
        const fromLatLng = L.latLng(busStops[i].coords[0], busStops[i].coords[1]);
        const toLatLng = L.latLng(busStops[i + 1].coords[0], busStops[i + 1].coords[1]);
        totalDistance += fromLatLng.distanceTo(toLatLng);
    }
    
    // Calculer le temps total
    const etaInSeconds = totalDistance / busSpeed;
    const etaInMinutes = etaInSeconds / 60;
    
    return {
        distance: totalDistance.toFixed(0),
        eta: etaInMinutes.toFixed(1)
    };
}

// Trouver l'arrêt le plus proche de la position actuelle
function findNearestStopIndex(currentPosition, busStops) {
    let minDistance = Infinity;
    let nearestIndex = 0;
    
    busStops.forEach(function(stop, index) {
        const stopLatLng = L.latLng(stop.coords[0], stop.coords[1]);
        const distance = currentPosition.distanceTo(stopLatLng);
        
        if (distance < minDistance) {
            minDistance = distance;
            nearestIndex = index;
        }
    });
    
    // Si nous sommes très proches du "nearestIndex", considérons que nous avons dépassé cet arrêt
    const nearestStopLatLng = L.latLng(busStops[nearestIndex].coords[0], busStops[nearestIndex].coords[1]);
    if (currentPosition.distanceTo(nearestStopLatLng) < 50) { // 50 mètres est considéré comme "à l'arrêt"
        return nearestIndex;
    } else if (nearestIndex < busStops.length - 1) {
        // Vérifier si nous sommes entre l'arrêt le plus proche et le suivant
        const nextStopLatLng = L.latLng(busStops[nearestIndex + 1].coords[0], busStops[nearestIndex + 1].coords[1]);
        const distToNext = currentPosition.distanceTo(nextStopLatLng);
        const distToCurrent = currentPosition.distanceTo(nearestStopLatLng);
        
        // Si nous sommes plus proches du prochain arrêt que de l'arrêt actuel, alors nous avons dépassé l'arrêt actuel
        if (distToNext < distToCurrent) {
            return nearestIndex + 1;
        }
    }
    
    return nearestIndex;
}

// Créer un marqueur de bus qui va se déplacer
var movingBus = L.marker(busStops[0].coords, {icon: busIcon})
    .addTo(map)
    .bindPopup("Bus en déplacement", {autoClose: false, closeOnClick: false});
    movingBus.on('mouseover', function (e) {
        this.openPopup();
    });
    movingBus.on('mouseout', function (e) {
        this.closePopup();
    });
// Placer les marqueurs de bus sur la carte
busStops.forEach(function(stop, index) {
    var icon;
    if (index === 0) {
        icon = startIcon;
    } else if (index === busStops.length - 1) {
        icon = endIcon;
    } else {
        icon = regularIcon;
    }
    
    var marker = L.marker(stop.coords, {icon: icon})
        .addTo(map)
        .bindPopup("<b>" + stop.name + "</b>");
    
    if (index === 0 || index === busStops.length - 1) {
        marker.openPopup();
    }
});

// Créer les waypoints pour le routage
var busWaypoints = busStops.map(function(stop) {
    return L.latLng(stop.coords[0], stop.coords[1]);
});

// Configurer le contrôle de routage
var control = L.Routing.control({
    waypoints: busWaypoints,
    routeWhileDragging: true,
    lineOptions: {
        styles: [{color: 'blue', opacity: 0.7, weight: 10}]
    },
    createMarker: function() { return null; }, // Ne pas créer de marqueurs supplémentaires
    addWaypoints: false,
    draggableWaypoints: false,
    
}).addTo(map);

// Variable pour stocker l'intervalle d'ETA
var etaUpdateInterval=null;

// Écouter l'événement routesfound pour animer l'icône de bus
control.on('routesfound', function(e) {
    var routes = e.routes;
    var coordinates = routes[0].coordinates;
    
    // Réinitialiser la position du bus au début de l'itinéraire
    movingBus.setLatLng([coordinates[0].lat, coordinates[0].lng]);
    
    // Vitesse du bus en mètres par seconde (environ 30 km/h)
    var busSpeed = 8.33; // 30 km/h ≈ 8.33 m/s
    if (etaUpdateInterval) {
        clearInterval(etaUpdateInterval);
        etaUpdateInterval = null;
    }
    // Animer le déplacement du bus le long de l'itinéraire
    var i = 0;
    var animationInterval = setInterval(function() {
        if (i < coordinates.length) {
            // Mettre à jour la position du bus
            var currentPosition = L.latLng(coordinates[i].lat, coordinates[i].lng);
            movingBus.setLatLng(currentPosition);
            
            // Mettre à jour le popup du bus si l'intervalle d'ETA est déjà défini
            if (i% 20 == 0) {
                updateBusETA(currentPosition, busSpeed);
            }
            
            i++;
        } else {
            clearInterval(animationInterval); // Arrêter l'animation quand terminée
            
            // Arrêter également l'intervalle d'ETA
            if (etaUpdateInterval) {
                clearInterval(etaUpdateInterval);
                etaUpdateInterval= null;
            }
        }
    }, 100); // Vitesse d'animation, ajustez selon vos besoins
    
    // Créer l'intervalle d'ETA pour mettre à jour le popup toutes les 5 secondes
    
    
    // Premier calcul d'ETA immédiatement
    updateBusETA(L.latLng(coordinates[0].lat, coordinates[0].lng), busSpeed);
    
    // Mise à jour de l'ETA toutes les 5 secondes
    etaUpdateInterval = setInterval(function() {
        var currentPos = movingBus.getLatLng();
        updateBusETA(currentPos, busSpeed);
    }, 5000); // 5000 ms = 5 secondes
});

// Fonction pour mettre à jour l'ETA et afficher le popup
function updateBusETA(currentPosition, busSpeed) {
    // Trouver l'arrêt le plus proche déjà passé
    var nearestStopIndex = findNearestStopIndex(currentPosition, busStops);
    
    // Créer le contenu du popup
    var popupContent = '<b>Bus en déplacement</b><br>';
    
    // Si nous ne sommes pas encore au terminus
    if (nearestStopIndex < busStops.length - 1) {
        // Informations sur le prochain arrêt
        const nextStopIndex = nearestStopIndex + 1;
        const nextStopName = busStops[nextStopIndex].name;
        const nextStopLatLng = L.latLng(busStops[nextStopIndex].coords[0], busStops[nextStopIndex].coords[1]);
        
        // Calculer l'ETA jusqu'au prochain arrêt
        const nextStopETA = calculateETAToNextStop(currentPosition, nextStopLatLng, busSpeed);
        
        // Calculer l'ETA jusqu'au terminus
        const terminusETA = calculateETAToTerminus(currentPosition, busStops, nearestStopIndex, busSpeed);
        
        // Ajouter les informations au popup
        popupContent += 'Prochain arrêt: <b>' + nextStopName + '</b><br>';
        popupContent += 'Distance: <b>' + nextStopETA.distance + ' m</b><br>';
        popupContent += 'ETA: <b>' + nextStopETA.eta + ' min</b><br>';
        popupContent += '<hr style="margin: 5px 0;">'; // Ligne de séparation
        popupContent += 'Terminus: <b>' + busStops[busStops.length - 1].name + '</b><br>';
        popupContent += 'Distance totale: <b>' + terminusETA.distance + ' m</b><br>';
        popupContent += 'ETA terminus: <b>' + terminusETA.eta + ' min</b>';
    } else {
        // Nous sommes au terminus
        popupContent += '<b>Arrivé au terminus</b>';
    }
    
    // Mettre à jour le popup
    movingBus.setPopupContent(popupContent);
}


// Ligne métro
var metroStops = [
    { name: "Aïn Naâdja", coords: [36.7105, 3.0975] },
    { name: "Gué de Constantine", coords: [36.7150, 3.0948] },
    { name: "Les Ateliers", coords: [36.7195, 3.0910] },
    { name: "Haï el Badr", coords: [36.7249, 3.0875] },
    { name: "Cité Mer et Soleil", coords: [36.7308, 3.0839] },
    { name: "Cité Amirouche", coords: [36.7358, 3.0783] },
    { name: "Les Fusillés", coords: [36.74264555486513, 3.082866668252138] },
    { name: "Jardin d'Essai", coords: [36.7467, 3.0686] },
    { name: "Hamma", coords: [36.7506, 3.0642] },
    { name: "Aïssat Idir", coords: [36.7553, 3.0578] },
    { name: "1er Mai", coords: [36.7605, 3.0586] }
];

var startIcon2 = L.icon({
    iconUrl: 'image/metro.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [40, 65],
    iconAnchor: [20, 65],
    popupAnchor: [1, -60],
    shadowSize: [70, 65]
});

var endIcon2 = L.icon({
    iconUrl: 'image/metro.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [40, 65],
    iconAnchor: [20, 65],
    popupAnchor: [1, -60],
    shadowSize: [70, 65]
});

var regularIcon2 = L.icon({
    iconUrl: 'image/stationmetro.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

var metroIcon = L.icon({
    iconUrl: 'image/metro2.png',
    iconSize: [40, 40],
    iconAnchor: [12, 12] 
});

// Fonction pour calculer l'ETA pour le prochain arrêt
function calculateETAToNextStop(currentPosition, nextStopPosition, MetroSpeed) {
    // Calculer la distance jusqu'au prochain arrêt
    const distance = currentPosition.distanceTo(nextStopPosition); // en mètres
    
    // Calculer le temps estimé (MetroSpeed est en m/s)
    const etaInSeconds = distance / MetroSpeed;
    const etaInMinutes = etaInSeconds / 60;
    
    return {
        distance: distance.toFixed(0),
        eta: etaInMinutes.toFixed(1)
    };
}

// Fonction pour calculer l'ETA jusqu'au terminus
function calculateETAToTerminus(currentPosition, metroStops, currentStopIndex, MetroSpeed) {
    if (currentStopIndex >= metroStops.length - 1) {
        return {
            distance: 0,
            eta: 0
        };
    }
    
    let totalDistance = 0;
    
    // Calculer d'abord la distance jusqu'au prochain arrêt
    const nextStopLatLng = L.latLng(metroStops[currentStopIndex + 1].coords[0], metroStops[currentStopIndex + 1].coords[1]);
    totalDistance += currentPosition.distanceTo(nextStopLatLng);
    
    // Puis ajouter toutes les distances entre les arrêts restants jusqu'au terminus
    for (let i = currentStopIndex + 1; i < metroStops.length - 1; i++) {
        const fromLatLng = L.latLng(metroStops[i].coords[0], metroStops[i].coords[1]);
        const toLatLng = L.latLng(metroStops[i + 1].coords[0], metroStops[i + 1].coords[1]);
        totalDistance += fromLatLng.distanceTo(toLatLng);
    }
    
    // Calculer le temps total
    const etaInSeconds = totalDistance / MetroSpeed;
    const etaInMinutes = etaInSeconds / 60;
    
    return {
        distance: totalDistance.toFixed(0),
        eta: etaInMinutes.toFixed(1)
    };
}

// Trouver l'arrêt le plus proche de la position actuelle
function findNearestStopIndex(currentPosition, metroStops) {
    let minDistance = Infinity;
    let nearestIndex = 0;
    
    metroStops.forEach(function(stop, index) {
        const stopLatLng = L.latLng(stop.coords[0], stop.coords[1]);
        const distance = currentPosition.distanceTo(stopLatLng);
        
        if (distance < minDistance) {
            minDistance = distance;
            nearestIndex = index;
        }
    });
    
    // Si nous sommes très proches du "nearestIndex", considérons que nous avons dépassé cet arrêt
    const nearestStopLatLng = L.latLng(metroStops[nearestIndex].coords[0], metroStops[nearestIndex].coords[1]);
    if (currentPosition.distanceTo(nearestStopLatLng) < 50) { // 50 mètres est considéré comme "à l'arrêt"
        return nearestIndex;
    } else if (nearestIndex < metroStops.length - 1) {
        // Vérifier si nous sommes entre l'arrêt le plus proche et le suivant
        const nextStopLatLng = L.latLng(metroStops[nearestIndex + 1].coords[0], metroStops[nearestIndex + 1].coords[1]);
        const distToNext = currentPosition.distanceTo(nextStopLatLng);
        const distToCurrent = currentPosition.distanceTo(nearestStopLatLng);
        
        // Si nous sommes plus proches du prochain arrêt que de l'arrêt actuel, alors nous avons dépassé l'arrêt actuel
        if (distToNext < distToCurrent) {
            return nearestIndex + 1;
        }
    }
    
    return nearestIndex;
}

// Placer les marqueurs de métro sur la carte
metroStops.forEach(function(stop, index) {
    var icon;
    if (index === 0) {
        icon = startIcon2;
    } else if (index === metroStops.length - 1) {
        icon = endIcon2;
    } else {
        icon = regularIcon2;  
    }
    
    var marker = L.marker(stop.coords, {icon: icon})
        .addTo(map)
        .bindPopup("<b>" + stop.name + "</b>");
    
    if (index === 0 || index === metroStops.length - 1) {
        marker.openPopup();
    }
});

// Tracer la ligne d'itinéraire pour le métro
var metroLatLngs = metroStops.map(function(stop) {
    return stop.coords;
});

var metroPolyline = L.polyline(metroLatLngs, {
    color: 'orange',  
    weight: 10,
    opacity: 0.7,
    smoothFactor: 1
}).addTo(map);

metroPolyline.bindTooltip("Ligne Metro", {
    permanent: true,
    direction: 'center',
    className: 'metro-ligne'
});

var movingMetro = L.marker(metroStops[0].coords, {icon: metroIcon}).addTo(map)
    .bindPopup("Metro en déplacement", {autoClose: false, closeOnClick: false});
    movingMetro.on('mouseover', function (e) {
        this.openPopup();
    });
    movingMetro.on('mouseout', function (e) {
        this.closePopup();
    });

function interpolatePoints(p1, p2, steps) {
    var points = [];
    for (var i = 0; i <= steps; i++) {
        var lat = p1[0] + (p2[0] - p1[0]) * (i / steps);
        var lng = p1[1] + (p2[1] - p1[1]) * (i / steps);
        points.push([lat, lng]);
    }
    return points;
}

function createDetailedRoute(stops, pointsPerSegment) {
    var route = [];
    for (var i = 0; i < stops.length - 1; i++) {
        var segment = interpolatePoints(stops[i].coords, stops[i+1].coords, pointsPerSegment);
        route = route.concat(segment);
    }
    return route;
}

// Définir les variables liées à l'animation dans la portée globale
var detailedMetroRoute = createDetailedRoute(metroStops, 20);
var etaUpdateInterval;
var MetroSpeed = 16.67; // environ 30 km/h en m/s

function startMetroAnimation() {
    var i = 0;
    var animationInterval = setInterval(function() {
        if (i < detailedMetroRoute.length) {
            var currentPosition = L.latLng(detailedMetroRoute[i][0], detailedMetroRoute[i][1]);
            movingMetro.setLatLng(currentPosition);
            
            // Mettre à jour l'ETA si l'intervalle est actif
            if (i % 20 === 0) { // Mettre à jour tous les 20 pas pour réduire les calculs
                updateMetroETA(currentPosition, MetroSpeed);
            }
            
            i++;
        } else {
            clearInterval(animationInterval); // Arrêter l'animation une fois terminée
            if (etaUpdateInterval) {
                clearInterval(etaUpdateInterval);
            }
        }
    }, 300);
    
    // Effacer l'intervalle existant s'il y en a un
    if (etaUpdateInterval) {
        clearInterval(etaUpdateInterval);
    }
    
    // Mise à jour initiale de l'ETA
    updateMetroETA(L.latLng(metroStops[0].coords[0], metroStops[0].coords[1]), MetroSpeed);
    
    // Configurer des mises à jour régulières de l'ETA
    etaUpdateInterval = setInterval(function() {
        var currentPos = movingMetro.getLatLng();
        updateMetroETA(currentPos, MetroSpeed);
    }, 5000);
}

function updateMetroETA(currentPosition, MetroSpeed) {
    // Trouver l'index de l'arrêt le plus proche
    var nearestStopIndex = findNearestStopIndex(currentPosition, metroStops);
    
    // Créer le contenu du popup
    var popupContent = '<b>Metro en déplacement</b><br>';
    
    // Si nous ne sommes pas encore au terminus
    if (nearestStopIndex < metroStops.length - 1) {
        // Informations sur le prochain arrêt
        const nextStopIndex = nearestStopIndex + 1;
        const nextStopName = metroStops[nextStopIndex].name;
        const nextStopLatLng = L.latLng(metroStops[nextStopIndex].coords[0], metroStops[nextStopIndex].coords[1]);
        
        // Calculer l'ETA jusqu'au prochain arrêt
        const nextStopETA = calculateETAToNextStop(currentPosition, nextStopLatLng, MetroSpeed);
        
        // Calculer l'ETA jusqu'au terminus
        const terminusETA = calculateETAToTerminus(currentPosition, metroStops, nearestStopIndex, MetroSpeed);
        
        // Ajouter les informations au popup
        popupContent += 'Prochain arrêt: <b>' + nextStopName + '</b><br>';
        popupContent += 'Distance: <b>' + nextStopETA.distance + ' m</b><br>';
        popupContent += 'ETA: <b>' + nextStopETA.eta + ' min</b><br>';
        popupContent += '<hr style="margin: 5px 0;">'; // Séparateur
        popupContent += 'Terminus: <b>' + metroStops[metroStops.length - 1].name + '</b><br>';
        popupContent += 'Distance totale: <b>' + terminusETA.distance + ' m</b><br>';
        popupContent += 'ETA terminus: <b>' + terminusETA.eta + ' min</b>';
    } else {
        // Nous sommes au terminus
        popupContent += '<b>Arrivé au terminus</b>';
    }
    
    movingMetro.setPopupContent(popupContent);
}

// Appeler la fonction pour démarrer l'animation
startMetroAnimation();
// Ligne train
var trainStops = [
    { name: "Aïn Naâdja", coords: [36.689049, 3.0759443] },
    { name: "Gué de Constantine", coords: [36.6968477, 3.094913899999999] },
    { name: "EL Harrach", coords: [36.72151359999999, 3.1328614] },
    { name: "Caroubier", coords: [36.7350706, 3.1195576] },
    { name: "H.Day", coords: [36.7454351, 3.0940193] }
];

var startIcon3 = L.icon({
    iconUrl: 'image/train.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [40, 65],
    iconAnchor: [20, 65],
    popupAnchor: [1, -60],
    shadowSize: [70, 65]
});

var endIcon3 = L.icon({
    iconUrl: 'image/train.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [40, 65],
    iconAnchor: [20, 65],
    popupAnchor: [1, -60],
    shadowSize: [70, 65]
});

var regularIcon3 = L.icon({
    iconUrl: 'image/trainstation.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41] 
});

var trainIcon = L.icon({
    iconUrl: 'image/train2.png',
    iconSize: [40, 40],
    iconAnchor: [12, 12] 
});

// Placer les marqueurs de train sur la carte
trainStops.forEach(function(stop, index) {
    var icon;
    if (index === 0) {
        icon = startIcon3;
    } else if (index === trainStops.length - 1) {
        icon = endIcon3;
    } else {
        icon = regularIcon3; 
    }
    
    var marker = L.marker(stop.coords, {icon: icon})
        .addTo(map)
        .bindPopup("<b>" + stop.name + "</b>");
    
    if (index === 0 || index === trainStops.length - 1) {
        marker.openPopup();
    }
});

// Tracer la ligne d'itinéraire pour le train
var trainLatLngs = trainStops.map(function(stop) {
    return stop.coords;
});

var trainPolyline = L.polyline(trainLatLngs, {
    color: 'purple',  
    weight: 10,
    opacity: 0.7,
    smoothFactor: 1
}).addTo(map);

trainPolyline.bindTooltip("Train", {
    permanent: true,
    direction: 'center',
    className: 'train'
});

var movingTrain = L.marker(trainStops[0].coords, {icon: trainIcon}).addTo(map)
    .bindPopup("Train en déplacement", {autoClose: false, closeOnClick: false});
    movingTrain.on('mouseover', function (e) {
        this.openPopup();
    });
    movingTrain.on('mouseout', function (e) {
        this.closePopup();
    });
// Définir les variables liées à l'animation dans la portée globale
var detailedTrainRoute = createDetailedRoute(trainStops, 20);
var trainEtaUpdateInterval;
var trainSpeed = 22.22; // environ 80 km/h en m/s

function updateTrainETA(currentPosition, trainSpeed) {
    // Trouver l'index de l'arrêt le plus proche
    var nearestStopIndex = findNearestStopIndex(currentPosition, trainStops);
    
    // Créer le contenu du popup
    var popupContent = '<b>Train en déplacement</b><br>';
    
    // Si nous ne sommes pas encore au terminus
    if (nearestStopIndex < trainStops.length - 1) {
        // Informations sur le prochain arrêt
        const nextStopIndex = nearestStopIndex + 1;
        const nextStopName = trainStops[nextStopIndex].name;
        const nextStopLatLng = L.latLng(trainStops[nextStopIndex].coords[0], trainStops[nextStopIndex].coords[1]);
        
        // Calculer l'ETA jusqu'au prochain arrêt
        const nextStopETA = calculateETAToNextStop(currentPosition, nextStopLatLng, trainSpeed);
        
        // Calculer l'ETA jusqu'au terminus
        const terminusETA = calculateETAToTerminus(currentPosition, trainStops, nearestStopIndex, trainSpeed);
        
        // Ajouter les informations au popup
        popupContent += 'Prochain arrêt: <b>' + nextStopName + '</b><br>';
        popupContent += 'Distance: <b>' + nextStopETA.distance + ' m</b><br>';
        popupContent += 'ETA: <b>' + nextStopETA.eta + ' min</b><br>';
        popupContent += '<hr style="margin: 5px 0;">'; // Séparateur
        popupContent += 'Terminus: <b>' + trainStops[trainStops.length - 1].name + '</b><br>';
        popupContent += 'Distance totale: <b>' + terminusETA.distance + ' m</b><br>';
        popupContent += 'ETA terminus: <b>' + terminusETA.eta + ' min</b>';
    } else {
        // Nous sommes au terminus
        popupContent += '<b>Arrivé au terminus</b>';
    }
    
    movingTrain.setPopupContent(popupContent);
}

function startTrainAnimation() {
    var i = 0;
    var animationInterval = setInterval(function() {
        if (i < detailedTrainRoute.length) {
            var currentPosition = L.latLng(detailedTrainRoute[i][0], detailedTrainRoute[i][1]);
            movingTrain.setLatLng(currentPosition);
            
            // Mettre à jour l'ETA si l'intervalle est actif
            if (i % 20 === 0) { // Mettre à jour tous les 20 pas pour réduire les calculs
                updateTrainETA(currentPosition, trainSpeed);
            }
            
            i++;
        } else {
            clearInterval(animationInterval); // Arrêter l'animation une fois terminée
            if (trainEtaUpdateInterval) {
                clearInterval(trainEtaUpdateInterval);
            }
        }
    }, 300);
    
    // Effacer l'intervalle existant s'il y en a un
    if (trainEtaUpdateInterval) {
        clearInterval(trainEtaUpdateInterval);
    }
    
    // Mise à jour initiale de l'ETA
    updateTrainETA(L.latLng(trainStops[0].coords[0], trainStops[0].coords[1]), trainSpeed);
    
    // Configurer des mises à jour régulières de l'ETA
    trainEtaUpdateInterval = setInterval(function() {
        var currentPos = movingTrain.getLatLng();
        updateTrainETA(currentPos, trainSpeed);
    }, 5000);
}

// Appeler la fonction pour démarrer l'animation
startTrainAnimation();
// Ligne tram
var tramStops = [
    { name: "Caroubier", coords: [36.73575015911541, 3.118212823888928] },
    { name: "Tripoli-Maqqaria", coords: [36.737608929789296, 3.113548362115336] },
    { name: "Tripoli-Hamadache", coords: [36.74146069624754, 3.103119933993822] },
    { name: "Tripoli-Mosquée", coords: [36.74390234095257, 3.097798431577906] },
    { name: "Tripoli-Thaalibia", coords: [36.745724926604446, 3.0922623517536767] },
    { name: "Les Fusillés", coords: [36.74343113323734, 3.0835533138099738] }
];

var startIcon4 = L.icon({
    iconUrl: 'image/starttram.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [40, 65],
    iconAnchor: [20, 65],
    popupAnchor: [1, -60],
    shadowSize: [70, 65]
});

var endIcon4 = L.icon({
    iconUrl: 'image/starttram.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [40, 65],
    iconAnchor: [20, 65],
    popupAnchor: [1, -60],
    shadowSize: [70, 65]
});

var tramwayIcon = L.icon({
    iconUrl: 'image/tramw.png',
    iconSize: [40, 40],
    iconAnchor: [12, 12]
});

var regularIcon4 = L.icon({
    iconUrl: 'image/stationtram.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Placer les marqueurs de tram sur la carte
tramStops.forEach(function(stop, index) {
    var icon;
    if (index === 0) {
        icon = startIcon4;
    } else if (index === tramStops.length - 1) {
        icon = endIcon4;
    } else {
        icon = regularIcon4;
    }
   
    var marker = L.marker(stop.coords, {icon: icon})
        .addTo(map)
        .bindPopup("<b>" + stop.name + "</b>");
   
    if (index === 0 || index === tramStops.length - 1) {
        marker.openPopup();
    }
});

// Tracer la ligne d'itinéraire pour le tram
var tramLatLngs = tramStops.map(function(stop) {
    return stop.coords;
});

var tramPolyline = L.polyline(tramLatLngs, {
    color: 'red',  
    weight: 7,
    opacity: 0.7,
    smoothFactor: 1
}).addTo(map);

tramPolyline.bindTooltip("Tram", {
    permanent: true,
    direction: 'center',
    className: 'tram'
});

var movingTram = L.marker(tramStops[0].coords, {icon: tramwayIcon}).addTo(map)
    .bindPopup("Tram en déplacement", {autoClose: false, closeOnClick: false});
    movingTram.on('mouseover', function (e) {
        this.openPopup();
    });
    movingTram.on('mouseout', function (e) {
        this.closePopup();
    });
// Définir les variables liées à l'animation dans la portée globale
var detailedTramRoute = createDetailedRoute(tramStops, 20);
var tramEtaUpdateInterval;
var tramSpeed = 13.89; // environ 50 km/h en m/s

function updateTramETA(currentPosition, tramSpeed) {
    // Trouver l'index de l'arrêt le plus proche
    var nearestStopIndex = findNearestStopIndex(currentPosition, tramStops);
    
    // Créer le contenu du popup
    var popupContent = '<b>Tram en déplacement</b><br>';
    
    // Si nous ne sommes pas encore au terminus
    if (nearestStopIndex < tramStops.length - 1) {
        // Informations sur le prochain arrêt
        const nextStopIndex = nearestStopIndex + 1;
        const nextStopName = tramStops[nextStopIndex].name;
        const nextStopLatLng = L.latLng(tramStops[nextStopIndex].coords[0], tramStops[nextStopIndex].coords[1]);
        
        // Calculer l'ETA jusqu'au prochain arrêt
        const nextStopETA = calculateETAToNextStop(currentPosition, nextStopLatLng, tramSpeed);
        
        // Calculer l'ETA jusqu'au terminus
        const terminusETA = calculateETAToTerminus(currentPosition, tramStops, nearestStopIndex, tramSpeed);
        
        // Ajouter les informations au popup
        popupContent += 'Prochain arrêt: <b>' + nextStopName + '</b><br>';
        popupContent += 'Distance: <b>' + nextStopETA.distance + ' m</b><br>';
        popupContent += 'ETA: <b>' + nextStopETA.eta + ' min</b><br>';
        popupContent += '<hr style="margin: 5px 0;">'; // Séparateur
        popupContent += 'Terminus: <b>' + tramStops[tramStops.length - 1].name + '</b><br>';
        popupContent += 'Distance totale: <b>' + terminusETA.distance + ' m</b><br>';
        popupContent += 'ETA terminus: <b>' + terminusETA.eta + ' min</b>';
    } else {
        // Nous sommes au terminus
        popupContent += '<b>Arrivé au terminus</b>';
    }
    
    movingTram.setPopupContent(popupContent);
}

function startTramAnimation() {
    var i = 0;
    var animationInterval = setInterval(function() {
        if (i < detailedTramRoute.length) {
            var currentPosition = L.latLng(detailedTramRoute[i][0], detailedTramRoute[i][1]);
            movingTram.setLatLng(currentPosition);
            
            // Mettre à jour l'ETA si l'intervalle est actif
            if (i % 20 === 0) { // Mettre à jour tous les 20 pas pour réduire les calculs
                updateTramETA(currentPosition, tramSpeed);
            }
            
            i++;
        } else {
            clearInterval(animationInterval); // Arrêter l'animation une fois terminée
            if (tramEtaUpdateInterval) {
                clearInterval(tramEtaUpdateInterval);
            }
        }
    }, 300);
    
    // Effacer l'intervalle existant s'il y en a un
    if (tramEtaUpdateInterval) {
        clearInterval(tramEtaUpdateInterval);
    }
    
    // Mise à jour initiale de l'ETA
    updateTramETA(L.latLng(tramStops[0].coords[0], tramStops[0].coords[1]), tramSpeed);
    
    // Configurer des mises à jour régulières de l'ETA
    tramEtaUpdateInterval = setInterval(function() {
        var currentPos = movingTram.getLatLng();
        updateTramETA(currentPos, tramSpeed);
    }, 5000);
}

// Appeler la fonction pour démarrer l'animation
startTramAnimation();


// Première correspondance
var connectionPoints1 = [
    [36.7454351, 3.0940193],    
    [36.745724926604446, 3.0922623517536767]
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
    [36.74343113323734, 3.0835533138099738],  
    [36.74264555486513, 3.082866668252138]
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

// Ajuster la vue pour afficher toutes les lignes
map.fitBounds([
    L.latLngBounds(busWaypoints), // Utiliser les waypoints de bus au lieu d'une polyline
    metroPolyline.getBounds(),
    trainPolyline.getBounds(),
    tramPolyline.getBounds(),
    
], {
    padding: [50, 50]
});


var speed ;
function CalculETA (stop,index ,speed, Icon){
    const dis = stop[0].getLatLng()-stop[6].getLatLng(index);
    
   for (let i =0; i<index; i++  ){
    var disrest= dis -Icon.getLatLng();
    var time = disrest / speed;
    return time;

   }

}