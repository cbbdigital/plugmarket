import { useState, useEffect, useCallback, useRef } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { BC, GR, cs } from "../styles/theme";

// ── Data ──
const MAKES_DATA = {
  Tesla: ["Model 3", "Model Y", "Model S", "Model X"],
  BMW: ["iX3", "iX1", "i4", "i5", "i7", "iX"],
  Volkswagen: ["ID.3", "ID.4", "ID.5", "ID.7", "ID.Buzz"],
  Mercedes: ["EQA", "EQB", "EQE", "EQS"],
  Audi: ["Q4 e-tron", "Q6 e-tron", "Q8 e-tron", "e-tron GT"],
  Hyundai: ["Ioniq 5", "Ioniq 6", "Kona Electric"],
  Kia: ["EV6", "EV9", "Niro EV"],
  BYD: ["Atto 3", "Dolphin", "Seal", "Seal U"],
  Porsche: ["Taycan", "Macan Electric"],
  Renault: ["Megane E-Tech", "Renault 5"],
  Skoda: ["Enyaq", "Elroq"],
  Volvo: ["EX30", "EX40", "EX90"],
  MG: ["MG4", "MG5", "ZS EV"],
  Polestar: ["Polestar 2", "Polestar 3", "Polestar 4"],
  Cupra: ["Born", "Tavascan"],
  Ford: ["Mustang Mach-E", "Explorer Electric"],
  NIO: ["ET5", "ET7", "EL6"],
  Fiat: ["500e"],
};
const COUNTRIES = [
  { code:"DE", name:"Germany" }, { code:"FR", name:"France" },
  { code:"NL", name:"Netherlands" }, { code:"BE", name:"Belgium" },
  { code:"AT", name:"Austria" }, { code:"IT", name:"Italy" },
  { code:"ES", name:"Spain" }, { code:"PL", name:"Poland" },
  { code:"RO", name:"Romania" }, { code:"SE", name:"Sweden" },
  { code:"NO", name:"Norway" }, { code:"CZ", name:"Czech Rep." },
  { code:"PT", name:"Portugal" }, { code:"DK", name:"Denmark" },
];
const COLORS = ["Black","White","Silver","Gray","Blue","Red","Green","Brown","Orange","Yellow","Other"];
const DRIVETRAINS = ["RWD","AWD","FWD"];
const PORTS = ["CCS2","Type 2","CHAdeMO","CCS2 / Type 2"];
const CONDITIONS = ["New","Used","Certified Pre-Owned"];

// ── Icons ──
const Ic = ({d,size=16,color="currentColor"}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);
const BoltIcon = (p) => <Ic {...p} d={<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>}/>;
const CarIcon = (p) => <Ic {...p} d={<path d="M5 17h14M5 17a2 2 0 01-2-2V9a2 2 0 012-2h1l2-3h8l2 3h1a2 2 0 012 2v6a2 2 0 01-2 2M5 17v1a1 1 0 001 1h1a1 1 0 001-1v-1m10 0v1a1 1 0 001 1h1a1 1 0 001-1v-1"/>}/>;
const BatteryIcon = (p) => <Ic {...p} d={<><rect x="1" y="6" width="18" height="12" rx="2"/><line x1="23" y1="10" x2="23" y2="14"/></>}/>;
const CameraIcon = (p) => <Ic {...p} d={<><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></>}/>;
const TagIcon = (p) => <Ic {...p} d={<><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></>}/>;
const UserIcon = (p) => <Ic {...p} d={<><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>}/>;
const CheckIcon = (p) => <Ic {...p} d={<polyline points="20 6 9 17 4 12"/>}/>;
const ChevL = (p) => <Ic {...p} d={<polyline points="15 18 9 12 15 6"/>}/>;
const ChevR = (p) => <Ic {...p} d={<polyline points="9 18 15 12 9 6"/>}/>;
const ChevDown = (p) => <Ic {...p} d={<polyline points="6 9 12 15 18 9"/>}/>;
const PlusIcon = (p) => <Ic {...p} d={<><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></>}/>;
const TrashIcon = (p) => <Ic {...p} d={<><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></>}/>;
const InfoIcon = (p) => <Ic {...p} d={<><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></>}/>;
const HomeIcon = (p) => <Ic {...p} d={<><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>}/>;
const SearchIcon = (p) => <Ic {...p} d={<><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>}/>;
const HeartIcon = (p) => <Ic {...p} d={<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>}/>;
const SunIcon = (p) => <Ic {...p} d={<><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></>}/>;
const MoonIcon = (p) => <Ic {...p} d={<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>}/>;
const MsgIcon = (p) => <Ic {...p} d={<><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></>}/>;

