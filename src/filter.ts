import * as holiday_jp from '@holiday-jp/holiday_jp';

// AED施設データの型定義
export interface AEDFacility {
  id: number;
  organizationCode: string;
  organizationName: string;
  locationName: string;
  locationNameKana: string;
  locationAddress: string;
  latitude: number;
  longitude: number;
  availableDays: string;
  mondayAvailableStartTime: string;
  mondayAvailableEndTime: string;
  tuesdayAvailableStartTime: string;
  tuesdayAvailableEndTime: string;
  wednesdayAvailableStartTime: string;
  wednesdayAvailableEndTime: string;
  thursdayAvailableStartTime: string;
  thursdayAvailableEndTime: string;
  fridayAvailableStartTime: string;
  fridayAvailableEndTime: string;
  saturdayAvailableStartTime: string;
  saturdayAvailableEndTime: string;
  sundayAvailableStartTime: string;
  sundayAvailableEndTime: string;
  holidayAvailableStartTime: string;
  holidayAvailableEndTime: string;
  holidayAvailable: boolean;
  holidayNextDayAvailable: boolean;
  acceptableHolidays: string;
  invalidHolidays: string;
  unavailableNthMonday: string;
  unavailableNthTuesday: string;
  unavailableNthWednesday: string;
  unavailableNthThursday: string;
  unavailableNthFriday: string;
  unavailableNthSaturday: string;
  unavailableNthSunday: string;
  unavailableDates: string;
  notes: string;
}

/**
 * 日付が日本の祝日かどうかを判定
 */
export function isJapaneseHoliday(date: Date): boolean {
  return holiday_jp.isHoliday(date);
}

/**
 * 日付がその月の第何曜日かを計算（例: 第3月曜日 = 3）
 */
function getNthWeekdayOfMonth(date: Date): number {
  const day = date.getDate();
  return Math.ceil(day / 7);
}

/**
 * 時刻文字列かどうかを判定
 */
function isTimeString(str: string): boolean {
  // 日付型に変換できるかどうかでチェック(9:00や21:30などの形式を想定)
  const timePattern = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timePattern.test(str);
}

/**
 * 時刻文字列（HH:MM形式）を分単位に変換
 */
