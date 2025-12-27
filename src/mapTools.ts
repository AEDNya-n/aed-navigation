import { LocateControl } from "leaflet.locatecontrol";
import "./libs/leaflet.usermarker.js"
import L from "leaflet"
import type { AEDFacility } from "./filter.js";

interface NowLocation {
  latitude: number;
  longitude: number;
}

interface DistanceList {
  name: string,
  distance: number
}

export async function setup(facilities: AEDFacility[]) {
  const nowLocation = await getNowLocation()
  const map = initMapView(nowLocation)
  const distanceList = getNearLocation(nowLocation, facilities)
  const destination = facilities.find((element) => element.locationName === distanceList[0].name)
  if (!destination) return
  const route = await getRoute(nowLocation, destination)
  renderRoute(map, route)
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
      L.polyline(route, {
        color: 'blue',
        weight: 5,
        opacity: 0.5,
      }).addTo(map)
      
      const bounds = L.latLngBounds(route)
      map.setView(bounds.getCenter(), 18)
      console.log(map)
}

async function getRoute(nowLocation: NowLocation, destination: AEDFacility) {
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

function getNearLocation(nowLocation: NowLocation, facilities: AEDFacility[]) {
  let distanceList: DistanceList[] = []
  facilities.forEach(element => {
    distanceList.push({name: element.locationName, distance: getEuclidRange(nowLocation, element)})
  });
  
  distanceList.sort((a, b) => {
    return b - a
  })

  return distanceList
}

function getEuclidRange(nowLocation: NowLocation, destination: AEDFacility): number {
  let latDiff = (nowLocation.latitude - destination.latitude) ** 2
  let lonDiff = (nowLocation.longitude - destination.longitude) ** 2
  return Math.sqrt(latDiff + lonDiff)
}

async function getNowLocation(): Promise<NowLocation>{
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
