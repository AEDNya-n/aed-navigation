import "leaflet.locatecontrol"
import L from "leaflet";

export interface NowLocation {
  latitude: number;
  longitude: number;
}

export function initMapView(nowLocation: NowLocation){
  console.log("initMapView")
  console.log(nowLocation.latitude)
  var map = L.map("map").setView([nowLocation.latitude, nowLocation.longitude], 18)
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
