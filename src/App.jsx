import { useState, useEffect } from "react";
import { ref, set, onValue } from "firebase/database";
import { db } from "./firebase";

const PW = "admin1";

// ── Bracket configs (2-R1 ≤8P · 4-R1 ≤16P · 8-R1 ≤32P) ─────────────────────
const BRACKET_CONFIGS = {
  2: {
    r1Count: 2,
    feeds: {
      WF:  [{m:"W1_1",r:0},{m:"W1_2",r:0},{m:"W1_1",r:1},{m:"W1_2",r:1}],
      L1_1:[{m:"W1_1",r:2},{m:"W1_2",r:2},{m:"W1_1",r:3},{m:"W1_2",r:3}],
      LF:  [{m:"L1_1",r:0},{m:"L1_1",r:1},{m:"WF",r:2},{m:"WF",r:3}],
      GF:  [{m:"WF",r:0},{m:"WF",r:1},{m:"LF",r:0},{m:"LF",r:1}],
    },
    allIds: ["W1_1","W1_2","WF","L1_1","LF","GF"],
    topo:   ["W1_1","W1_2","WF","L1_1","LF","GF"],
    bracketCols: [
      {label:"R1",         wIds:["W1_1","W1_2"], lIds:[]},
      {label:"Halbfinale", wIds:["WF"],          lIds:["L1_1"]},
      {label:"L-Final",    wIds:[],              lIds:["LF"]},
    ],
  },
  4: {
    r1Count: 4,
    feeds: {
      W2_1:[{m:"W1_1",r:0},{m:"W1_2",r:0},{m:"W1_3",r:0},{m:"W1_4",r:0}],
      W2_2:[{m:"W1_1",r:1},{m:"W1_2",r:1},{m:"W1_3",r:1},{m:"W1_4",r:1}],
      WF:  [{m:"W2_1",r:0},{m:"W2_1",r:1},{m:"W2_2",r:0},{m:"W2_2",r:1}],
      L1_1:[{m:"W1_1",r:2},{m:"W1_2",r:2},{m:"W1_3",r:2},{m:"W1_4",r:2}],
      L1_2:[{m:"W1_1",r:3},{m:"W1_2",r:3},{m:"W1_3",r:3},{m:"W1_4",r:3}],
      L2_1:[{m:"L1_1",r:0},{m:"L1_2",r:0},{m:"W2_1",r:2},{m:"W2_2",r:2}],
      L2_2:[{m:"L1_1",r:1},{m:"L1_2",r:1},{m:"W2_1",r:3},{m:"W2_2",r:3}],
      L3_1:[{m:"L2_1",r:0},{m:"L2_2",r:0},{m:"WF",r:2}],
      L3_2:[{m:"L2_1",r:1},{m:"L2_2",r:1},{m:"WF",r:3}],
      LF:  [{m:"L3_1",r:0},{m:"L3_1",r:1},{m:"L3_2",r:0},{m:"L3_2",r:1}],
      GF:  [{m:"WF",r:0},{m:"WF",r:1},{m:"LF",r:0},{m:"LF",r:1}],
    },
    allIds: [
      "W1_1","W1_2","W1_3","W1_4",
      "W2_1","W2_2","WF",
      "L1_1","L1_2","L2_1","L2_2","L3_1","L3_2","LF","GF",
    ],
    topo: [
      "W1_1","W1_2","W1_3","W1_4",
      "L1_1","L1_2","W2_1","W2_2",
      "L2_1","L2_2","WF","L3_1","L3_2","LF","GF",
    ],
    bracketCols: [
      {label:"R1",         wIds:["W1_1","W1_2","W1_3","W1_4"], lIds:[]},
      {label:"R2",         wIds:["W2_1","W2_2"],               lIds:["L1_1","L1_2"]},
      {label:"Halbfinale", wIds:["WF"],                        lIds:["L2_1","L2_2"]},
      {label:"L-R3",       wIds:[],                            lIds:["L3_1","L3_2"]},
      {label:"L-Final",    wIds:[],                            lIds:["LF"]},
    ],
  },
  8: {
    r1Count: 8,
    feeds: {
      W2_1:[{m:"W1_1",r:0},{m:"W1_3",r:0},{m:"W1_5",r:0},{m:"W1_7",r:0}],
      W2_2:[{m:"W1_2",r:0},{m:"W1_4",r:0},{m:"W1_6",r:0},{m:"W1_8",r:0}],
      W2_3:[{m:"W1_1",r:1},{m:"W1_3",r:1},{m:"W1_5",r:1},{m:"W1_7",r:1}],
      W2_4:[{m:"W1_2",r:1},{m:"W1_4",r:1},{m:"W1_6",r:1},{m:"W1_8",r:1}],
      W3_1:[{m:"W2_1",r:0},{m:"W2_2",r:0},{m:"W2_3",r:0},{m:"W2_4",r:0}],
      W3_2:[{m:"W2_1",r:1},{m:"W2_2",r:1},{m:"W2_3",r:1},{m:"W2_4",r:1}],
      WF:  [{m:"W3_1",r:0},{m:"W3_1",r:1},{m:"W3_2",r:0},{m:"W3_2",r:1}],
      L1_1:[{m:"W1_1",r:2},{m:"W1_3",r:2},{m:"W1_5",r:2},{m:"W1_7",r:2}],
      L1_2:[{m:"W1_2",r:2},{m:"W1_4",r:2},{m:"W1_6",r:2},{m:"W1_8",r:2}],
      L1_3:[{m:"W1_1",r:3},{m:"W1_3",r:3},{m:"W1_5",r:3},{m:"W1_7",r:3}],
      L1_4:[{m:"W1_2",r:3},{m:"W1_4",r:3},{m:"W1_6",r:3},{m:"W1_8",r:3}],
      L2_1:[{m:"L1_1",r:0},{m:"L1_2",r:0},{m:"W2_1",r:2},{m:"W2_2",r:2}],
      L2_2:[{m:"L1_1",r:1},{m:"L1_2",r:1},{m:"W2_1",r:3},{m:"W2_2",r:3}],
      L2_3:[{m:"L1_3",r:0},{m:"L1_4",r:0},{m:"W2_3",r:2},{m:"W2_4",r:2}],
      L2_4:[{m:"L1_3",r:1},{m:"L1_4",r:1},{m:"W2_3",r:3},{m:"W2_4",r:3}],
      L3_1:[{m:"L2_1",r:0},{m:"L2_2",r:0},{m:"W3_1",r:2},{m:"W3_2",r:2}],
      L3_2:[{m:"L2_1",r:1},{m:"L2_3",r:0},{m:"W3_1",r:3},{m:"L2_4",r:0}],
      L3_3:[{m:"L2_2",r:1},{m:"L2_3",r:1},{m:"L2_4",r:1},{m:"W3_2",r:3}],
      L4_1:[{m:"L3_1",r:0},{m:"L3_2",r:0},{m:"L3_3",r:0},{m:"WF",r:2}],
      L4_2:[{m:"L3_1",r:1},{m:"L3_2",r:1},{m:"L3_3",r:1},{m:"WF",r:3}],
      LF:  [{m:"L4_1",r:0},{m:"L4_1",r:1},{m:"L4_2",r:0},{m:"L4_2",r:1}],
      GF:  [{m:"WF",r:0},{m:"WF",r:1},{m:"LF",r:0},{m:"LF",r:1}],
    },
    allIds: [
      "W1_1","W1_2","W1_3","W1_4","W1_5","W1_6","W1_7","W1_8",
      "W2_1","W2_2","W2_3","W2_4","W3_1","W3_2","WF",
      "L1_1","L1_2","L1_3","L1_4","L2_1","L2_2","L2_3","L2_4",
      "L3_1","L3_2","L3_3","L4_1","L4_2","LF","GF",
    ],
    topo: [
      "W1_1","W1_2","W1_3","W1_4","W1_5","W1_6","W1_7","W1_8",
      "L1_1","L1_2","L1_3","L1_4","W2_1","W2_2","W2_3","W2_4",
      "L2_1","L2_2","L2_3","L2_4","W3_1","W3_2","L3_1","L3_2","L3_3",
      "WF","L4_1","L4_2","LF","GF",
    ],
    bracketCols: [
      {label:"R1",         wIds:["W1_1","W1_2","W1_3","W1_4","W1_5","W1_6","W1_7","W1_8"], lIds:[]},
      {label:"R2",         wIds:["W2_1","W2_2","W2_3","W2_4"],          lIds:["L1_1","L1_2","L1_3","L1_4"]},
      {label:"R3",         wIds:["W3_1","W3_2"],                        lIds:["L2_1","L2_2","L2_3","L2_4"]},
      {label:"Halbfinale", wIds:["WF"],                                 lIds:["L3_1","L3_2","L3_3"]},
      {label:"L-R4",       wIds:[],                                     lIds:["L4_1","L4_2"]},
      {label:"L-Final",    wIds:[],                                     lIds:["LF"]},
    ],
  },
};

