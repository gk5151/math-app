const {useState} = React;

const DEFAULT_CONTENT = [
 {id:"sim",icon:"📐",title:"シミュレータ",desc:"数学を動かしながら理解するための教材置き場",visible:true},
 {id:"calc",icon:"🧮",title:"計算ノート",desc:"手書きで計算したり、式を書いて考えるノート",visible:true},
 {id:"formula",icon:"📕",title:"公式ノート",desc:"高校数学 I / A / II / B / III / C の公式を整理",visible:true},
 {id:"akapen",icon:"📝",title:"赤ペンノート",desc:"問題を解いて、答え合わせや赤ペン学習をするノート",false},
 {id:"practice",icon:"✏️",title:"練習問題",desc:"授業内容に合わせた練習問題",visible:true},
 {id:"resources",icon:"📚",title:"資料",desc:"授業資料・参考資料をまとめる場所",visible:true}
];

function load(){try{return JSON.parse(localStorage.getItem("math_note_v1"))||{content:DEFAULT_CONTENT,notes:[]}}catch(e){return {content:DEFAULT_CONTENT,notes:[]}}}
function save(x){localStorage.setItem("math_note_v1",JSON.stringify(x))}
function today(){return new Date().toLocaleDateString("ja-JP",{year:"numeric",month:"2-digit",day:"2-digit"})}

function Login({onLogin}){
 const [role,setRole]=useState("guest"),[pw,setPw]=useState(""),[err,setErr]=useState("");
 function submit(e){e.preventDefault(); if(role==="guest" || pw==="math-host-2026"){onLogin(role)}else setErr("ホストパスワードが違います")}
 return <section className="login"><div className="login-card">
  <h1>数学ノート</h1><div className="sub">授業・教材・シミュレータをまとめています</div>
  <div className="role"><button className={role==="host"?"active":""} onClick={()=>setRole("host")}>👨‍🏫 ホスト</button><button className={role==="guest"?"active":""} onClick={()=>setRole("guest")}>👨‍🎓 ゲスト</button></div>
  {role==="host"&&<input type="password" placeholder="ホストパスワード" value={pw} onChange={e=>setPw(e.target.value)}/>}
  <button className="primary" onClick={submit}>入室</button>{err&&<p className="error">{err}</p>}
 </div></section>
}

function App(){
 const [session,setSession]=useState(sessionStorage.getItem("math_role")||"");
 const [data,setData]=useState(load()),[page,setPage]=useState("home"),[selected,setSelected]=useState(null);
 if(!session)return <Login onLogin={r=>{sessionStorage.setItem("math_role",r);setSession(r)}}/>;

 const visible=data.content.filter(x=>x.visible);
 function updateContent(next){const nd={...data,content:next};setData(nd);save(nd)}
 function open(id){setSelected(id);setPage(id)}
 function logout(){sessionStorage.removeItem("math_role");setSession("")}

 return <div className="app"><div className="book">
  <header className="header"><h1>数学ノート</h1><p className="sub">今日の学習や数学教材をまとめています。</p>
   <div className="userbox"><span className="badge">{session==="host"?"HOST":"GUEST"}</span><button className="logout" onClick={logout}>退出</button></div>
  </header>
  <nav className="nav">
   <button className={page==="home"?"active":""} onClick={()=>setPage("home")}>ホーム</button>
   {visible.map(x=><button key={x.id} className={page===x.id?"active":""} onClick={()=>open(x.id)}>{x.icon} {x.title}</button>)}
   {session==="host"&&<button className={page==="admin"?"active":""} onClick={()=>setPage("admin")}>⚙ 管理</button>}
  </nav>
  <main>
   {page==="home"&&<Home data={data} session={session} open={open}/>}
   {page==="admin"&&session==="host"&&<Admin data={data} updateContent={updateContent}/>}
   {page==="sim"&&<Simulator/>}
   {page==="calc"&&<CalcNote/>}
   {page==="formula"&&<Formula/>}
   {page==="akapen"&&<Akapen/>}
   {["practice","resources"].includes(page)&&<SimplePage type={page}/>}
  </main>
 </div></div>
}

