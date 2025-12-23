import type { AEDFacility } from "./filter.ts";

/**
 * CSVをパースしてAEDFacilityオブジェクトの配列に変換
 */
export async function loadAEDDataFromCSV(csvUrl: string): Promise<AEDFacility[]> {
  const response = await fetch(csvUrl);
  const csvText = await response.text();
  
  const lines = csvText.trim().split("\n");
  
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
      organizationCode: values[0] || "",
      organizationName: values[1] || "",
      locationName: values[2] || "",
      locationNameKana: values[3] || "",
      locationAddress: values[4] || "",
      latitude: parseFloat(values[5]) || 0,
      longitude: parseFloat(values[6]) || 0,
      availableDays: values[7] || "",
      mondayAvailableStartTime: values[8] || "",
      mondayAvailableEndTime: values[9] || "",
      tuesdayAvailableStartTime: values[10] || "",
      tuesdayAvailableEndTime: values[11] || "",
      wednesdayAvailableStartTime: values[12] || "",
      wednesdayAvailableEndTime: values[13] || "",
      thursdayAvailableStartTime: values[14] || "",
      thursdayAvailableEndTime: values[15] || "",
      fridayAvailableStartTime: values[16] || "",
      fridayAvailableEndTime: values[17] || "",
      saturdayAvailableStartTime: values[18] || "",
      saturdayAvailableEndTime: values[19] || "",
      sundayAvailableStartTime: values[20] || "",
      sundayAvailableEndTime: values[21] || "",
      holidayAvailableStartTime: values[22] || "",
      holidayAvailableEndTime: values[23] || "",
      holidayAvailable: values[24] === "TRUE",
      holidayNextDayAvailable: values[25] === "TRUE",
      acceptableHolidays: values[26] || "",
      invalidHolidays: values[27] || "",
      unavailableNthMonday: values[28] || "",
      unavailableNthTuesday: values[29] || "",
      unavailableNthWednesday: values[30] || "",
      unavailableNthThursday: values[31] || "",
      unavailableNthFriday: values[32] || "",
      unavailableNthSaturday: values[33] || "",
      unavailableNthSunday: values[34] || "",
      unavailableDates: values[35] || "",
      notes: values[36] || "",
    };
    
    facilities.push(facility);
  }
  
  return facilities;
}