function getBracketConfig(playerCount) {
  if (playerCount <= 8)  return BRACKET_CONFIGS[2];
  if (playerCount <= 16) return BRACKET_CONFIGS[4];
  return BRACKET_CONFIGS[8];
}
function getCfgFromTourn(t) {
  if (!t) return BRACKET_CONFIGS[8];
  if (t.r1Count) return BRACKET_CONFIGS[t.r1Count] || BRACKET_CONFIGS[8];
  if (t.matches?.W1_8) return BRACKET_CONFIGS[8];
  if (t.matches?.W1_4) return BRACKET_CONFIGS[4];
  return BRACKET_CONFIGS[2];
}

const PLACE_LBL = ["1. Platz","2. Platz","3. Platz","4. Platz"];
function placeIcon(matchId, i) {
  if (matchId === "GF") return ["🥇","🥈","🥉","4️⃣"][i];
  return i <= 1 ? "⭐" : "🔴";
}
function placeColor(matchId, i) {
  if (matchId === "GF") return ["text-yellow-300","text-slate-300","text-amber-500","text-slate-500"][i];
  return i <= 1 ? "text-yellow-300" : "text-red-500";
}

function humanId(id) {
  if (id==="WF") return "Winners Final";
  if (id==="LF") return "Losers Final";
  if (id==="GF") return "Grand Final";
  const m = id.match(/([WL])(\d+)_(\d+)/);
  return m ? `${m[1]}-R${m[2]} M${m[3]}` : id;
}
function sectionLabel(id) {
  if (id==="GF") return "Grand Final";
  if (id==="WF"||id==="LF") return id.startsWith("W")?"Winners":"Losers";
  return id.startsWith("W")?"Winners":"Losers";
}

