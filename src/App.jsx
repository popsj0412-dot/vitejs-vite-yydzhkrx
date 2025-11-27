import React, { useState, useEffect, useCallback, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, onSnapshot, runTransaction, collection, query, where, getDocs, addDoc, serverTimestamp, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { MapPin, Calendar, Users, PlusCircle, LayoutList, CheckCircle, ChevronLeft, Loader2, Megaphone, Settings, ListChecks, Shuffle, TrendingUp, XCircle, DollarSign, ExternalLink, CreditCard, Grid, Play, SkipForward, Hash, Globe, BellRing, Search, Star, Heart, Trophy, AlertCircle, Trash2, Sparkles, Flag, Crown, Swords, Timer, ClipboardList, User as UserIcon, LogOut, Mail, Lock, KeyRound, Copy, Bell, Zap, Dices, Edit, Save, Image as ImageIcon, Printer, FileText, X, Plus, AlertTriangle, Repeat } from 'lucide-react';

// --- App ID ---
const appId = 'dance-event-demo-01'; 

// --- Firebase Config ---
const firebaseConfig = {
  apiKey: "AIzaSyC7sx5yZtUHYXbVtVTokmJbz5GS9U8aVtg",
  authDomain: "number-calling.firebaseapp.com",
  projectId: "number-calling",
  storageBucket: "number-calling.firebasestorage.app",
  messagingSenderId: "377620988598",
  appId: "1:377620988598:web:420ff4b20b1137375d5c17",
  measurementId: "G-WSX5WGW02B"
};

// --- Initialize Firebase ---
let app, auth, db;
try {
  if (firebaseConfig.apiKey && !firebaseConfig.apiKey.includes("請填入")) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    setPersistence(auth, browserLocalPersistence).catch(console.error);
  }
} catch (e) {
  console.error("Firebase Init Failed:", e);
}

// --- Error Boundary ---
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-900 text-white min-h-screen flex flex-col items-center justify-center text-center">
          <AlertTriangle size={48} className="mb-4" />
          <h1 className="text-2xl font-bold mb-2">App Crashed!</h1>
          <p className="mb-4 text-sm opacity-80">Please screenshot this screen.</p>
          <button onClick={() => window.location.reload()} className="mt-8 px-6 py-3 bg-white text-red-900 rounded-full font-bold">Reload App</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Helper Functions ---
const formatNumber = (num) => num > 0 ? num.toString().padStart(3, '0') : '--';
const safeDate = (timestamp) => {
    if (!timestamp) return null;
    try {
        if (typeof timestamp.toDate === 'function') return timestamp.toDate();
        const d = new Date(timestamp);
        if (isNaN(d.getTime())) return null;
        return d;
    } catch (e) { return null; }
};
const formatDateOnly = (ts) => safeDate(ts)?.toLocaleDateString('zh-TW') || 'N/A';
const getLaneName = (index) => String.fromCharCode(65 + index);

