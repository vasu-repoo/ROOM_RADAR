export type Slot = {
  id: number;
  uploadId?: number;
  day: string;
  period: string;
  room: string;
  course: string;
  section: string;
  floor: number;
  capacity: number;
  building?: string;
};

export type Room = {
  name: string;
  floor: number;
  capacity: number;
  type: string;
  building: string;
};

export type TimetableUpload = {
  id: number;
  fileName: string;
  building: string;
  section: string;
  academicYear: string;
  entryCount: number;
  createdAt: string;
  updatedAt: string;
};

export const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export const periods = [
  ["1", "8:30 – 9:20"],
  ["2", "9:20 – 10:10"],
  ["3", "10:10 – 11:00"],
  ["4", "11:00 – 11:50"],
  ["5", "11:50 – 12:40"],
  ["6", "12:40 – 1:30"],
  ["7", "1:30 – 2:20"],
  ["8", "2:20 – 3:10"],
  ["9", "3:10 – 4:00"],
];

export function periodFromTime(value: string): string {
  if (!value) return "4";
  const [hours, minutes] = value.split(":").map(Number);
  const total = hours * 60 + minutes;
  const ranges = [
    [510, 560], // 1: 8:30 - 9:20
    [560, 610], // 2: 9:20 - 10:10
    [610, 660], // 3: 10:10 - 11:00
    [660, 710], // 4: 11:00 - 11:50
    [710, 760], // 5: 11:50 - 12:40
    [760, 810], // 6: 12:40 - 1:30
    [810, 860], // 7: 1:30 - 2:20
    [860, 910], // 8: 2:20 - 3:10
    [910, 960], // 9: 3:10 - 4:00
  ];
  const match = ranges.findIndex(
    ([start, end], index) =>
      total >= start && (index === ranges.length - 1 ? total <= end : total < end)
  );
  return match >= 0 ? String(match + 1) : "";
}

export const baseRooms: Room[] = [
  { name: "CL-14", floor: 1, capacity: 64, type: "Classroom", building: "CS/IT Block" },
  { name: "CL-15", floor: 1, capacity: 64, type: "Classroom", building: "CS/IT Block" },
  { name: "CL-16", floor: 1, capacity: 70, type: "Classroom", building: "CS/IT Block" },
  { name: "CL-17", floor: 1, capacity: 70, type: "Classroom", building: "CS/IT Block" },
  { name: "CL-18", floor: 1, capacity: 64, type: "Classroom", building: "CS/IT Block" },
  { name: "Lab-1", floor: 2, capacity: 35, type: "Computer Lab", building: "CS/IT Block" },
  { name: "Lab-2", floor: 2, capacity: 35, type: "Computer Lab", building: "CS/IT Block" },
  { name: "Lab-3", floor: 2, capacity: 35, type: "Computer Lab", building: "CS/IT Block" },
  { name: "Lab-4", floor: 2, capacity: 35, type: "Computer Lab", building: "CS/IT Block" },
  { name: "Project Lab", floor: 2, capacity: 30, type: "Project Space", building: "CS/IT Block" },
  { name: "ML-42", floor: 4, capacity: 60, type: "Classroom", building: "Main/ML Block" },
  { name: "ML-43", floor: 4, capacity: 60, type: "Classroom", building: "Main/ML Block" },
  { name: "ML-44", floor: 4, capacity: 60, type: "Classroom", building: "Main/ML Block" },
];

export const buildingForRoom = (room: string) =>
  room.startsWith("ML-") ? "Main/ML Block" : "CS/IT Block";

export const roomSpecs: Record<string, { floor: number; capacity: number; building: string }> = {
  "CL-14": { floor: 1, capacity: 64, building: "CS/IT Block" },
  "CL-15": { floor: 1, capacity: 64, building: "CS/IT Block" },
  "CL-16": { floor: 1, capacity: 70, building: "CS/IT Block" },
  "CL-17": { floor: 1, capacity: 70, building: "CS/IT Block" },
  "CL-18": { floor: 1, capacity: 64, building: "CS/IT Block" },
  "Lab-1": { floor: 2, capacity: 35, building: "CS/IT Block" },
  "Lab-2": { floor: 2, capacity: 35, building: "CS/IT Block" },
  "Lab-3": { floor: 2, capacity: 35, building: "CS/IT Block" },
  "Lab-4": { floor: 2, capacity: 35, building: "CS/IT Block" },
  "Project Lab": { floor: 2, capacity: 30, building: "CS/IT Block" },
  "ML-42": { floor: 4, capacity: 60, building: "Main/ML Block" },
  "ML-43": { floor: 4, capacity: 60, building: "Main/ML Block" },
  "ML-44": { floor: 4, capacity: 60, building: "Main/ML Block" },
};

let slotIdCounter = 1;
function slot(
  day: string,
  period: string,
  room: string,
  course: string,
  section: string
): Slot {
  const spec = roomSpecs[room] || {
    floor: room.startsWith("ML-") ? 4 : 1,
    capacity: 60,
    building: buildingForRoom(room),
  };
  return {
    id: slotIdCounter++,
    day,
    period: String(period),
    room,
    course,
    section,
    floor: spec.floor,
    capacity: spec.capacity,
    building: spec.building,
  };
}