// ── Bracket logic ─────────────────────────────────────────────────────────────
function initMatches(players, cfg) {
  const m = {};
  cfg.allIds.forEach(id => { m[id]={id,players:[null,null,null,null],result:null,location:null}; });
  const padded = [...players];
  while (padded.length < cfg.r1Count * 4) padded.push(null);
  for (let i=0; i<cfg.r1Count; i++) m[`W1_${i+1}`].players = padded.slice(i*4, i*4+4);
  return m;
}
function sourcesDone(matches, id, feeds) {
  const f=feeds[id]; if(!f) return true;
  return [...new Set(f.map(x=>x.m))].every(mid=>!!matches[mid]?.result);
}
function propagateOne(matches, src, result, feeds) {
  const nm={...matches};
  Object.entries(feeds).forEach(([tid,fds])=>{
    const np=[...nm[tid].players]; let ch=false;
    fds.forEach((f,s)=>{ if(f.m===src){np[s]=result[f.r]??null;ch=true;} });
    if(ch) nm[tid]={...nm[tid],players:np};
  });
  return nm;
}
function autoHandleByes(mi, cfg) {
  let nm={...mi}; let ch=true;
  while(ch){ ch=false;
    for(const id of cfg.topo){
      const m=nm[id]; if(m.result) continue; if(!sourcesDone(nm,id,cfg.feeds)) continue;
      const real=m.players.filter(Boolean); if(real.length>=2) continue;
      const result=real.length===1?[real[0],null,null,null]:[null,null,null,null];
      nm[id]={...nm[id],result}; nm=propagateOne(nm,id,result,cfg.feeds); ch=true;
    }
  }
  return nm;
}
function cascadeReset(matches, src, feeds) {
  let nm={...matches}; const q=[src],seen=new Set();
  while(q.length){ const mid=q.shift(); if(seen.has(mid)) continue; seen.add(mid);
    nm[mid]={...nm[mid],result:null};
    Object.entries(feeds).forEach(([tid,fds])=>{
      if(fds.some(f=>f.m===mid)){ const np=[...nm[tid].players];
        fds.forEach((f,s)=>{if(f.m===mid)np[s]=null;}); nm[tid]={...nm[tid],players:np};
        if(!seen.has(tid))q.push(tid);
      }
    });
  }
  return nm;
}
function isPureBye(m) {
  if(!m) return true;
  return !m.players.some(Boolean)&&!!m.result&&!m.result.some(Boolean);
}
function getUpcoming(matches, topo) {
  return topo.map(id=>matches[id]).filter(m=>m&&!m.result&&m.location&&!isPureBye(m));
}
function getAllPending(matches, topo) {
  return topo.map(id=>matches[id]).filter(m=>m&&!m.result&&!isPureBye(m));
}
function normalizeTourn(data) {
  if (!data?.matches) return data;
  const matches = {};
  for (const [id, m] of Object.entries(data.matches)) {
    matches[id] = {
      ...m,
      players: Array.from({length: 4}, (_, i) => m.players?.[i] ?? null),
      result: m.result
        ? Array.from({length: 4}, (_, i) => m.result?.[i] ?? null)
        : null,
    };
  }
  return { ...data, matches };
}
function persist(data) {
  set(ref(db, "tournament"), data).catch(() => {});
}

// ── Small components ──────────────────────────────────────────────────────────
function LocBadge({loc,big=false}) {
  if(!loc) return null;
  const cls=big?"font-bold text-sm px-3 py-1 rounded-xl":"font-bold text-[9px] px-1.5 py-0.5 rounded-md";
  const st=loc==="vorn"
    ?{background:"rgba(59,130,246,0.2)",border:"1px solid rgba(59,130,246,0.4)",color:"#93c5fd"}
    :{background:"rgba(139,92,246,0.2)",border:"1px solid rgba(139,92,246,0.4)",color:"#c4b5fd"};
  return <span style={st} className={`tracking-wider ${cls}`}>{loc==="vorn"?"📍 VORN":"📍 HINTEN"}</span>;
}

function ConfirmModal({msg,onOk,onCancel}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6"
      style={{background:"rgba(0,0,0,0.9)"}}>
      <div style={{background:"#1e293b",border:"1px solid #334155"}} className="rounded-2xl p-6 w-full max-w-xs">
        <div className="text-white text-sm mb-5 leading-relaxed whitespace-pre-line">{msg}</div>
        <div className="flex gap-2">
          <button onClick={onOk} style={{background:"linear-gradient(135deg,#dc2626,#b91c1c)"}}
            className="flex-1 text-white font-bold py-2.5 rounded-xl text-sm">Ja</button>
          <button onClick={onCancel} style={{background:"rgba(30,41,59,0.9)",border:"1px solid #475569"}}
            className="flex-1 text-slate-300 py-2.5 rounded-xl text-sm">Abbrechen</button>
        </div>
      </div>
    </div>
  );
}

