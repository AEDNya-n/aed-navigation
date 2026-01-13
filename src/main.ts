import './style.css'
import { loadAEDDataFromCSV } from './csvLoader';
import { filterAvailableFacilities } from './filter';
import type { AEDFacility } from './filter';

import * as MapTools from "./mapTools.ts"
import "./libs/leaflet.usermarker.css"
import "leaflet/dist/leaflet.css"

async function renderApp(): Promise<void> {
  const app = document.querySelector<HTMLDivElement>('#app')
  const facilities = await loadAndFilterFacilities();
  console.log(`利用可能な施設の件数: ${facilities.length}`);

  
 
  if (!app) return

  app.innerHTML = `
    <header class="header">
      <h1 id="facility-name">検索中…</h1>
      <div class="facility-details">
        <p id="location-organization">読み込み中…</p>
        <p id="location-address">読み込み中…</p>
      </div>
    </header>

    <main class="main-content">
      <div class="map-container" id="map">
        <button class="guidance-button">
          <div class="icon-circle">
            <i class="fa-solid fa-location-dot"></i>
          </div>
          <div class="text-box">
            <span class="main-text">リアルタイム案内</span>
            <span class="sub-text">を開始する</span>
          </div>
        </button>
      </div>

      <div class="next-location-bar">
        <div class="location-info">
          <p class="label">次に近い場所</p>
          <p class="location-name" id="next-location-name">検索中…</p>
        </div>
        <div class="refresh-icon">
          <i class="fa-solid fa-rotate"></i>
        </div>
      </div>

      <div class="info-section">
        <div class="info-row">
          <h2>利用可能時間</h2>
          <p class="time-text" id="facility-time-text">読み込み中…</p>
        </div>
        <hr class="divider">
        <div class="info-row">
          <h2>補足</h2>
          <p class="supplement-text" id="facility-notes">情報を取得しています。</p>
        </div>
      </div>
    </main>

    <footer class="footer-actions">
      <button class="action-btn">
        <span class="iconify" data-icon="lucide:phone-call"></span>
        <span>救急連絡</span>
      </button>

      <button class="action-btn active">
        <span class="iconify" data-icon="material-symbols:map-outline-sharp"></span>
        <span>最短地図</span>
      </button>

      <button class="action-btn">
        <span class="iconify" data-icon="material-symbols:medical-services-outline-rounded"></span>
        <span>応急処置</span>
      </button>
    </footer>
  `
  await MapTools.setup(facilities, {
    onNearestReady: ({ nearestFacility, sortedFacilities }) => {
      updateNearestFacilityDetails(nearestFacility)
      updateNextLocationName(sortedFacilities)
    }
  })
}

async function loadAndFilterFacilities(): Promise<AEDFacility[]> {
  const facilities = await loadAEDDataFromCSV(`${import.meta.env.BASE_URL}/aed_data.csv`);
  const currentDate = new Date();
  const availableFacilities = filterAvailableFacilities(facilities, currentDate);
  return availableFacilities;
}

function updateNearestFacilityDetails(facility: AEDFacility): void {
  const facilityNameEl = document.getElementById("facility-name")
  if (facilityNameEl) facilityNameEl.textContent = facility.locationName

  const orgEl = document.getElementById("location-organization")
  if (orgEl) orgEl.textContent = facility.organizationName

  const addressEl = document.getElementById("location-address")
  if (addressEl) addressEl.textContent = facility.locationAddress || "住所情報なし"

  const timeEl = document.getElementById("facility-time-text")
  if (timeEl) timeEl.textContent = facility.availableDays || "利用時間情報は登録されていません"

  const notesEl = document.getElementById("facility-notes")
  if (notesEl) {
    notesEl.textContent = facility.notes ? facility.notes : "特記事項は登録されていません"
  }
}

function updateNextLocationName(sortedFacilities: MapTools.FacilityDistance[]): void {
  const nameEl = document.getElementById("next-location-name")
  if (!nameEl) return

  const secondFacility = sortedFacilities[1]?.facility
  nameEl.textContent = secondFacility ? secondFacility.locationName : "他の候補はありません"
}

// アプリケーション起動
renderApp().catch(error => {
  console.error("アプリケーション起動エラー:", error);
  const app = document.querySelector<HTMLDivElement>('#app');
  if (app) {
    app.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100vh; flex-direction: column; gap: 20px; padding: 20px; text-align: center; background: white;">
        <i class="fa-solid fa-exclamation-triangle" style="font-size: 48px; color: #d32f2f;"></i>
        <div>
          <p style="font-weight: bold; font-size: 18px; margin-bottom: 8px;">アプリケーション起動エラー</p>
          <p style="font-size: 14px; color: #666; margin-bottom: 8px;">
            ${error instanceof Error ? error.message : 'システムエラーが発生しました'}
          </p>
          <p style="font-size: 12px; color: #999;">ブラウザをリロードしてください</p>
        </div>
      </div>
    `;
  }
});

