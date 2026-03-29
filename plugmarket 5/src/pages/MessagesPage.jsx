import { useState, useRef, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
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
/* ─── MOCK DATA ─── */
const CONVERSATIONS = [
  {
    id:1, name:"Marcus Weber", initials:"MW", online:true, unread:2,
    car:"Tesla Model 3",
    lastMsg:"Is the battery report available?", time:"2 min ago",
    messages:[
      {id:1,from:"them",text:"Hi, I saw your Tesla Model 3 listing. Is it still available?",time:"10:32 AM"},
      {id:2,from:"me",text:"Yes, it's still available! Would you like to schedule a viewing?",time:"10:35 AM"},
      {id:3,from:"them",text:"That would be great. I'm in Munich as well. Could we do this Saturday?",time:"10:38 AM"},
      {id:4,from:"me",text:"Saturday works perfectly. I can do 10 AM or 2 PM — what's better for you?",time:"10:41 AM"},
      {id:5,from:"them",text:"Let's go with 10 AM. Also, I noticed you mentioned the SoH is 97%.",time:"11:02 AM"},
      {id:6,from:"them",text:"Is the battery report available?",time:"11:03 AM"},
    ]
  },
  {
    id:2, name:"Sophie Laurent", initials:"SL", online:false, unread:1,
    car:"Tesla Model 3",
    lastMsg:"I'd like to offer €36,500 for the car", time:"1 hour ago",
    messages:[
      {id:1,from:"them",text:"Bonjour, is the Tesla Model 3 still available?",time:"Yesterday"},
      {id:2,from:"me",text:"Hi Sophie! Yes, absolutely. Where are you located?",time:"Yesterday"},
      {id:3,from:"them",text:"I'm in Brussels. I'd like to offer €36,500 for the car",time:"2:15 PM"},
    ]
  },
  {
    id:3, name:"Jan de Vries", initials:"JV", online:false, unread:0,
    car:"Tesla Model 3",
    lastMsg:"Thanks, I'll think about it", time:"2 days ago",
    messages:[
      {id:1,from:"them",text:"What's the lowest you'd go on the Tesla?",time:"2 days ago"},
      {id:2,from:"me",text:"I can do €37,500 for a quick sale.",time:"2 days ago"},
      {id:3,from:"them",text:"Thanks, I'll think about it",time:"2 days ago"},
    ]
  },
  {
    id:4, name:"Anna Müller", initials:"AM", online:true, unread:1,
    car:"BMW i4",
    lastMsg:"Can I see it this Saturday?", time:"30 min ago",
    messages:[
      {id:1,from:"them",text:"Hi! I'm interested in the BMW i4. Is it available for viewing?",time:"10:00 AM"},
      {id:2,from:"me",text:"Yes! I'm in Munich. When would you like to come?",time:"10:05 AM"},
      {id:3,from:"them",text:"Can I see it this Saturday?",time:"10:30 AM"},
    ]
  },
  {
    id:5, name:"Thomas Schmidt", initials:"TS", online:false, unread:1,
    car:"BMW i4",
    lastMsg:"What's the lowest you'd go?", time:"3 hours ago",
    messages:[
      {id:1,from:"them",text:"I'm interested in the BMW i4. What's the lowest you'd go?",time:"9:00 AM"},
    ]
  },
];

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
  const { user } = useAuth();
  const nav = useNavigate();
  const[activeChat,setActiveChat]=useState(null);
  const[newMsg,setNewMsg]=useState("");
  const[search,setSearch]=useState("");
  const[conversations,setConversations]=useState(CONVERSATIONS);
  const[activeFilter,setActiveFilter]=useState("all");
  const messagesEndRef=useRef(null);
  const inputRef=useRef(null);
  const width=useWidth();
  const narrow=width<600;

  useEffect(()=>{messagesEndRef.current?.scrollIntoView({behavior:"smooth"})},[activeChat,conversations]);
  useEffect(() => { if (!user) nav("/login"); }, [user, nav]);
  if (!user) return null;

  const activeConvo=conversations.find(c=>c.id===activeChat);
  const totalUnread=conversations.reduce((s,c)=>s+c.unread,0);
  const groups=groupByCar(conversations);

  const filtered=conversations.filter(c=>{
    const ms=c.name.toLowerCase().includes(search.toLowerCase())||c.car.toLowerCase().includes(search.toLowerCase());
    if(activeFilter==="all") return ms;
    return ms&&c.car===activeFilter;
  });

  const sendMessage=()=>{
    if(!newMsg.trim()||!activeChat)return;
    setConversations(prev=>prev.map(c=>{
      if(c.id!==activeChat)return c;
      const ts=new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
      return{...c,messages:[...c.messages,{id:Date.now(),from:"me",text:newMsg.trim(),time:ts}],lastMsg:newMsg.trim(),time:"now"};
    }));
    setNewMsg("");
    inputRef.current?.focus();
  };

  const selectConvo=(id)=>{
    setActiveChat(id);
    setConversations(prev=>prev.map(x=>x.id===id?{...x,unread:0}:x));
  };

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
