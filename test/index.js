// Initialisation de la carte centrée sur Alger
var map = L.map('map').setView([36.7372, 3.0865], 13);

// Ajout du fond de carte OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Liste des arrêts avec coordonnées
var waypoints = [
  { name: "Aïn Naâdja", coords: [36.7056, 3.0819] }, 
  { name: "Marché Aïn Naâdja", coords: [36.7030, 3.0800] },
  { name: "Château d'eau", coords: [36.7018, 3.0723] },
  { name: "Cité 720 Logements (2)", coords: [36.7060, 3.0820] }, 
  { name: "Cité 720 Logements (1)", coords: [36.7062, 3.0826] },
  { name: "Cité AADL (El Karas)", coords: [36.7147, 3.0845] }, 
  { name: "Hôpital Militaire", coords: [36.7267, 3.0635] }, 
  { name: "Ruisseau", coords: [36.7372, 3.0865] },
  { name: "Hamoud Boualem", coords: [36.7320, 3.0870] },
  { name: "Jardin d'essai", coords: [36.7465, 3.0737] }, 
  { name: "Les Ateliers", coords: [36.7564, 3.0794] }, 
  { name: "Place du 1er Mai", coords: [36.7620, 3.0571] }
];
L.Routing.control({
    waypoints: [
        L.latLng(36.7056, 3.0819),
        L.latLng(36.7030, 3.0800),
        L.latLng(36.7018, 3.0723)
        
    ],
    routeWhileDragging: true,
    geocoder: L.Control.Geocoder.nominatim()
}).addTo(map);
/*
// Ajouter les arrêts sur la carte
waypoints.forEach(stop => {
    L.marker(stop.coords).addTo(map)
        .bindPopup(stop.name);
});

// Icône personnalisée pour le bus
var busIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2328/2328614.png',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
});

// Ajouter le bus sur la carte
var busMarker = L.marker(waypoints[0].coords, { icon: busIcon }).addTo(map);

// Déplacer le bus entre les arrêts
let index = 0;
function moveBus() {
    index = (index + 1) % waypoints.length;
    busMarker.setLatLng(waypoints[index].coords)
        .bindPopup(`🚌 Bus en route vers : ${waypoints[index].name}`);
    setTimeout(moveBus, 3000);
}

moveBus();*/
