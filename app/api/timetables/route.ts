import { and, desc, eq, sql } from "drizzle-orm";
import { getChatGPTUser } from "../../chatgpt-auth";
import { getDb } from "../../../db";
import { timetableUploads, uploadedSlots } from "../../../db/schema";

export const dynamic = "force-dynamic";

type ImportedEntry = {
  day?: unknown;
  period?: unknown;
  room?: unknown;
  course?: unknown;
  section?: unknown;
  building?: unknown;
  floor?: unknown;
  capacity?: unknown;
};

const validDays = new Set(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
const MAX_ROWS = 500;
const MAX_BODY_BYTES = 512_000;

const textValue = (value: unknown, maximum: number) => String(value ?? "").trim().slice(0, maximum);

function unauthorized() {
  return Response.json({ error: "Sign in with ChatGPT to manage your timetables." }, { status: 401 });
}

function cleanEntry(entry: ImportedEntry, defaults: { section: string; building: string }) {
  return {
    day: textValue(entry.day, 12),
    period: textValue(entry.period, 2),
    room: textValue(entry.room, 40).toUpperCase(),
    course: textValue(entry.course, 50).toUpperCase(),
    section: (textValue(entry.section, 40) || defaults.section).toUpperCase(),
    building: textValue(entry.building, 80) || defaults.building,
    floor: Math.min(30, Math.max(0, Number(entry.floor) || 1)),
    capacity: Math.min(500, Math.max(1, Number(entry.capacity) || 60)),
  };
}

function entryError(entry: ReturnType<typeof cleanEntry>) {
  if (!validDays.has(entry.day)) return "Every row needs a weekday from Monday to Friday.";
  if (!/^([1-9]|10)$/.test(entry.period)) return "Every row needs a lecture period from 1 to 10.";
  if (!entry.room || !entry.course) return "Every row needs a room and course.";
  if (!entry.section || !entry.building) return "Every row needs a section and building.";
  return null;
}

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return unauthorized();

  const db = getDb();
  const [slots, uploads] = await Promise.all([
    db.select().from(uploadedSlots).where(eq(uploadedSlots.userId, user.userId)).orderBy(desc(uploadedSlots.id)).limit(2000),
    db.select().from(timetableUploads).where(eq(timetableUploads.userId, user.userId)).orderBy(desc(timetableUploads.id)).limit(100),
  ]);
  return Response.json({ user: { displayName: user.displayName, email: user.email }, slots, uploads });
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return unauthorized();

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) return Response.json({ error: "This timetable is too large." }, { status: 413 });
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return Response.json({ error: "Timetable data must be sent as JSON." }, { status: 415 });
  }

  try {
    const body = await request.json() as {
      fileName?: unknown;
      building?: unknown;
      section?: unknown;
      academicYear?: unknown;
      entries?: ImportedEntry[];
    };
    const fileName = textValue(body.fileName, 120) || "timetable.csv";
    const building = textValue(body.building, 80);
    const section = textValue(body.section, 40).toUpperCase();
    const academicYear = textValue(body.academicYear, 30) || "Not specified";
    if (!building || !section) return Response.json({ error: "Building and section are required." }, { status: 400 });
    if (!Array.isArray(body.entries) || body.entries.length < 1) return Response.json({ error: "No timetable rows were found." }, { status: 400 });
    if (body.entries.length > MAX_ROWS) return Response.json({ error: `A timetable can contain at most ${MAX_ROWS} rows.` }, { status: 400 });

    const cleaned = body.entries.map((entry) => cleanEntry(entry, { section, building }));
    const invalid = cleaned.map(entryError).find(Boolean);
    if (invalid) return Response.json({ error: invalid }, { status: 400 });

    const now = new Date().toISOString();
    const db = getDb();
    const [upload] = await db.insert(timetableUploads).values({
      userId: user.userId,
      userEmail: user.email,
      fileName,
      building,
      section,
      academicYear,
      entryCount: cleaned.length,
      createdAt: now,
      updatedAt: now,
    }).returning();

    try {
      await db.insert(uploadedSlots).values(cleaned.map((entry) => ({
        ...entry,
        uploadId: upload.id,
        userId: user.userId,
        createdAt: now,
        updatedAt: now,
      })));
    } catch (error) {
      await db.delete(timetableUploads).where(and(eq(timetableUploads.id, upload.id), eq(timetableUploads.userId, user.userId)));
      throw error;
    }

    const slots = await db.select().from(uploadedSlots).where(and(eq(uploadedSlots.uploadId, upload.id), eq(uploadedSlots.userId, user.userId)));
    return Response.json({ upload, slots }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to import timetable." }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return unauthorized();

  try {
    const body = await request.json() as ImportedEntry & { slotId?: unknown };
    const slotId = Number(body.slotId);
    if (!Number.isInteger(slotId) || slotId < 1) return Response.json({ error: "A valid timetable entry is required." }, { status: 400 });
    const entry = cleanEntry(body, { section: "", building: "" });
    const invalid = entryError(entry);
    if (invalid) return Response.json({ error: invalid }, { status: 400 });

    const now = new Date().toISOString();
    const db = getDb();
    const [updated] = await db.update(uploadedSlots).set({ ...entry, updatedAt: now }).where(and(eq(uploadedSlots.id, slotId), eq(uploadedSlots.userId, user.userId))).returning();
    if (!updated) return Response.json({ error: "Timetable entry not found." }, { status: 404 });
    await db.update(timetableUploads).set({ updatedAt: now }).where(and(eq(timetableUploads.id, updated.uploadId), eq(timetableUploads.userId, user.userId)));
    return Response.json({ slot: updated });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to update timetable entry." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return unauthorized();

  const url = new URL(request.url);
  const uploadId = Number(url.searchParams.get("uploadId"));
  const slotId = Number(url.searchParams.get("slotId"));
  const db = getDb();

  if (Number.isInteger(uploadId) && uploadId > 0) {
    const [owned] = await db.select({ id: timetableUploads.id }).from(timetableUploads).where(and(eq(timetableUploads.id, uploadId), eq(timetableUploads.userId, user.userId))).limit(1);
    if (!owned) return Response.json({ error: "Timetable not found." }, { status: 404 });
    await db.delete(uploadedSlots).where(and(eq(uploadedSlots.uploadId, uploadId), eq(uploadedSlots.userId, user.userId)));
    await db.delete(timetableUploads).where(and(eq(timetableUploads.id, uploadId), eq(timetableUploads.userId, user.userId)));
    return Response.json({ deleted: true });
  }

  if (Number.isInteger(slotId) && slotId > 0) {
    const [owned] = await db.select().from(uploadedSlots).where(and(eq(uploadedSlots.id, slotId), eq(uploadedSlots.userId, user.userId))).limit(1);
    if (!owned) return Response.json({ error: "Timetable entry not found." }, { status: 404 });
    await db.delete(uploadedSlots).where(and(eq(uploadedSlots.id, slotId), eq(uploadedSlots.userId, user.userId)));
    await db.update(timetableUploads).set({ entryCount: sql`MAX(${timetableUploads.entryCount} - 1, 0)`, updatedAt: new Date().toISOString() }).where(and(eq(timetableUploads.id, owned.uploadId), eq(timetableUploads.userId, user.userId)));
    return Response.json({ deleted: true });
  }

  return Response.json({ error: "Choose a timetable or entry to delete." }, { status: 400 });
}
