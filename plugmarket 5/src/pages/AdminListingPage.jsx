import { useState, useEffect, useRef } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { BC, GR, cs } from "../styles/theme";

const SB_URL = import.meta.env.VITE_SUPABASE_URL || "https://tmftxqwqwceuiydleuag.supabase.co";
const SB_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const sbH = (token) => ({ apikey: SB_KEY, Authorization: `Bearer ${token || SB_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" });
async function sbGet(table, params, token) { try { const r = await fetch(`${SB_URL}/rest/v1/${table}?${params}`, { headers: sbH(token) }); return r.ok ? r.json() : []; } catch { return []; } }
async function sbInsert(table, data, token) { try { const r = await fetch(`${SB_URL}/rest/v1/${table}`, { method: "POST", headers: sbH(token), body: JSON.stringify(data) }); if (!r.ok) return { error: await r.text() }; const j = await r.json(); return { row: Array.isArray(j) ? j[0] : j }; } catch (e) { return { error: e.message }; } }

// Compress an image file to a JPEG data URL (max 1920px)
function compressImage(file, maxSizeKB = 2500) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const img = new Image();
      let done = false;
      const timer = setTimeout(() => { if (!done) { done = true; resolve(dataUrl); } }, 5000);
      img.onerror = () => { if (!done) { done = true; clearTimeout(timer); resolve(dataUrl); } };
      img.onload = () => {
        if (done) return; done = true; clearTimeout(timer);
        try {
          const canvas = document.createElement("canvas");
          let w = img.width, h = img.height; const maxDim = 1920;
          if (w > maxDim || h > maxDim) { if (w > h) { h = Math.round(h * maxDim / w); w = maxDim; } else { w = Math.round(w * maxDim / h); h = maxDim; } }
          canvas.width = w; canvas.height = h; canvas.getContext("2d").drawImage(img, 0, 0, w, h);
          let quality = 0.8, result = canvas.toDataURL("image/jpeg", quality);
          while (result.length > maxSizeKB * 1370 && quality > 0.3) { quality -= 0.1; result = canvas.toDataURL("image/jpeg", quality); }
          resolve(result);
        } catch { resolve(dataUrl); }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

// Upload a compressed data-url to Supabase storage; returns the public URL
async function uploadPhoto(userId, listingId, dataUrl, position, token) {
  const path = `${userId}/${listingId}/${position}.jpg`;
  const blob = await (await fetch(dataUrl)).blob();
  const res = await fetch(`${SB_URL}/storage/v1/object/listing-photos/${path}`, {
    method: "POST",
    headers: { apikey: SB_KEY, Authorization: `Bearer ${token}`, "Content-Type": "image/jpeg", "x-upsert": "true" },
    body: blob,
  });
  if (!res.ok) return null;
  return `${SB_URL}/storage/v1/object/public/listing-photos/${path}`;
}

const COUNTRIES = [
  { code: "DE", name: "Germany" }, { code: "FR", name: "France" }, { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" }, { code: "AT", name: "Austria" }, { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" }, { code: "PL", name: "Poland" }, { code: "RO", name: "Romania" },
  { code: "SE", name: "Sweden" }, { code: "NO", name: "Norway" }, { code: "CZ", name: "Czech Rep." },
  { code: "PT", name: "Portugal" }, { code: "DK", name: "Denmark" },
];
const COMMON_MAKES = ["Tesla","BMW","Volkswagen","Mercedes","Audi","Hyundai","Kia","BYD","Porsche","Renault","Skoda","Volvo","MG","Polestar","Cupra","Ford","NIO","Fiat","Dacia","Citroën","Leapmotor","Nissan","Xpeng","Zeekr"];

export default function AdminListingPage() {
  const { t } = useOutletContext();
  const { user, session, loading: authLoading } = useAuth();
  const nav = useNavigate();
  const [isAdmin, setIsAdmin] = useState(null); // null = checking
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);

  // Vehicle
  const [make, setMake] = useState(""); const [model, setModel] = useState(""); const [variant, setVariant] = useState("");
  const [year, setYear] = useState(""); const [km, setKm] = useState(""); const [condition, setCondition] = useState("used");
  const [color, setColor] = useState(""); const [drive, setDrive] = useState(""); const [vin, setVin] = useState("");
  const [regDate, setRegDate] = useState(""); const [owners, setOwners] = useState(""); const [accidentFree, setAccidentFree] = useState(true);
  const [serviceHistory, setServiceHistory] = useState("");
  // EV
  const [battery, setBattery] = useState(""); const [usable, setUsable] = useState(""); const [soh, setSoh] = useState("");
  const [rangeReal, setRangeReal] = useState(""); const [rangeWinter, setRangeWinter] = useState(""); const [wltp, setWltp] = useState("");
  const [dcCharge, setDcCharge] = useState(""); const [acCharge, setAcCharge] = useState(""); const [port, setPort] = useState(""); const [powerKw, setPowerKw] = useState("");
  // Pricing
  const [price, setPrice] = useState(""); const [negotiable, setNegotiable] = useState(true); const [vatDeduct, setVatDeduct] = useState(false); const [description, setDescription] = useState("");
  // Contact (external)
  const [sellerType, setSellerType] = useState("dealer");
  const [contactName, setContactName] = useState(""); const [phone, setPhone] = useState(""); const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); const [vat, setVat] = useState(""); const [mapsUrl, setMapsUrl] = useState("");
  const [city, setCity] = useState(""); const [country, setCountry] = useState("");
  // Photos (compressed data-urls, uploaded on publish)
  const [photos, setPhotos] = useState([]);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setIsAdmin(false); return; }
    (async () => {
      const p = await sbGet("profiles", `id=eq.${user.id}&select=is_admin`, session?.access_token);
      setIsAdmin(!!p?.[0]?.is_admin);
    })();
  }, [authLoading, user, session]);

  const L = { fontSize: 12, fontWeight: 600, color: t.tx2, marginBottom: 4, display: "block" };
  const fileRef = useRef(null);
  const onPickFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setProcessing(true);
    const next = [];
    for (const f of files) {
      if (!f.type.startsWith("image/")) continue;
      try { next.push(await compressImage(f)); } catch {}
    }
    setPhotos(prev => [...prev, ...next].slice(0, 20));
    setProcessing(false);
    if (fileRef.current) fileRef.current.value = "";
  };
  const removePhoto = (i) => setPhotos(prev => prev.filter((_, idx) => idx !== i));
  const inp = { width: "100%", height: 42, borderRadius: 10, border: `1px solid ${t.bd}`, background: t.inp, color: t.tx, padding: "0 12px", fontSize: 13, boxSizing: "border-box", outline: "none" };
  const Field = ({ label, value, set, ph, type = "text" }) => (
    <div><label style={L}>{label}</label><input value={value} onChange={e => set(e.target.value)} placeholder={ph} type={type} style={inp} /></div>
  );
  const Select = ({ label, value, set, opts }) => (
    <div><label style={L}>{label}</label><select value={value} onChange={e => set(e.target.value)} style={{ ...inp, cursor: "pointer" }}>{opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}</select></div>
  );
  const Toggle = ({ label, value, set }) => (
    <div onClick={() => set(!value)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", padding: "8px 0" }}>
      <span style={{ fontSize: 13, color: t.tx }}>{label}</span>
      <div style={{ width: 42, height: 24, borderRadius: 12, background: value ? BC : t.bd, position: "relative", transition: "background .2s" }}>
        <div style={{ width: 20, height: 20, borderRadius: 10, background: "#fff", position: "absolute", top: 2, left: value ? 20 : 2, transition: "left .2s" }} /></div>
    </div>
  );
  const Sec = ({ title, children }) => (
    <div style={{ ...cs(t), padding: 18, marginBottom: 14 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: t.tx, marginBottom: 12 }}>{title}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>{children}</div>
    </div>
  );

  const publish = async () => {
    if (busy) return;
    if (!make || !model || !year || !price) { alert("Make, model, year and price are required."); return; }
    setBusy(true);
    const token = session.access_token;
    const farFuture = new Date(); farFuture.setFullYear(farFuture.getFullYear() + 50);
    const data = {
      make, model, variant: variant || null, year: +year, mileage_km: km ? +km : 0,
      condition: condition || null, exterior_color: color || null, drivetrain: drive || null,
      vin: vin || null, first_registration: regDate || null, previous_owners: owners ? +owners : null,
      accident_free: accidentFree, service_history: serviceHistory || null,
      battery_capacity_kwh: battery ? +battery : null, usable_capacity_kwh: usable ? +usable : null,
      state_of_health_pct: soh ? +soh : null, range_real_km: rangeReal ? +rangeReal : null,
      range_winter_km: rangeWinter ? +rangeWinter : null, range_wltp_km: wltp ? +wltp : null,
      dc_charge_max_kw: dcCharge ? +dcCharge : null, ac_charge_kw: acCharge ? +acCharge : null,
      charge_port: port || null, power_kw: powerKw ? +powerKw : null,
      price_eur: +price, negotiable, vat_deductible: vatDeduct, description: description || null,
      contact_name: contactName || null, contact_phone: phone || null, contact_email: email || null,
      website: website || null, dealer_vat: vat || null, maps_url: mapsUrl || null,
      seller_type: sellerType, city: city || null, country: country || null,
      is_external: true, seller_id: user.id, status: "active", paid_until: farFuture.toISOString(),
    };
    const { row, error } = await sbInsert("listings", data, token);
    if (error || !row?.id) { setBusy(false); alert(`Failed to create listing: ${error || "unknown error"}`); return; }

    // Upload photos to Supabase storage (hosted by you)
    for (let i = 0; i < photos.length; i++) {
      const url = await uploadPhoto(user.id, row.id, photos[i], i, token);
      if (url) await sbInsert("listing_photos", { listing_id: row.id, url, position: i }, token);
    }
    setBusy(false);
    setDone(row.id);
  };

  const reset = () => {
    [setMake,setModel,setVariant,setYear,setKm,setColor,setDrive,setVin,setRegDate,setOwners,setServiceHistory,
     setBattery,setUsable,setSoh,setRangeReal,setRangeWinter,setWltp,setDcCharge,setAcCharge,setPort,setPowerKw,
     setPrice,setDescription,setContactName,setPhone,setEmail,setWebsite,setVat,setMapsUrl,setCity
    ].forEach(fn => fn(""));
    setPhotos([]);
    setCondition("used"); setAccidentFree(true); setNegotiable(true); setVatDeduct(false); setSellerType("dealer"); setCountry(""); setDone(null);
  };

  if (authLoading || isAdmin === null) return <div style={{ padding: "60px 0", textAlign: "center", fontSize: 13, color: t.tx3 }}>Loading…</div>;
  if (!isAdmin) return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "60px 0", textAlign: "center" }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: t.tx }}>Not authorised</div>
      <div style={{ fontSize: 13, color: t.tx2, marginTop: 8 }}>This area is for administrators only.</div>
    </div>
  );

  if (done) return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "60px 0", textAlign: "center" }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#10b981" }}>Listing published</div>
      <div style={{ fontSize: 13, color: t.tx2, marginTop: 8 }}>The external listing is live.</div>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 22 }}>
        <button onClick={() => nav(`/listing/${done}`)} style={{ padding: "10px 18px", borderRadius: 10, border: `1px solid ${t.bd}`, background: t.card, color: t.tx, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>View listing</button>
        <button onClick={reset} style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: GR, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Add another</button>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "10px 0 40px" }}>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: t.tx }}>Admin — add external listing</h1>
        <p style={{ fontSize: 13, color: t.tx2, margin: "4px 0 0" }}>Creates a listing with direct dealer contact details (no buyer account needed).</p>
      </div>

      <Sec title="Vehicle">
        <div><label style={L}>Make *</label><input list="mk" value={make} onChange={e => setMake(e.target.value)} placeholder="e.g. Tesla" style={inp} /><datalist id="mk">{COMMON_MAKES.map(m => <option key={m} value={m} />)}</datalist></div>
        <Field label="Model *" value={model} set={setModel} ph="e.g. Model 3" />
        <Field label="Variant / trim" value={variant} set={setVariant} ph="Long Range" />
        <Field label="Year *" value={year} set={setYear} ph="2023" type="number" />
        <Field label="Mileage (km)" value={km} set={setKm} ph="25000" type="number" />
        <Select label="Condition" value={condition} set={setCondition} opts={[{ v: "used", l: "Used" }, { v: "new", l: "New" }, { v: "certified_pre_owned", l: "Certified Pre-Owned" }]} />
        <Field label="Exterior colour" value={color} set={setColor} ph="Black" />
        <Select label="Drivetrain" value={drive} set={setDrive} opts={[{ v: "", l: "—" }, { v: "rwd", l: "RWD" }, { v: "awd", l: "AWD" }, { v: "fwd", l: "FWD" }]} />
        <Field label="VIN" value={vin} set={setVin} ph="optional" />
        <Field label="First registration" value={regDate} set={setRegDate} ph="MM/YYYY" />
        <Field label="Previous owners" value={owners} set={setOwners} ph="1" type="number" />
        <Select label="Service history" value={serviceHistory} set={setServiceHistory} opts={[{ v: "", l: "—" }, { v: "Full service history", l: "Full" }, { v: "Partial service history", l: "Partial" }, { v: "No service history", l: "None" }]} />
        <div style={{ gridColumn: "1 / -1" }}><Toggle label="Accident-free" value={accidentFree} set={setAccidentFree} /></div>
      </Sec>

      <Sec title="EV specs">
        <Field label="Battery (kWh)" value={battery} set={setBattery} ph="75" type="number" />
        <Field label="Usable (kWh)" value={usable} set={setUsable} ph="72.5" type="number" />
        <Field label="State of Health (%)" value={soh} set={setSoh} ph="97" type="number" />
        <Field label="WLTP range (km)" value={wltp} set={setWltp} ph="500" type="number" />
        <Field label="Real range summer (km)" value={rangeReal} set={setRangeReal} ph="450" type="number" />
        <Field label="Real range winter (km)" value={rangeWinter} set={setRangeWinter} ph="330" type="number" />
        <Field label="Max DC charge (kW)" value={dcCharge} set={setDcCharge} ph="250" type="number" />
        <Field label="AC charge (kW)" value={acCharge} set={setAcCharge} ph="11" type="number" />
        <Select label="Charge port" value={port} set={setPort} opts={[{ v: "", l: "—" }, { v: "ccs2", l: "CCS2" }, { v: "type2", l: "Type 2" }, { v: "chademo", l: "CHAdeMO" }, { v: "ccs2_type2", l: "CCS2 / Type 2" }]} />
        <Field label="Power (kW)" value={powerKw} set={setPowerKw} ph="258" type="number" />
      </Sec>

      <Sec title="Pricing">
        <Field label="Price (EUR) *" value={price} set={setPrice} ph="38900" type="number" />
        <div />
        <div style={{ gridColumn: "1 / -1" }}><Toggle label="Negotiable" value={negotiable} set={setNegotiable} /><Toggle label="VAT deductible" value={vatDeduct} set={setVatDeduct} /></div>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={L}>Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="Condition, history, extras…" style={{ ...inp, height: "auto", padding: "10px 12px", resize: "vertical", fontFamily: "inherit" }} />
        </div>
      </Sec>

      <Sec title="Dealer contact (shown on the listing)">
        <Select label="Seller type" value={sellerType} set={setSellerType} opts={[{ v: "dealer", l: "Dealer" }, { v: "private", l: "Private" }]} />
        <Field label="Dealer / contact name" value={contactName} set={setContactName} ph="EV Motors GmbH" />
        <Field label="Phone" value={phone} set={setPhone} ph="+49 ..." />
        <Field label="Email" value={email} set={setEmail} ph="sales@dealer.com" />
        <Field label="Website" value={website} set={setWebsite} ph="https://dealer.com" />
        <Field label="VAT number" value={vat} set={setVat} ph="DE123456789" />
        <Field label="City" value={city} set={setCity} ph="Munich" />
        <Select label="Country" value={country} set={setCountry} opts={[{ v: "", l: "—" }, ...COUNTRIES.map(c => ({ v: c.code, l: c.name }))]} />
        <div style={{ gridColumn: "1 / -1" }}><Field label="Google Maps link" value={mapsUrl} set={setMapsUrl} ph="https://maps.google.com/..." /></div>
      </Sec>

      <Sec title="Photos (uploaded & hosted by you)">
        <div style={{ gridColumn: "1 / -1" }}>
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={onPickFiles} style={{ display: "none" }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(96px,1fr))", gap: 8 }}>
            {photos.map((src, i) => (
              <div key={i} style={{ position: "relative", aspectRatio: "4/3", borderRadius: 8, overflow: "hidden", border: `1px solid ${t.bd}` }}>
                <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <button onClick={() => removePhoto(i)} style={{ position: "absolute", top: 3, right: 3, width: 20, height: 20, borderRadius: 6, border: "none", background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: 12, cursor: "pointer", lineHeight: 1 }}>×</button>
                {i === 0 && <div style={{ position: "absolute", bottom: 3, left: 3, fontSize: 8, fontWeight: 700, background: BC, color: "#fff", padding: "2px 5px", borderRadius: 4 }}>COVER</div>}
              </div>
            ))}
            <button onClick={() => fileRef.current?.click()} disabled={processing} style={{ aspectRatio: "4/3", borderRadius: 8, border: `2px dashed ${t.bd}`, background: t.sec, color: t.tx3, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              {processing ? "Processing…" : "+ Add photos"}
            </button>
          </div>
          <div style={{ fontSize: 11, color: t.tx3, marginTop: 6 }}>{photos.length}/20 · First photo is the cover. Images are compressed and uploaded to your storage on publish.</div>
        </div>
      </Sec>

      <button onClick={publish} disabled={busy} style={{ width: "100%", height: 50, borderRadius: 14, border: "none", background: GR, color: "#fff", fontSize: 15, fontWeight: 700, cursor: busy ? "default" : "pointer", opacity: busy ? 0.7 : 1, boxShadow: "0 4px 16px rgba(255,117,0,0.3)" }}>
        {busy ? "Publishing…" : "Publish external listing"}
      </button>
    </div>
  );
}
