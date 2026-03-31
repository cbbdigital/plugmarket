import { useState, useRef, useEffect } from "react";
import { useOutletContext, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../lib/auth";

/* ─── ICONS (same as dashboard) ─── */
const I=({d,size=16,color="currentColor"})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{d}</svg>;
const Bolt=p=><I {...p} d={<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>}/>;
const Car=p=><I {...p} d={<path d="M5 17h14M5 17a2 2 0 01-2-2V9a2 2 0 012-2h1l2-3h8l2 3h1a2 2 0 012 2v6a2 2 0 01-2 2M5 17v1a1 1 0 001 1h1a1 1 0 001-1v-1m10 0v1a1 1 0 001 1h1a1 1 0 001-1v-1"/>}/>;
const Chat=p=><I {...p} d={<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>}/>;
const Plus=p=><I {...p} d={<><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></>}/>;
const Bck=p=><I {...p} d={<><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></>}/>;
const Home=p=><I {...p} d={<><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>}/>;
const Srch=p=><I {...p} d={<><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>}/>;
const Usr=p=><I {...p} d={<><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>}/>;
const Sun=p=><I {...p} d={<><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/></>}/>;
const Moon=p=><I {...p} d={<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>}/>;
const Send=p=><I {...p} d={<><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>}/>;
const Chk2=p=><I {...p} d={<><path d="M18 6L7 17l-5-5"/><path d="M22 10l-9.17 9.17"/></>}/>;
const Phone=p=><I {...p} d={<path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>}/>;
const Dots=p=><I {...p} d={<><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></>}/>;
const Img=p=><I {...p} d={<><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></>}/>;
const ChevL=p=><I {...p} d={<polyline points="15 18 9 12 15 6"/>}/>;
const Hrt=p=><I {...p} d={<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>}/>;

const BC="#FF7500";
const BG="linear-gradient(135deg,#FF7500,#FF9533)";

// ── Supabase REST client ──
const SB_URL = import.meta.env.VITE_SUPABASE_URL || "https://tmftxqwqwceuiydleuag.supabase.co";
const SB_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtZnR4cXdxd2NldWl5ZGxldWFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MDA2MzEsImV4cCI6MjA5MDI3NjYzMX0.k5TOln3e4M8PxH2tH22-6BsFimH84InVfNOWP8riaCM";
const sbH=(token)=>({"apikey":SB_KEY,"Authorization":`Bearer ${token||SB_KEY}`,"Content-Type":"application/json","Prefer":"return=representation"});
async function sbGet(table,params,token){try{const r=await fetch(`${SB_URL}/rest/v1/${table}?${params}`,{headers:sbH(token)});if(!r.ok)return[];return await r.json()}catch{return[]}}
async function sbPost(table,data,token){try{const r=await fetch(`${SB_URL}/rest/v1/${table}`,{method:"POST",headers:sbH(token),body:JSON.stringify(data)});if(!r.ok)return null;const res=await r.json();return res?.[0]||res}catch{return null}}
async function sbPatch(table,match,data,token){try{await fetch(`${SB_URL}/rest/v1/${table}?${match}`,{method:"PATCH",headers:sbH(token),body:JSON.stringify(data)});return true}catch{return false}}
/* ─── RESPONSIVE HOOK ─── */
function useWidth(){
  const[w,setW]=useState(typeof window!=="undefined"?window.innerWidth:800);
  useEffect(()=>{
    const h=()=>setW(window.innerWidth);
    window.addEventListener("resize",h);
    return()=>window.removeEventListener("resize",h);
  },[]);
  return w;
}

function timeAgo(d){if(!d)return"";const s=Math.floor((Date.now()-new Date(d).getTime())/1000);if(s<60)return"now";if(s<3600)return`${Math.floor(s/60)} min ago`;if(s<86400)return`${Math.floor(s/3600)}h ago`;if(s<604800)return`${Math.floor(s/86400)}d ago`;return new Date(d).toLocaleDateString()}
const groupByCar=c=>{const g={};c.forEach(x=>{if(!g[x.car])g[x.car]=[];g[x.car].push(x)});return g};
/* ─── CONVERSATION ROW ─── */
function ConvoRow({c,t,active,onClick,isLast}){
  const[hov,setHov]=useState(false);
  return(
    <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",cursor:"pointer",background:active?"rgba(255,117,0,0.08)":hov?t.sec:"transparent",borderBottom:isLast?"none":`1px solid ${t.bd}`,borderLeft:active?`3px solid ${BC}`:"3px solid transparent",transition:"background 0.15s"}}>
      <div style={{position:"relative",flexShrink:0}}>
        <div style={{width:40,height:40,borderRadius:"50%",background:t.tg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:t.tx2}}>{c.initials}</div>
        {c.online&&<div style={{position:"absolute",bottom:0,right:0,width:10,height:10,borderRadius:"50%",background:"#10b981",border:`2px solid ${t.card}`}}/>}
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}>
          <span style={{fontSize:13,fontWeight:c.unread?600:500,color:t.tx}}>{c.name}</span>
          <span style={{fontSize:10,color:t.tx3,flexShrink:0,marginLeft:8}}>{c.time}</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:3}}>
          <span style={{fontSize:9,fontWeight:600,color:"#fff",background:"#3b82f6",padding:"1px 5px",borderRadius:3,display:"inline-flex",alignItems:"center",gap:2}}><Car size={8} color="#fff"/>{c.car}</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:12,color:c.unread?t.tx:t.tx2,fontWeight:c.unread?500:400,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.lastMsg}</span>
          {c.unread>0&&<span style={{minWidth:18,height:18,borderRadius:9,background:BC,color:"#fff",fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 5px",flexShrink:0,marginLeft:8}}>{c.unread}</span>}
        </div>
      </div>
    </div>
  );
}
/* ─── CHAT BUBBLE ─── */
function Bubble({msg,t}){
  const mine=msg.from==="me";
  return(
    <div style={{display:"flex",justifyContent:mine?"flex-end":"flex-start",padding:"2px 0"}}>
      <div style={{maxWidth:"80%",padding:"9px 13px",borderRadius:14,borderBottomRightRadius:mine?4:14,borderBottomLeftRadius:mine?14:4,background:mine?BG:t.card,color:mine?"#fff":t.tx,fontSize:13,lineHeight:1.5,border:mine?"none":`1px solid ${t.bd}`}}>
        <div>{msg.text}</div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",gap:4,marginTop:3}}>
          <span style={{fontSize:9,color:mine?"rgba(255,255,255,0.5)":t.tx3}}>{msg.time}</span>
          {mine&&<Chk2 size={11} color="rgba(255,255,255,0.5)"/>}
        </div>
      </div>
    </div>
  );
}
/* ─── SHARED: LEFT PANEL (conversations list) ─── */
function LeftPanel({t,dark,search,setSearch,activeFilter,setActiveFilter,conversations,groups,filtered,activeChat,onSelect}){
  return(
    <>
      <div style={{padding:"12px 14px 8px"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,height:36,borderRadius:10,border:`1px solid ${t.bd}`,background:t.bg,padding:"0 10px"}}>
          <Srch size={13} color={t.tx3}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search conversations..." style={{flex:1,background:"none",border:"none",outline:"none",color:t.tx,fontSize:12}}/>
        </div>
      </div>
      <div style={{display:"flex",gap:4,padding:"4px 14px 10px",overflowX:"auto",flexShrink:0}}>
        {[{v:"all",l:"All",n:conversations.length},...Object.entries(groups).map(([car,arr])=>({v:car,l:car,n:arr.length}))].map(f=>(
          <button key={f.v} onClick={()=>setActiveFilter(f.v)} style={{padding:"5px 10px",borderRadius:8,border:activeFilter===f.v?`1.5px solid ${BC}`:`1px solid ${t.bd}`,background:activeFilter===f.v?(dark?"#2A2530":"#FFF3EB"):t.inp,color:activeFilter===f.v?BC:t.tx2,fontSize:10,fontWeight:activeFilter===f.v?600:500,cursor:"pointer",display:"flex",alignItems:"center",gap:3,whiteSpace:"nowrap"}}>
            {f.l}
            <span style={{minWidth:14,height:14,borderRadius:7,background:activeFilter===f.v?BC:t.sec,color:activeFilter===f.v?"#fff":t.tx3,fontSize:8,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 3px"}}>{f.n}</span>
          </button>
        ))}
      </div>
      <div style={{flex:1,overflowY:"auto"}}>
        {filtered.length===0?(
          <div style={{textAlign:"center",padding:"40px 14px",color:t.tx3,fontSize:12}}>No conversations found</div>
        ):filtered.map((c,i)=>(
          <ConvoRow key={c.id} c={c} t={t} active={c.id===activeChat} isLast={i===filtered.length-1} onClick={()=>onSelect(c.id)}/>
        ))}
      </div>
    </>
  );
}
/* ─── SHARED: RIGHT PANEL (chat view) ─── */
function RightPanel({t,activeConvo,newMsg,setNewMsg,sendMessage,inputRef,messagesEndRef,onBack,narrow}){
  return(
    <>
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 16px",borderBottom:`1px solid ${t.bd}`,flexShrink:0}}>
        {narrow&&<button onClick={onBack} style={{padding:"5px 8px",borderRadius:8,border:`1px solid ${t.bd}`,background:t.inp,display:"flex",alignItems:"center",cursor:"pointer"}}><ChevL size={14} color={t.tx2}/></button>}
        <div style={{position:"relative",flexShrink:0}}>
          <div style={{width:36,height:36,borderRadius:"50%",background:t.tg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:t.tx2}}>{activeConvo.initials}</div>
          {activeConvo.online&&<div style={{position:"absolute",bottom:0,right:0,width:9,height:9,borderRadius:"50%",background:"#10b981",border:`2px solid ${t.card}`}}/>}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:14,fontWeight:600,color:t.tx}}>{activeConvo.name}</div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:10,color:activeConvo.online?"#10b981":t.tx3}}>{activeConvo.online?"Online":"Offline"}</span>
            <span style={{fontSize:9,fontWeight:600,color:"#fff",background:"#3b82f6",padding:"1px 5px",borderRadius:3}}>{activeConvo.car}</span>
          </div>
        </div>
        <div style={{display:"flex",gap:5}}>
          <button style={{width:32,height:32,borderRadius:8,border:`1px solid ${t.bd}`,background:t.inp,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><Phone size={14} color={t.tx3}/></button>
          <button style={{width:32,height:32,borderRadius:8,border:`1px solid ${t.bd}`,background:t.inp,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><Dots size={14} color={t.tx3}/></button>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"12px 16px"}}>
        {activeConvo.messages.map(msg=><Bubble key={msg.id} msg={msg} t={t}/>)}
        <div ref={messagesEndRef}/>
      </div>
      <div style={{padding:"8px 16px 12px",borderTop:`1px solid ${t.bd}`,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:6,height:40,borderRadius:10,border:`1px solid ${t.bd}`,background:t.bg,padding:"0 5px 0 12px"}}>
          <Img size={15} color={t.tx3} style={{cursor:"pointer",flexShrink:0}}/>
          <input ref={inputRef} value={newMsg} onChange={e=>setNewMsg(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage()}}} placeholder="Type a message..." style={{flex:1,background:"none",border:"none",outline:"none",color:t.tx,fontSize:12,height:"100%"}}/>
          <button onClick={sendMessage} style={{height:30,padding:"0 12px",borderRadius:7,border:"none",background:newMsg.trim()?BG:t.sec,color:newMsg.trim()?"#fff":t.tx3,fontSize:11,fontWeight:600,cursor:newMsg.trim()?"pointer":"default",display:"flex",alignItems:"center",gap:4,transition:"all 0.15s"}}>Send <Send size={11} color={newMsg.trim()?"#fff":t.tx3}/></button>
        </div>
      </div>
    </>
  );
}

