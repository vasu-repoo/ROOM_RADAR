"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import {
  type Slot,
  type Room,
  type TimetableUpload,
  days,
  periods,
  periodFromTime,
  baseRooms,
  buildingForRoom,
  initialSlots,
} from "./timetable-data";

function Icon({ name }: { name: "radar" | "pin" | "clock" | "users" | "floor" | "search" | "calendar" | "plus" }) {
  const paths = {
    radar: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><path d="M12 12l6-6"/></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1116 0z"/><circle cx="12" cy="10" r="2.5"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    users: <><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0112 0v2M16 5a3 3 0 010 6M17 14a5 5 0 014 4v2"/></>,
    floor: <><path d="M4 20h16M6 20V9h12v11M9 9V5h6v4M9 13h2M13 13h2M9 17h2M13 17h2"/></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="M16 16l5 5"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></>,
    plus: <path d="M12 5v14M5 12h14"/>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export default function Home() {
  const [day, setDay] = useState("Monday");
  const [period, setPeriod] = useState("4");
  const [time, setTime] = useState("11:00");
  const [building, setBuilding] = useState("CS/IT Block");
  const [floor, setFloor] = useState("All floors");
  const [minCapacity, setMinCapacity] = useState("Any capacity");
  const [searched, setSearched] = useState(true);
  const [activeView, setActiveView] = useState<"finder" | "timetable" | "upload" | "manage" | "admin">("finder");
  const [userSlots, setUserSlots] = useState<Slot[]>([]);
  const [uploads, setUploads] = useState<TimetableUpload[]>([]);
  const [account, setAccount] = useState<{ displayName: string; email: string } | null>(null);
  const [accountLoading, setAccountLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [editingSlotId, setEditingSlotId] = useState<number | null>(null);
  const [newSlot, setNewSlot] = useState({ day: "Monday", period: "1", room: "CL-14", course: "", section: "CSE-3", building: "CS/IT Block", floor: 1, capacity: 64 });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadBuilding, setUploadBuilding] = useState("CS/IT Block");
  const [customBuilding, setCustomBuilding] = useState("");
  const [uploadSection, setUploadSection] = useState("CSE-1");
  const [uploadYear, setUploadYear] = useState("2nd Year");
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploading, setUploading] = useState(false);

  const loadTimetables = useCallback(async () => {
    try {
      const response = await fetch("/api/timetables", { cache: "no-store" });
      if (response.status === 401) {
        setAccount(null);
        setUserSlots([]);
        setUploads([]);
        return;
      }
      const data = await response.json() as { user?: { displayName: string; email: string }; slots?: Slot[]; uploads?: TimetableUpload[]; error?: string };
      if (!response.ok) throw new Error(data.error || "Unable to load your timetable data.");
      setAccount(data.user || null);
      setUserSlots(Array.isArray(data.slots) ? data.slots : []);
      setUploads(Array.isArray(data.uploads) ? data.uploads : []);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to load your timetable data.");
    } finally {
      setAccountLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadTimetables(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadTimetables]);

  const slots = useMemo(() => [...initialSlots, ...userSlots], [userSlots]);
  const roomDirectory = useMemo(() => {
    const rooms = [...baseRooms];
    for (const slot of userSlots) {
      const slotBuilding = slot.building || "Other / Custom Building";
      if (!rooms.some((room) => room.name === slot.room && room.building === slotBuilding)) {
        rooms.push({ name: slot.room, floor: slot.floor, capacity: slot.capacity, type: "My uploaded room", building: slotBuilding });
      }
    }
    return rooms;
  }, [userSlots]);

  const occupied = useMemo(() => slots.filter((s) => s.day === day && s.period === period), [slots, day, period]);
  const available = useMemo(() => roomDirectory.filter((room) => {
    const isFree = !occupied.some((slot) => slot.room === room.name && (slot.building || buildingForRoom(slot.room)) === room.building);
    const buildingMatch = building === "All buildings" || room.building === building;
    const floorMatch = floor === "All floors" || room.floor === Number(floor);
    const capacityMatch = minCapacity === "Any capacity" || room.capacity >= Number(minCapacity);
    return isFree && buildingMatch && floorMatch && capacityMatch;
  }), [roomDirectory, occupied, building, floor, minCapacity]);

  const roomsInScope = useMemo(() => roomDirectory.filter((room) => building === "All buildings" || room.building === building), [roomDirectory, building]);
  const occupiedInScope = useMemo(() => occupied.filter((slot) => building === "All buildings" || (slot.building || buildingForRoom(slot.room)) === building), [occupied, building]);
  const availabilityTimeline = useMemo(() => periods.map(([id, label]) => ({
    id,
    label,
    free: roomsInScope.filter((room) => !slots.some((slot) => slot.day === day && slot.period === id && slot.room === room.name && (slot.building || buildingForRoom(slot.room)) === room.building)).map((room) => room.name),
  })), [day, roomsInScope, slots]);

  const runSearch = (event: FormEvent) => {
    event.preventDefault();
    setSearched(false);
    window.setTimeout(() => setSearched(true), 180);
  };

  const addSlot = async (event: FormEvent) => {
    event.preventDefault();
    if (!newSlot.course.trim() || !newSlot.section.trim()) return;
    if (!account) { setNotice("Sign in with ChatGPT or click 1-Click Fast Access before saving timetable changes."); return; }
    try {
      if (account.email === "demo@akgec.ac.in") {
        // Fast local client state save
        const mockId = Date.now();
        const demoSlot: Slot = { id: mockId, uploadId: 9999, ...newSlot };
        setUserSlots((prev) => [demoSlot, ...prev]);
        setNotice(`${newSlot.room} saved for ${newSlot.day}, Period ${newSlot.period} (Demo Mode).`);
        setEditingSlotId(null);
        setNewSlot((current) => ({ ...current, course: "" }));
        return;
      }
      const payload = editingSlotId
        ? { slotId: editingSlotId, ...newSlot }
        : { fileName: "Manual entry", building: newSlot.building, section: newSlot.section, academicYear: "Manual", entries: [newSlot] };
      const response = await fetch("/api/timetables", {
        method: editingSlotId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || "Unable to save this timetable entry.");
      setNotice(`${newSlot.room} saved for ${newSlot.day}, Period ${newSlot.period}.`);
      setEditingSlotId(null);
      setNewSlot((current) => ({ ...current, course: "" }));
      await loadTimetables();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to save this timetable entry.");
    }
  };

  const periodLabel = periods.find((p) => p[0] === period)?.[1];
  const updateTime = (value: string) => {
    setTime(value);
    const matchedPeriod = periodFromTime(value);
    if (matchedPeriod) setPeriod(matchedPeriod);
  };

  const downloadTemplate = () => {
    const csv = "day,period,room,course,section,building,floor,capacity\nMonday,1,CL-14,BCS301,CSE-1,CS/IT Block,1,64\nMonday,2,CL-14,BCS302,CSE-1,CS/IT Block,1,64";
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "roomradar-timetable-template.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const chooseFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setUploadFile(file);
    setUploadStatus(file ? `${file.name} selected` : "");
  };

  const importTimetable = async (event: FormEvent) => {
    event.preventDefault();
    if (!account) { setUploadStatus("Sign in with ChatGPT or click 1-Click Fast Access before uploading."); return; }
    if (!uploadFile) { setUploadStatus("Choose a CSV timetable first."); return; }
    if (!uploadFile.name.toLowerCase().endsWith(".csv")) { setUploadStatus("For accurate automatic updates, upload the CSV template. PDF and image timetables need manual verification."); return; }
    setUploading(true);
    try {
      const text = await uploadFile.text();
      const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      const headers = lines[0]?.split(",").map((header) => header.trim().toLowerCase()) || [];
      const required = ["day", "period", "room", "course"];
      if (!required.every((key) => headers.includes(key))) throw new Error("CSV must contain day, period, room and course columns.");
      const selectedBuilding = uploadBuilding === "Other / Custom Building" ? customBuilding.trim() : uploadBuilding;
      if (!selectedBuilding) throw new Error("Enter the building name.");
      const entries = lines.slice(1).map((line, index) => {
        const values = line.split(",").map((value) => value.trim());
        const value = (key: string) => values[headers.indexOf(key)] || "";
        return {
          id: Date.now() + index,
          uploadId: 9999,
          day: value("day"), period: value("period"), room: value("room"), course: value("course"),
          section: value("section") || uploadSection,
          building: value("building") || selectedBuilding,
          floor: Number(value("floor")) || 1,
          capacity: Number(value("capacity")) || 60,
        };
      });

      if (account.email === "demo@akgec.ac.in") {
        setUserSlots((prev) => [...entries, ...prev]);
        setUploads((prev) => [{
          id: 9999,
          fileName: uploadFile.name,
          building: selectedBuilding,
          section: uploadSection,
          academicYear: uploadYear,
          entryCount: entries.length,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }, ...prev]);
        setBuilding(selectedBuilding);
        setUploadStatus(`Imported ${entries.length} timetable entries in Demo Mode.`);
        setUploadFile(null);
        return;
      }
      const response = await fetch("/api/timetables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: uploadFile.name,
          building: selectedBuilding,
          section: uploadSection,
          academicYear: uploadYear,
          entries,
        }),
      });
      const data = await response.json() as { slots?: Slot[]; error?: string };
      if (!response.ok) throw new Error(data.error || "Could not import this timetable.");
      await loadTimetables();
      setBuilding(selectedBuilding);
      setUploadStatus(`Imported ${data.slots?.length || entries.length} timetable entries. They are private to your signed-in account and now update your results.`);
      setUploadFile(null);
    } catch (error) {
      setUploadStatus(error instanceof Error ? error.message : "Could not import this timetable.");
    } finally { setUploading(false); }
  };

  const deleteUpload = async (uploadId: number) => {
    if (!window.confirm("Delete this timetable and remove its effect from your room availability?")) return;
    const response = await fetch(`/api/timetables?uploadId=${uploadId}`, { method: "DELETE" });
    const data = await response.json() as { error?: string };
    if (!response.ok) { setNotice(data.error || "Unable to delete this timetable."); return; }
    setNotice("Timetable deleted. Your availability results have been updated.");
    await loadTimetables();
  };

  const deleteSlot = async (slotId: number) => {
    const response = await fetch(`/api/timetables?slotId=${slotId}`, { method: "DELETE" });
    const data = await response.json() as { error?: string };
    if (!response.ok) { setNotice(data.error || "Unable to delete this entry."); return; }
    setNotice("Timetable entry deleted.");
    await loadTimetables();
  };

  const editSlot = (slot: Slot) => {
    setEditingSlotId(slot.id);
    setNewSlot({
      day: slot.day,
      period: slot.period,
      room: slot.room,
      course: slot.course,
      section: slot.section,
      building: slot.building || buildingForRoom(slot.room),
      floor: slot.floor,
      capacity: slot.capacity,
    });
    setActiveView("admin");
  };

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" onClick={() => setActiveView("finder")} aria-label="RoomRadar home">
          <span className="brand-mark"><Icon name="radar" /></span>
          <span><strong>RoomRadar</strong><small>Find space. Save time.</small></span>
        </a>
        <nav aria-label="Primary navigation">
          <button className={activeView === "finder" ? "active" : ""} onClick={() => setActiveView("finder")}>Find a room</button>
          <button className={activeView === "timetable" ? "active" : ""} onClick={() => setActiveView("timetable")}>Timetable</button>
          <button className={activeView === "upload" ? "active" : ""} onClick={() => setActiveView("upload")}>Upload</button>
          <button className={activeView === "manage" ? "active" : ""} onClick={() => setActiveView("manage")}>My uploads</button>
          <button className={activeView === "admin" ? "active" : ""} onClick={() => setActiveView("admin")}>Add / Edit Room Slot</button>
        </nav>
        {accountLoading ? <div className="account-chip">Checking account...</div> : account
          ? <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button 
                className="account-chip" 
                style={{ background: "#059669", color: "#fff", border: "none", cursor: "pointer", padding: "6px 14px", fontWeight: "600" }}
                onClick={() => {
                  navigator.clipboard.writeText(window.location.origin);
                  setNotice("Shareable link copied to clipboard!");
                }}
              >
                🔗 1-Click Copy Share Link
              </button>
              <a className="account-chip signed-in" href="/signout-with-chatgpt?return_to=/" title={account.email}><span></span>{account.displayName}</a>
            </div>
          : <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button 
                className="account-chip signed-in"
                style={{ background: "#2563eb", color: "#fff", border: "none", cursor: "pointer", padding: "6px 14px", fontWeight: "600" }}
                onClick={() => setAccount({ displayName: "Demo Student", email: "demo@akgec.ac.in" })}
              >
                ⚡ 1-Click Fast Access (Demo)
              </button>
              <button 
                className="account-chip"
                style={{ background: "#059669", color: "#fff", border: "none", cursor: "pointer", padding: "6px 14px", fontWeight: "600" }}
                onClick={() => {
                  navigator.clipboard.writeText(window.location.origin);
                  setNotice("Shareable link copied to clipboard!");
                }}
              >
                🔗 1-Click Copy Share Link
              </button>
              <a className="account-chip" href="/signin-with-chatgpt?return_to=/"><span></span>Sign in</a>
            </div>}
      </header>

      {activeView === "finder" && <>
        <section className="hero" id="top">
          <div className="hero-copy">
            <p className="eyebrow"><span></span> Live classroom finder</p>
            <h1>Your next free room is <em>closer than you think.</em></h1>
            <p>Check classroom availability across different AKGEC buildings in seconds—no wandering, no waiting.</p>
            <div className="live-note"><span className="pulse"></span><strong>Multi-building timetable active</strong><span>•</span><span>User uploads supported</span></div>
          </div>
          <div className="radar-art" aria-hidden="true">
            <div className="orbit orbit-one"></div><div className="orbit orbit-two"></div><div className="orbit orbit-three"></div>
            <div className="sweep"></div><div className="radar-center"><Icon name="pin" /></div>
            <span className="dot d1"></span><span className="dot d2"></span><span className="dot d3"></span>
          </div>
        </section>

        <section className="finder-wrap" aria-label="Room search">
          <form className="finder" onSubmit={runSearch}>
            <label><span>Day</span><div className="input-wrap"><Icon name="calendar" /><select value={day} onChange={(e) => setDay(e.target.value)}>{days.map((item) => <option key={item}>{item}</option>)}</select></div></label>
            <label><span>Enter time</span><div className="input-wrap"><Icon name="clock" /><input className="time-input" type="time" min="08:30" max="16:00" value={time} onChange={(e) => updateTime(e.target.value)} /></div></label>
            <label><span>Lecture period</span><div className="input-wrap"><Icon name="clock" /><select value={period} onChange={(e) => { setPeriod(e.target.value); setTime(periods.find((p) => p[0] === e.target.value)?.[1].split(" ")[0] || time); }}>{periods.map(([id, label]) => <option key={id} value={id}>Period {id} · {label}</option>)}</select></div></label>
            <label><span>Building</span><div className="input-wrap"><Icon name="pin" /><select value={building} onChange={(e) => { setBuilding(e.target.value); setFloor("All floors"); }}><option>All buildings</option>{Array.from(new Set(roomDirectory.map((room) => room.building))).map((name) => <option key={name}>{name}</option>)}</select></div></label>
            <label><span>Floor</span><div className="input-wrap"><Icon name="floor" /><select value={floor} onChange={(e) => setFloor(e.target.value)}><option>All floors</option><option value="1">Floor 1</option><option value="2">Floor 2</option><option value="4">Floor 4</option></select></div></label>
            <label><span>Minimum capacity</span><div className="input-wrap"><Icon name="users" /><select value={minCapacity} onChange={(e) => setMinCapacity(e.target.value)}><option>Any capacity</option><option value="35">35+ students</option><option value="60">60+ students</option></select></div></label>
            <button className="search-button" type="submit"><Icon name="search" /> Find available rooms</button>
          </form>
        </section>

        <section className={`results ${searched ? "show" : ""}`}>
          <div className="results-heading">
            <div><p className="eyebrow">Search results</p><h2>{available.length} room{available.length !== 1 ? "s" : ""} available</h2><p>{day} · {time} · Period {period} · {periodLabel} · {building}</p></div>
            <div className="legend"><span><i className="free-dot"></i>Available</span><span><i className="busy-dot"></i>Occupied</span></div>
          </div>
          {available.length > 0 ? <div className="room-grid">
            {available.map((room, index) => <article className="room-card" key={`${room.building}-${room.name}`} style={{ animationDelay: `${index * 45}ms` }}>
              <div className="room-top"><span className="available-pill">Available now</span><span className="room-type">{room.type}</span></div>
              <h3>{room.name}</h3>
              <div className="room-meta"><span><Icon name="floor" />Floor {room.floor}</span><span><Icon name="users" />{room.capacity} seats</span></div>
              <div className="next-slot"><span>Also free next period</span><strong>Until {period === "9" ? "4:00 PM" : periods[Math.min(Number(period), 8)][1].split("–")[1]?.trim()}</strong></div>
            </article>)}
          </div> : <div className="empty-state"><Icon name="search" /><h3>No matching room found</h3><p>Try another floor or lower the minimum capacity.</p></div>}

          <div className="occupied-section"><div className="occupied-title"><h3>Currently occupied</h3><span>{occupiedInScope.length} scheduled room{occupiedInScope.length !== 1 ? "s" : ""}</span></div>
            <div className="occupied-list">{occupiedInScope.length ? occupiedInScope.map((slot) => <div key={`${slot.uploadId ? "user" : "official"}-${slot.id}`}><span className="busy-marker"></span><strong>{slot.room}</strong><span>{slot.course}</span><span>{slot.section}</span></div>) : <p>No occupied rooms are recorded for this building and period.</p>}</div>
          </div>

          <div className="timeline-section">
            <div className="timeline-heading"><div><p className="eyebrow">Full-day view</p><h3>Empty rooms by time</h3></div><span>{day} · {building}</span></div>
            <div className="timeline-grid">{availabilityTimeline.map((item) => <article className={item.id === period ? "current" : ""} key={item.id}><div><strong>Period {item.id}</strong><span>{item.label}</span></div><div className="free-room-chips">{item.free.length ? item.free.map((room) => <span key={room}>{room}</span>) : <em>No free rooms</em>}</div></article>)}</div>
          </div>
        </section>
      </>}

      {activeView === "timetable" && <section className="page-panel">
        <p className="eyebrow">Weekly overview</p><h1>Classroom timetable</h1><p className="panel-intro">Browse the records used by RoomRadar, prepared from the uploaded official CSE timetable for second, third and fourth year.</p>
        <div className="table-wrap"><table><thead><tr><th>Day</th><th>Period</th><th>Time</th><th>Building</th><th>Room</th><th>Course</th><th>Section</th><th>Source</th></tr></thead><tbody>{slots.map((slot) => <tr key={`${slot.uploadId ? "user" : "official"}-${slot.id}`}><td>{slot.day}</td><td>{slot.period}</td><td>{periods.find((p) => p[0] === slot.period)?.[1]}</td><td>{slot.building || buildingForRoom(slot.room)}</td><td><strong>{slot.room}</strong></td><td>{slot.course}</td><td>{slot.section}</td><td>{slot.uploadId ? "My upload" : "Official"}</td></tr>)}</tbody></table></div>
      </section>}

      {activeView === "upload" && <section className="page-panel upload-page">
        <div className="upload-intro"><p className="eyebrow">Secure timetable import</p><h1>Upload your timetable</h1><p className="panel-intro">Add a section timetable from any AKGEC building. Validated entries become part of your availability calculation, so occupied rooms are removed from your free-room list.</p>
          <div className="import-steps"><span><b>1</b> Download template</span><span><b>2</b> Fill timetable rows</span><span><b>3</b> Upload and verify</span></div>
          <div className="privacy-note"><strong>Private by default</strong><span>Your CSV is read for validation but is not stored. Only the timetable rows are saved to your signed-in account, and other users cannot edit or view them.</span></div>
        </div>
        <form className="upload-card" onSubmit={importTimetable}>
          <div className="upload-card-head"><div className="upload-icon">↑</div><div><h2>Import timetable CSV</h2><p>One row per occupied room and lecture period.</p></div></div>
          {!account && !accountLoading && <div className="sign-in-gate"><strong>Sign in required</strong><span>Secure uploads need an account so RoomRadar can protect your timetable.</span><a href="/signin-with-chatgpt?return_to=/">Sign in with ChatGPT</a></div>}
          <div className="upload-fields">
            <label><span>Year / semester</span><select value={uploadYear} onChange={(e) => setUploadYear(e.target.value)}><option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option></select></label>
            <label><span>Section</span><input value={uploadSection} onChange={(e) => setUploadSection(e.target.value.toUpperCase())} placeholder="e.g. CSE-4" required /></label>
            <label><span>Building</span><select value={uploadBuilding} onChange={(e) => setUploadBuilding(e.target.value)}><option>CS/IT Block</option><option>Main/ML Block</option><option>Other / Custom Building</option></select></label>
            {uploadBuilding === "Other / Custom Building" && <label><span>Custom building name</span><input value={customBuilding} onChange={(e) => setCustomBuilding(e.target.value)} placeholder="Enter AKGEC building name" required /></label>}
          </div>
          <label className="drop-zone"><input type="file" accept=".csv,text/csv" onChange={chooseFile} /><span className="drop-symbol">⇧</span><strong>{uploadFile ? uploadFile.name : "Choose timetable CSV"}</strong><small>Use the RoomRadar template for accurate automatic import</small></label>
          <div className="upload-actions"><button type="button" className="secondary-button" onClick={downloadTemplate}>Download CSV template</button><button className="search-button" type="submit" disabled={uploading || !account}>{uploading ? "Importing…" : "Upload and update rooms"}</button></div>
          {uploadStatus && <div className="upload-status" role="status">{uploadStatus}</div>}
          <p className="format-note"><strong>PDF or image timetable?</strong> Use Admin to verify and enter its room slots, or convert it to the CSV template first. RoomRadar does not guess unclear table cells because an incorrect import could show an occupied room as free.</p>
        </form>
      </section>}

      {activeView === "manage" && <section className="page-panel manage-panel">
        <div className="manage-heading"><div><p className="eyebrow">Private account data</p><h1>My uploaded timetables</h1><p className="panel-intro">Review, correct or remove the entries that affect your personal room-availability results.</p></div><button className="search-button" onClick={() => setActiveView("upload")}>Upload another</button></div>
        {!account && !accountLoading ? <div className="sign-in-empty"><h2>Sign in to manage timetables</h2><p>Your uploaded schedules are protected by your ChatGPT account.</p><a className="search-button" href="/signin-with-chatgpt?return_to=/">Sign in with ChatGPT</a></div> : uploads.length === 0 ? <div className="empty-state"><Icon name="calendar" /><h3>No private timetables yet</h3><p>Upload the CSV template or add a verified entry manually.</p></div> : <div className="upload-list">{uploads.map((upload) => <article key={upload.id}>
          <div className="upload-summary"><div><span className="available-pill">Private</span><h2>{upload.fileName}</h2><p>{upload.academicYear} · {upload.section} · {upload.building}</p></div><div><strong>{upload.entryCount}</strong><span>entries</span></div><button className="danger-button" onClick={() => void deleteUpload(upload.id)}>Delete timetable</button></div>
          <div className="managed-slots">{userSlots.filter((slot) => slot.uploadId === upload.id).map((slot) => <div key={slot.id}><span>{slot.day} · P{slot.period}</span><strong>{slot.room}</strong><span>{slot.course} · {slot.section}</span><span>{slot.building}</span><div><button onClick={() => editSlot(slot)}>Edit</button><button className="danger-link" onClick={() => void deleteSlot(slot.id)}>Delete</button></div></div>)}</div>
        </article>)}</div>}
        {notice && <div className="success-notice" role="status">✓ {notice}</div>}
      </section>}

      {activeView === "admin" && <section className="page-panel admin-panel">
        <div><p className="eyebrow">Account-protected editing</p><h1>{editingSlotId ? "Edit room slot" : "Add room slot"}</h1><p className="panel-intro">Create or correct one verified room slot. Changes update only your private timetable and availability results—the official timetable and other users remain unchanged.</p>{!account && !accountLoading && <a className="search-button inline-signin" href="/signin-with-chatgpt?return_to=/">Sign in with ChatGPT</a>}</div>
        <form className="admin-form" onSubmit={addSlot}>
          <label><span>Day</span><select value={newSlot.day} onChange={(e) => setNewSlot({ ...newSlot, day: e.target.value })}>{days.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><span>Period</span><select value={newSlot.period} onChange={(e) => setNewSlot({ ...newSlot, period: e.target.value })}>{periods.map(([id, time]) => <option key={id} value={id}>Period {id} · {time}</option>)}</select></label>
          <label><span>Room</span><select value={`${newSlot.building}|${newSlot.room}`} onChange={(e) => { const [selectedBuilding, selectedRoom] = e.target.value.split("|"); const room = roomDirectory.find((item) => item.name === selectedRoom && item.building === selectedBuilding); if (room) setNewSlot({ ...newSlot, room: room.name, building: room.building, floor: room.floor, capacity: room.capacity }); }}>{roomDirectory.map((room) => <option key={`${room.building}-${room.name}`} value={`${room.building}|${room.name}`}>{room.name} · {room.building}</option>)}</select></label>
          <label><span>Course code</span><input required placeholder="e.g. BCS301" value={newSlot.course} onChange={(e) => setNewSlot({ ...newSlot, course: e.target.value.toUpperCase() })} /></label>
          <label><span>Section</span><input required placeholder="e.g. CSE-3" value={newSlot.section} onChange={(e) => setNewSlot({ ...newSlot, section: e.target.value.toUpperCase() })} /></label>
          <button className="search-button" type="submit" disabled={!account}><Icon name="plus" /> {editingSlotId ? "Save changes" : "Add private entry"}</button>
          {editingSlotId && <button className="secondary-button cancel-edit" type="button" onClick={() => { setEditingSlotId(null); setNewSlot((current) => ({ ...current, course: "" })); }}>Cancel editing</button>}
        </form>
        {notice && <div className="success-notice" role="status">✓ {notice}</div>}
        <div className="admin-stats"><article><strong>{roomDirectory.length}</strong><span>Rooms mapped</span></article><article><strong>{slots.length}</strong><span>Timetable entries</span></article><article><strong>{new Set(roomDirectory.map((room) => room.building)).size}</strong><span>Buildings mapped</span></article></div>
      </section>}

      <footer><div className="footer-brand"><span className="brand-mark"><Icon name="radar" /></span><span><strong>RoomRadar</strong><small>Web-Based Classroom Availability Finder</small></span></div><p>Second-year Mini Project · Official data + private user timetables</p></footer>
    </main>
  );
}