function timeToMinutes(timeStr: string): number {
  if (!timeStr) return -1;
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * 特定の日付が利用不可日に含まれているかチェック
 */
function isInUnavailableDates(date: Date, unavailableDates: string): boolean {
  if (!unavailableDates) return false;
  
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const dateStr = `${month}-${day}`;
  
  const unavailableList = unavailableDates.split("|");
  return unavailableList.includes(dateStr);
}

/**
 * 利用できない祝日かどうかを判定
 */
function isInvalidHoliday(date: Date, invalidHolidays: string): boolean {
  if (!invalidHolidays) return false;
  const holidayName = holiday_jp.between(date, date)?.[0]?.name;
  if (!holidayName) return false;
  
  const invalidList = invalidHolidays.split("|");
  return invalidList.includes(holidayName);
}

/**
 * 利用できる祝日かどうかを判定
 */
function isAcceptableHoliday(date: Date, acceptableHolidays: string): boolean {
  if (!acceptableHolidays) return false;
  const holidayName = holiday_jp.between(date, date)?.[0]?.name;
  if (!holidayName) return false;
  
  const acceptableList = acceptableHolidays.split("|");
  return acceptableList.includes(holidayName);
}

/**
 * 前日が祝日かどうかを判定
 */
function isPreviousDayHoliday(date: Date): boolean {
  const previousDay = new Date(date);
  previousDay.setDate(previousDay.getDate() - 1);
  return isJapaneseHoliday(previousDay);
}

/**
 * 現在時刻が営業時間内かチェック(25時間以上の場合対応)
 */
function isWithinOperatingHours(currentMinutes: number, startMinutes: number, endMinutes: number): boolean {
  if (startMinutes <= endMinutes) {
    // 通常の営業時間 (例: 09:00 - 21:00)
    // console.log("通常営業時間");
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  } else {
    // 24時間を超える営業時間 (例: 20:00 - 02:00)
    // console.log("24時間超営業時間");
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  }
}

/**
 * 施設が現在の日時に利用可能かどうかを判定
 */
export function isAvailable(facility: AEDFacility, currentDate: Date = new Date()): boolean {
  const dayOfWeek = currentDate.getDay(); // 0=日曜, 1=月曜, ..., 6=土曜
  const isHoliday = isJapaneseHoliday(currentDate);
  const isPrevDayHoliday = isPreviousDayHoliday(currentDate);
  const nthWeekday = getNthWeekdayOfMonth(currentDate);
  
  const currentMinutes = currentDate.getHours() * 60 + currentDate.getMinutes();

  const timeFields = [
    [facility.sundayAvailableStartTime, facility.sundayAvailableEndTime],
    [facility.mondayAvailableStartTime, facility.mondayAvailableEndTime],
    [facility.tuesdayAvailableStartTime, facility.tuesdayAvailableEndTime],
    [facility.wednesdayAvailableStartTime, facility.wednesdayAvailableEndTime],
    [facility.thursdayAvailableStartTime, facility.thursdayAvailableEndTime],
    [facility.fridayAvailableStartTime, facility.fridayAvailableEndTime],
    [facility.saturdayAvailableStartTime, facility.saturdayAvailableEndTime],
  ];
  
  // 利用不可日チェック
  if (isInUnavailableDates(currentDate, facility.unavailableDates)) {
    return false;
  }

  // 祝日利用不可チェック
  if (isHoliday && !facility.holidayAvailable && !isAcceptableHoliday(currentDate, facility.acceptableHolidays)) {
    return false;
  }

  // 祝日利用可否チェック
  if (isHoliday) {
    if (isInvalidHoliday(currentDate, facility.invalidHolidays)) {
      return false;
    }
  }
  
  // 祝日の翌日チェック
  if (isPrevDayHoliday && !facility.holidayNextDayAvailable) {
    return false;
  }

  
  // 第N曜日の利用不可チェック
  const nthUnavailableFields = [
    facility.unavailableNthSunday,
    facility.unavailableNthMonday,
    facility.unavailableNthTuesday,
    facility.unavailableNthWednesday,
    facility.unavailableNthThursday,
    facility.unavailableNthFriday,
    facility.unavailableNthSaturday,
  ];
  
  const nthUnavailable = nthUnavailableFields[dayOfWeek];
  if (nthUnavailable) {
    const unavailableNths = nthUnavailable.split("|").map(Number);
    // 第N曜日が利用不可に含まれていてかつ許可祝日でない場合は利用不可
    if (unavailableNths.includes(nthWeekday) && !isAcceptableHoliday(currentDate, facility.acceptableHolidays)) {
      return false;
    }
  }
  
  // 時間のチェック
  let startTime: string;
  let endTime: string;
  
  if (isHoliday) {
    startTime = facility.holidayAvailableStartTime;
    endTime = facility.holidayAvailableEndTime;
    // 祝日の営業時間が設定されていない場合は曜日の営業時間を使用
    if (!startTime || !endTime) {
      [startTime, endTime] = timeFields[dayOfWeek];
    }
  } else {
    [startTime, endTime] = timeFields[dayOfWeek];
  }
  
  // 時間が設定されていない場合は利用不可
  if (!startTime || !endTime) {
    return false;
  }

  // 開始時刻と終了時刻が時刻形式ではなく、文字列の場合は例外だが利用可能とする
  if (!isTimeString(startTime) || !isTimeString(endTime)) {
    return true;
  }
  
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  
  // 現在時刻が営業時間内かチェック
  return isWithinOperatingHours(currentMinutes, startMinutes, endMinutes);
}

/**
 * 利用可能な施設のみをフィルタリング
 */
export function filterAvailableFacilities(
  facilities: AEDFacility[],
  currentDate: Date = new Date()
): AEDFacility[] {
  return facilities.filter((facility) => isAvailable(facility, currentDate));
}
