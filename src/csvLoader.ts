import type { AEDFacility } from "./filter.ts";

/**
 * CSVをパースしてAEDFacilityオブジェクトの配列に変換
 */
export async function loadAEDDataFromCSV(csvUrl: string): Promise<AEDFacility[]> {
  try {
    const response = await fetch(csvUrl);
    
    if (!response.ok) {
      throw new Error(`CSVファイル読み込みエラー: HTTP ${response.status} ${response.statusText}`);
    }
    
    const csvText = await response.text();
    
    if (!csvText || csvText.trim().length === 0) {
      throw new Error("CSVファイルが空です");
    }
    
    const lines = csvText.trim().split("\n");
    
    if (lines.length < 2) {
      throw new Error("CSVファイルにヘッダーおよびデータ行がありません");
    }
    
    const facilities: AEDFacility[] = [];
    
    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      
      // CSVの値を解析（カンマ区切り、クオートも考慮）
      const values: string[] = [];
      let currentValue = "";
      let insideQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        
        if (char === '"') {
          insideQuotes = !insideQuotes;
        } else if (char === "," && !insideQuotes) {
          values.push(currentValue.trim());
          currentValue = "";
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue.trim());
      
      // AEDFacilityオブジェクトを構築
      const facility: AEDFacility = {
        id: parseInt(values[0]) || 0,
        organizationCode: values[1] || "",
        organizationName: values[2] || "",
        locationName: values[3] || "",
        locationNameKana: values[4] || "",
        locationAddress: values[5] || "",
        latitude: parseFloat(values[6]) || 0,
        longitude: parseFloat(values[7]) || 0,
        availableDays: values[8] || "",
        mondayAvailableStartTime: values[9] || "",
        mondayAvailableEndTime: values[10] || "",
      tuesdayAvailableStartTime: values[11] || "",
      tuesdayAvailableEndTime: values[12] || "",
      wednesdayAvailableStartTime: values[13] || "",
      wednesdayAvailableEndTime: values[14] || "",
      thursdayAvailableStartTime: values[15] || "",
      thursdayAvailableEndTime: values[16] || "",
      fridayAvailableStartTime: values[17] || "",
      fridayAvailableEndTime: values[18] || "",
      saturdayAvailableStartTime: values[19] || "",
      saturdayAvailableEndTime: values[20] || "",
      sundayAvailableStartTime: values[21] || "",
      sundayAvailableEndTime: values[22] || "",
      holidayAvailableStartTime: values[23] || "",
      holidayAvailableEndTime: values[24] || "",
      holidayAvailable: values[25] === "TRUE",
      holidayNextDayAvailable: values[26] === "TRUE",
      acceptableHolidays: values[27] || "",
      invalidHolidays: values[28] || "",
      unavailableNthMonday: values[29] || "",
      unavailableNthTuesday: values[30] || "",
      unavailableNthWednesday: values[31] || "",
      unavailableNthThursday: values[32] || "",
      unavailableNthFriday: values[33] || "",
      unavailableNthSaturday: values[34] || "",
      unavailableNthSunday: values[35] || "",
      unavailableDates: values[36] || "",
      notes: values[37] || "",
    };
    
    facilities.push(facility);
  }
  
  console.log(`CSVから${facilities.length}件の施設を読み込みました`);
  return facilities;
  } catch (error) {
    console.error("CSVロードエラー:", error);
    throw new Error(`AED施設データの読み込みに失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