function Home({data,session,open}){
 const note=data.notes[0]||{date:today(),title:"今日の授業",body:"ホスト側の「管理」から今日のメモを追加できます。"};
 const items=data.content.filter(x=>x.visible);
 return <><div className="note"><div className="date">{note.date}</div><h2>{note.title}</h2><div>{note.body}</div></div>
 <h2 className="section-title">教材</h2><div className="grid">{items.map(x=><div className="card" key={x.id}><span className="state">● 公開</span><h3>{x.icon} {x.title}</h3><p>{x.desc}</p><button className="open" onClick={()=>open(x.id)}>開く →</button></div>)}</div>
 {session==="host"&&<div className="notice" style={{marginTop:20}}>ホストモード：右上の「管理」から教材の公開・非公開と先生メモを変更できます。</div>}</>
}

function Admin({data,updateContent}){
 const [title,setTitle]=useState(data.notes[0]?.title||"今日の授業"),[body,setBody]=useState(data.notes[0]?.body||""),[msg,setMsg]=useState("");
 function toggle(id){updateContent(data.content.map(x=>x.id===id?{...x,visible:!x.visible}:x))}
 function saveNote(){const nd={...data,notes:[{date:today(),title,body},...data.notes.filter((_,i)=>i>0)]};save(nd);location.reload()}
 return <><h2 className="section-title">⚙ ホスト管理</h2>
 <div className="admin"><h3>教材の公開設定</h3><table className="table"><thead><tr><th>教材</th><th>状態</th><th>操作</th></tr></thead><tbody>{data.content.map(x=><tr key={x.id}><td>{x.icon} {x.title}</td><td>{x.visible?"🟢 公開":"🔴 非公開"}</td><td><button className="toggle" onClick={()=>toggle(x.id)}>{x.visible?"非公開にする":"公開する"}</button></td></tr>)}</tbody></table></div>
 <div className="admin"><h3>📌 今日の先生メモ</h3>
  <div className="field"><label>タイトル</label><input value={title} onChange={e=>setTitle(e.target.value)}/></div>
  <div className="field"><label>本文</label><textarea value={body} onChange={e=>setBody(e.target.value)}/></div>
  <button className="primary" onClick={saveNote}>今日の日付で公開</button>{msg&&<p>{msg}</p>}
 </div>
 <div className="notice">※このV1では公開設定・メモはこのブラウザのlocalStorageに保存します。GitHub Pagesだけでは、全生徒の端末へ同じ変更を配信する共有データベースにはなりません。本番運用ではFirebase/Supabase等への移行を前提にできます。</div>
 </>}

function Simulator(){return <><button className="back" onClick={()=>history.back()}>← 戻る</button><h2 className="section-title">📐 シミュレータ</h2><iframe className="simframe" src="simulators/demo.html" title="数学シミュレータ"/></>}
function CalcNote(){return <><h2 className="section-title">🧮 計算ノート</h2><div className="notice">ここに以前作った手書き計算ノートを組み込みます。V1では入口を用意し、既存機能を落とさない形で後から移植できます。</div></>}
function Formula(){return <><h2 className="section-title">📕 公式ノート</h2><div className="notice">既存の「高校数学_公式ノート.html」をこの場所に組み込みます。数学I / A / II / B / III / C、検索、POINT解説、例題・答え確認を維持する想定です。</div></>}
function Akapen(){return <><h2 className="section-title">📝 赤ペンノート</h2><div className="notice">既存の「akapen-note」をここへ統合する入口です。手書き、問題生成、答え確認、赤ペン採点の機能を維持する前提です。</div></>}
function SimplePage({type}){let t=type==="practice"?"✏️ 練習問題":"📚 資料";return <><h2 className="section-title">{t}</h2><div className="empty">ここに教材を追加できます。</div></>}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);