const translations = {
    'zh-TW': {
        appTitle: "舞蹈賽事平台",
        loginTitle: "登入", registerTitle: "註冊", emailPh: "電子郵件", passwordPh: "密碼", loginBtn: "登入", registerBtn: "註冊", switchToRegister: "沒帳號？註冊", switchToLogin: "有帳號？登入", logout: "登出", allEvents: "所有賽事", noEvents: "目前無賽事", backToEvents: "返回列表", createEventTitle: "發佈賽事", eventNamePh: "活動名稱", eventRegionPh: "地點", bannerUrlPh: "封面圖片網址", descPh: "描述...", manageEventBtn: "管理後台", randomRegisterBtn: "報名參賽", registered: "已報名", waitingForDraw: "待抽籤", statusCheckedIn: "已到", statusNotCheckedIn: "未到", statusPaid: "已付", statusNotPaid: "未付", yourNumber: "編號", manageListTitle: "我主辦的", myEventsTitle: "我參加的", noHostedEvents: "無主辦賽事", noJoinedEvents: "無參賽紀錄", enterManage: "管理", compSettingsTitle: "賽制設定", laneCountPh: "賽道數", laneCapacityPh: "人數上限", categoriesLabel: "組別", categoryPh: "組別名稱", paymentSettingsTitle: "繳費設定", paymentDescPh: "繳費說明", paymentQrPh: "QR 連結", publishBtn: "發佈", editEvent: "編輯", deleteEvent: "刪除", saveChanges: "儲存", cancelEdit: "取消", deleteConfirm: "確定刪除？", endEventConfirm: "確定結束？", eventEnded: "已結束", tabCheckIn: "報到", tabAssignment: "抽籤", tabCalling: "叫號", userNotFound: "查無此帳號，請先註冊！", drawWarning: "確定重新抽籤？", drawSuccess: "完成", callSuccess: "已叫號", callNext: "下一位", callAgain: "再次呼叫", generateDrawBtn: "生成抽籤 (已付+已到)", openMap: "地圖", category: "組別", printList: "列印名單", printTitle: "參賽名單", stageNamePh: "舞台名稱", selectCategory: "選擇組別", notifyHint: "開啟通知", itsYourTurn: "輪到你了！", pleaseGoToStage: "請上台！", closeNotification: "收到", qualifyAlertTitle: "恭喜晉級！", qualifyAlertMsg: "進入下一輪", congrats: "報名成功", successMsg: "已登記", rememberPayment: "請記得繳費報到", backToHome: "回首頁", addCategoryBtn: "加入", eventFormatLabel: "賽制", roundConfigTitle: "輪次設定", roundConfigDesc: "晉級人數", roundLabel: "輪次", paymentLinkPh: "支付連結 (Stripe等)", payNowBtn: "前往繳費",
        callModeSingle: "單人叫號", callModeAllLanes: "賽道齊發 (多道)", callTop8: "呼叫 8 強選手", callBattle: "呼叫對戰 (1 on 1)", start7toSmoke: "啟動 7 to Smoke", startTournament: "啟動 Tournament", battle: "對戰", winner: "獲勝",
    },
    'en': { appTitle: "Dance Platform" } 
};