// -------------------------------------------------------------
// Official AKGEC Computer Science & Engineering Timetables
// W.E.F. 07-Sep-2026 (Semester III, V, VII)
// -------------------------------------------------------------
export const initialSlots: Slot[] = [
  // ==========================================
  // 1. 2nd Year · Section CSE-1 (Room: CL-14)
  // ==========================================
  // Monday
  slot("Monday", "1", "CL-14", "BCS303", "II Year · CSE-1"),
  slot("Monday", "2", "CL-14", "BCS301", "II Year · CSE-1"),
  slot("Monday", "4", "CL-14", "BCS302", "II Year · CSE-1"),
  slot("Monday", "5", "CL-14", "BCS301", "II Year · CSE-1"),
  slot("Monday", "7", "CL-14", "ESE", "II Year · CSE-1"),
  slot("Monday", "8", "Lab-4", "BCS-351 (A+B)", "II Year · CSE-1"),
  slot("Monday", "8", "Project Lab", "BCS-352 (C+D)", "II Year · CSE-1"),
  slot("Monday", "9", "Lab-4", "BCS-351 (A+B)", "II Year · CSE-1"),
  slot("Monday", "9", "Project Lab", "BCS-352 (C+D)", "II Year · CSE-1"),

  // Tuesday
  slot("Tuesday", "1", "Lab-1", "BCS-351 (C+D)", "II Year · CSE-1"),
  slot("Tuesday", "1", "Project Lab", "BCS-353 (A+B)", "II Year · CSE-1"),
  slot("Tuesday", "2", "Lab-1", "BCS-351 (C+D)", "II Year · CSE-1"),
  slot("Tuesday", "2", "Project Lab", "BCS-353 (A+B)", "II Year · CSE-1"),
  slot("Tuesday", "4", "CL-14", "BCS302", "II Year · CSE-1"),
  slot("Tuesday", "5", "CL-14", "BAS301", "II Year · CSE-1"),
  slot("Tuesday", "7", "CL-14", "ESE", "II Year · CSE-1"),
  slot("Tuesday", "8", "CL-14", "BCS303", "II Year · CSE-1"),
  slot("Tuesday", "9", "CL-14", "Self Study", "II Year · CSE-1"),

  // Wednesday
  slot("Wednesday", "1", "CL-14", "BCS302", "II Year · CSE-1"),
  slot("Wednesday", "2", "CL-14", "BCS303", "II Year · CSE-1"),
  slot("Wednesday", "4", "CL-14", "BCS301", "II Year · CSE-1"),
  slot("Wednesday", "5", "CL-14", "BCC301", "II Year · CSE-1"),
  slot("Wednesday", "7", "CL-14", "ESE", "II Year · CSE-1"),
  slot("Wednesday", "8", "CL-14", "Self Study", "II Year · CSE-1"),
  slot("Wednesday", "9", "CL-14", "Self Study", "II Year · CSE-1"),

  // Thursday
  slot("Thursday", "1", "CL-14", "BCS303", "II Year · CSE-1"),
  slot("Thursday", "2", "CL-14", "BCS301", "II Year · CSE-1"),
  slot("Thursday", "4", "CL-14", "BCC301", "II Year · CSE-1"),
  slot("Thursday", "5", "CL-14", "BCS302", "II Year · CSE-1"),
  slot("Thursday", "7", "CL-14", "ESE", "II Year · CSE-1"),
  slot("Thursday", "8", "CL-14", "BAS301", "II Year · CSE-1"),
  slot("Thursday", "9", "CL-14", "BCC351", "II Year · CSE-1"),

  // Friday
  slot("Friday", "1", "CL-14", "BCS301", "II Year · CSE-1"),
  slot("Friday", "2", "CL-14", "BCS303", "II Year · CSE-1"),
  slot("Friday", "4", "CL-14", "Self Study", "II Year · CSE-1"),
  slot("Friday", "5", "CL-14", "BCS302", "II Year · CSE-1"),
  slot("Friday", "7", "Lab-1", "BCS-352 (A+B)", "II Year · CSE-1"),
  slot("Friday", "7", "Lab-2", "BCS-353 (C+D)", "II Year · CSE-1"),
  slot("Friday", "8", "Lab-1", "BCS-352 (A+B)", "II Year · CSE-1"),
  slot("Friday", "8", "Lab-2", "BCS-353 (C+D)", "II Year · CSE-1"),
  slot("Friday", "9", "CL-14", "BAS301", "II Year · CSE-1"),

  // ==========================================
  // 2. 2nd Year · Section CSE-2 (Room: CL-15)
  // ==========================================
  // Monday
  slot("Monday", "1", "CL-15", "BCS302", "II Year · CSE-2"),
  slot("Monday", "2", "CL-15", "BCS301", "II Year · CSE-2"),
  slot("Monday", "4", "CL-15", "BCS303", "II Year · CSE-2"),
  slot("Monday", "5", "CL-15", "BCC301", "II Year · CSE-2"),
  slot("Monday", "7", "CL-15", "ESE", "II Year · CSE-2"),
  slot("Monday", "8", "CL-15", "BCS301", "II Year · CSE-2"),
  slot("Monday", "9", "CL-15", "Self Study", "II Year · CSE-2"),

  // Tuesday
  slot("Tuesday", "1", "CL-15", "BCS302", "II Year · CSE-2"),
  slot("Tuesday", "2", "CL-15", "BCS301", "II Year · CSE-2"),
  slot("Tuesday", "4", "CL-15", "BAS301", "II Year · CSE-2"),
  slot("Tuesday", "5", "CL-15", "BCS303", "II Year · CSE-2"),
  slot("Tuesday", "7", "CL-15", "ESE", "II Year · CSE-2"),
  slot("Tuesday", "8", "CL-15", "BCC351", "II Year · CSE-2"),
  slot("Tuesday", "9", "CL-15", "Self Study", "II Year · CSE-2"),

  // Wednesday
  slot("Wednesday", "1", "CL-15", "BCS303", "II Year · CSE-2"),
  slot("Wednesday", "2", "CL-15", "BCS302", "II Year · CSE-2"),
  slot("Wednesday", "4", "Lab-1", "BCS-351 (C+D)", "II Year · CSE-2"),
  slot("Wednesday", "4", "Project Lab", "BCS-353 (A+B)", "II Year · CSE-2"),
  slot("Wednesday", "5", "Lab-1", "BCS-351 (C+D)", "II Year · CSE-2"),
  slot("Wednesday", "5", "Project Lab", "BCS-353 (A+B)", "II Year · CSE-2"),
  slot("Wednesday", "7", "CL-15", "ESE", "II Year · CSE-2"),
  slot("Wednesday", "8", "CL-15", "Self Study", "II Year · CSE-2"),
  slot("Wednesday", "9", "CL-15", "Self Study", "II Year · CSE-2"),

  // Thursday
  slot("Thursday", "1", "CL-15", "BCS303", "II Year · CSE-2"),
  slot("Thursday", "2", "CL-15", "BCS301", "II Year · CSE-2"),
  slot("Thursday", "4", "CL-15", "BCS302", "II Year · CSE-2"),
  slot("Thursday", "5", "CL-15", "BAS301", "II Year · CSE-2"),
  slot("Thursday", "7", "CL-15", "ESE", "II Year · CSE-2"),
  slot("Thursday", "8", "Lab-1", "BCS-351 (A+B)", "II Year · CSE-2"),
  slot("Thursday", "8", "Lab-2", "BCS-352 (C+D)", "II Year · CSE-2"),
  slot("Thursday", "9", "Lab-1", "BCS-351 (A+B)", "II Year · CSE-2"),
  slot("Thursday", "9", "Lab-2", "BCS-352 (C+D)", "II Year · CSE-2"),

  // Friday
  slot("Friday", "1", "CL-15", "BCS301", "II Year · CSE-2"),
  slot("Friday", "2", "CL-15", "BCS302", "II Year · CSE-2"),
  slot("Friday", "4", "CL-15", "BCS303", "II Year · CSE-2"),
  slot("Friday", "5", "CL-15", "BCS301", "II Year · CSE-2"),
  slot("Friday", "7", "CL-15", "BAS301", "II Year · CSE-2"),
  slot("Friday", "8", "Project Lab", "BCS-352 (A+B)", "II Year · CSE-2"),
  slot("Friday", "8", "Lab-3", "BCS-353 (C+D)", "II Year · CSE-2"),
  slot("Friday", "9", "Project Lab", "BCS-352 (A+B)", "II Year · CSE-2"),
  slot("Friday", "9", "Lab-3", "BCS-353 (C+D)", "II Year · CSE-2"),

  // ==========================================
  // 3. 2nd Year · Section CSE-3 (Rotation)
  // ==========================================
  // Monday
  slot("Monday", "1", "CL-16", "BCS302", "II Year · CSE-3"),
  slot("Monday", "2", "CL-16", "BCS303", "II Year · CSE-3"),
  slot("Monday", "4", "CL-17", "BCS301", "II Year · CSE-3"),
  slot("Monday", "5", "CL-17", "BAS301", "II Year · CSE-3"),
  slot("Monday", "7", "CL-14", "ESE", "II Year · CSE-3"),
  slot("Monday", "8", "CL-14", "BCC351", "II Year · CSE-3"),
  slot("Monday", "9", "CL-14", "Self Study", "II Year · CSE-3"),

  // Tuesday
  slot("Tuesday", "1", "Lab-1", "BCS-351 (C+D)", "II Year · CSE-3"),
  slot("Tuesday", "1", "Lab-2", "BCS-352 (A+B)", "II Year · CSE-3"),
  slot("Tuesday", "2", "Lab-1", "BCS-351 (C+D)", "II Year · CSE-3"),
  slot("Tuesday", "2", "Lab-2", "BCS-352 (A+B)", "II Year · CSE-3"),
  slot("Tuesday", "4", "CL-18", "Self Study", "II Year · CSE-3"),
  slot("Tuesday", "5", "CL-18", "BCS303", "II Year · CSE-3"),
  slot("Tuesday", "7", "CL-14", "ESE", "II Year · CSE-3"),
  slot("Tuesday", "8", "CL-17", "BAS301", "II Year · CSE-3"),
  slot("Tuesday", "9", "CL-14", "Self Study", "II Year · CSE-3"),

  // Wednesday
  slot("Wednesday", "1", "Lab-1", "BCS-351 (C+D)", "II Year · CSE-3"),
  slot("Wednesday", "2", "CL-14", "BCS302", "II Year · CSE-3"),
  slot("Wednesday", "4", "CL-15", "Self Study", "II Year · CSE-3"),
  slot("Wednesday", "5", "CL-15", "BCS303", "II Year · CSE-3"),
  slot("Wednesday", "7", "CL-14", "ESE", "II Year · CSE-3"),
  slot("Wednesday", "8", "CL-17", "BCS301", "II Year · CSE-3"),
  slot("Wednesday", "9", "CL-14", "BAS301", "II Year · CSE-3"),

  // Thursday
  slot("Thursday", "1", "CL-18", "BCS301", "II Year · CSE-3"),
  slot("Thursday", "2", "CL-18", "BCC301", "II Year · CSE-3"),
  slot("Thursday", "4", "CL-16", "BCS302", "II Year · CSE-3"),
  slot("Thursday", "5", "CL-16", "BCS303", "II Year · CSE-3"),
  slot("Thursday", "7", "CL-14", "ESE", "II Year · CSE-3"),
  slot("Thursday", "8", "Project Lab", "BCS-352 (C+D)", "II Year · CSE-3"),
  slot("Thursday", "8", "Lab-3", "BCS-353 (A+B)", "II Year · CSE-3"),
  slot("Thursday", "9", "Project Lab", "BCS-352 (C+D)", "II Year · CSE-3"),
  slot("Thursday", "9", "Lab-3", "BCS-353 (A+B)", "II Year · CSE-3"),

  // Friday
  slot("Friday", "1", "CL-16", "BCS303", "II Year · CSE-3"),
  slot("Friday", "2", "CL-16", "BCS301", "II Year · CSE-3"),
  slot("Friday", "4", "Project Lab", "BCS-351 (A+B)", "II Year · CSE-3"),
  slot("Friday", "4", "Lab-3", "BCS-353 (C+D)", "II Year · CSE-3"),
  slot("Friday", "5", "Project Lab", "BCS-351 (A+B)", "II Year · CSE-3"),
  slot("Friday", "5", "Lab-3", "BCS-353 (C+D)", "II Year · CSE-3"),
  slot("Friday", "7", "CL-14", "BCS302", "II Year · CSE-3"),
  slot("Friday", "8", "CL-14", "BCC301", "II Year · CSE-3"),
  slot("Friday", "9", "CL-18", "Self Study", "II Year · CSE-3"),

  // ==========================================
  // 4. 3rd Year · Section CSE-1 (Room: CL-16)
  // ==========================================
  // Monday
  slot("Monday", "1", "Lab-1", "BCS-551 (A+B)", "III Year · CSE-1"),
  slot("Monday", "1", "Project Lab", "BCS-553 (C+D)", "III Year · CSE-1"),
  slot("Monday", "2", "Lab-1", "BCS-551 (A+B)", "III Year · CSE-1"),
  slot("Monday", "2", "Project Lab", "BCS-553 (C+D)", "III Year · CSE-1"),
  slot("Monday", "4", "CL-16", "BCS055", "III Year · CSE-1"),
  slot("Monday", "5", "CL-16", "BCS503", "III Year · CSE-1"),
  slot("Monday", "7", "CL-16", "BCS-052", "III Year · CSE-1"),
  slot("Monday", "8", "CL-16", "BCS502", "III Year · CSE-1"),
  slot("Monday", "9", "CL-16", "BCS501", "III Year · CSE-1"),

  // Tuesday
  slot("Tuesday", "1", "CL-16", "BCS055", "III Year · CSE-1"),
  slot("Tuesday", "2", "CL-16", "BCS501", "III Year · CSE-1"),
  slot("Tuesday", "4", "CL-16", "BCS502", "III Year · CSE-1"),
  slot("Tuesday", "5", "CL-16", "BCS503", "III Year · CSE-1"),
  slot("Tuesday", "7", "CL-16", "BNC501", "III Year · CSE-1"),
  slot("Tuesday", "8", "CL-16", "BCS554", "III Year · CSE-1"),
  slot("Tuesday", "9", "CL-16", "BCS554", "III Year · CSE-1"),

  // Wednesday
  slot("Wednesday", "1", "CL-16", "BCS503", "III Year · CSE-1"),
  slot("Wednesday", "2", "CL-16", "BCS502", "III Year · CSE-1"),
  slot("Wednesday", "4", "CL-16", "BCS-052", "III Year · CSE-1"),
  slot("Wednesday", "5", "CL-16", "BCS501", "III Year · CSE-1"),
  slot("Wednesday", "7", "CL-16", "BCS055", "III Year · CSE-1"),
  slot("Wednesday", "8", "CL-16", "BCS-052", "III Year · CSE-1"),
  slot("Wednesday", "9", "CL-16", "BNC501", "III Year · CSE-1"),

  // Thursday
  slot("Thursday", "1", "CL-16", "BCS055", "III Year · CSE-1"),
  slot("Thursday", "2", "CL-16", "BCS503", "III Year · CSE-1"),
  slot("Thursday", "3", "CL-16", "Minor/Honors", "III Year · CSE-1"),
  slot("Thursday", "4", "Lab-1", "BCS-551 (C+D)", "III Year · CSE-1"),
  slot("Thursday", "4", "Lab-2", "BCS-552 (A+B)", "III Year · CSE-1"),
  slot("Thursday", "5", "Lab-1", "BCS-551 (C+D)", "III Year · CSE-1"),
  slot("Thursday", "5", "Lab-2", "BCS-552 (A+B)", "III Year · CSE-1"),
  slot("Thursday", "7", "CL-16", "BCS502", "III Year · CSE-1"),
  slot("Thursday", "8", "CL-16", "BCS501", "III Year · CSE-1"),
  slot("Thursday", "9", "CL-16", "Self Study", "III Year · CSE-1"),

  // Friday
  slot("Friday", "1", "Project Lab", "BCS-553 (A+B)", "III Year · CSE-1"),
  slot("Friday", "1", "Lab-2", "BCS-552 (C+D)", "III Year · CSE-1"),
  slot("Friday", "2", "Project Lab", "BCS-553 (A+B)", "III Year · CSE-1"),
  slot("Friday", "2", "Lab-2", "BCS-552 (C+D)", "III Year · CSE-1"),
  slot("Friday", "4", "CL-16", "BCS503", "III Year · CSE-1"),
  slot("Friday", "5", "CL-16", "BCS501", "III Year · CSE-1"),
  slot("Friday", "7", "CL-16", "BCS502", "III Year · CSE-1"),
  slot("Friday", "8", "CL-16", "BCS-052", "III Year · CSE-1"),
  slot("Friday", "9", "CL-16", "Minor/Honors", "III Year · CSE-1"),

  // ==========================================
  // 5. 3rd Year · Section CSE-2 (Room: CL-17)
  // ==========================================
  // Monday
  slot("Monday", "1", "CL-17", "BCS502", "III Year · CSE-2"),
  slot("Monday", "2", "CL-17", "BCS501", "III Year · CSE-2"),
  slot("Monday", "4", "Project Lab", "BCS-553 (A+B)", "III Year · CSE-2"),
  slot("Monday", "4", "Lab-2", "BCS-552 (C+D)", "III Year · CSE-2"),
  slot("Monday", "5", "Project Lab", "BCS-553 (A+B)", "III Year · CSE-2"),
  slot("Monday", "5", "Lab-2", "BCS-552 (C+D)", "III Year · CSE-2"),
  slot("Monday", "7", "CL-17", "BCS055", "III Year · CSE-2"),
  slot("Monday", "8", "CL-17", "BCS503", "III Year · CSE-2"),
  slot("Monday", "9", "CL-17", "BCS502", "III Year · CSE-2"),

  // Tuesday
  slot("Tuesday", "1", "CL-17", "BCS-052", "III Year · CSE-2"),
  slot("Tuesday", "2", "CL-17", "BCS503", "III Year · CSE-2"),
  slot("Tuesday", "4", "CL-17", "BCS501", "III Year · CSE-2"),
  slot("Tuesday", "5", "CL-17", "BCS-052", "III Year · CSE-2"),
  slot("Tuesday", "7", "Lab-1", "BCS-551 (C+D)", "III Year · CSE-2"),
  slot("Tuesday", "7", "Lab-2", "BCS-552 (A+B)", "III Year · CSE-2"),
  slot("Tuesday", "8", "Lab-1", "BCS-551 (C+D)", "III Year · CSE-2"),
  slot("Tuesday", "8", "Lab-2", "BCS-552 (A+B)", "III Year · CSE-2"),
  slot("Tuesday", "9", "CL-17", "BNC501", "III Year · CSE-2"),

  // Wednesday
  slot("Wednesday", "1", "CL-17", "BCS502", "III Year · CSE-2"),
  slot("Wednesday", "2", "CL-17", "BCS503", "III Year · CSE-2"),
  slot("Wednesday", "4", "CL-17", "BCS055", "III Year · CSE-2"),
  slot("Wednesday", "5", "CL-17", "BCS501", "III Year · CSE-2"),
  slot("Wednesday", "7", "Lab-1", "BCS-551 (A+B)", "III Year · CSE-2"),
  slot("Wednesday", "7", "Project Lab", "BCS-553 (C+D)", "III Year · CSE-2"),
  slot("Wednesday", "8", "Lab-1", "BCS-551 (A+B)", "III Year · CSE-2"),
  slot("Wednesday", "8", "Project Lab", "BCS-553 (C+D)", "III Year · CSE-2"),
  slot("Wednesday", "9", "CL-17", "BCS055", "III Year · CSE-2"),

  // Thursday
  slot("Thursday", "1", "CL-17", "BCS-052", "III Year · CSE-2"),
  slot("Thursday", "2", "CL-17", "BCS501", "III Year · CSE-2"),
  slot("Thursday", "3", "CL-17", "Minor/Honors", "III Year · CSE-2"),
  slot("Thursday", "4", "CL-17", "BCS554", "III Year · CSE-2"),
  slot("Thursday", "5", "CL-17", "BCS554", "III Year · CSE-2"),
  slot("Thursday", "7", "CL-17", "BCS503", "III Year · CSE-2"),
  slot("Thursday", "8", "CL-17", "BCS502", "III Year · CSE-2"),
  slot("Thursday", "9", "CL-17", "Minor/Honors", "III Year · CSE-2"),

  // Friday
  slot("Friday", "1", "CL-17", "BCS055", "III Year · CSE-2"),
  slot("Friday", "2", "CL-17", "BCS501", "III Year · CSE-2"),
  slot("Friday", "4", "CL-17", "BNC501", "III Year · CSE-2"),
  slot("Friday", "5", "CL-17", "BCS-052", "III Year · CSE-2"),
  slot("Friday", "7", "CL-17", "BCS503", "III Year · CSE-2"),
  slot("Friday", "8", "CL-17", "Minor/Honors", "III Year · CSE-2"),
  slot("Friday", "9", "CL-17", "Minor/Honors", "III Year · CSE-2"),

  // ==========================================
  // 6. 3rd Year · Section CSE-3 (Room: CL-18)
  // ==========================================
  // Monday
  slot("Monday", "1", "CL-18", "BCS503", "III Year · CSE-3"),
  slot("Monday", "2", "CL-18", "BCS502", "III Year · CSE-3"),
  slot("Monday", "4", "CL-18", "BCS055", "III Year · CSE-3"),
  slot("Monday", "5", "CL-18", "BCS-052", "III Year · CSE-3"),
  slot("Monday", "7", "CL-18", "BCS-055", "III Year · CSE-3"),
  slot("Monday", "8", "Project Lab", "BCS-553 (A+B)", "III Year · CSE-3"),
  slot("Monday", "8", "Lab-2", "BCS-552 (C+D)", "III Year · CSE-3"),
  slot("Monday", "9", "Project Lab", "BCS-553 (A+B)", "III Year · CSE-3"),
  slot("Monday", "9", "Lab-2", "BCS-552 (C+D)", "III Year · CSE-3"),

  // Tuesday
  slot("Tuesday", "1", "CL-18", "BCS502", "III Year · CSE-3"),
  slot("Tuesday", "2", "CL-18", "BCS-052", "III Year · CSE-3"),
  slot("Tuesday", "4", "Lab-1", "BCS-551 (A+B)", "III Year · CSE-3"),
  slot("Tuesday", "4", "Project Lab", "BCS-553 (C+D)", "III Year · CSE-3"),
  slot("Tuesday", "5", "Lab-1", "BCS-551 (A+B)", "III Year · CSE-3"),
  slot("Tuesday", "5", "Project Lab", "BCS-553 (C+D)", "III Year · CSE-3"),
  slot("Tuesday", "7", "CL-18", "BCS503", "III Year · CSE-3"),
  slot("Tuesday", "8", "CL-18", "BNC501", "III Year · CSE-3"),
  slot("Tuesday", "9", "CL-18", "BCS503", "III Year · CSE-3"),

  // Wednesday
  slot("Wednesday", "1", "CL-18", "BCS501", "III Year · CSE-3"),
  slot("Wednesday", "2", "CL-18", "BCS503", "III Year · CSE-3"),
  slot("Wednesday", "4", "CL-18", "BCS502", "III Year · CSE-3"),
  slot("Wednesday", "5", "CL-18", "BCS-052", "III Year · CSE-3"),
  slot("Wednesday", "7", "CL-18", "BCS554", "III Year · CSE-3"),
  slot("Wednesday", "8", "CL-18", "BCS554", "III Year · CSE-3"),
  slot("Wednesday", "9", "CL-18", "BNC501", "III Year · CSE-3"),

  // Thursday
  slot("Thursday", "1", "Lab-1", "BCS-551 (C+D)", "III Year · CSE-3"),
  slot("Thursday", "1", "Lab-2", "BCS-552 (A+B)", "III Year · CSE-3"),
  slot("Thursday", "2", "Lab-1", "BCS-551 (C+D)", "III Year · CSE-3"),
  slot("Thursday", "2", "Lab-2", "BCS-552 (A+B)", "III Year · CSE-3"),
  slot("Thursday", "3", "CL-18", "Minor/Honors", "III Year · CSE-3"),
  slot("Thursday", "4", "CL-18", "BCS501", "III Year · CSE-3"),
  slot("Thursday", "5", "CL-18", "BCS503", "III Year · CSE-3"),
  slot("Thursday", "7", "CL-18", "BCS055", "III Year · CSE-3"),
  slot("Thursday", "8", "CL-18", "BCS501", "III Year · CSE-3"),
  slot("Thursday", "9", "CL-18", "BCS503", "III Year · CSE-3"),

  // Friday
  slot("Friday", "1", "CL-18", "BCS501", "III Year · CSE-3"),
  slot("Friday", "2", "CL-18", "BCS055", "III Year · CSE-3"),
  slot("Friday", "4", "CL-18", "BCS501", "III Year · CSE-3"),
  slot("Friday", "5", "CL-18", "BCS-052", "III Year · CSE-3"),
  slot("Friday", "7", "CL-18", "BCS502", "III Year · CSE-3"),
  slot("Friday", "8", "CL-18", "Minor/Honors", "III Year · CSE-3"),
  slot("Friday", "9", "CL-18", "Minor/Honors", "III Year · CSE-3"),

  // ==========================================
  // 7. 4th Year · Section CSE-1 (Room: ML-42)
  // ==========================================
  // Monday
  slot("Monday", "1", "ML-42", "BCS-701", "IV Year · CSE-1"),
  slot("Monday", "2", "ML-42", "BCS-701", "IV Year · CSE-1"),
  slot("Monday", "3", "ML-42", "BCS-071", "IV Year · CSE-1"),
  slot("Monday", "4", "ML-42", "OE-II", "IV Year · CSE-1"),
  slot("Monday", "5", "ML-42", "OE-II", "IV Year · CSE-1"),
  slot("Monday", "6", "ML-42", "BCS-071", "IV Year · CSE-1"),
  slot("Monday", "8", "ML-42", "BCS-751", "IV Year · CSE-1"),
  slot("Monday", "9", "ML-42", "BCS-751", "IV Year · CSE-1"),

  // Tuesday
  slot("Tuesday", "1", "ML-42", "BCS-071", "IV Year · CSE-1"),
  slot("Tuesday", "2", "ML-42", "BCS-071", "IV Year · CSE-1"),
  slot("Tuesday", "3", "ML-42", "BCS-752", "IV Year · CSE-1"),
  slot("Tuesday", "4", "ML-42", "OE-II", "IV Year · CSE-1"),
  slot("Tuesday", "5", "ML-42", "OE-II", "IV Year · CSE-1"),
  slot("Tuesday", "6", "ML-42", "BCS-701", "IV Year · CSE-1"),
  slot("Tuesday", "8", "ML-42", "BCS-701", "IV Year · CSE-1"),
  slot("Tuesday", "9", "ML-42", "BCS-752", "IV Year · CSE-1"),

  // Wednesday
  slot("Wednesday", "1", "ML-42", "Project", "IV Year · CSE-1"),
  slot("Wednesday", "2", "ML-42", "Project", "IV Year · CSE-1"),
  slot("Wednesday", "4", "ML-42", "Project", "IV Year · CSE-1"),
  slot("Wednesday", "5", "ML-42", "Project", "IV Year · CSE-1"),
  slot("Wednesday", "6", "ML-42", "Minor/Honors", "IV Year · CSE-1"),
  slot("Wednesday", "8", "ML-42", "Minor/Honors", "IV Year · CSE-1"),
  slot("Wednesday", "9", "ML-42", "Minor/Honors", "IV Year · CSE-1"),

  // Thursday
  slot("Thursday", "1", "ML-42", "Project", "IV Year · CSE-1"),
  slot("Thursday", "2", "ML-42", "Project", "IV Year · CSE-1"),
  slot("Thursday", "4", "ML-42", "Project", "IV Year · CSE-1"),
  slot("Thursday", "5", "ML-42", "Project", "IV Year · CSE-1"),
  slot("Thursday", "6", "ML-42", "Project", "IV Year · CSE-1"),
  slot("Thursday", "8", "ML-42", "Project", "IV Year · CSE-1"),
  slot("Thursday", "9", "ML-42", "Project", "IV Year · CSE-1"),

  // Friday
  slot("Friday", "1", "ML-42", "Project", "IV Year · CSE-1"),
  slot("Friday", "2", "ML-42", "Project", "IV Year · CSE-1"),
  slot("Friday", "4", "ML-42", "Project", "IV Year · CSE-1"),
  slot("Friday", "5", "ML-42", "Project", "IV Year · CSE-1"),
  slot("Friday", "6", "ML-42", "Project", "IV Year · CSE-1"),
  slot("Friday", "8", "ML-42", "Project", "IV Year · CSE-1"),
  slot("Friday", "9", "ML-42", "Project", "IV Year · CSE-1"),

  // ==========================================
  // 8. 4th Year · Section CSE-2 (Room: ML-43)
  // ==========================================
  // Monday
  slot("Monday", "1", "ML-43", "BCS-071", "IV Year · CSE-2"),
  slot("Monday", "2", "ML-43", "BCS-071", "IV Year · CSE-2"),
  slot("Monday", "3", "ML-43", "BCS-701", "IV Year · CSE-2"),
  slot("Monday", "4", "ML-43", "OE-II", "IV Year · CSE-2"),
  slot("Monday", "5", "ML-43", "OE-II", "IV Year · CSE-2"),
  slot("Monday", "6", "ML-43", "BCS-701", "IV Year · CSE-2"),
  slot("Monday", "8", "ML-43", "BCS-752", "IV Year · CSE-2"),
  slot("Monday", "9", "ML-43", "BCS-751", "IV Year · CSE-2"),

  // Tuesday
  slot("Tuesday", "1", "ML-43", "BCS-701", "IV Year · CSE-2"),
  slot("Tuesday", "2", "ML-43", "BCS-701", "IV Year · CSE-2"),
  slot("Tuesday", "3", "ML-43", "BCS-751", "IV Year · CSE-2"),
  slot("Tuesday", "4", "ML-43", "OE-II", "IV Year · CSE-2"),
  slot("Tuesday", "5", "ML-43", "OE-II", "IV Year · CSE-2"),
  slot("Tuesday", "6", "ML-43", "BCS-071", "IV Year · CSE-2"),
  slot("Tuesday", "8", "ML-43", "BCS-071", "IV Year · CSE-2"),
  slot("Tuesday", "9", "ML-43", "BCS-752", "IV Year · CSE-2"),

  // Wednesday
  slot("Wednesday", "1", "ML-43", "Project", "IV Year · CSE-2"),
  slot("Wednesday", "2", "ML-43", "Project", "IV Year · CSE-2"),
  slot("Wednesday", "4", "ML-43", "Project", "IV Year · CSE-2"),
  slot("Wednesday", "5", "ML-43", "Project", "IV Year · CSE-2"),
  slot("Wednesday", "6", "ML-43", "Minor/Honors", "IV Year · CSE-2"),
  slot("Wednesday", "8", "ML-43", "Minor/Honors", "IV Year · CSE-2"),
  slot("Wednesday", "9", "ML-43", "Minor/Honors", "IV Year · CSE-2"),

  // Thursday
  slot("Thursday", "1", "ML-43", "Project", "IV Year · CSE-2"),
  slot("Thursday", "2", "ML-43", "Project", "IV Year · CSE-2"),
  slot("Thursday", "4", "ML-43", "Project", "IV Year · CSE-2"),
  slot("Thursday", "5", "ML-43", "Project", "IV Year · CSE-2"),
  slot("Thursday", "6", "ML-43", "Project", "IV Year · CSE-2"),
  slot("Thursday", "8", "ML-43", "Project", "IV Year · CSE-2"),
  slot("Thursday", "9", "ML-43", "Project", "IV Year · CSE-2"),

  // Friday
  slot("Friday", "1", "ML-43", "Project", "IV Year · CSE-2"),
  slot("Friday", "2", "ML-43", "Project", "IV Year · CSE-2"),
  slot("Friday", "4", "ML-43", "Project", "IV Year · CSE-2"),
  slot("Friday", "5", "ML-43", "Project", "IV Year · CSE-2"),
  slot("Friday", "6", "ML-43", "Project", "IV Year · CSE-2"),
  slot("Friday", "8", "ML-43", "Project", "IV Year · CSE-2"),
  slot("Friday", "9", "ML-43", "Project", "IV Year · CSE-2"),

  // ==========================================
  // 9. 4th Year · Section CSE-3 (Room: ML-44)
  // ==========================================
  // Monday
  slot("Monday", "1", "ML-44", "BCS-701", "IV Year · CSE-3"),
  slot("Monday", "2", "ML-44", "BCS-701", "IV Year · CSE-3"),
  slot("Monday", "3", "ML-44", "BCS-071", "IV Year · CSE-3"),
  slot("Monday", "4", "ML-44", "OE-II", "IV Year · CSE-3"),
  slot("Monday", "5", "ML-44", "OE-II", "IV Year · CSE-3"),
  slot("Monday", "6", "ML-44", "BCS-071", "IV Year · CSE-3"),
  slot("Monday", "8", "ML-44", "BCS-752", "IV Year · CSE-3"),
  slot("Monday", "9", "ML-44", "BCS-751", "IV Year · CSE-3"),

  // Tuesday
  slot("Tuesday", "1", "ML-44", "BCS-071", "IV Year · CSE-3"),
  slot("Tuesday", "2", "ML-44", "BCS-071", "IV Year · CSE-3"),
  slot("Tuesday", "3", "ML-44", "BCS-701", "IV Year · CSE-3"),
  slot("Tuesday", "4", "ML-44", "OE-II", "IV Year · CSE-3"),
  slot("Tuesday", "5", "ML-44", "OE-II", "IV Year · CSE-3"),
  slot("Tuesday", "6", "ML-44", "BCS-701", "IV Year · CSE-3"),
  slot("Tuesday", "8", "ML-44", "BCS-751", "IV Year · CSE-3"),
  slot("Tuesday", "9", "ML-44", "BCS-752", "IV Year · CSE-3"),

  // Wednesday
  slot("Wednesday", "1", "ML-44", "Project", "IV Year · CSE-3"),
  slot("Wednesday", "2", "ML-44", "Project", "IV Year · CSE-3"),
  slot("Wednesday", "4", "ML-44", "Project", "IV Year · CSE-3"),
  slot("Wednesday", "5", "ML-44", "Project", "IV Year · CSE-3"),
  slot("Wednesday", "6", "ML-44", "Minor/Honors", "IV Year · CSE-3"),
  slot("Wednesday", "8", "ML-44", "Minor/Honors", "IV Year · CSE-3"),
  slot("Wednesday", "9", "ML-44", "Minor/Honors", "IV Year · CSE-3"),

  // Thursday
  slot("Thursday", "1", "ML-44", "Project", "IV Year · CSE-3"),
  slot("Thursday", "2", "ML-44", "Project", "IV Year · CSE-3"),
  slot("Thursday", "4", "ML-44", "Project", "IV Year · CSE-3"),
  slot("Thursday", "5", "ML-44", "Project", "IV Year · CSE-3"),
  slot("Thursday", "6", "ML-44", "Project", "IV Year · CSE-3"),
  slot("Thursday", "8", "ML-44", "Project", "IV Year · CSE-3"),
  slot("Thursday", "9", "ML-44", "Project", "IV Year · CSE-3"),

  // Friday
  slot("Friday", "1", "ML-44", "Project", "IV Year · CSE-3"),
  slot("Friday", "2", "ML-44", "Project", "IV Year · CSE-3"),
  slot("Friday", "4", "ML-44", "Project", "IV Year · CSE-3"),
  slot("Friday", "5", "ML-44", "Project", "IV Year · CSE-3"),
  slot("Friday", "6", "ML-44", "Project", "IV Year · CSE-3"),
  slot("Friday", "8", "ML-44", "Project", "IV Year · CSE-3"),
  slot("Friday", "9", "ML-44", "Project", "IV Year · CSE-3"),
];