export default function MessagesPage(){
  const { t, dark } = useOutletContext();
  const { user, session } = useAuth();
  const nav = useNavigate();
  const [sp, setSp] = useSearchParams();
  const incomingListing = sp.get("listing");
  const incomingSeller = sp.get("seller");
  const[activeChat,setActiveChat]=useState(null);
  const[newMsg,setNewMsg]=useState("");
  const[search,setSearch]=useState("");
  const[conversations,setConversations]=useState([]);
  const[activeFilter,setActiveFilter]=useState("all");
  const[loading,setLoading]=useState(true);
  const messagesEndRef=useRef(null);
  const inputRef=useRef(null);
  const width=useWidth();
  const narrow=width<600;

  useEffect(()=>{messagesEndRef.current?.scrollIntoView({behavior:"smooth"})},[activeChat,conversations]);
  useEffect(() => { if (!user) nav("/login"); }, [user, nav]);

  // Load conversations from Supabase
  useEffect(()=>{
    if(!user||!session?.access_token)return;
    const token=session.access_token;
    const uid=user.id;
    (async()=>{
      const convos=await sbGet("conversations",`or=(buyer_id.eq.${uid},seller_id.eq.${uid})&order=updated_at.desc`,token);
      if(convos.length>0){
        const mapped=[];
        for(const c of convos){
          const otherIsMe=c.buyer_id===uid;
          const otherId=otherIsMe?c.seller_id:c.buyer_id;
          const otherProfile=await sbGet("profiles",`id=eq.${otherId}&select=full_name`,token);
          const otherName=otherProfile?.[0]?.full_name||"User";
          const listing=c.listing_id?await sbGet("listings",`id=eq.${c.listing_id}&select=make,model`,token):[];
          const carName=listing?.[0]?`${listing[0].make} ${listing[0].model}`:"General";
          const msgs=await sbGet("messages",`conversation_id=eq.${c.id}&order=created_at.asc`,token);
          mapped.push({
            id:c.id, name:otherName,
            initials:otherName.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2),
            online:false, unread:otherIsMe?(c.buyer_unread_count||0):(c.seller_unread_count||0),
            car:carName, lastMsg:c.last_message_text||"", time:timeAgo(c.updated_at),
            messages:msgs.map(m=>({id:m.id,from:m.sender_id===uid?"me":"them",text:m.content,time:new Date(m.created_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})})),
          });
        }
        setConversations(mapped);
      }
      setLoading(false);
    })();
  },[user,session]);

  // Auto-open or create conversation when coming from listing page
  useEffect(()=>{
    if(!incomingListing||!incomingSeller||!user||!session?.access_token||loading)return;
    if(incomingSeller===user.id){setSp({});return;} // can't message yourself
    const token=session.access_token;
    const uid=user.id;
    (async()=>{
      // Check if conversation already exists for this listing between these users
      // Try both directions: user is buyer OR user is seller
      let existing=await sbGet("conversations",`listing_id=eq.${incomingListing}&buyer_id=eq.${uid}&seller_id=eq.${incomingSeller}`,token);
      if(existing.length===0){
        existing=await sbGet("conversations",`listing_id=eq.${incomingListing}&buyer_id=eq.${incomingSeller}&seller_id=eq.${uid}`,token);
      }
      if(existing.length>0){
        // Found existing — make sure it's in our local state
        const existingId=existing[0].id;
        const alreadyInState=conversations.find(c=>c.id===existingId);
        if(!alreadyInState){
          // Fetch details and add to state
          const otherId=existing[0].buyer_id===uid?existing[0].seller_id:existing[0].buyer_id;
          const otherProfile=await sbGet("profiles",`id=eq.${otherId}&select=full_name`,token);
          const listing=await sbGet("listings",`id=eq.${incomingListing}&select=make,model`,token);
          const otherName=otherProfile?.[0]?.full_name||"Seller";
          const carName=listing?.[0]?`${listing[0].make} ${listing[0].model}`:"Vehicle";
          const msgs=await sbGet("messages",`conversation_id=eq.${existingId}&order=created_at.asc`,token);
          setConversations(prev=>[{
            id:existingId,name:otherName,
            initials:otherName.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2),
            online:false,unread:0,car:carName,
            lastMsg:existing[0].last_message_text||"",time:timeAgo(existing[0].updated_at),
            messages:msgs.map(m=>({id:m.id,from:m.sender_id===uid?"me":"them",text:m.content,time:new Date(m.created_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})})),
          },...prev]);
        }
        setActiveChat(existingId);
      } else {
        // Create new conversation
        const newConvo=await sbPost("conversations",{
          listing_id:incomingListing,
          buyer_id:uid,
          seller_id:incomingSeller,
          last_message_text:"",
        },token);
        if(newConvo?.id){
          const listing=await sbGet("listings",`id=eq.${incomingListing}&select=make,model`,token);
          const sellerProfile=await sbGet("profiles",`id=eq.${incomingSeller}&select=full_name`,token);
          const carName=listing?.[0]?`${listing[0].make} ${listing[0].model}`:"Vehicle";
          const sellerName=sellerProfile?.[0]?.full_name||"Seller";
          setConversations(prev=>[{
            id:newConvo.id,name:sellerName,
            initials:sellerName.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2),
            online:false,unread:0,car:carName,lastMsg:"",time:"now",messages:[],
          },...prev]);
          setActiveChat(newConvo.id);
        }
      }
      // Clear URL params
      setSp({});
    })();
  },[incomingListing,incomingSeller,user,session,loading]);

  if (!user) return null;

  const activeConvo=conversations.find(c=>c.id===activeChat);
  const totalUnread=conversations.reduce((s,c)=>s+c.unread,0);
  const groups=groupByCar(conversations);

  const filtered=conversations.filter(c=>{
    const ms=c.name.toLowerCase().includes(search.toLowerCase())||c.car.toLowerCase().includes(search.toLowerCase());
    if(activeFilter==="all") return ms;
    return ms&&c.car===activeFilter;
  });

  const sendMessage=async()=>{
    if(!newMsg.trim()||!activeChat||!session?.access_token)return;
    const token=session.access_token;
    const msg=await sbPost("messages",{conversation_id:activeChat,sender_id:user.id,content:newMsg.trim()},token);
    if(msg){
      const ts=new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
      setConversations(prev=>prev.map(c=>{
        if(c.id!==activeChat)return c;
        return{...c,messages:[...c.messages,{id:msg.id||Date.now(),from:"me",text:newMsg.trim(),time:ts}],lastMsg:newMsg.trim(),time:"now"};
      }));
    }
    setNewMsg("");
    inputRef.current?.focus();
  };

  const selectConvo=(id)=>{
    setActiveChat(id);
    setConversations(prev=>prev.map(x=>x.id===id?{...x,unread:0}:x));
    // Mark as read in Supabase
    if(session?.access_token){
      const c=conversations.find(x=>x.id===id);
      if(c) sbPatch("conversations",`id=eq.${id}`,{[c.buyer_id===user.id?"buyer_unread_count":"seller_unread_count"]:0},session.access_token);
    }
  };

  if(loading) return <div style={{textAlign:"center",padding:"60px 0",color:t.tx3}}>Loading messages...</div>;

  // Empty state
  if(conversations.length===0) return(
    <div style={{textAlign:"center",padding:"60px 0"}}>
      <Chat size={48} color={t.tx3}/>
      <div style={{fontSize:16,fontWeight:600,color:t.tx,marginTop:12}}>No messages yet</div>
      <div style={{fontSize:13,color:t.tx2,marginTop:6}}>When buyers contact you about your listings, conversations will appear here.</div>
    </div>
  );

  if(narrow){
    return(
      <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 140px)",overflow:"hidden"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 0"}}>
          <Chat size={20} color={BC}/>
          <span style={{fontSize:16,fontWeight:700}}>Messages</span>
          {totalUnread>0&&<span style={{minWidth:18,height:18,borderRadius:9,background:BC,color:"#fff",fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 5px"}}>{totalUnread}</span>}
        </div>
        {activeChat&&activeConvo?(
          <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",background:t.chat||t.sec,borderRadius:12,border:`1px solid ${t.bd}`}}>
            <RightPanel t={t} activeConvo={activeConvo} newMsg={newMsg} setNewMsg={setNewMsg} sendMessage={sendMessage} inputRef={inputRef} messagesEndRef={messagesEndRef} onBack={()=>setActiveChat(null)} narrow={true}/>
          </div>
        ):(
          <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",background:t.card,borderRadius:12,border:`1px solid ${t.bd}`}}>
            <LeftPanel t={t} dark={dark} search={search} setSearch={setSearch} activeFilter={activeFilter} setActiveFilter={setActiveFilter} conversations={conversations} groups={groups} filtered={filtered} activeChat={activeChat} onSelect={selectConvo}/>
          </div>
        )}
      </div>
    );
  }

  return(
    <>
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 0"}}>
        <Chat size={20} color={BC}/>
        <span style={{fontSize:16,fontWeight:700}}>Messages</span>
        {totalUnread>0&&<span style={{minWidth:18,height:18,borderRadius:9,background:BC,color:"#fff",fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 5px"}}>{totalUnread}</span>}
      </div>
      <div style={{display:"flex",overflow:"hidden",border:`1px solid ${t.bd}`,borderRadius:12,background:t.card,height:"calc(100vh - 200px)"}}>
        <div style={{width:280,minWidth:240,flexShrink:0,display:"flex",flexDirection:"column",borderRight:`1px solid ${t.bd}`,overflow:"hidden"}}>
          <LeftPanel t={t} dark={dark} search={search} setSearch={setSearch} activeFilter={activeFilter} setActiveFilter={setActiveFilter} conversations={conversations} groups={groups} filtered={filtered} activeChat={activeChat} onSelect={selectConvo}/>
        </div>
        {activeChat&&activeConvo?(
          <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",background:t.chat||t.sec}}>
            <RightPanel t={t} activeConvo={activeConvo} newMsg={newMsg} setNewMsg={setNewMsg} sendMessage={sendMessage} inputRef={inputRef} messagesEndRef={messagesEndRef} onBack={()=>setActiveChat(null)} narrow={false}/>
          </div>
        ):(
          <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8,background:t.chat||t.sec}}>
            <Chat size={48} color={t.tx3}/>
            <div style={{fontSize:16,fontWeight:600,color:t.tx,marginTop:8}}>Select a conversation</div>
            <div style={{fontSize:12,color:t.tx2}}>Choose from your messages on the left</div>
          </div>
        )}
      </div>
    </>
  );
}