// --- Main App Component ---
const App = () => {
    const [user, setUser] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [lang, setLang] = useState('zh-TW');
    const [currentPage, setCurrentPage] = useState('browse');
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [events, setEvents] = useState([]);
    const [myRegistrations, setMyRegistrations] = useState([]);
    
    const [authEmail, setAuthEmail] = useState('');
    const [authPassword, setAuthPassword] = useState('');
    const [isRegisteringMode, setIsRegisteringMode] = useState(false);
    const [systemMessage, setSystemMessage] = useState('');

    // 🔔 全域通知狀態
    const [globalAlert, setGlobalAlert] = useState(null); // { title, body, eventName }
    const audioRef = useRef(null);

    const t = (key) => translations[lang]?.[key] || translations['en'][key] || key;

    // Auth
    useEffect(() => {
        if(!auth) return;
        return onAuthStateChanged(auth, (u) => {
            setUser(u);
            setIsAuthReady(true);
        });
    }, []);

    // 🟢 全域監聽：只要有任何一個報名的活動叫號，就觸發通知
    useEffect(() => {
        if (!myRegistrations.length || !events.length) return;

        // 檢查是否有任何註冊剛被呼叫 (10秒內)
        const now = Date.now();
        const activeCalls = myRegistrations.filter(reg => {
            if (!reg.lastCalledAt || !reg.called) return false;
            const time = reg.lastCalledAt.toMillis ? reg.lastCalledAt.toMillis() : new Date(reg.lastCalledAt).getTime();
            return (now - time) < 10000; // 10秒內的呼叫
        });

        if (activeCalls.length > 0) {
            const lastCall = activeCalls[0]; // 取最新的一個
            const eventName = events.find(e => e.id === lastCall.eventId)?.name || "Unknown Event";
            
            // 設定全域彈窗內容
            setGlobalAlert({
                title: t('itsYourTurn'),
                body: `${t('pleaseGoToStage')}`,
                eventName: eventName
            });

            // 嘗試觸發手機功能 (包在 try-catch 避免崩潰)
            try { if (navigator.vibrate) navigator.vibrate([500, 200, 500, 200, 1000]); } catch(e){}
            
            if (audioRef.current) {
                audioRef.current.play().catch(e => console.log("Auto-play prevented by browser"));
            }

            if (Notification.permission === 'granted') {
                try { new Notification(`${t('itsYourTurn')} - ${eventName}`, { body: t('pleaseGoToStage') }); } catch(e){}
            }
        }
    }, [myRegistrations, events]); // 當註冊資料更新時觸發 (包含被叫號)

    const handleAuth = async (e) => {
        e.preventDefault();
        // 登入時順便解鎖音效
        if (audioRef.current) { audioRef.current.play().then(()=>audioRef.current.pause()).catch(()=>{}); }
        try {
            if(isRegisteringMode) await createUserWithEmailAndPassword(auth, authEmail, authPassword);
            else await signInWithEmailAndPassword(auth, authEmail, authPassword);
        } catch(err) { alert(err.message); }
    };

    const fetchEvents = useCallback(async () => {
        if(!db) return;
        const q = query(collection(db, `artifacts/${appId}/public/data/events`));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setEvents(snapshot.docs.map(d => ({id:d.id, ...d.data(), categories: d.data().categories || ['Standard'], paymentLink: d.data().paymentLink || ''})));
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => { if(isAuthReady) fetchEvents(); }, [isAuthReady, fetchEvents]);
    
    useEffect(() => {
        if(!db || !user) return;
        const q = query(collection(db, `artifacts/${appId}/public/data/registrations`), where("userId", "==", user.uid));
        // 實時監聽我的所有報名
        return onSnapshot(q, s => setMyRegistrations(s.docs.map(d => ({id:d.id, ...d.data()}))));
    }, [user]);

    const navigate = (page, event = null) => { setSelectedEvent(event); setCurrentPage(page); window.scrollTo(0,0); };

    if (!isAuthReady) return <div className="min-h-screen bg-black flex items-center justify-center text-white"><Loader2 className="animate-spin"/></div>;

    if (!user) return <AuthScreen onAuth={handleAuth} isRegistering={isRegisteringMode} setIsRegistering={setIsRegisteringMode} authEmail={authEmail} setAuthEmail={setAuthEmail} authPassword={authPassword} setAuthPassword={setAuthPassword} t={t} systemMessage={systemMessage}/>;

    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-black text-sans flex flex-col items-center">
                {/* 隱藏音效檔 */}
                <audio ref={audioRef} src="data:audio/mp3;base64,SUQzBAAAAAABAFRYWFgAAAASAAADbWFqb3JfYnJhbmQAbXA0MgBUWFhYAAAAEQAAA21pbm9yX3ZlcnNpb24AMABUWFhYAAAAHAAAA2NvbXBhdGlibGVfYnJhbmRzAGlzb21tcDQyAFRTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQxAAAAAAA0gAAAAABAAABAAAAAAAAAAABH//tQxAAAAAAA0gAAAAABAAABAAAAAAAAAAAB///tQxAAAAAAA0gAAAAABAAABAAAAAAAAAAAB//tQxAAAAAAA0gAAAAABAAABAAAAAAAAAAAB" /> 

                {/* 🔴 全域通知彈窗 (Global Alert) */}
                {globalAlert && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 animate-in fade-in zoom-in duration-300">
                        <div className="bg-red-600 p-8 rounded-3xl text-center border-4 border-white shadow-2xl w-4/5 max-w-sm animate-bounce">
                            <BellRing size={64} className="text-white mx-auto mb-4 animate-pulse" />
                            <h2 className="text-2xl font-black text-white mb-1">{globalAlert.eventName}</h2>
                            <h3 className="text-3xl font-black text-yellow-300 mb-4">{globalAlert.title}</h3>
                            <p className="text-lg text-white font-bold">{globalAlert.body}</p>
                            <button 
                                onClick={() => { setGlobalAlert(null); if(audioRef.current) audioRef.current.pause(); }} 
                                className="mt-8 bg-white text-red-600 px-8 py-4 rounded-full font-bold text-xl w-full shadow-lg active:scale-95"
                            >
                                {t('closeNotification')}
                            </button>
                        </div>
                    </div>
                )}

                <div id="app" className="w-full max-w-md min-h-screen flex flex-col bg-gray-900 shadow-xl relative">
                    <header className="p-4 bg-gray-900 border-b border-gray-800 flex justify-between items-center sticky top-0 z-50">
                        <h1 className="text-xl font-black text-white flex items-center"><span className="text-red-600 mr-2">⚡</span> {t('appTitle')}</h1>
                    </header>
                    
                    <main className="flex-grow overflow-y-auto">
                        {currentPage === 'browse' && <EventList events={events} navigate={navigate} t={t} handleLogout={()=>signOut(auth)} lang={lang} setLang={setLang}/>}
                        {currentPage === 'detail' && <EventDetail event={selectedEvent} user={user} db={db} navigate={navigate} t={t} myRegistrations={myRegistrations} appId={appId} requestNotificationPermission={() => Notification.requestPermission()}/>}
                        {currentPage === 'create' && <CreateEventForm user={user} db={db} navigate={navigate} t={t} fetchEvents={fetchEvents} appId={appId}/>}
                        {currentPage === 'manage' && <EventManager event={selectedEvent} db={db} t={t} navigate={navigate} appId={appId}/>}
                        {currentPage === 'my_events' && <MyEvents events={events} myRegistrations={myRegistrations} navigate={navigate} t={t}/>}
                        {currentPage === 'manage_list' && <ManagementList events={events} user={user} navigate={navigate} t={t}/>}
                        {currentPage === 'registerSuccess' && <RegistrationSuccess event={selectedEvent} navigate={navigate} t={t}/>}
                    </main>

                    <div className="fixed bottom-0 w-full max-w-md bg-gray-900 border-t border-gray-800 flex justify-around p-2 z-50">
                        {[{p:'browse',i:Grid},{p:'create',i:PlusCircle},{p:'my_events',i:UserIcon},{p:'manage_list',i:ClipboardList}].map(b=>(
                            <button key={b.p} onClick={()=>navigate(b.p)} className={`p-2 ${currentPage===b.p?'text-red-500':'text-gray-500'}`}><b.i/></button>
                        ))}
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
};