const STEPS = [
  { id:1, label:"Vehicle", icon:<CarIcon size={14}/> },
  { id:2, label:"EV details", icon:<BatteryIcon size={14}/> },
  { id:3, label:"Photos", icon:<CameraIcon size={14}/> },
  { id:4, label:"Pricing", icon:<TagIcon size={14}/> },
  { id:5, label:"Contact", icon:<UserIcon size={14}/> },
  { id:6, label:"Review", icon:<CheckIcon size={14}/> },
];

// ── Reusable components ──
function Sel({label,value,onChange,options,ph,req,t}){
  return(
    <div style={{display:"flex",flexDirection:"column",gap:4}}>
      {label&&<label style={{fontSize:12,fontWeight:600,color:t.tx2}}>{label}{req&&<span style={{color:"#ef4444"}}> *</span>}</label>}
      <div style={{position:"relative"}}>
        <select value={value} onChange={e=>onChange(e.target.value)} style={{width:"100%",height:42,borderRadius:10,border:`1px solid ${t.bd}`,background:t.inp,color:value?t.tx:"#9ca3af",padding:"0 30px 0 14px",fontSize:13,cursor:"pointer",appearance:"none",WebkitAppearance:"none"}}>
          <option value="">{ph||"Select..."}</option>
          {options.map(o=>typeof o==="string"?<option key={o} value={o}>{o}</option>:<option key={o.v} value={o.v}>{o.l}</option>)}
        </select>
        <div style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}><ChevDown size={14} color="#9ca3af"/></div>
      </div>
    </div>
  );
}

function Inp({label,value,onChange,ph,unit,type="text",req,textarea,t}){
  const shared = {width:"100%",borderRadius:10,border:`1px solid ${t.bd}`,background:t.inp,color:t.tx,padding:unit?"0 40px 0 14px":"0 14px",fontSize:13,boxSizing:"border-box"};
  return(
    <div style={{display:"flex",flexDirection:"column",gap:4}}>
      {label&&<label style={{fontSize:12,fontWeight:600,color:t.tx2}}>{label}{req&&<span style={{color:"#ef4444"}}> *</span>}</label>}
      <div style={{position:"relative"}}>
        {textarea?
          <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={ph} rows={4} style={{...shared,height:"auto",padding:"10px 14px",resize:"vertical",fontFamily:"inherit"}}/>
          :<input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={ph} style={{...shared,height:42}}/>
        }
        {unit&&<span style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",fontSize:11,color:"#9ca3af"}}>{unit}</span>}
      </div>
    </div>
  );
}

function Toggle({label,value,onChange,t}){
  return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <span style={{fontSize:13,color:t.tx}}>{label}</span>
      <div onClick={()=>onChange(!value)} style={{width:44,height:24,borderRadius:12,background:value?BC:"rgba(128,128,128,0.2)",cursor:"pointer",position:"relative",transition:"background 0.2s"}}>
        <div style={{width:20,height:20,borderRadius:10,background:"#fff",position:"absolute",top:2,left:value?22:2,transition:"left 0.2s",boxShadow:"0 1px 3px rgba(0,0,0,0.15)"}}/>
      </div>
    </div>
  );
}

