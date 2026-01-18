import"./modulepreload-polyfill-B5Qt9EMX.js";import{s as b,u as y}from"./mapTools-B90QuwtO.js";import{l as x,f as g,h}from"./filter-DHkFs3_6.js";async function E(){const t=document.querySelector("#app"),e=await A();console.log(`利用可能な施設の件数: ${e.length}`),t&&(t.innerHTML=`
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
          <h2>利用可能日</h2>
          <p class="date-text" id="facility-date-text">読み込み中…</p>
        </div>
        <hr class="divider">
        <div class="info-row">
          <h2>利用可能時間</h2>
          <p class="time-text" id="facility-time-text">読み込み中…</p>
        </div>
        <hr class="divider">
        <div class="info-row">
          <h2>補足</h2>
          <p class="supplement-text" id="facility-notes">読み込み中…</p>
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
  `,I(),N(),await b(e,{onNearestReady:({sortedFacilities:n})=>{w(n)}}))}async function A(){const t=await x("/aed-navigation/aed_data.csv");return g(t,new Date)}let a=null;function w(t){console.info("Navigation init",{total:t.length,firstFacility:t[0]?.facility.locationName}),a={sortedFacilities:t,currentIndex:0},m({skipMapUpdate:!0}),v()}function m(t){if(!a||!a.sortedFacilities.length)return;const e=a.sortedFacilities[a.currentIndex]?.facility;e&&(console.info("Apply facility selection",{index:a.currentIndex,total:a.sortedFacilities.length,facility:e.locationName,latitude:e.latitude,longitude:e.longitude,skipMapUpdate:!!t?.skipMapUpdate}),S(e),T(),F(e),v(),t?.skipMapUpdate||y(e))}function p(t){if(!a)return;const e=a.currentIndex+t;e<0||e>=a.sortedFacilities.length||(console.info("Move facility selection",{currentIndex:a.currentIndex,step:t,nextIndex:e,total:a.sortedFacilities.length}),a.currentIndex=e,m())}function S(t){const e=document.getElementById("facility-name");e&&(e.textContent=t.locationName);const n=document.getElementById("location-address");n&&(n.textContent=`${t.organizationName} ${t.locationAddress} `);const i=document.getElementById("facility-date-text");i&&(i.textContent=t.availableDays||"利用可能日情報は登録されていません");const o=document.getElementById("facility-time-text");if(o){const f=[{start:t.mondayAvailableStartTime,end:t.mondayAvailableEndTime},{start:t.tuesdayAvailableStartTime,end:t.tuesdayAvailableEndTime},{start:t.wednesdayAvailableStartTime,end:t.wednesdayAvailableEndTime},{start:t.thursdayAvailableStartTime,end:t.thursdayAvailableEndTime},{start:t.fridayAvailableStartTime,end:t.fridayAvailableEndTime},{start:t.saturdayAvailableStartTime,end:t.saturdayAvailableEndTime},{start:t.sundayAvailableStartTime,end:t.sundayAvailableEndTime},{start:t.holidayAvailableStartTime,end:t.holidayAvailableEndTime}],d=new Date,r=h.isHoliday(d);console.log(`今日は${r?"":"平日"}です`);let l;if(r&&t.holidayAvailableStartTime&&t.holidayAvailableEndTime)l=`祝日: ${t.holidayAvailableStartTime} ～ ${t.holidayAvailableEndTime}`;else{const u=d.getDay(),c=f[u];c.start&&c.end?l=`${["日曜","月曜","火曜","水曜","木曜","金曜","土曜"][u]}: ${c.start} ～ ${c.end}`:l="本日の利用時間情報は登録されていません"}o.textContent=l}const s=document.getElementById("facility-notes");s&&(s.textContent=t.notes?t.notes:"特記事項は登録されていません")}function T(){const t=document.getElementById("prev-location-name"),e=document.getElementById("next-location-name");if(!a){t&&(t.textContent="なし"),e&&(e.textContent="なし");return}const{sortedFacilities:n,currentIndex:i}=a,o=n[i-1]?.facility,s=n[i+1]?.facility;t&&(t.textContent=o?o.locationName:"なし"),e&&(e.textContent=s?s.locationName:"なし")}function I(){const t=document.querySelector(".location-nav-button.prev"),e=document.querySelector(".location-nav-button.next");t?.addEventListener("click",()=>{console.debug("Prev button clicked"),p(-1)}),e?.addEventListener("click",()=>{console.debug("Next button clicked"),p(1)})}function v(){const t=document.querySelector(".location-nav-button.prev"),e=document.querySelector(".location-nav-button.next");if(!a){t&&(t.disabled=!0),e&&(e.disabled=!0);return}t?.setAttribute("aria-disabled",String(a.currentIndex===0)),e?.setAttribute("aria-disabled",String(a.currentIndex>=a.sortedFacilities.length-1)),t&&(t.disabled=a.currentIndex===0),e&&(e.disabled=a.currentIndex>=a.sortedFacilities.length-1)}function N(){const t=document.querySelector('[data-footer-action="call"]'),e=document.querySelector('[data-footer-action="map"]'),n=document.querySelector('[data-footer-action="aid"]');t?.addEventListener("click",()=>{window.location.href="/aed-navigation/contact.html"}),e?.addEventListener("click",()=>{e.classList.contains("active")||(window.location.href="/aed-navigation")}),n?.addEventListener("click",()=>{window.open("https://www.fdma.go.jp/mission/enrichment/appropriate/","_blank")})}function F(t){const e=document.querySelector(".guidance-button");e&&(e.onclick=()=>{const n=`https://www.google.com/maps/dir/?api=1&destination=${t.latitude},${t.longitude}&travelmode=walking`;window.open(n,"_blank")})}E().catch(t=>{console.error("アプリケーション起動エラー:",t);const e=document.querySelector("#app");e&&(e.innerHTML=`
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