// --- 子組件 (保持原樣，直接引用前面的定義) ---
const AuthScreen = ({ onAuth, isRegistering, setIsRegistering, authEmail, setAuthEmail, authPassword, setAuthPassword, t, systemMessage }) => (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-white">
        <div className="w-full max-w-md bg-gray-900 p-8 rounded-3xl border border-gray-800 shadow-2xl">
            <h1 className="text-3xl font-black text-center mb-8"><span className="text-red-600 mr-2">⚡</span> {t('appTitle')}</h1>
            <form onSubmit={onAuth} className="space-y-4">
                <div className="bg-gray-800 p-2 rounded-xl border border-gray-700 flex items-center"><Mail className="text-gray-500 ml-2" size={20}/><input type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} className="bg-transparent flex-1 p-2 outline-none" placeholder={t('emailPh')} required /></div>
                <div className="bg-gray-800 p-2 rounded-xl border border-gray-700 flex items-center"><Lock className="text-gray-500 ml-2" size={20}/><input type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} className="bg-transparent flex-1 p-2 outline-none" placeholder={t('passwordPh')} required /></div>
                <button className="w-full bg-gradient-to-r from-red-600 to-red-800 font-bold py-3 rounded-xl">{isRegistering ? t('registerBtn') : t('loginBtn')}</button>
            </form>
            <button onClick={() => setIsRegistering(!isRegistering)} className="mt-6 text-gray-400 text-sm w-full text-center">{isRegistering ? t('switchToLogin') : t('switchToRegister')}</button>
            {systemMessage && <div className="mt-4 p-2 bg-red-900/50 text-center rounded text-sm">{systemMessage}</div>}
        </div>
    </div>
);

const EventList = ({ events, navigate, t, handleLogout, lang, setLang }) => {
    const sorted = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));
    const featured = sorted.find(e => new Date(e.date) >= new Date()) || sorted[sorted.length - 1];
    return (
        <div className="p-4 pb-24 space-y-4 text-white">
            <div className="flex justify-between items-center"><h2 className="text-xl font-bold">{t('allEvents')}</h2><div className="flex gap-2 items-center"><select value={lang} onChange={e => setLang(e.target.value)} className="bg-gray-800 text-xs p-1 rounded"><option value="zh-TW">繁體</option><option value="en">EN</option></select><button onClick={handleLogout}><LogOut size={16}/></button></div></div>
            {featured && <div onClick={() => navigate('detail', featured)} className="relative w-full h-48 bg-gray-800 rounded-3xl overflow-hidden border border-gray-700 group cursor-pointer">{featured.bannerUrl ? <img src={featured.bannerUrl} className="absolute inset-0 w-full h-full object-cover opacity-60" /> : <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-black opacity-90"/>}<div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/90 via-transparent"><span className="bg-red-600 text-[10px] font-black px-2 py-1 rounded w-fit mb-1">HOT</span><h3 className="text-2xl font-black shadow-black drop-shadow-md">{featured.name}</h3><p className="text-xs text-gray-300 flex items-center"><MapPin size={12} className="mr-1"/>{featured.region}</p></div></div>}
            <div className="space-y-3">{sorted.map(e => <div key={e.id} onClick={() => navigate('detail', e)} className="bg-gray-800 p-4 rounded-2xl border border-gray-700 flex gap-3 cursor-pointer overflow-hidden relative">{e.bannerUrl && <div className="absolute inset-0 opacity-20"><img src={e.bannerUrl} className="w-full h-full object-cover"/></div>}<div className="relative z-10"><h3 className="font-bold text-lg">{e.name}</h3><div className="flex gap-1 flex-wrap mt-1">{e.categories.map(c => <span key={c} className="text-[10px] bg-indigo-900 text-indigo-200 px-1 rounded border border-indigo-700">{c}</span>)}</div><div className="text-sm text-gray-400 mt-2 flex items-center"><Calendar size={14} className="mr-1"/>{formatDateOnly(e.date)}</div></div></div>)}</div>
        </div>
    );
};

