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
            <span class="main-text">Google Map</span>
          </div>
        </button>
      </div>

      <div class="next-location-bar">
        <button class="location-nav-button prev" aria-label="前の候補">
          <i class="fa-solid fa-chevron-left"></i>
        </button>
        <div class="location-info">
          <p class="adjacent-names">
            <span class="adjacent-container">
              <span class="adjacent-label">前:</span>
              <span id="prev-location-name">なし</span>
            </span>
            <span class="adjacent-separator">|</span>
            <span class="adjacent-container">
              <span class="adjacent-label">次:</span>
              <span id="next-location-name">検索中…</span>
            </span>
          </p>
        </div>
        <button class="location-nav-button next" aria-label="次の候補">
          <i class="fa-solid fa-chevron-right"></i>
        </button>
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
      <button class="action-btn" data-footer-action="call">
        <span class="iconify" data-icon="lucide:phone-call"></span>
        <span>救急連絡</span>
      </button>

      <button class="action-btn active" data-footer-action="map">
        <span class="iconify" data-icon="material-symbols:map-outline-sharp"></span>
        <span>最短地図</span>
      </button>

      <button class="action-btn" data-footer-action="aid">
        <span class="iconify" data-icon="material-symbols:medical-services-outline-rounded"></span>
        <span>応急処置</span>
      </button>
    </footer>
  `
  setupNavigationControls();
  setupFooterNavigation();
  await MapTools.setup(facilities, {
    onNearestReady: ({ sortedFacilities }) => {
      initializeNavigation(sortedFacilities)
    }
  })
}

async function loadAndFilterFacilities(): Promise<AEDFacility[]> {
  const facilities = await loadAEDDataFromCSV(`${import.meta.env.BASE_URL}/aed_data.csv`);
  const currentDate = new Date();
  const availableFacilities = filterAvailableFacilities(facilities, currentDate);
  return availableFacilities;
}

interface NavigationState {
  sortedFacilities: MapTools.FacilityDistance[];
  currentIndex: number;
}

let navigationState: NavigationState | null = null;

function initializeNavigation(sortedFacilities: MapTools.FacilityDistance[]): void {
  console.info("Navigation init", {
    total: sortedFacilities.length,
    firstFacility: sortedFacilities[0]?.facility.locationName,
  });
  navigationState = {
    sortedFacilities,
    currentIndex: 0,
  };

  applyFacilitySelection({ skipMapUpdate: true });
  updateNavigationControls();
}

function applyFacilitySelection(options?: { skipMapUpdate?: boolean }): void {
  if (!navigationState || !navigationState.sortedFacilities.length) return;

  const facility = navigationState.sortedFacilities[navigationState.currentIndex]?.facility;
  if (!facility) return;

  console.info("Apply facility selection", {
    index: navigationState.currentIndex,
    total: navigationState.sortedFacilities.length,
    facility: facility.locationName,
    latitude: facility.latitude,
    longitude: facility.longitude,
    skipMapUpdate: Boolean(options?.skipMapUpdate),
  });

  updateNearestFacilityDetails(facility);
  updateAdjacentLocationNames();
  setupGuidanceButton(facility);
  updateNavigationControls();

  if (!options?.skipMapUpdate) {
    void MapTools.updateDestination(facility);
  }
}

function moveFacilitySelection(step: number): void {
  if (!navigationState) return;
  const nextIndex = navigationState.currentIndex + step;
  if (nextIndex < 0 || nextIndex >= navigationState.sortedFacilities.length) return;

  console.info("Move facility selection", {
    currentIndex: navigationState.currentIndex,
    step,
    nextIndex,
    total: navigationState.sortedFacilities.length,
  });

  navigationState.currentIndex = nextIndex;
  applyFacilitySelection();
}

function updateNearestFacilityDetails(facility: AEDFacility): void {
  const facilityNameEl = document.getElementById("facility-name")
  if (facilityNameEl) facilityNameEl.textContent = facility.locationName


  const addressEl = document.getElementById("location-address")
  if (addressEl) addressEl.textContent = `${facility.organizationName} ${facility.locationAddress} `

  const timeEl = document.getElementById("facility-time-text")
  if (timeEl) timeEl.textContent = facility.availableDays || "利用時間情報は登録されていません"

  const notesEl = document.getElementById("facility-notes")
  if (notesEl) {
    notesEl.textContent = facility.notes ? facility.notes : "特記事項は登録されていません"
  }
}


function updateAdjacentLocationNames(): void {
  const prevNameEl = document.getElementById("prev-location-name");
  const nextNameEl = document.getElementById("next-location-name");
  if (!navigationState) {
    if (prevNameEl) prevNameEl.textContent = "なし";
    if (nextNameEl) nextNameEl.textContent = "なし";
    return;
  }

  const { sortedFacilities, currentIndex } = navigationState;
  const prevFacility = sortedFacilities[currentIndex - 1]?.facility;
  const nextFacility = sortedFacilities[currentIndex + 1]?.facility;

  if (prevNameEl) prevNameEl.textContent = prevFacility ? prevFacility.locationName : "なし";
  if (nextNameEl) nextNameEl.textContent = nextFacility ? nextFacility.locationName : "なし";
}

function setupNavigationControls(): void {
  const prevButton = document.querySelector<HTMLButtonElement>('.location-nav-button.prev');
  const nextButton = document.querySelector<HTMLButtonElement>('.location-nav-button.next');

  prevButton?.addEventListener('click', () => {
    console.debug("Prev button clicked");
    moveFacilitySelection(-1);
  });
  nextButton?.addEventListener('click', () => {
    console.debug("Next button clicked");
    moveFacilitySelection(1);
  });
}

function updateNavigationControls(): void {
  const prevButton = document.querySelector<HTMLButtonElement>('.location-nav-button.prev');
  const nextButton = document.querySelector<HTMLButtonElement>('.location-nav-button.next');

  if (!navigationState) {
    if (prevButton) prevButton.disabled = true;
    if (nextButton) nextButton.disabled = true;
    return;
  }

  prevButton?.setAttribute('aria-disabled', String(navigationState.currentIndex === 0));
  nextButton?.setAttribute('aria-disabled', String(navigationState.currentIndex >= navigationState.sortedFacilities.length - 1));

  if (prevButton) prevButton.disabled = navigationState.currentIndex === 0;
  if (nextButton) nextButton.disabled = navigationState.currentIndex >= navigationState.sortedFacilities.length - 1;
}

function setupFooterNavigation(): void {
  const callButton = document.querySelector<HTMLButtonElement>('[data-footer-action="call"]');
  const mapButton = document.querySelector<HTMLButtonElement>('[data-footer-action="map"]');
  const aidButton = document.querySelector<HTMLButtonElement>('[data-footer-action="aid"]');

  callButton?.addEventListener('click', () => {
    window.location.href = `${import.meta.env.BASE_URL}/contact.html`;
  });

  mapButton?.addEventListener('click', () => {
    if (!mapButton.classList.contains('active')) {
      window.location.href = `${import.meta.env.BASE_URL}`;
    }
  });

  aidButton?.addEventListener('click', () => {
    window.open('https://www.fdma.go.jp/mission/enrichment/appropriate/', '_blank');
  });
}

function setupGuidanceButton(facility: AEDFacility): void {
  const button = document.querySelector<HTMLButtonElement>('.guidance-button')
  if (!button) return

  button.onclick = () => {
    // Google Mapsへのルート案内URL (徒歩モード)
    const url = `https://www.google.com/maps/dir/?api=1&destination=${facility.latitude},${facility.longitude}&travelmode=walking`
    window.open(url, '_blank')
  }
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

