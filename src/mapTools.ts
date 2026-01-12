import { LocateControl } from "leaflet.locatecontrol";
import "./libs/leaflet.usermarker.js"
import L from "leaflet"
import type { AEDFacility } from "./filter.js";

export interface NowLocation {
  latitude: number;
  longitude: number;
}

export interface FacilityDistance {
  facility: AEDFacility;
  distance: number;
}

export interface SetupOptions {
  onNearestReady?: (payload: {
    nearestFacility: AEDFacility;
    nowLocation: NowLocation;
    sortedFacilities: FacilityDistance[];
  }) => void;
}

export async function setup(
  facilities: AEDFacility[],
  options?: SetupOptions
): Promise<void> {
  if (!facilities.length) return;

  const nowLocation = await getNowLocation();
  const sortedFacilities = getFacilitiesByDistance(nowLocation, facilities);
  if (!sortedFacilities.length) return;

  const destination = sortedFacilities[0].facility;
  const map = initMapView(nowLocation);
  renderDestinationPin(map, destination);
  const route = await getRoute(nowLocation, destination);
  if (route) {
    renderRoute(map, route);
  }

  options?.onNearestReady?.({
    nearestFacility: destination,
    nowLocation,
    sortedFacilities,
  });
}

function initMapView(nowLocation: NowLocation){
  console.log("initMapView")
  console.log(nowLocation.latitude)
  var map = L.map("map").setView([nowLocation.latitude, nowLocation.longitude], 18)
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map)

  new LocateControl().addTo(map);
  
  const markerOptions = {
    plusing: true,
    smallIcon: true,
  }
  L.userMarker([nowLocation.latitude, nowLocation.longitude], markerOptions).addTo(map)

  return map
}

function renderRoute(map: L.Map, route: L.LatLngExpression[]) {
  const polyline = L.polyline(route, {
    color: 'blue',
    weight: 5,
    opacity: 0.5,
  }).addTo(map)

  const bounds = L.latLngBounds(route)
  map.setView(bounds.getCenter())
  map.fitBounds(polyline.getBounds())
  console.log(map)
}

function renderDestinationPin(map: L.Map, destination: AEDFacility) {
  const icon = L.divIcon({
    className: 'destination-pin',
    html: `
      <div class="destination-pin__wrapper">
        <div class="destination-pin__outer">
          <div class="destination-pin__inner"></div>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 30],
    popupAnchor: [0, -32],
  });

  const marker = L.marker([destination.latitude, destination.longitude], {
    icon,
  }).addTo(map);

  marker.bindPopup(`
    <div class="destination-popup">
      <strong>${destination.locationName}</strong><br />
      <span>${destination.locationAddress ?? ''}</span>
    </div>
  `);
}

async function getRoute(
  nowLocation: NowLocation,
  destination: AEDFacility
): Promise<L.LatLngExpression[] | undefined> {
  console.log('getRoute called')
  const baseUrl = 'https://router.project-osrm.org/route/v1/foot/'
  const coord = `${nowLocation.longitude},${nowLocation.latitude};${destination.longitude},${destination.latitude}`
  const parameter = 'overview=full&geometries=geojson'

  const url = `${baseUrl}${coord}?${parameter}`
  try {
    const response = await fetch(url)
    const data = await response.json()
    
    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const route = data.routes[0]
      const routeCoord = route.geometry.coordinates.map(coords => L.latLng(coords[1],coords[0]))
      return routeCoord
    }
  } catch (error) {
    console.error("Error fetching route data:", error);
  }
}

export function getFacilitiesByDistance(
  nowLocation: NowLocation,
  facilities: AEDFacility[]
): FacilityDistance[] {
  return facilities
    .map((facility) => ({
      facility,
      distance: getEuclidRange(nowLocation, facility),
    }))
    .sort((a, b) => a.distance - b.distance)
}

function getEuclidRange(nowLocation: NowLocation, destination: AEDFacility): number {
  let latDiff = (nowLocation.latitude - destination.latitude) ** 2
  let lonDiff = (nowLocation.longitude - destination.longitude) ** 2
  return Math.sqrt(latDiff + lonDiff)
}

export async function getNowLocation(): Promise<NowLocation>{
  return new Promise((resolve, reject) => {
  
    async function success(position) {
      resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      })
    }
  
    function error() {
      reject(new Error("Unable to retrieve your location"))
      return
    }
  
    if (!navigator.geolocation) {
      reject(new Error("このブラウザーは位置情報に対応していません"))
      return
    } else {
      console.info("位置情報を取得中…");
      navigator.geolocation.getCurrentPosition(success, error);
    }
  })
}
