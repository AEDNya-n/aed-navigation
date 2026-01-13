import"./modulepreload-polyfill-B5Qt9EMX.js";import{s as r,u}from"./mapTools-CzkS7rfn.js";import{l as p,f}from"./filter-CxIDbtkt.js";async function m(){const t=document.querySelector("#app"),n=await v();console.log(`利用可能な施設の件数: ${n.length}`),t&&(t.innerHTML=`
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
          <p class="label">表示中の地点</p>
          <p class="location-name" id="current-location-name">検索中…</p>
          <p class="adjacent-names">
            <span class="adjacent-label">前:</span>
            <span id="prev-location-name">なし</span>
            <span class="adjacent-separator">|</span>
            <span class="adjacent-label">次:</span>
            <span id="next-location-name">検索中…</span>
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
  `,h(),w(),await r(n,{onNearestReady:({sortedFacilities:a})=>{b(a)}}))}async function v(){const t=await p("/aed-navigation/aed_data.csv");return f(t,new Date)}let e=null;function b(t){console.info("Navigation init",{total:t.length,firstFacility:t[0]?.facility.locationName}),e={sortedFacilities:t,currentIndex:0},s({skipMapUpdate:!0}),d()}function s(t){if(!e||!e.sortedFacilities.length)return;const n=e.sortedFacilities[e.currentIndex]?.facility;n&&(console.info("Apply facility selection",{index:e.currentIndex,total:e.sortedFacilities.length,facility:n.locationName,latitude:n.latitude,longitude:n.longitude,skipMapUpdate:!!t?.skipMapUpdate}),x(n),g(n.locationName),y(),E(n),d(),t?.skipMapUpdate||u(n))}function l(t){if(!e)return;const n=e.currentIndex+t;n<0||n>=e.sortedFacilities.length||(console.info("Move facility selection",{currentIndex:e.currentIndex,step:t,nextIndex:n,total:e.sortedFacilities.length}),e.currentIndex=n,s())}function x(t){const n=document.getElementById("facility-name");n&&(n.textContent=t.locationName);const a=document.getElementById("location-address");a&&(a.textContent=`${t.organizationName} ${t.locationAddress} `);const i=document.getElementById("facility-time-text");i&&(i.textContent=t.availableDays||"利用時間情報は登録されていません");const o=document.getElementById("facility-notes");o&&(o.textContent=t.notes?t.notes:"特記事項は登録されていません")}function g(t){const n=document.getElementById("current-location-name");n&&(n.textContent=t??"名称不明")}function y(){const t=document.getElementById("prev-location-name"),n=document.getElementById("next-location-name");if(!e){t&&(t.textContent="なし"),n&&(n.textContent="なし");return}const{sortedFacilities:a,currentIndex:i}=e,o=a[i-1]?.facility,c=a[i+1]?.facility;t&&(t.textContent=o?o.locationName:"なし"),n&&(n.textContent=c?c.locationName:"なし")}function h(){const t=document.querySelector(".location-nav-button.prev"),n=document.querySelector(".location-nav-button.next");t?.addEventListener("click",()=>{console.debug("Prev button clicked"),l(-1)}),n?.addEventListener("click",()=>{console.debug("Next button clicked"),l(1)})}function d(){const t=document.querySelector(".location-nav-button.prev"),n=document.querySelector(".location-nav-button.next");if(!e){t&&(t.disabled=!0),n&&(n.disabled=!0);return}t?.setAttribute("aria-disabled",String(e.currentIndex===0)),n?.setAttribute("aria-disabled",String(e.currentIndex>=e.sortedFacilities.length-1)),t&&(t.disabled=e.currentIndex===0),n&&(n.disabled=e.currentIndex>=e.sortedFacilities.length-1)}function w(){const t=document.querySelector('[data-footer-action="call"]'),n=document.querySelector('[data-footer-action="map"]'),a=document.querySelector('[data-footer-action="aid"]');t?.addEventListener("click",()=>{window.location.href="/aed-navigation/contact.html"}),n?.addEventListener("click",()=>{n.classList.contains("active")||(window.location.href="/aed-navigation")}),a?.addEventListener("click",()=>{window.open("https://www.fdma.go.jp/mission/enrichment/appropriate/","_blank")})}function E(t){const n=document.querySelector(".guidance-button");n&&(n.onclick=()=>{const a=`https://www.google.com/maps/dir/?api=1&destination=${t.latitude},${t.longitude}&travelmode=walking`;window.open(a,"_blank")})}m().catch(t=>{console.error("アプリケーション起動エラー:",t);const n=document.querySelector("#app");n&&(n.innerHTML=`
      <div style="display: flex; align-items: center; justify-content: center; height: 100vh; flex-direction: column; gap: 20px; padding: 20px; text-align: center; background: white;">
        <i class="fa-solid fa-exclamation-triangle" style="font-size: 48px; color: #d32f2f;"></i>
        <div>
          <p style="font-weight: bold; font-size: 18px; margin-bottom: 8px;">アプリケーション起動エラー</p>
          <p style="font-size: 14px; color: #666; margin-bottom: 8px;">
            ${t instanceof Error?t.message:"システムエラーが発生しました"}
          </p>
          <p style="font-size: 12px; color: #999;">ブラウザをリロードしてください</p>
        </div>
      </div>
    `)});
