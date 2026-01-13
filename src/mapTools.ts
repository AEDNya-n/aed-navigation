import { LocateControl } from "leaflet.locatecontrol";
import "./libs/leaflet.usermarker.js"
import L from "leaflet"
import type { AEDFacility } from "./filter.js";

declare global {
  namespace L {
    function userMarker(
      latlng: L.LatLngExpression,
      options?: Record<string, unknown>
    ): L.Marker;
  }
}

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

let mapInstance: L.Map | null = null;
let destinationMarker: L.Marker | null = null;
let routePolyline: L.Polyline | null = null;
let nowLocationCache: NowLocation | null = null;

export async function setup(
  facilities: AEDFacility[],
  options?: SetupOptions
): Promise<void> {
  if (!facilities.length) return;

  try {
    const nowLocation = await getNowLocation();
    const sortedFacilities = getFacilitiesByDistance(nowLocation, facilities);
    if (!sortedFacilities.length) return;

    const destination = sortedFacilities[0].facility;
    console.info("Map setup", {
      facilityCount: facilities.length,
      availableDestinations: sortedFacilities.length,
      initialDestination: destination.locationName,
    });
    const map = initMapView(nowLocation);
    mapInstance = map;
    nowLocationCache = nowLocation;

    destinationMarker = renderDestinationPin(map, destination);
    const route = await getRoute(nowLocation, destination);
    if (route) {
      routePolyline = renderRoute(map, route);
    } else {
      centerOnDestination(map, destination);
    }

    options?.onNearestReady?.({
      nearestFacility: destination,
      nowLocation,
      sortedFacilities,
    });
  } catch (error) {
    console.error("地図セットアップエラー:", error);
    const mapEl = document.getElementById("map");
    if (mapEl) {
      mapEl.innerHTML = `
        <div class="error-message" style="display: flex; align-items: center; justify-content: center; height: 100%; flex-direction: column; gap: 20px; padding: 20px; text-align: center;">
          <i class="fa-solid fa-location-dot" style="font-size: 48px; color: #ccc;"></i>
          <div>
            <p style="font-weight: bold; margin-bottom: 8px;">位置情報の取得に失敗しました</p>
            <p style="font-size: 14px; color: #666;">
              ${error instanceof Error ? error.message : '予期しないエラーが発生しました'}
            </p>
            <p style="font-size: 12px; color: #999; margin-top: 12px;">ブラウザの設定で位置情報へのアクセスを許可してください</p>
          </div>
        </div>
      `;
    }
  }
}

function initMapView(nowLocation: NowLocation): L.Map {
  console.log("initMapView")
  console.log(nowLocation.latitude)
  const map = L.map("map").setView([nowLocation.latitude, nowLocation.longitude], 18)
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

function renderRoute(map: L.Map, route: L.LatLngExpression[]): L.Polyline {
  const polyline = L.polyline(route, {
    color: 'blue',
    weight: 5,
    opacity: 0.5,
  }).addTo(map);

  const bounds = L.latLngBounds(route);
  map.setView(bounds.getCenter());
  map.fitBounds(polyline.getBounds());
  return polyline;
}

function renderDestinationPin(map: L.Map, destination: AEDFacility): L.Marker {
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

  const popupContent = document.createElement("div");
  popupContent.className = "destination-popup";

  const nameElement = document.createElement("strong");
  nameElement.textContent = destination.locationName ?? "";
  popupContent.appendChild(nameElement);

  popupContent.appendChild(document.createElement("br"));

  const addressElement = document.createElement("span");
  addressElement.textContent = destination.locationAddress ?? "";
  popupContent.appendChild(addressElement);

  marker.bindPopup(popupContent);
  return marker;
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
    if (!response.ok) {
      console.error(
        `Error fetching route data: HTTP ${response.status} ${response.statusText} for URL ${url}`
      );
      return;
    }
    const data = await response.json()
    
    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const route = data.routes[0]
      const routeCoord = route.geometry.coordinates.map((coords: [number, number]) => L.latLng(coords[1],coords[0]))
      console.info("Route data fetched", {
        distance: route.distance,
        duration: route.duration,
        points: routeCoord.length,
      });
      return routeCoord
    }
    console.warn("Route data unavailable", {
      code: data.code,
      routesLength: data.routes?.length,
      message: data.message,
    });
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
    // セキュアコンテキストの確認
    if (!window.isSecureContext) {
      console.warn("警告: セキュアコンテキストではありません。位置情報へのアクセスが制限される可能性があります。");
      console.warn(`現在のプロトコル: ${window.location.protocol}`);
      console.warn(`現在のホスト: ${window.location.hostname}`);
    }

    if (!navigator.geolocation) {
      reject(new Error("このブラウザーは位置情報に対応していません"))
      return
    }

    function success(position: GeolocationPosition) {
      console.info("位置情報取得成功:", {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      })
    }

    function error(err: GeolocationPositionError) {
      let errorMsg = err.message;
      
      // エラーコードごとの詳細メッセージ
      if (err.code === 1) {
        errorMsg = "ユーザーが位置情報へのアクセスを拒否しました";
      } else if (err.code === 2) {
        errorMsg = "位置情報が取得できません（GPS信号が弱い可能性があります）";
      } else if (err.code === 3) {
        errorMsg = "位置情報の取得がタイムアウトしました（ネットワーク接続を確認してください）";
      }
      
      console.error("位置情報取得エラー:", {
        code: err.code,
        message: err.message,
        translatedMessage: errorMsg
      });
      reject(new Error(errorMsg))
    }

    console.info("位置情報を取得中…");
    console.info(`セキュアコンテキスト: ${window.isSecureContext ? "はい（HTTPS）" : "いいえ（HTTP）"}`);
    
    // タイムアウト10秒、最大キャッシュ5秒、高精度を有効化
    navigator.geolocation.getCurrentPosition(success, error, {
      timeout: 10000,
      maximumAge: 5000,
      enableHighAccuracy: true
    });
  })
}

export async function updateDestination(facility: AEDFacility): Promise<void> {
  if (!mapInstance || !nowLocationCache) {
    console.warn("地図が初期化されていません");
    return;
  }

  console.info("Update destination", {
    facility: facility.locationName,
    latitude: facility.latitude,
    longitude: facility.longitude,
    hasMarker: Boolean(destinationMarker),
    hasRoute: Boolean(routePolyline),
  });

  if (destinationMarker) {
    mapInstance.removeLayer(destinationMarker);
    destinationMarker = null;
  }

  if (routePolyline) {
    mapInstance.removeLayer(routePolyline);
    routePolyline = null;
  }

  destinationMarker = renderDestinationPin(mapInstance, facility);
  const route = await getRoute(nowLocationCache, facility);
  if (route) {
    console.info("Route update success", {
      pointCount: route.length,
    });
    routePolyline = renderRoute(mapInstance, route);
    return;
  }

  console.warn("Route update skipped; centering on destination");
  centerOnDestination(mapInstance, facility);
}

function centerOnDestination(map: L.Map, facility: AEDFacility): void {
  map.setView([facility.latitude, facility.longitude], Math.max(map.getZoom(), 18));
}