const EventDetail = ({ event, user, db, navigate, t, myRegistrations, appId, requestNotificationPermission }) => {
    if (!event) return <div className="p-8 text-center text-white"><Loader2 className="animate-spin mx-auto"/></div>;
    const reg = myRegistrations.find(r => r.eventId === event.id);
    const isCreator = user?.uid === event.creatorId;
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ ...event, categoriesStr: event.categories?.join(', ') });
    const [stageName, setStageName] = useState('');
    const [category, setCategory] = useState(event.categories?.[0] || 'Standard');
    
    const handleRegister = async () => {
        if (!stageName.trim()) return alert("Please enter Stage Name");
        try {
            const q = query(collection(db, `artifacts/${appId}/public/data/registrations`), where("eventId", "==", event.id), where("userId", "==", user.uid));
            const snap = await getDocs(q);
            if (!snap.empty) throw new Error("Already registered");
            await addDoc(collection(db, `artifacts/${appId}/public/data/registrations`), { eventId: event.id, userId: user.uid, stageName, category, registrationTime: serverTimestamp(), checkedIn: false, paid: false, isAssigned: false, called: false, lastCalledAt: null });
            requestNotificationPermission();
            navigate('registerSuccess', { ...event, temp: true });
        } catch (e) { alert(e.message); }
    };
    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!isCreator) return;
        try {
            const cats = editForm.categoriesStr.split(',').map(s => s.trim()).filter(s => s);
            await updateDoc(doc(db, `artifacts/${appId}/public/data/events`, event.id), { ...editForm, categories: cats, laneCount: parseInt(editForm.laneCount), laneCapacity: parseInt(editForm.laneCapacity) });
            setIsEditing(false);
        } catch (e) { alert(e.message); }
    };
    const handleDelete = async () => {
        if (!confirm(t('deleteConfirm'))) return;
        await deleteDoc(doc(db, `artifacts/${appId}/public/data/events`, event.id));
        navigate('browse');
    };

    return (
        <div className="p-4 pb-24 space-y-4 text-white">
            <button onClick={() => navigate('browse')} className="flex items-center text-gray-400"><ChevronLeft size={20}/> {t('backToEvents')}</button>
            {isEditing ? (
                <form onSubmit={handleUpdate} className="bg-gray-800 p-4 rounded-xl space-y-3 border border-gray-700">
                    <h3 className="font-bold flex items-center text-yellow-400"><Edit size={18} className="mr-2"/> {t('editEvent')}</h3>
                    <input className="w-full p-3 bg-gray-900 rounded border border-gray-600" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} required/>
                    <input className="w-full p-3 bg-gray-900 rounded border border-gray-600" type="datetime-local" value={editForm.date} onChange={e => setEditForm({...editForm, date: e.target.value})} required/>
                    <input className="w-full p-3 bg-gray-900 rounded border border-gray-600" value={editForm.bannerUrl} onChange={e => setEditForm({...editForm, bannerUrl: e.target.value})} placeholder="Banner URL"/>
                    <input className="w-full p-3 bg-gray-900 rounded border border-gray-600" value={editForm.paymentLink} onChange={e => setEditForm({...editForm, paymentLink: e.target.value})} placeholder={t('paymentLinkPh')}/>
                    <input className="w-full p-3 bg-gray-900 rounded border border-gray-600" value={editForm.categoriesStr} onChange={e => setEditForm({...editForm, categoriesStr: e.target.value})} placeholder="Categories"/>
                    <div className="flex gap-2"><button type="button" onClick={() => setIsEditing(false)} className="flex-1 bg-gray-700 p-3 rounded">{t('cancelEdit')}</button><button className="flex-1 bg-green-600 p-3 rounded font-bold">{t('saveChanges')}</button></div>
                    <button type="button" onClick={handleDelete} className="w-full border border-red-600 text-red-500 p-3 rounded mt-2">{t('deleteEvent')}</button>
                </form>
            ) : (
                <>
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                        <div className="flex justify-between"><h2 className="text-2xl font-black">{event.name}</h2>{isCreator && <button onClick={() => setIsEditing(true)} className="bg-gray-700 p-2 rounded-full"><Edit size={16}/></button>}</div>
                        <div className="flex gap-2 my-2 flex-wrap">{event.categories?.map(c => <span key={c} className="bg-indigo-900 text-indigo-200 px-2 rounded text-xs">{c}</span>)}</div>
                        {event.paymentLink && <a href={event.paymentLink} target="_blank" className="block w-full bg-green-600 text-white text-center font-bold py-3 rounded-xl mt-4">{t('payNowBtn')}</a>}
                    </div>
                    <div className="fixed bottom-20 left-0 right-0 px-4 z-20">
                        {isCreator ? (
                            <button onClick={() => navigate('manage', event)} className="w-full bg-indigo-600 p-4 rounded-xl font-bold shadow-lg flex justify-center items-center"><Settings size={20} className="mr-2"/> {t('manageEventBtn')}</button>
                        ) : !reg ? (
                            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-xl space-y-3">
                                <input value={stageName} onChange={e => setStageName(e.target.value)} className="w-full p-3 bg-gray-900 rounded text-white" placeholder={t('stageNamePh')}/>
                                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-3 bg-gray-900 rounded text-white">{event.categories?.map(c => <option key={c} value={c}>{c}</option>)}</select>
                                <button onClick={handleRegister} className="w-full bg-red-600 p-4 rounded-xl font-bold shadow-lg">{t('randomRegisterBtn')}</button>
                            </div>
                        ) : (
                            <div className="bg-gray-900/90 p-4 rounded-xl border border-green-600 text-center shadow-xl backdrop-blur">
                                <p className="text-green-500 font-bold mb-1">{t('registered')}</p>
                                <div className="text-2xl font-black">{reg.laneAssignment ? `${reg.laneAssignment}-${formatNumber(reg.queueNumber)}` : t('waitingForDraw')}</div>
                                <p className="text-xs text-gray-400 mt-1">{reg.category} | {reg.stageName}</p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

const CreateEventForm = ({ user, db, navigate, t, fetchEvents, appId }) => {
    const [form, setForm] = useState({ name: '', date: '', region: '', description: '', laneCount: 4, laneCapacity: 50, bannerUrl: '', categoriesStr: 'Standard', paymentInfo: '', paymentQrCodeUrl: '', paymentLink: '' });
    const [isProcessing, setIsProcessing] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        try {
            const cats = form.categoriesStr.split(',').map(s => s.trim()).filter(s => s);
            await addDoc(collection(db, `artifacts/${appId}/public/data/events`), { ...form, categories: cats.length ? cats : ['Standard'], creatorId: user.uid, timestamp: serverTimestamp(), status: 'active', roundsConfig: [{round:2, qualifiers:64}] });
            fetchEvents(); navigate('browse');
        } catch(e) { alert(e.message); } finally { setIsProcessing(false); }
    };
    return (
        <div className="p-4 pb-24 text-white">
            <button onClick={() => navigate('browse')} className="text-gray-400 mb-4 flex items-center"><ChevronLeft/> {t('backToHome')}</button>
            <h2 className="text-2xl font-bold mb-6">{t('createEventTitle')}</h2>
            <form onSubmit={handleSubmit} className="space-y-4 bg-gray-800 p-5 rounded-xl border border-gray-700">
                <input className="w-full p-3 bg-gray-900 rounded text-white" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder={t('eventNamePh')} required/>
                <input className="w-full p-3 bg-gray-900 rounded text-white" type="datetime-local" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required/>
                <input className="w-full p-3 bg-gray-900 rounded text-white" value={form.region} onChange={e => setForm({...form, region: e.target.value})} placeholder={t('eventRegionPh')} required/>
                <input className="w-full p-3 bg-gray-900 rounded text-white" value={form.bannerUrl} onChange={e => setForm({...form, bannerUrl: e.target.value})} placeholder={t('bannerUrlPh')}/>
                <input className="w-full p-3 bg-gray-900 rounded text-white" value={form.paymentLink} onChange={e => setForm({...form, paymentLink: e.target.value})} placeholder={t('paymentLinkPh')}/>
                <input className="w-full p-3 bg-gray-900 rounded text-white" value={form.categoriesStr} onChange={e => setForm({...form, categoriesStr: e.target.value})} placeholder={t('categoriesLabel')}/>
                <textarea className="w-full p-3 bg-gray-900 rounded text-white" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder={t('descPh')} rows={3}/>
                <button disabled={isProcessing} className="w-full bg-red-600 p-4 rounded-xl font-bold shadow-lg">{isProcessing ? <Loader2 className="animate-spin mx-auto"/> : t('publishBtn')}</button>
            </form>
        </div>
    );
};

const EventManager = ({ event, db, t, navigate, appId }) => {
    if (!event) return <div className="text-center text-white p-8">Loading...</div>;
    const [regs, setRegs] = useState([]);
    const [cat, setCat] = useState(event.categories?.[0] || 'Standard');
    const [activeTab, setActiveTab] = useState('checkin');
    const [callStatus, setCallStatus] = useState({ displayNumbers: [] });
    const [callMode, setCallMode] = useState('single');

    useEffect(() => {
        const q = query(collection(db, `artifacts/${appId}/public/data/registrations`), where("eventId", "==", event.id));
        const unsub = onSnapshot(q, s => setRegs(s.docs.map(d => ({ id: d.id, ...d.data() }))));
        const unsubStatus = onSnapshot(doc(db, `artifacts/${appId}/public/data/call_status/${event.id}`), s => s.exists() && setCallStatus(s.data()));
        return () => { unsub(); unsubStatus(); }
    }, [db, event.id]);

    const catRegs = regs.filter(r => (r.category || 'Standard') === cat);
    const eligible = catRegs.filter(r => r.checkedIn && r.paid);

    const draw = async () => {
        if (!confirm(t('drawWarning'))) return;
        const batch = writeBatch(db);
        const shuffled = [...eligible].sort(() => 0.5 - Math.random());
        shuffled.forEach((r, i) => {
            const lane = getLaneName(i % (event.laneCount || 4));
            const num = Math.floor(i / (event.laneCount || 4)) + 1;
            batch.update(doc(db, `artifacts/${appId}/public/data/registrations`, r.id), { laneAssignment: lane, queueNumber: num, isAssigned: true });
        });
        await batch.commit();
        alert(t('drawSuccess'));
    };

    const toggle = (id, field, val) => updateDoc(doc(db, `artifacts/${appId}/public/data/registrations`, id), { [field]: val });
    
    const callNext = async () => {
        let targets = [];
        const waiting = catRegs.filter(r => r.laneAssignment && !r.called).sort((a,b) => a.queueNumber - b.queueNumber);
        if (waiting.length === 0) return alert(t('noMorePlayers'));

        if (callMode === 'all_lanes') {
            const uniqueLanes = [...new Set(catRegs.map(r => r.laneAssignment).filter(l => l))].sort();
            uniqueLanes.forEach(lane => {
                const nextInLane = waiting.find(r => r.laneAssignment === lane);
                if (nextInLane) targets.push(nextInLane);
            });
        } else { targets.push(waiting[0]); }

        if (targets.length === 0) return alert(t('noMorePlayers'));

        const displayNums = targets.map(t => t.queueNumber);
        const batch = writeBatch(db);
        batch.set(doc(db, `artifacts/${appId}/public/data/call_status/${event.id}`), { displayNumbers: displayNums, updatedAt: serverTimestamp() }, { merge: true });
        targets.forEach(t => batch.update(doc(db, `artifacts/${appId}/public/data/registrations`, t.id), { called: true, lastCalledAt: serverTimestamp() }));
        await batch.commit();
    };
    
    const callAgain = async () => {
        const currentNums = callStatus.displayNumbers || [];
        if (currentNums.length === 0) return;
        const targets = catRegs.filter(r => currentNums.includes(r.queueNumber));
        const batch = writeBatch(db);
        targets.forEach(t => batch.update(doc(db, `artifacts/${appId}/public/data/registrations`, t.id), { lastCalledAt: serverTimestamp() }));
        await batch.commit();
    };
    
    const printList = () => {
        const win = window.open('','','width=600,height=600');
        win.document.write(`<html><body><h2>${event.name} - ${cat}</h2><table border="1" width="100%"><tr><th>#</th><th>Name</th><th>Status</th></tr>${catRegs.map(r=>`<tr><td>${r.laneAssignment||''}-${r.queueNumber||''}</td><td>${r.stageName}</td><td>${r.checkedIn?'In':''}</td></tr>`).join('')}</table></body></html>`);
        win.print();
    };

    return (
        <div className="p-4 pb-24 space-y-4 text-white">
            <div className="flex justify-between"><button onClick={() => navigate('detail', event)}><ChevronLeft/></button><button onClick={printList}><Printer/></button></div>
            <h2 className="text-xl font-bold">{event.name} - {t('manageTitle')}</h2>
            <select value={cat} onChange={e => setCat(e.target.value)} className="w-full p-3 bg-gray-800 rounded border border-gray-700 text-white font-bold">{event.categories?.map(c => <option key={c} value={c}>{c}</option>)}</select>
            <div className="flex bg-gray-800 rounded-xl p-1"><button onClick={() => setActiveTab('checkin')} className={`flex-1 p-2 rounded ${activeTab === 'checkin' ? 'bg-gray-600' : ''}`}>{t('tabCheckIn')}</button><button onClick={() => setActiveTab('draw')} className={`flex-1 p-2 rounded ${activeTab === 'draw' ? 'bg-gray-600' : ''}`}>{t('tabAssignment')}</button><button onClick={() => setActiveTab('call')} className={`flex-1 p-2 rounded ${activeTab === 'call' ? 'bg-gray-600' : ''}`}>{t('tabCalling')}</button></div>
            
            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 min-h-[300px]">
                {activeTab === 'checkin' && catRegs.map(r => (
                    <div key={r.id} className="flex justify-between bg-gray-800 p-3 mb-2 rounded items-center border border-gray-700">
                        <div><div className="font-bold">{r.stageName}</div><div className="text-xs text-gray-400">{r.laneAssignment ? `${r.laneAssignment}-${r.queueNumber}` : '-'}</div></div>
                        <div className="flex gap-2"><button onClick={() => toggle(r.id, 'paid', !r.paid)} className={`px-2 py-1 rounded text-xs ${r.paid ? 'bg-yellow-600 text-black' : 'bg-gray-700'}`}>$</button><button onClick={() => toggle(r.id, 'checkedIn', !r.checkedIn)} className={`px-2 py-1 rounded text-xs ${r.checkedIn ? 'bg-green-600' : 'bg-gray-700'}`}>In</button></div>
                    </div>
                ))}
                {activeTab === 'draw' && <div className="text-center p-8"><Dices size={48} className="mx-auto mb-4 text-indigo-400"/><p className="mb-4 text-gray-400">{t('drawStats').replace('{n}', eligible.length)}</p><button onClick={draw} className="w-full bg-indigo-600 p-4 rounded-xl font-bold shadow-lg">{t('generateDrawBtn')}</button></div>}
                {activeTab === 'call' && <div className="text-center p-8">
                    <div className="flex justify-center gap-2 mb-6 bg-gray-800 p-1 rounded-lg">
                        <button onClick={() => setCallMode('single')} className={`flex-1 py-2 text-xs rounded ${callMode==='single'?'bg-blue-600':'text-gray-400'}`}>{t('modeSingle')}</button>
                        <button onClick={() => setCallMode('all_lanes')} className={`flex-1 py-2 text-xs rounded ${callMode==='all_lanes'?'bg-blue-600':'text-gray-400'}`}>{t('modeAllLanes')}</button>
                    </div>
                    <div className="text-6xl font-black mb-6">{callStatus.displayNumbers?.join(' , ') || '--'}</div>
                    <div className="flex gap-2">
                        <button onClick={callAgain} className="flex-1 bg-yellow-600 p-4 rounded-xl font-bold shadow-lg flex items-center justify-center"><Repeat size={20} className="mr-2"/> {t('callAgain')}</button>
                        <button onClick={callNext} className="flex-1 bg-green-600 p-4 rounded-xl font-bold shadow-lg flex items-center justify-center">{t('callNext')} <ChevronLeft className="ml-2 rotate-180" size={20}/></button>
                    </div>
                </div>}
            </div>
        </div>
    );
};

const RegistrationSuccess = ({ event, navigate, t }) => (
    <div className="p-8 text-center text-white flex flex-col items-center justify-center h-[80vh]">
        <CheckCircle size={80} className="text-green-500 mb-4"/>
        <h2 className="text-3xl font-bold mb-2">{t('congrats')}</h2>
        <p className="text-gray-400 mb-8">{t('successMsg')}</p>
        <button onClick={() => navigate('browse')} className="bg-gray-800 px-8 py-3 rounded-full font-bold">{t('backToHome')}</button>
    </div>
);

export default App;