function BCard({match,isAdmin,onOpen}) {
  if(!match||isPureBye(match)) return null;
  const{id,players,result,location}=match;
  const real=players.filter(Boolean), done=!!result, ready=real.length>=2;
  return (
    <div onClick={()=>isAdmin&&onOpen(id)}
      style={{
        width:164,
        background:done?"linear-gradient(135deg,rgba(5,46,22,0.9),rgba(20,83,45,0.9))":
          ready?"linear-gradient(135deg,rgba(30,41,59,0.9),rgba(15,23,42,0.9))":"rgba(15,23,42,0.4)",
        border:done?"1px solid rgba(22,163,74,0.4)":ready?"1px solid #334155":"1px solid rgba(51,65,85,0.35)",
      }}
      className={`rounded-xl p-2 select-none flex-shrink-0 transition-all
        ${isAdmin?"cursor-pointer hover:border-yellow-500/50 hover:scale-[1.02]":"cursor-default"}
        ${!ready&&!done?"opacity-40":""}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[9px] font-mono text-slate-600 leading-none">{humanId(id)}</span>
        <div className="flex items-center gap-1">
          <LocBadge loc={location}/>
          {done&&<span className="text-green-400 text-[10px]">✓</span>}
        </div>
      </div>
      {done?(
        <div className="space-y-px">
          {result.map((p,i)=>p&&(
            <div key={i} className={`flex items-center gap-1 text-[10px] ${placeColor(id,i)}`}>
              <span className="leading-none">{placeIcon(id,i)}</span>
              <span className={`truncate ${i<2?"text-white":""}`} style={{maxWidth:110}}>{p}</span>
            </div>
          ))}
        </div>
      ):ready?(
        <div className="space-y-px">
          {players.map((p,i)=>(
            <div key={i} className={`text-[10px] truncate ${p?"text-slate-200":"text-slate-700 italic"}`}
              style={{maxWidth:148}}>{p||"·"}</div>
          ))}
        </div>
      ):(
        <div className="space-y-px">
          {[0,1,2,3].map(i=>(
            <div key={i} className="text-[10px] text-slate-700 italic">Noch offen</div>
          ))}
        </div>
      )}
    </div>
  );
}

function NextCard({match,index,isAdmin,onOpen}) {
  const{id,players,result,location}=match;
  const real=players.filter(Boolean), ready=real.length>=2&&!result;
  return (
    <div onClick={()=>isAdmin&&onOpen(id)}
      style={{
        background:ready?"linear-gradient(135deg,rgba(30,41,59,0.95),rgba(15,23,42,0.95))":"rgba(15,23,42,0.6)",
        border:ready?"1px solid #334155":"1px solid rgba(51,65,85,0.4)",
      }}
      className={`rounded-2xl p-4 transition-all ${isAdmin?"cursor-pointer hover:border-yellow-500/50":""}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div style={{background:"rgba(234,179,8,0.15)",border:"1px solid rgba(234,179,8,0.3)"}}
            className="text-yellow-400 font-bold text-base w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
            {index+1}
          </div>
          <div>
            <div className="text-[9px] text-slate-500 tracking-widest font-bold uppercase">
              {sectionLabel(id)}
            </div>
            <div className="text-white font-bold text-sm leading-tight">{humanId(id)}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LocBadge loc={location} big/>
          {isAdmin&&<span className="text-yellow-600 text-[10px]">✏️</span>}
        </div>
      </div>
      <div style={{background:"rgba(0,0,0,0.2)",border:"1px solid rgba(255,255,255,0.05)"}}
        className="rounded-xl p-3">
        {ready?(
          <div className="grid grid-cols-2 gap-1.5">
            {players.filter(Boolean).map((p,i)=>(
              <div key={i} className="flex items-center gap-1.5">
                <div style={{background:"rgba(234,179,8,0.1)"}}
                  className="w-5 h-5 rounded-md text-[9px] text-yellow-500 font-bold flex items-center justify-center flex-shrink-0">
                  {i+1}
                </div>
                <span className="text-slate-200 text-xs truncate">{p}</span>
              </div>
            ))}
          </div>
        ):(
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <span>⏳</span><span>Spieler noch nicht bekannt</span>
          </div>
        )}
      </div>
      <div className={`rounded-lg px-3 py-1.5 mt-2 text-xs text-center
        ${ready?"text-green-400":"text-slate-600"}`}
        style={ready
          ?{background:"rgba(22,163,74,0.08)",border:"1px solid rgba(22,163,74,0.15)"}
          :{background:"rgba(30,41,59,0.4)",border:"1px solid rgba(51,65,85,0.3)"}}>
        {ready ? (isAdmin?"✓ Bereit · Antippen zum Eintragen":"✓ Bereit zum Spielen") : (isAdmin?"⏳ Spieler noch offen · Antippen zum Ort ändern":"⏳ Spieler noch nicht bekannt")}
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [screen,   setScreen]   = useState("loading");
  const [isAdmin,  setIsAdmin]  = useState(false);
  const [pw,       setPw]       = useState("");
  const [pwErr,    setPwErr]    = useState("");
  const [tourn,    setTourn]    = useState(null);
  const [regList,  setRegList]  = useState([]);
  const [regInput, setRegInput] = useState("");
  const [mainTab,  setMainTab]  = useState("next");
  const [modal,    setModal]    = useState(null);
  const [ranking,  setRanking]  = useState([]);
  const [modalLoc, setModalLoc] = useState(null);
  const [confirm,  setConfirm]  = useState(null);
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    const tournRef = ref(db, "tournament");
    const unsub = onValue(tournRef, snap => {
      if (snap.exists()) setTourn(normalizeTourn(snap.val()));
      setScreen(s => s === "loading" ? "main" : s);
    });
    return () => unsub();
  }, []);

  function doLoad() {
    const tournRef = ref(db, "tournament");
    onValue(tournRef, snap => {
      if (snap.exists()) setTourn(normalizeTourn(snap.val()));
    }, { onlyOnce: true });
  }
  function apply(t){setTourn(t);setSaving(true);persist(t);setTimeout(()=>setSaving(false),500);}
  function doLogin(){if(pw===PW){setIsAdmin(true);setScreen("main");setPw("");setPwErr("");}else setPwErr("Falsches Passwort!");}
  function doLogout(){setIsAdmin(false);}
  function addPlayer(){const n=regInput.trim();if(!n||regList.length>=32||regList.includes(n))return;setRegList(l=>[...l,n]);setRegInput("");}
  function removePlayer(i){setRegList(l=>l.filter((_,j)=>j!==i));}
  function startTournament(){
    if(regList.length<2) return;
    const cfg=getBracketConfig(regList.length);
    const sh=[...regList].sort(()=>Math.random()-0.5);
    let m=initMatches(sh,cfg); m=autoHandleByes(m,cfg);
    apply({players:[...regList],r1Count:cfg.r1Count,matches:m,started:Date.now()});
    setRegList([]);setRegInput("");setScreen("main");
  }
  function openModal(id){
    if(!isAdmin||!tourn) return;
    const m=tourn.matches[id]; if(!m||isPureBye(m)) return;
    setModal(id);
    setRanking(m.result?m.result.filter(Boolean):[]);
    setModalLoc(m.location||null);
  }
  function closeModal(){setModal(null);setRanking([]);setModalLoc(null);}
  function toggleRank(p){setRanking(r=>r.includes(p)?r.filter(x=>x!==p):[...r,p]);}
  function saveLocOnly(){
    if(!modal||!tourn) return;
    const nm={...tourn.matches}; nm[modal]={...nm[modal],location:modalLoc};
    apply({...tourn,matches:nm}); closeModal();
  }
  function saveResult(){
    if(!modal||!tourn) return;
    const m=tourn.matches[modal]; const avail=m.players.filter(Boolean);
    if(ranking.length!==avail.length||avail.length===0) return;
    const result=[...ranking,null,null,null,null].slice(0,4);
    let nm={...tourn.matches}; nm[modal]={...nm[modal],result,location:modalLoc};
    nm=propagateOne(nm,modal,result,cfg.feeds); nm=autoHandleByes(nm,cfg);
    const t={...tourn,matches:nm}; if(modal==="GF") t.champion=result[0];
    apply(t); closeModal();
  }
  function doResetMatch(id){
    setConfirm({msg:`"${humanId(id)}" und Folge-Matches zurücksetzen?`,onOk:()=>{
      const cfg=getCfgFromTourn(tourn);
      let nm=cascadeReset(tourn.matches,id,cfg.feeds); nm=autoHandleByes(nm,cfg);
      const t={...tourn,matches:nm}; if(["GF","WF","LF"].includes(id)) delete t.champion;
      apply(t); closeModal(); setConfirm(null);
    }});
  }
  function resetAll(){
    setConfirm({msg:`Neues Zufallslos für alle ${tourn.players.length} Spieler?\nAlle Ergebnisse werden gelöscht.`,onOk:()=>{
      const cfg=getCfgFromTourn(tourn);
      const sh=[...tourn.players].sort(()=>Math.random()-0.5);
      let m=initMatches(sh,cfg); m=autoHandleByes(m,cfg);
      const t={...tourn,matches:m,started:Date.now()}; delete t.champion;
      apply(t); setConfirm(null);
    }});
  }
  function fullReset(){
    setConfirm({msg:`⚠️ Gesamtes Turnier zurücksetzen?\n\nAlle Spieler und Ergebnisse werden unwiderruflich gelöscht.`,onOk:()=>{
      setConfirm({msg:`🚨 LETZTE WARNUNG\n\nWirklich alles löschen?\nDanach müssen alle Spieler neu eingetragen werden.`,onOk:()=>{
        set(ref(db,"tournament"),null).catch(()=>{});
        setTourn(null); setConfirm(null);
      }});
    }});
  }

  const cfg      = getCfgFromTourn(tourn);
  const M        = tourn?.matches||{};
  const upcoming = tourn?getUpcoming(M,cfg.topo):[];
  const pending  = tourn?getAllPending(M,cfg.topo):[];

  // ── Screens ────────────────────────────────────────────────────────────────
  if(screen==="loading") return (
    <div style={{background:"#030712"}} className="min-h-screen flex items-center justify-center">
      <span className="text-slate-500 text-sm tracking-widest">LADE …</span>
    </div>
  );

  if(screen==="login") return (
    <div style={{background:"linear-gradient(135deg,#030712,#0f172a)"}} className="min-h-screen flex items-center justify-center p-4">
      <div style={{background:"rgba(15,23,42,0.97)",border:"1px solid #1e293b"}} className="rounded-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🏁</div>
          <div className="text-yellow-400 text-[10px] tracking-[0.3em] font-bold mb-1">MARIO KART TURNIER</div>
          <div className="text-white text-xl font-bold">Admin-Anmeldung</div>
        </div>
        <input type="password" value={pw} onChange={e=>setPw(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&doLogin()} placeholder="Passwort …"
          style={{background:"rgba(30,41,59,0.8)",border:"1px solid #334155"}}
          className="w-full text-white rounded-xl px-4 py-3 mb-2 outline-none focus:border-yellow-500 transition-colors"/>
        {pwErr&&<div className="text-red-400 text-sm mb-3 text-center">{pwErr}</div>}
        <button onClick={doLogin} style={{background:"linear-gradient(135deg,#eab308,#f59e0b)"}}
          className="w-full text-black font-bold py-3 rounded-xl hover:opacity-90 tracking-wide mb-3">ANMELDEN</button>
        <button onClick={()=>{setPw("");setPwErr("");setScreen("main");}} className="w-full text-slate-500 text-sm py-1">Zurück</button>
      </div>
    </div>
  );

  if(screen==="register") return (
    <div style={{background:"linear-gradient(135deg,#030712,#0f172a)"}} className="min-h-screen p-4">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6 pt-2">
          <button onClick={()=>{setRegList([]);setRegInput("");setScreen("main");}}
            style={{background:"rgba(30,41,59,0.8)",border:"1px solid #334155"}}
            className="text-slate-400 px-3 py-1.5 rounded-lg hover:text-white text-sm">← Zurück</button>
          <div>
            <div className="text-yellow-400 text-[10px] tracking-[0.3em]">SETUP</div>
            <h1 className="text-white text-lg font-bold">Spieler eintragen</h1>
          </div>
        </div>
        <div className="flex gap-2 mb-3">
          <input value={regInput} onChange={e=>setRegInput(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&addPlayer()} placeholder="Name + Enter" maxLength={20}
            style={{background:"rgba(30,41,59,0.8)",border:"1px solid #334155"}}
            className="flex-1 text-white rounded-xl px-4 py-2.5 outline-none focus:border-yellow-500 text-sm"/>
          <button onClick={addPlayer} disabled={regList.length>=32}
            style={{background:"linear-gradient(135deg,#eab308,#f59e0b)"}}
            className="text-black font-bold px-5 rounded-xl disabled:opacity-40 text-xl">+</button>
        </div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-slate-400 text-sm">{regList.length}/32 Spieler</span>
          {regList.length>0&&regList.length%4!==0&&(
            <span className="text-amber-400 text-xs">⚠️ Letztes Match: {regList.length%4} Spieler</span>
          )}
        </div>
        {regList.length===0?(
          <div className="text-center text-slate-600 py-12 text-sm">Noch keine Spieler</div>
        ):(
          <div className="grid grid-cols-2 gap-2 mb-6">
            {regList.map((p,i)=>(
              <div key={i} style={{background:"rgba(30,41,59,0.6)",border:"1px solid #1e293b"}}
                className="flex items-center justify-between rounded-lg px-3 py-2">
                <span className="text-white text-sm truncate"><span className="text-slate-600 mr-1.5 text-xs">{i+1}.</span>{p}</span>
                <button onClick={()=>removePlayer(i)} className="text-red-500 hover:text-red-400 ml-2 text-base leading-none flex-shrink-0">×</button>
              </div>
            ))}
          </div>
        )}
        <button onClick={startTournament} disabled={regList.length<2}
          style={regList.length>=2?{background:"linear-gradient(135deg,#16a34a,#15803d)"}:{background:"rgba(30,41,59,0.5)",border:"1px solid #1e293b"}}
          className="w-full text-white font-bold py-3.5 rounded-xl disabled:opacity-50 tracking-wider text-sm">
          🚦 TURNIER AUSLOSEN &amp; STARTEN
        </button>
      </div>
    </div>
  );

  // ── MAIN ───────────────────────────────────────────────────────────────────
  return (
    <div style={{background:"#030712"}} className="min-h-screen flex flex-col text-white">

      {/* Top bar */}
      <div style={{background:"rgba(15,23,42,0.97)",borderBottom:"1px solid #1e293b"}} className="sticky top-0 z-40 px-4 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl">🏎️</span>
            <div className="min-w-0">
              <div className="text-yellow-400 text-[8px] tracking-[0.3em] font-bold leading-tight">MARIO KART</div>
              <div className="text-white font-bold text-sm leading-tight">Doppel-KO</div>
            </div>
            {tourn&&(
              <div style={{background:"rgba(234,179,8,0.1)",border:"1px solid rgba(234,179,8,0.2)"}}
                className="text-yellow-400 text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0">{tourn.players.length}P</div>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {saving&&<span className="text-yellow-400 text-xs">💾</span>}
            {isAdmin?(
              <>
                <button onClick={doLoad} className="text-slate-500 hover:text-slate-300 text-base px-1">↺</button>
                {!tourn
                  ?<button onClick={()=>setScreen("register")} style={{background:"linear-gradient(135deg,#16a34a,#15803d)"}}
                    className="text-white text-xs font-bold px-2.5 py-1.5 rounded-lg">+ Erstellen</button>
                  :<button onClick={resetAll} style={{background:"rgba(239,68,68,0.12)",border:"1px solid rgba(239,68,68,0.3)"}}
                    className="text-red-400 text-xs px-2 py-1 rounded-lg">Neu</button>
                }
                {tourn&&(
                  <button onClick={fullReset} style={{background:"rgba(239,68,68,0.15)",border:"1px solid rgba(239,68,68,0.4)"}}
                    className="text-red-400 text-xs px-2 py-1 rounded-lg font-bold">🗑️ Reset</button>
                )}
                <div style={{background:"rgba(234,179,8,0.1)",border:"1px solid rgba(234,179,8,0.3)"}}
                  className="text-yellow-400 text-xs px-2 py-1 rounded-lg font-bold">👑</div>
                <button onClick={doLogout} className="text-slate-600 hover:text-slate-400 text-xs px-1">Logout</button>
              </>
            ):(
              <button onClick={()=>setScreen("login")}
                style={{background:"rgba(30,41,59,0.9)",border:"1px solid #334155"}}
                className="text-slate-400 hover:text-white text-xs px-3 py-1.5 rounded-lg">Admin</button>
            )}
          </div>
        </div>
      </div>

      {!tourn?(
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="text-7xl mb-6">🏁</div>
            <div className="text-slate-200 text-xl font-bold mb-2">Kein Turnier aktiv</div>
            <div className="text-slate-600 text-sm mb-8">Der Admin muss das Turnier zuerst erstellen.</div>
            {isAdmin&&(
              <button onClick={()=>setScreen("register")} style={{background:"linear-gradient(135deg,#eab308,#f59e0b)"}}
                className="text-black font-bold px-8 py-3 rounded-xl hover:opacity-90 tracking-wide">🏎️ TURNIER ERSTELLEN</button>
            )}
          </div>
        </div>
      ):(
        <>
          {tourn.champion&&(
            <div style={{background:"linear-gradient(90deg,#92400e,#b45309,#d97706,#b45309,#92400e)"}}
              className="text-center py-2.5 font-bold text-base tracking-wide">
              🏆 TURNIERSIEGER: {tourn.champion.toUpperCase()} 🏆
            </div>
          )}
          {isAdmin&&(
            <div style={{background:"rgba(234,179,8,0.06)",borderBottom:"1px solid rgba(234,179,8,0.1)"}}
              className="px-4 py-1 text-yellow-600 text-xs text-center">
              👑 Match antippen → Spielort oder Ergebnis eintragen
            </div>
          )}

          {/* Main tabs */}
          <div style={{background:"rgba(15,23,42,0.9)",borderBottom:"1px solid #1e293b"}} className="flex">
            {[["next","🎮","Nächste Spiele"],["tree","🌳","Turnierbaum"]].map(([id,icon,label])=>(
              <button key={id} onClick={()=>setMainTab(id)}
                style={mainTab===id?{borderBottom:"2px solid #eab308",color:"#eab308"}:{borderBottom:"2px solid transparent"}}
                className="flex-1 py-2.5 text-xs font-bold tracking-wide text-slate-500 hover:text-slate-300 transition-colors">
                {icon} {label}
              </button>
            ))}
          </div>

          {/* ── NÄCHSTE SPIELE ── */}
          {mainTab==="next"&&(
            <div className="flex-1 overflow-auto">
              {upcoming.length===0?(
                <div className="flex flex-col items-center justify-center h-48 p-8 text-center">
                  <div className="text-4xl mb-3">📋</div>
                  <div className="text-slate-400 text-sm font-medium mb-1">Keine Spiele geplant</div>
                  <div className="text-slate-600 text-xs">
                    {isAdmin?"Im Turnierbaum ein Match antippen und Spielort festlegen.":"Der Admin legt gleich die nächsten Spielorte fest."}
                  </div>
                </div>
              ):(
                <div className="p-4 space-y-3">
                  <div className="text-slate-500 text-xs tracking-widest font-bold px-1">
                    NÄCHSTE {upcoming.length} SPIELE
                  </div>
                  {upcoming.map((m,i)=>(
                    <NextCard key={m.id} match={m} index={i} isAdmin={isAdmin} onOpen={openModal}/>
                  ))}
                </div>
              )}

              {/* Admin quick-assign section */}
              {isAdmin&&(()=>{
                const noLoc=pending.filter(m=>!m.location);
                if(noLoc.length===0) return null;
                return (
                  <div className="p-4 pt-0">
                    <div style={{background:"rgba(234,179,8,0.05)",border:"1px solid rgba(234,179,8,0.1)"}} className="rounded-2xl p-4">
                      <div className="text-yellow-600 text-xs tracking-widest font-bold mb-3">NOCH KEIN ORT FESTGELEGT ({noLoc.length})</div>
                      <div className="space-y-2">
                        {noLoc.slice(0,8).map(m=>(
                          <button key={m.id} onClick={()=>openModal(m.id)}
                            style={{background:"rgba(30,41,59,0.6)",border:"1px solid #334155"}}
                            className="w-full flex items-center justify-between rounded-xl px-3 py-2.5 hover:border-yellow-500/50 transition-all">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] text-slate-500 font-mono">{sectionLabel(m.id)}</span>
                              <span className="text-white text-sm font-medium">{humanId(m.id)}</span>
                              {m.players.some(Boolean)&&(
                                <span style={{background:"rgba(22,163,74,0.15)",border:"1px solid rgba(22,163,74,0.2)"}}
                                  className="text-green-400 text-[9px] px-1.5 py-0.5 rounded-md">Bereit</span>
                              )}
                            </div>
                            <span className="text-yellow-500 text-sm">+ Ort</span>
                          </button>
                        ))}
                        {noLoc.length>8&&<div className="text-slate-600 text-xs text-center pt-1">+ {noLoc.length-8} weitere im Turnierbaum</div>}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ── TURNIERBAUM ── */}
          {mainTab==="tree"&&(
            <div className="flex-1 overflow-auto p-3">
              <div className="min-w-max">

                {/* ─ GEWINNERBRACKET ─ */}
                <div style={{background:"rgba(234,179,8,0.06)",border:"1px solid rgba(234,179,8,0.12)"}}
                  className="rounded-xl px-3 py-1.5 mb-3 inline-block">
                  <span className="text-yellow-500 text-[10px] font-bold tracking-widest">🏆 GEWINNERBRACKET</span>
                </div>

                <div className="flex gap-3 items-start mb-2">
                  {cfg.bracketCols.map((col,ci)=>(
                    <div key={ci} style={{width:164}} className="flex flex-col flex-shrink-0">
                      <div className="text-[9px] text-slate-600 font-bold tracking-widest uppercase mb-1.5 text-center"
                        style={{borderBottom:"1px solid #1e293b",paddingBottom:4}}>
                        {col.label}
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {col.wIds.length>0
                          ?col.wIds.map(id=><BCard key={id} match={M[id]} isAdmin={isAdmin} onOpen={openModal}/>)
                          :<div style={{height:60}} className="opacity-0"/>
                        }
                      </div>
                    </div>
                  ))}
                  {/* Grand Final column */}
                  <div style={{width:164}} className="flex flex-col flex-shrink-0">
                    <div className="text-[9px] text-yellow-500 font-bold tracking-widest uppercase mb-1.5 text-center"
                      style={{borderBottom:"1px solid rgba(234,179,8,0.2)",paddingBottom:4}}>
                      ⚔️ Grand Final
                    </div>
                    <BCard match={M["GF"]} isAdmin={isAdmin} onOpen={openModal}/>
                  </div>
                </div>

                {/* ─ Separator ─ */}
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-slate-800"/>
                  <div style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.15)"}}
                    className="rounded-xl px-3 py-1.5 flex-shrink-0">
                    <span className="text-red-500 text-[10px] font-bold tracking-widest">💀 VERLIERERBRACKET</span>
                  </div>
                  <div className="flex-1 h-px bg-slate-800"/>
                </div>

                {/* ─ VERLIERERBRACKET ─ */}
                <div className="flex gap-3 items-start">
                  {cfg.bracketCols.filter(col=>col.lIds.length>0).map((col,ci)=>(
                    <div key={ci} style={{width:164}} className="flex flex-col flex-shrink-0">
                      <div className="flex flex-col gap-1.5">
                        {col.lIds.map(id=><BCard key={id} match={M[id]} isAdmin={isAdmin} onOpen={openModal}/>)}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          )}
        </>
      )}

      {/* ── MODAL ── */}
      {modal&&tourn&&(()=>{
        const m=tourn.matches[modal]; if(!m) return null;
        const avail=m.players.filter(Boolean);
        const hasP=avail.length>=2;
        const allOk=ranking.length===avail.length&&avail.length>0;
        return (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{background:"rgba(0,0,0,0.9)"}}>
            <div style={{background:"linear-gradient(180deg,#1e293b,#0f172a)",border:"1px solid #334155"}}
              className="rounded-2xl p-5 w-full max-w-sm shadow-2xl">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-[9px] text-yellow-400 tracking-widest font-bold">{sectionLabel(modal).toUpperCase()}</div>
                  <div className="text-white font-bold text-lg leading-tight">{humanId(modal)}</div>
                  <div className="text-slate-500 text-xs mt-0.5">{hasP?`${avail.length} Spieler bereit`:"Spieler noch nicht bekannt"}</div>
                </div>
                <button onClick={closeModal} className="text-slate-500 hover:text-white text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5">×</button>
              </div>

              {/* Location */}
              <div className="mb-4">
                <div className="text-slate-500 text-xs font-bold tracking-widest mb-2">SPIELORT</div>
                <div className="flex gap-2">
                  {["vorn","hinten"].map(l=>(
                    <button key={l} onClick={()=>setModalLoc(x=>x===l?null:l)}
                      style={modalLoc===l
                        ?{background:l==="vorn"?"rgba(59,130,246,0.25)":"rgba(139,92,246,0.25)",border:`1px solid ${l==="vorn"?"#3b82f6":"#8b5cf6"}`}
                        :{background:"rgba(30,41,59,0.6)",border:"1px solid #334155"}}
                      className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all">
                      <span className={modalLoc===l?"text-white":"text-slate-400"}>{l==="vorn"?"📍 VORN":"📍 HINTEN"}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Save location only (when no players) */}
              {!hasP&&modalLoc&&(
                <button onClick={saveLocOnly} style={{background:"linear-gradient(135deg,#1d4ed8,#1e40af)"}}
                  className="w-full text-white font-bold py-2.5 rounded-xl text-sm mb-3 tracking-wide">
                  📍 Spielort speichern
                </button>
              )}

              {/* Ranking */}
              {hasP&&(
                <>
                  <div className="mb-4">
                    <div className="text-slate-500 text-xs font-bold tracking-widest mb-1">PLATZIERUNG</div>
                    <div className="text-slate-600 text-xs mb-2.5">In Reihenfolge antippen: 1. → 2. → … Platz</div>
                    <div className="space-y-2">
                      {avail.map(p=>{
                        const idx=ranking.indexOf(p),ranked=idx!==-1,isW=ranked&&idx<2;
                        return (
                          <button key={p} onClick={()=>toggleRank(p)}
                            style={ranked
                              ?{background:isW?"rgba(234,179,8,0.15)":"rgba(100,116,139,0.1)",border:`1px solid ${isW?"rgba(234,179,8,0.4)":"rgba(100,116,139,0.25)"}`}
                              :{background:"rgba(30,41,59,0.6)",border:"1px solid #334155"}}
                            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all hover:scale-[1.01]">
                            <span className={ranked?(isW?"text-yellow-200 font-medium":"text-slate-400"):"text-slate-300"}>{p}</span>
                            {ranked
                              ?<span className={`font-bold text-xs ${placeColor(modal,idx)}`}>{placeIcon(modal,idx)} {PLACE_LBL[idx]}</span>
                              :<span className="text-slate-600 text-xs">Antippen</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div style={{background:"rgba(22,163,74,0.1)",border:"1px solid rgba(22,163,74,0.2)",visibility:ranking.length>=2?"visible":"hidden"}}
                    className="rounded-lg px-3 py-2 mb-3 text-xs text-green-400">
                    ✓ {ranking[0]}{ranking[1]?` & ${ranking[1]}`:""} qualifizieren sich weiter
                  </div>
                  <div className="flex gap-2 mb-2">
                    {modalLoc&&!allOk&&(
                      <button onClick={saveLocOnly} style={{background:"linear-gradient(135deg,#1d4ed8,#1e40af)"}}
                        className="flex-1 text-white font-bold py-2.5 rounded-xl text-xs tracking-wide">📍 Nur Ort</button>
                    )}
                    <button onClick={saveResult} disabled={!allOk}
                      style={allOk?{background:"linear-gradient(135deg,#16a34a,#15803d)"}:{}}
                      className={`text-white font-bold py-2.5 rounded-xl disabled:opacity-30 disabled:bg-slate-700 text-xs tracking-wide transition-all ${modalLoc&&!allOk?"flex-1":"w-full"}`}>
                      {allOk?"✓ Ergebnis speichern":`${ranking.length}/${avail.length} platziert`}
                    </button>
                  </div>
                </>
              )}

              {m.result&&(
                <button onClick={()=>doResetMatch(modal)}
                  className="w-full mt-1 py-1.5 text-red-500 hover:text-red-400 text-xs transition-colors">
                  ↺ Ergebnis zurücksetzen (inkl. Folge-Matches)
                </button>
              )}
            </div>
          </div>
        );
      })()}

      {confirm&&<ConfirmModal msg={confirm.msg} onOk={confirm.onOk} onCancel={()=>setConfirm(null)}/>}
    </div>
  );
}
