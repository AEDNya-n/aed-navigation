import "leaflet.locatecontrol"
import L from "leaflet";

export function initMapView(nowLocation: number[]){
  var map = L.map("map-container").setView(nowLocation[0], nowLocation[1])
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map)
  
  L.control.locate().addTo(map);

}

function getNearLocation() {

}

function calculateDistance() {

}

export function getNowLocation(): number[] | undefined {

  async function success(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    console.info(`lat: ${latitude}°、log: ${longitude}°`);
    return [latitude, longitude]
  }

  function error() {
    console.error("Unable to retrieve your location");
    return undefined
  }

  if (!navigator.geolocation) {
    console.error("このブラウザーは位置情報に対応していません");
    return undefined
  } else {
    console.info("位置情報を取得中…");
    navigator.geolocation.getCurrentPosition(success, error);
  }
}
