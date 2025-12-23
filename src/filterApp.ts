import { loadAEDDataFromCSV } from "./csvLoader.ts";
import { filterAvailableFacilities, type AEDFacility } from "./filter.ts";

/**
 * 施設リストをHTMLに表示
 */
function displayFacilities(facilities: AEDFacility[], container: HTMLElement) {
  container.innerHTML = "";

  if (facilities.length === 0) {
    const message = document.createElement("p");
    message.textContent = "現在利用可能な施設はありません。";
    container.appendChild(message);
    return;
  }

  const list = document.createElement("ul");
  list.className = "facility-list";

  facilities.forEach((facility) => {
    const item = document.createElement("li");
    item.className = "facility-item";

    const header = document.createElement("div");
    header.className = "facility-header";

    const title = document.createElement("h3");
    title.textContent = facility.locationName;
    header.appendChild(title);

    const organization = document.createElement("span");
    organization.className = "organization";
    organization.textContent = facility.organizationName;
    header.appendChild(organization);

    const details = document.createElement("div");
    details.className = "facility-details";

    const address = document.createElement("p");
    address.className = "address";
    address.textContent = facility.locationAddress;
    details.appendChild(address);

    const coordinates = document.createElement("p");
    coordinates.className = "coordinates";
    coordinates.textContent = `緯度: ${facility.latitude}, 経度: ${facility.longitude}`;
    details.appendChild(coordinates);

    const availableDays = document.createElement("p");
    availableDays.className = "available-days";
    availableDays.textContent = facility.availableDays;
    details.appendChild(availableDays);

    if (facility.notes) {
      const notes = document.createElement("p");
      notes.className = "notes";
      notes.textContent = facility.notes;
      details.appendChild(notes);
    }

    item.appendChild(header);
    item.appendChild(details);

    list.appendChild(item);
  });
  container.appendChild(list);
}

/**
 * 日付と時間の入力値からDateオブジェクトを生成
 */
function createDateFromInputs(dateInput: HTMLInputElement, timeInput: HTMLInputElement): Date {
  const dateStr = dateInput.value;
  const timeStr = timeInput.value;
  return new Date(`${dateStr}T${timeStr}`);
}

/**
 * フィルタリングを実行して結果を表示
 */
function updateFilteredFacilities(
  facilities: AEDFacility[],
  dateInput: HTMLInputElement,
  timeInput: HTMLInputElement,
  resultElement: HTMLElement,
  countElement: HTMLElement
) {
  const selectedDate = createDateFromInputs(dateInput, timeInput);
  const availableFacilities = filterAvailableFacilities(facilities, selectedDate);
  
  countElement.textContent = `${availableFacilities.length} 件`;
  displayFacilities(availableFacilities, resultElement);
}

/**
 * アプリケーションの初期化
 */
export async function initFilterApp() {
  const loadingElement = document.getElementById("loading");
  const resultElement = document.getElementById("result");
  const countElement = document.getElementById("count");
  const currentDateElement = document.getElementById("input_date") as HTMLInputElement;
  const currentTimeElement = document.getElementById("input_time") as HTMLInputElement;
  
  if (!loadingElement || !resultElement || !countElement || !currentDateElement || !currentTimeElement) {
    console.error("Required DOM elements not found");
    return;
  }
  
  try {
    // 現在時刻を初期値として設定
    const now = new Date();
    currentDateElement.value = now.toISOString().split("T")[0];
    currentTimeElement.value = now.toTimeString().slice(0, 5);
    
    // CSVデータをロード
    loadingElement.style.display = "block";
    const facilities = await loadAEDDataFromCSV(`${import.meta.env.BASE_URL}/aed_data.csv`);
    loadingElement.style.display = "none";
    
    // 初回フィルタリング
    updateFilteredFacilities(facilities, currentDateElement, currentTimeElement, resultElement, countElement);
    
    // 日付・時間変更時のイベントリスナーを追加
    currentDateElement.addEventListener("change", () => {
      console.log(`日付変更: ${currentDateElement.value}`);
      updateFilteredFacilities(facilities, currentDateElement, currentTimeElement, resultElement, countElement);
    });
    
    currentTimeElement.addEventListener("change", () => {
      console.log(`時間変更: ${currentTimeElement.value}`);
      updateFilteredFacilities(facilities, currentDateElement, currentTimeElement, resultElement, countElement);
    });
    
  } catch (error) {
    loadingElement.style.display = "none";
    resultElement.innerHTML = `<p class="error">データの読み込みに失敗しました: ${error}</p>`;
    console.error("Error loading AED data:", error);
  }
}