export default function SellPage(){
  const { t, dark: d } = useOutletContext();
  const { user } = useAuth();
  const nav = useNavigate();
  const [narrow,setNarrow]=useState(()=>window.innerWidth<480);
  useEffect(()=>{const h=()=>setNarrow(window.innerWidth<480);window.addEventListener("resize",h);return()=>window.removeEventListener("resize",h)},[]);
  const g2=narrow?"1fr":"1fr 1fr";
  const [step,setStep]=useState(1);

  // Step 1
  const [make,setMake]=useState("");
  const [model,setModel]=useState("");
  const [variant,setVariant]=useState("");
  const [year,setYear]=useState("");
  const [km,setKm]=useState("");
  const [condition,setCondition]=useState("");
  const [color,setColor]=useState("");
  const [intColor,setIntColor]=useState("");
  const [drive,setDrive]=useState("");
  const [vin,setVin]=useState("");
  const [regDate,setRegDate]=useState("");
  const [owners,setOwners]=useState("");
  const [accidentFree,setAccidentFree]=useState(true);
  const [serviceHistory,setServiceHistory]=useState("");

  // Step 2
  const [battery,setBattery]=useState("");
  const [usable,setUsable]=useState("");
  const [soh,setSoh]=useState("");
  const [rangeReal,setRangeReal]=useState("");
  const [rangeWinter,setRangeWinter]=useState("");
  const [dcCharge,setDcCharge]=useState("");
  const [acCharge,setAcCharge]=useState("");
  const [port,setPort]=useState("");
  const [powerKw,setPowerKw]=useState("");

  // Step 3
  const [photos,setPhotos]=useState([]);

  // Step 4
  const [price,setPrice]=useState("");
  const [negotiable,setNegotiable]=useState(true);
  const [vatDeduct,setVatDeduct]=useState(false);
  const [description,setDescription]=useState("");

  // Step 5
  const [sellerName,setSellerName]=useState("");
  const [sellerType,setSellerType]=useState("private");
  const [phone,setPhone]=useState("");
  const [email,setEmail]=useState("");
  const [city,setCity]=useState("");
  const [country,setCountry]=useState("");

  const [submitted,setSubmitted]=useState(false);

  // Auth redirect
  useEffect(() => { if (!user) nav("/login"); }, [user, nav]);
  if (!user) return null;

  const models = make ? MAKES_DATA[make]||[] : [];
  const years = Array.from({length:8},(_,i)=>String(2025-i));

  const [uploading, setUploading] = useState(false);

  const compressImage = (file, maxSizeKB = 2500) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let w = img.width, h = img.height;
          const maxDim = 1920;
          if (w > maxDim || h > maxDim) {
            if (w > h) { h = Math.round(h * maxDim / w); w = maxDim; }
            else { w = Math.round(w * maxDim / h); h = maxDim; }
          }
          canvas.width = w;
          canvas.height = h;
          canvas.getContext("2d").drawImage(img, 0, 0, w, h);
          let quality = 0.8;
          let result = canvas.toDataURL("image/jpeg", quality);
          while (result.length > maxSizeKB * 1370 && quality > 0.3) {
            quality -= 0.1;
            result = canvas.toDataURL("image/jpeg", quality);
          }
          resolve(result);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const fileInputRef = useRef(null);

  const addPhoto = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    const remaining = 20 - photos.length;
    const toProcess = files.slice(0, remaining);
    const compressed = [];
    for (const file of toProcess) {
      const result = await compressImage(file);
      compressed.push(result);
    }
    setPhotos(prev => [...prev, ...compressed]);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePhoto = (idx) => setPhotos(photos.filter((_,i)=>i!==idx));

  const canNext = () => {
    if(step===1) return make&&model&&year&&km&&condition;
    if(step===2) return battery&&soh&&dcCharge;
    if(step===3) return photos.length>=1;
    if(step===4) return price;
    if(step===5) return sellerName&&phone&&email&&city&&country;
    return true;
  };

  const cardS = {background:t.card,borderRadius:16,border:`1px solid ${t.bd}`,boxShadow:`0 2px 8px ${t.sh}`,padding:20,marginBottom:20};

  // ── Success screen ──
  if(submitted){
    return(
      <div style={{textAlign:"center"}}>
        <div style={{padding:"70px 0"}}>
          <div style={{width:68,height:68,borderRadius:"50%",background:"rgba(16,185,129,0.15)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto"}}><CheckIcon size={30} color="#059669"/></div>
          <h2 style={{fontSize:22,fontWeight:700,marginTop:18}}>Your listing is live!</h2>
          <p style={{fontSize:13,color:t.tx2,marginTop:6,lineHeight:1.6}}>
            Your {make} {model} has been published successfully.<br/>
            You'll receive notifications when buyers contact you.
          </p>
          <div style={{background:t.card,borderRadius:16,boxShadow:`0 2px 8px ${t.sh}`,border:`1px solid ${t.bd}`,padding:"2px 16px",textAlign:"left",marginTop:20}}>
            {[["Vehicle",`${make} ${model} ${variant}`.trim()],["Price",`€${Number(price).toLocaleString()}`],["Photos",`${photos.length} uploaded`]].map(([k,v],i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"8px 0",borderBottom:i<2?`1px solid ${t.bd}`:"none"}}>
                <span style={{color:t.tx2}}>{k}</span>
                <span style={{fontWeight:600}}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"center",marginTop:20}}>
              <button onClick={()=>{setSubmitted(false);setStep(1);setMake("");setModel("");setPhotos([]);setPrice("")}} style={{padding:"10px 20px",borderRadius:10,border:`1px solid ${t.bd}`,background:t.card,color:t.tx,fontSize:13,fontWeight:500,cursor:"pointer"}}>Sell another EV</button>
              <button onClick={()=>nav("/account")} style={{padding:"10px 20px",borderRadius:10,border:"none",background:GR,color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",boxShadow:"0 2px 8px rgba(255,117,0,0.3)"}}>View my listing</button>
            </div>
        </div>
      </div>
    );
  }

  return(
    <>
        {/* HEADER */}
        <div style={{padding:"24px 0 6px"}}>
          <h1 style={{fontSize:22,fontWeight:700,margin:0}}>Sell your EV</h1>
          <p style={{fontSize:13,color:t.tx2,margin:"4px 0 0"}}>List your electric vehicle in minutes. Reach thousands of buyers across Europe.</p>
        </div>

        {/* STEPPER */}
        <div style={{display:"flex",gap:4,padding:"14px 0 20px",overflowX:"auto"}}>
          {STEPS.map(s=>{
            const done = step > s.id;
            const active = step === s.id;
            return(
              <div key={s.id} onClick={()=>{if(done)setStep(s.id)}} style={{flex:1,minWidth:0,cursor:done?"pointer":"default"}}>
                <div style={{display:"flex",alignItems:"center",gap:5,padding:"7px 8px",borderRadius:10,background:active?(d?"rgba(255,117,0,0.1)":"rgba(255,117,0,0.06)"):done?(d?"rgba(16,185,129,0.1)":"rgba(16,185,129,0.06)"):t.sec,border:active?`1.5px solid ${BC}`:"1.5px solid transparent",transition:"all 0.2s"}}>
                  <div style={{width:26,height:26,borderRadius:8,background:done?"#10b981":active?BC:"rgba(128,128,128,0.15)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:done||active?"#fff":"#9ca3af",transition:"all 0.2s"}}>
                    {done?<CheckIcon size={12} color="#fff"/>:<span style={{fontSize:10,fontWeight:700}}>{s.id}</span>}
                  </div>
                  <span style={{fontSize:11,fontWeight:active?600:500,color:active?BC:done?"#059669":t.tx2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* FORM CARD */}
        <div style={cardS}>

          {step===1&&(
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                <CarIcon size={18} color={BC}/>
                <h2 style={{fontSize:16,fontWeight:700,margin:0}}>Vehicle details</h2>
              </div>
              <div style={{display:"grid",gridTemplateColumns:g2,gap:12}}>
                <Sel label="Make" value={make} onChange={v=>{setMake(v);setModel("")}} options={Object.keys(MAKES_DATA).sort()} ph="Select make" req t={t}/>
                <Sel label="Model" value={model} onChange={setModel} options={models} ph={make?"Select model":"Pick make first"} req t={t}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:g2,gap:12}}>
                <Inp label="Variant / Trim" value={variant} onChange={setVariant} ph="e.g. Long Range, Performance" t={t}/>
                <Sel label="Year" value={year} onChange={setYear} options={years} ph="Select year" req t={t}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:g2,gap:12}}>
                <Inp label="Mileage" value={km} onChange={setKm} ph="0" unit="km" type="number" req t={t}/>
                <Sel label="Condition" value={condition} onChange={setCondition} options={CONDITIONS} req t={t}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:g2,gap:12}}>
                <Sel label="Exterior colour" value={color} onChange={setColor} options={COLORS} t={t}/>
                <Inp label="Interior colour" value={intColor} onChange={setIntColor} ph="e.g. Black Premium" t={t}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:g2,gap:12}}>
                <Sel label="Drivetrain" value={drive} onChange={setDrive} options={DRIVETRAINS} t={t}/>
                <Inp label="VIN" value={vin} onChange={setVin} ph="Optional — builds trust" t={t}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:g2,gap:12}}>
                <Inp label="First registration" value={regDate} onChange={setRegDate} ph="MM/YYYY" t={t}/>
                <Inp label="Previous owners" value={owners} onChange={setOwners} ph="e.g. 1" type="number" t={t}/>
              </div>
              <Toggle label="Accident-free" value={accidentFree} onChange={setAccidentFree} t={t}/>
              <Sel label="Service history" value={serviceHistory} onChange={setServiceHistory} options={["Full service history","Partial service history","No service history"]} t={t}/>
            </div>
          )}

          {step===2&&(
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                <BatteryIcon size={18} color={BC}/>
                <h2 style={{fontSize:16,fontWeight:700,margin:0}}>EV specifications</h2>
              </div>
              <div style={{background:d?"rgba(255,117,0,0.06)":"rgba(255,117,0,0.04)",borderRadius:12,padding:"12px 14px",display:"flex",alignItems:"flex-start",gap:10,border:`1px solid ${d?"rgba(255,117,0,0.12)":"rgba(255,117,0,0.1)"}`}}>
                <InfoIcon size={16} color={BC} style={{flexShrink:0,marginTop:1}}/>
                <span style={{fontSize:12,color:t.tx2,lineHeight:1.5}}>These EV-specific details help your listing stand out. Battery health (SoH) is the #1 factor buyers look for in used EVs.</span>
              </div>
              <div style={{fontSize:13,fontWeight:600,color:t.tx,marginTop:4}}>Battery & range</div>
              <div style={{display:"grid",gridTemplateColumns:g2,gap:12}}>
                <Inp label="Gross battery capacity" value={battery} onChange={setBattery} ph="e.g. 75" unit="kWh" type="number" req t={t}/>
                <Inp label="Nett battery capacity" value={usable} onChange={setUsable} ph="e.g. 72.5" unit="kWh" type="number" t={t}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:g2,gap:12}}>
                <Inp label="State of Health (SoH)" value={soh} onChange={setSoh} ph="e.g. 97" unit="%" type="number" req t={t}/>
              <div style={{display:"grid",gridTemplateColumns:g2,gap:12}}>
                <Inp label="Range estimate (summer)" value={rangeReal} onChange={setRangeReal} ph="e.g. 520" unit="km" type="number" t={t}/>
                <Inp label="Range estimate (winter)" value={rangeWinter} onChange={setRangeWinter} ph="e.g. 380" unit="km" type="number" t={t}/>
              </div>
              </div>
              <div style={{fontSize:13,fontWeight:600,color:t.tx,marginTop:8}}>Charging</div>
              <div style={{display:"grid",gridTemplateColumns:g2,gap:12}}>
                <Inp label="Max DC fast charge" value={dcCharge} onChange={setDcCharge} ph="e.g. 250" unit="kW" type="number" req t={t}/>
                <Inp label="AC onboard charger" value={acCharge} onChange={setAcCharge} ph="e.g. 11" unit="kW" type="number" t={t}/>
              </div>
              <Sel label="Charge port type" value={port} onChange={setPort} options={PORTS} t={t}/>
              <div style={{fontSize:13,fontWeight:600,color:t.tx,marginTop:8}}>Power</div>
              <Inp label="Power (as per registration documents)" value={powerKw} onChange={setPowerKw} ph="e.g. 258" unit="kW" type="number" t={t}/>
            </div>
          )}

          {step===3&&(
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                <CameraIcon size={18} color={BC}/>
                <h2 style={{fontSize:16,fontWeight:700,margin:0}}>Photos</h2>
              </div>
              <div style={{background:d?"rgba(255,117,0,0.06)":"rgba(255,117,0,0.04)",borderRadius:12,padding:"12px 14px",display:"flex",alignItems:"flex-start",gap:10,border:`1px solid ${d?"rgba(255,117,0,0.12)":"rgba(255,117,0,0.1)"}`}}>
                <InfoIcon size={16} color={BC} style={{flexShrink:0,marginTop:1}}/>
                <span style={{fontSize:12,color:t.tx2,lineHeight:1.5}}>Listings with 6+ photos get 3x more views. Include exterior (front, rear, sides), interior, dashboard, boot, and any damage.</span>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(110px,1fr))",gap:10}}>
                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileSelect} style={{display:"none"}}/>
                {photos.map((ph,i)=>(
                  <div key={i} style={{position:"relative",aspectRatio:"4/3",borderRadius:12,overflow:"hidden",boxShadow:`inset 0 0 0 1px ${t.bd}`}}>
                    <img src={ph} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                    <button onClick={()=>removePhoto(i)} style={{position:"absolute",top:4,right:4,width:24,height:24,borderRadius:6,border:"none",background:"rgba(0,0,0,0.5)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><TrashIcon size={12} color="#fff"/></button>
                    {i===0&&<div style={{position:"absolute",bottom:4,left:4,fontSize:9,fontWeight:700,background:BC,color:"#fff",padding:"2px 6px",borderRadius:4,textTransform:"uppercase"}}>Cover</div>}
                  </div>
                ))}
                {photos.length<20&&(
                  <div onClick={addPhoto} style={{aspectRatio:"4/3",borderRadius:10,border:`2px dashed ${d?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.1)"}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",gap:6,background:t.sec,opacity:uploading?0.5:1}}>
                    <PlusIcon size={22} color={t.tx3}/>
                    <span style={{fontSize:11,color:t.tx3,fontWeight:500}}>{uploading?"Compressing...":"Add photo"}</span>
                  </div>
                )}
              </div>
              <div style={{fontSize:12,color:t.tx3}}>{photos.length}/20 photos · First photo is the cover image</div>
            </div>
          )}

          {step===4&&(
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                <TagIcon size={18} color={BC}/>
                <h2 style={{fontSize:16,fontWeight:700,margin:0}}>Pricing</h2>
              </div>
              <Inp label="Asking price" value={price} onChange={setPrice} ph="e.g. 38900" unit="EUR" type="number" req t={t}/>

              {price&&(
                <div style={{background:t.sec,borderRadius:12,padding:14}}>
                  <div style={{fontSize:12,fontWeight:600,color:t.tx3,marginBottom:8}}>Price positioning</div>
                  {(()=>{
                    const p = Number(price);
                    const avg = 42200;
                    const low = avg*0.8;
                    const high = avg*1.2;
                    const range = high-low;
                    const pct = Math.max(0,Math.min(100,((p-low)/range)*100));
                    const isGood = pct<35;
                    const isBad = pct>65;
                    const lbl = isGood?"Competitive price":isBad?"Above average":"Market average";
                    const clr = isGood?"#059669":isBad?"#dc2626":"#d97706";
                    return(
                      <div>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                          <span style={{fontSize:12,fontWeight:600,color:clr}}>{lbl}</span>
                          <span style={{fontSize:11,color:t.tx3}}>Avg. €{avg.toLocaleString()}</span>
                        </div>
                        <div style={{position:"relative",height:8,borderRadius:4,background:"linear-gradient(90deg,#10b981 0%,#10b981 30%,#f59e0b 45%,#f59e0b 55%,#ef4444 70%,#ef4444 100%)"}}>
                          <div style={{position:"absolute",top:-3,left:`${pct}%`,transform:"translateX(-50%)",width:14,height:14,borderRadius:"50%",background:t.card,border:`3px solid ${clr}`,boxShadow:"0 1px 4px rgba(0,0,0,0.2)"}}/>
                        </div>
                        <div style={{display:"flex",justifyContent:"space-between",marginTop:4,fontSize:10,color:t.tx3}}>
                          <span>€{Math.round(low).toLocaleString()}</span>
                          <span>€{Math.round(high).toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              <Toggle label="Price negotiable" value={negotiable} onChange={setNegotiable} t={t}/>
              <Toggle label="VAT deductible" value={vatDeduct} onChange={setVatDeduct} t={t}/>

              {/* Description */}
              <div style={{marginTop:8,background:d?"rgba(255,117,0,0.05)":"linear-gradient(135deg,rgba(255,117,0,0.04),rgba(255,149,51,0.04))",borderRadius:14,border:`1.5px solid ${d?"rgba(255,117,0,0.12)":"rgba(255,117,0,0.12)"}`,padding:16}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <div style={{width:28,height:28,borderRadius:8,background:BC,display:"flex",alignItems:"center",justifyContent:"center"}}><InfoIcon size={14} color="#fff"/></div>
                  <div>
                    <div style={{fontSize:14,fontWeight:700,color:BC}}>Description — this sells your car</div>
                    <div style={{fontSize:11,color:t.tx2}}>Listings with detailed descriptions sell 2x faster</div>
                  </div>
                </div>
                <div style={{fontSize:12,color:t.tx2,lineHeight:1.6,marginBottom:10}}>
                  Be specific and honest. Buyers want to know: recent maintenance (tyres, brakes, battery check), any modifications, winter/summer tyres included, charging habits (mostly home or DC fast charge), reason for selling, and what makes this car special.
                </div>
                <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder={"Example: One owner since new, always home-charged with a 11kW wallbox. Full Tesla service history, last service Sept 2024. New Michelin all-season tyres (Jan 2025). Battery degradation report available — 97% SoH verified. Autopilot included. Selling because upgrading to Model Y for more space. Winter package with heated steering wheel and seats. No scratches, no dents. Smoke-free, pet-free."} rows={7} style={{width:"100%",borderRadius:10,border:`1px solid ${d?"rgba(255,117,0,0.15)":"rgba(255,117,0,0.15)"}`,background:t.inp,color:t.tx,padding:"12px 14px",fontSize:13,boxSizing:"border-box",resize:"vertical",fontFamily:"inherit",lineHeight:1.6}}/>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:10}}>
                  <span style={{fontSize:11,color:t.tx3}}>Include:</span>
                  {["Maintenance history","Charging habits","Tyre condition","Reason for selling","Extras included","Known issues"].map((tt,i)=>(
                    <span key={i} style={{fontSize:10,padding:"3px 8px",borderRadius:5,background:d?"rgba(255,117,0,0.1)":"rgba(255,117,0,0.06)",color:BC,fontWeight:500}}>{tt}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step===5&&(
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                <UserIcon size={18} color={BC}/>
                <h2 style={{fontSize:16,fontWeight:700,margin:0}}>Contact details</h2>
              </div>
              <div>
                <label style={{fontSize:12,fontWeight:600,color:t.tx2,marginBottom:6,display:"block"}}>Seller type</label>
                <div style={{display:"flex",gap:8}}>
                  {[{v:"private",l:"Private seller"},{v:"dealer",l:"Dealer"}].map(tp=>(
                    <button key={tp.v} onClick={()=>setSellerType(tp.v)} style={{flex:1,height:42,borderRadius:10,border:sellerType===tp.v?`2px solid ${BC}`:`1px solid ${t.bd}`,background:sellerType===tp.v?(d?"rgba(255,117,0,0.08)":"rgba(255,117,0,0.04)"):t.inp,color:sellerType===tp.v?BC:t.tx,fontSize:13,fontWeight:sellerType===tp.v?600:400,cursor:"pointer"}}>{tp.l}</button>
                  ))}
                </div>
              </div>
              <Inp label="Name / Company" value={sellerName} onChange={setSellerName} ph={sellerType==="dealer"?"Company name":"Your name"} req t={t}/>
              <div style={{display:"grid",gridTemplateColumns:g2,gap:12}}>
                <Inp label="Phone" value={phone} onChange={setPhone} ph="+49 151 ..." req t={t}/>
                <Inp label="Email" value={email} onChange={setEmail} ph="you@email.com" type="email" req t={t}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:g2,gap:12}}>
                <Inp label="City" value={city} onChange={setCity} ph="e.g. Munich" req t={t}/>
                <Sel label="Country" value={country} onChange={setCountry} options={COUNTRIES.map(c=>({v:c.code,l:c.name}))} ph="Select country" req t={t}/>
              </div>
            </div>
          )}

          {step===6&&(
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                <CheckIcon size={18} color={BC}/>
                <h2 style={{fontSize:16,fontWeight:700,margin:0}}>Review your listing</h2>
              </div>
              <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                {photos.slice(0,3).map((ph,i)=>(
                  <div key={i} style={{width:96,height:64,borderRadius:8,overflow:"hidden"}}><img src={ph} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/></div>
                ))}
                {photos.length>3&&<div style={{width:96,height:64,borderRadius:8,background:t.sec,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:600,color:t.tx2}}>+{photos.length-3} more</div>}
              </div>
              {[
                {s:"Vehicle",si:1,rows:[
                  ["Make / Model",`${make} ${model} ${variant}`.trim()],
                  ["Year",year],["Mileage",km?`${Number(km).toLocaleString()} km`:""],
                  ["Condition",condition],["Colour",color],["Drivetrain",drive],
                ]},
                {s:"EV specs",si:2,rows:[
                  ["Gross battery",battery?`${battery} kWh`:""],["SoH",soh?`${soh}%`:""],
                  ["Range (summer)",rangeReal?`${rangeReal} km`:""],["Range (winter)",rangeWinter?`${rangeWinter} km`:""],
                  ["DC charge",dcCharge?`${dcCharge} kW`:""],["Port",port],
                  ["Power",powerKw?`${powerKw} kW`:""],
                ]},
                {s:"Pricing",si:4,rows:[
                  ["Price",price?`€${Number(price).toLocaleString()}`:""],
                  ["Negotiable",negotiable?"Yes":"No"],["VAT deductible",vatDeduct?"Yes":"No"],
                ]},
                {s:"Contact",si:5,rows:[
                  ["Seller",`${sellerName} (${sellerType})`],
                  ["Location",`${city}, ${COUNTRIES.find(c=>c.code===country)?.name||country}`],
                  ["Phone",phone],["Email",email],
                ]},
              ].map((section,idx)=>(
                <div key={idx}>
                  <div style={{fontSize:13,fontWeight:600,color:t.tx,marginBottom:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    {section.s}
                    <button onClick={()=>setStep(section.si)} style={{fontSize:11,color:BC,background:"none",border:"none",cursor:"pointer",fontWeight:600}}>Edit</button>
                  </div>
                  <div style={{background:t.sec,borderRadius:10,padding:"2px 14px"}}>
                    {section.rows.filter(r=>r[1]).map((r,ri,arr)=>(
                      <div key={ri} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:ri<arr.length-1?`1px solid ${t.bd}`:"none",fontSize:13}}>
                        <span style={{color:t.tx2}}>{r[0]}</span>
                        <span style={{fontWeight:500}}>{r[1]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* NAVIGATION */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingBottom:12}}>
          <button onClick={()=>setStep(Math.max(1,step-1))} style={{padding:"10px 18px",borderRadius:10,border:`1px solid ${t.bd}`,background:t.card,color:t.tx,fontSize:13,fontWeight:500,cursor:"pointer",display:"flex",alignItems:"center",gap:6,visibility:step===1?"hidden":"visible"}}><ChevL size={14}/> Back</button>

          {step<6?(
            <button onClick={()=>{if(canNext())setStep(step+1)}} style={{padding:"10px 22px",borderRadius:10,border:"none",background:canNext()?GR:"rgba(128,128,128,0.15)",color:canNext()?"#fff":"#9ca3af",fontSize:13,fontWeight:600,cursor:canNext()?"pointer":"default",display:"flex",alignItems:"center",gap:6,boxShadow:canNext()?"0 2px 8px rgba(255,117,0,0.3)":"none"}}>Next <ChevR size={14} color={canNext()?"#fff":"#9ca3af"}/></button>
          ):(
            <button onClick={()=>setSubmitted(true)} style={{padding:"12px 24px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#10b981,#059669)",color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:8,boxShadow:"0 4px 14px rgba(16,185,129,0.3)"}}>
              <CheckIcon size={16} color="#fff"/> Publish listing
            </button>
          )}
        </div>
    </>
  );
}
