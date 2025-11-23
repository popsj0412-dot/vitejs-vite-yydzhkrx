import React, { useState, useEffect, useCallback, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, onSnapshot, runTransaction, collection, query, where, getDocs, addDoc, serverTimestamp, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { MapPin, Calendar, Users, PlusCircle, LayoutList, CheckCircle, ChevronLeft, Loader2, Megaphone, Settings, ListChecks, Shuffle, TrendingUp, XCircle, DollarSign, ExternalLink, CreditCard, Grid, Play, SkipForward, Hash, Globe, BellRing, Search, Star, Heart, Trophy, AlertCircle, Trash2, Sparkles, Flag, Crown, Swords, Timer, ClipboardList, User as UserIcon, LogOut, Mail, Lock, KeyRound, Copy, Bell, Zap, Dices, Edit, Save, Image as ImageIcon, Printer, FileText, X, Plus, AlertTriangle } from 'lucide-react';

// --- 請修改這裡 (填入您的 Firebase 資料) ---
const appId = 'dance-event-demo-01'; 

const firebaseConfig = {
    apiKey: "AIzaSyC7sx5yZtUHYXbVtVTokmJbz5GS9U8aVtg",
    authDomain: "number-calling.firebaseapp.com",
    projectId: "number-calling",
    storageBucket: "number-calling.firebasestorage.app",
    messagingSenderId: "377620988598",
    appId: "1:377620988598:web:420ff4b20b1137375d5c17",
    measurementId: "G-WSX5WGW02B"
  };

// --- 初始化 Firebase ---
let app, auth, db;
try {
  if (firebaseConfig.apiKey && !firebaseConfig.apiKey.includes("請填入")) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    setPersistence(auth, browserLocalPersistence).catch(console.error);
  } else {
    console.warn("Firebase Config 尚未填寫！部分功能將無法使用。");
  }
} catch (e) {
  console.error("Firebase Init Failed:", e);
}

// --- 翻譯字典 ---
const translations = {
    'zh-TW': {
        appTitle: "舞蹈賽事平台",
        loginTitle: "登入平台",
        registerTitle: "註冊帳號",
        emailPh: "電子郵件",
        passwordPh: "密碼 (至少6位)",
        loginBtn: "登入",
        registerBtn: "註冊新帳號",
        switchToRegister: "還沒有帳號？點此註冊",
        switchToLogin: "已有帳號？點此登入",
        logout: "登出",
        welcome: "歡迎回來",
        discoverEvents: "探索賽事",
        createEventTitle: "發佈新賽事 📝",
        manageTitle: "賽事中控台",
        featured: "精選賽事",
        recommended: "熱門推薦",
        allEvents: "所有賽事",
        allRegions: "所有地區",
        allTimes: "所有時間",
        upcoming: "即將到來",
        past: "已結束",
        noEvents: "目前沒有符合條件的活動。",
        backToHome: "返回",
        backToEvents: "返回列表",
        time: "時間",
        location: "地點",
        description: "描述",
        numberRange: "號碼範圍",
        randomDraw: "隨機抽取",
        openMap: "開啟地圖",
        paymentInfoTitle: "繳費資訊",
        qrCode: "收款碼",
        randomRegisterBtn: "報名參賽",
        processing: "處理中...",
        registered: "已報名",
        waitingForDraw: "待抽籤分配",
        yourNumber: "您的編號",
        manageEventBtn: "進入中控台",
        statusCheckedIn: "已報到",
        statusNotCheckedIn: "未報到",
        statusPaid: "已繳費",
        statusNotPaid: "未繳費",
        lane: "賽道",
        congrats: "報名成功！",
        successMsg: "您已成功登記參加",
        rememberPayment: "請記得查看繳費資訊並前往現場報到。",
        basicInfo: "基本資訊",
        eventNamePh: "活動名稱",
        eventRegionPh: "地點/地區",
        mapLinkPh: "📍 地圖連結 (可選)",
        bannerUrlPh: "🖼️ 活動封面圖片網址 (可選)",
        descPh: "活動描述...",
        eventFormatLabel: "主要賽制 (Main Format)",
        categoriesLabel: "比賽組別/風格 (Categories)",
        addCategoryBtn: "加入",
        categoryPh: "輸入組別名稱 (例如: Breaking)",
        compSettingsTitle: "賽事與賽道規格",
        laneCountPh: "賽道數量 (A, B...)",
        laneCapacityPh: "每賽道人數上限",
        laneHint: "總賽道: A ~ {lastChar} | 總名額: {total} 人",
        paymentSettingsTitle: "繳費設定",
        paymentDescPh: "繳費說明...",
        paymentQrPh: "🔗 收款碼圖片連結 (可選)",
        roundConfigTitle: "賽制輪次規劃",
        roundConfigDesc: "設定每一輪預計晉級的人數",
        addRound: "新增輪次",
        roundLabel: "輪次",
        qualifiersLabel: "晉級人數",
        publishBtn: "發佈活動",
        tabCalling: "叫號",
        tabCheckIn: "報到/名單",
        tabAssignment: "抽籤", 
        tabProgression: "晉級",
        currentCall: "目前舞台",
        callStrategy: "叫號設定",
        mode: "模式",
        modeSingle: "單人",
        modeAllLanes: "賽道齊發",
        callNext: "叫下一位",
        callNextBatch: "叫下一批",
        randomAssignTitle: "隨機分道抽籤",
        startDraw: "開始抽籤",
        drawing: "抽籤中...",
        drawWarning: "警告：這將重新分配所有「已報到+已繳費」選手的號碼！",
        generateDrawBtn: "生成號碼 (僅限已報到+已繳費)",
        drawStats: "符合資格：{n} 人",
        navHome: "首頁",
        navCreate: "發佈",
        navMy: "我的",
        navManage: "管理",
        myEventsTitle: "我的參賽紀錄 🕺",
        manageListTitle: "我主辦的活動 🛠️",
        noJoinedEvents: "尚未報名任何活動",
        noHostedEvents: "尚未創建任何活動",
        enterManage: "管理",
        createSuccess: "✅ 發佈成功！",
        createFail: "發佈失敗",
        registerProcessing: "報名中...",
        registerFail: "報名失敗",
        drawSuccess: "✅ 抽籤完成！",
        callSuccess: "叫號成功",
        callFail: "叫號失敗",
        calculatingNext: "計算中...",
        noMorePlayers: "無待叫選手。",
        allLanesEmpty: "全賽道無人。",
        called: "已叫號",
        itsYourTurn: "輪到你了！",
        pleaseGoToStage: "請立即前往舞台！",
        closeNotification: "收到",
        searchPlaceholder: "搜尋 姓名/號碼...",
        statsTotal: "總數",
        statsCheckedIn: "已到",
        statsPaid: "已付",
        noResult: "找不到資料",
        progressionTitle: "晉級管理",
        currentRound: "當前輪次",
        nextRoundTarget: "下一輪目標",
        advanceManual: "手動晉級 (賽道+號碼)",
        advanceManualPh: "例如: A5, B12",
        advanceRandom: "隨機抽選晉級",
        advanceRandomCountPh: "晉級人數",
        advanceBtn: "確認晉級",
        endEventBtn: "結束活動",
        advancing: "處理中...",
        advanceSuccess: "✅ 晉級成功！",
        advanceFail: "失敗",
        qualifyAlertTitle: "恭喜晉級！",
        qualifyAlertMsg: "你已成功晉級到下一輪！",
        roundText: "第 {n} 輪",
        qualifiedStatus: "晉級",
        eliminatedStatus: "止步",
        specialModesTitle: "特殊賽制 (晉級後)",
        start7toSmoke: "啟動 7 to Smoke",
        startTournament: "啟動 Tournament",
        smokeTitle: "7 to Smoke",
        smokeKing: "King",
        smokeChallenger: "Challenger",
        smokeInLine: "排隊中",
        smokeWins: "勝",
        smokeWinBtn: "勝",
        smokeReq: "需正好 8 人晉級",
        tournTitle: "Tournament 對戰表",
        tournMatch: "對戰",
        tournWinnerBtn: "獲勝",
        tournReq: "需偶數人 (2, 4, 8...)",
        resetMode: "重置為標準叫號",
        modeActive: "進行中",
        stageNamePh: "舞台名稱 (Stage Name)",
        selectCategory: "選擇參賽項目",
        category: "項目",
        printList: "列印名單 / 下載 PDF",
        printTitle: "參賽者名單",
        editEvent: "編輯",
        deleteEvent: "刪除",
        saveChanges: "儲存",
        cancelEdit: "取消",
        deleteConfirm: "確定要刪除此活動？無法復原！",
        endEventConfirm: "確定要結束活動？結束後無法再叫號。",
        updateSuccess: "✅ 更新成功",
        deleteSuccess: "🗑️ 已刪除",
        eventEnded: "活動已結束",
        enableNotify: "開啟通知",
        notifyEnabled: "通知已開啟",
        notifyHint: "請允許通知以便接收叫號",
        wakelockActive: "螢幕恆亮中",
        formatStandard: "標準淘汰賽 (Standard)",
        format7toSmoke: "7 to Smoke (車輪戰)",
        formatTournament: "Tournament (1 on 1)",
    },
    'en': { 
        appTitle: "Dance Platform", 
        loginTitle: "Login",
        registerTitle: "Create Account",
        emailPh: "Email",
        passwordPh: "Password (min 6 chars)",
        loginBtn: "Login",
        registerBtn: "Register",
        switchToRegister: "No account? Register here",
        switchToLogin: "Have an account? Login here",
        logout: "Logout",
        welcome: "Welcome",
        discoverEvents: "Explore",
        createEventTitle: "Create Event",
        eventFormatLabel: "Main Format",
        categoriesLabel: "Categories",
        addCategoryBtn: "Add",
        categoryPh: "Category Name",
        formatStandard: "Standard",
        format7toSmoke: "7 to Smoke",
        formatTournament: "Tournament",
        // ... (英文部分簡略)
    }
};

const formatNumber = (num) => num > 0 ? num.toString().padStart(3, '0') : '--';
const formatDateTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    if (timestamp.toDate) return new Date(timestamp.toDate()).toLocaleString('zh-TW', { dateStyle: 'medium', timeStyle: 'short' });
    return new Date(timestamp).toLocaleString('zh-TW', { dateStyle: 'medium', timeStyle: 'short' });
};
const formatDateOnly = (timestamp) => {
    if (!timestamp) return 'N/A';
    if (timestamp.toDate) return new Date(timestamp.toDate()).toLocaleDateString('zh-TW');
    return new Date(timestamp).toLocaleDateString('zh-TW');
};
const getLaneName = (index) => String.fromCharCode(65 + index);

// --- 主應用程式組件 ---

const App = () => {
    const [user, setUser] = useState(null); 
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [loading, setLoading] = useState(true);
    const [systemMessage, setSystemMessage] = useState('');
    const [lang, setLang] = useState('zh-TW');

    const [authEmail, setAuthEmail] = useState('');
    const [authPassword, setAuthPassword] = useState('');
    const [isRegisteringMode, setIsRegisteringMode] = useState(false);

    const [currentPage, setCurrentPage] = useState('browse');
    const [selectedEvent, setSelectedEvent] = useState(null);
    
    const [events, setEvents] = useState([]);
    const [myRegistrations, setMyRegistrations] = useState([]);

    const t = (key) => translations[lang]?.[key] || translations['zh-TW'][key] || translations['en'][key] || key;

    // --- Firebase 狀態監聽 ---
    useEffect(() => {
        if (!auth) {
            setSystemMessage("Firebase 初始化失敗，請檢查 Config");
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser && currentUser.isAnonymous) {
                await signOut(auth);
                setUser(null);
            } else {
                setUser(currentUser);
            }
            setIsAuthReady(true);
            setLoading(false);
            if (currentUser && !currentUser.isAnonymous) {
                setAuthEmail('');
                setAuthPassword('');
            }
        });
        return () => unsubscribe();
    }, []);

    const handleAuth = async (e) => {
        e.preventDefault();
        if (!auth) { alert("Firebase 未連線"); return; }
        setSystemMessage("Processing...");
        try {
            if (isRegisteringMode) {
                await createUserWithEmailAndPassword(auth, authEmail, authPassword);
                setSystemMessage("Registered successfully!");
            } else {
                await setPersistence(auth, browserLocalPersistence);
                await signInWithEmailAndPassword(auth, authEmail, authPassword);
                setSystemMessage("Logged in successfully!");
            }
        } catch (error) {
            console.error(error);
            setSystemMessage(error.message);
        }
    };

    const handleLogout = async () => {
        if (!auth) return;
        try {
            await signOut(auth);
            setUser(null);
            setMyRegistrations([]); 
            navigate('browse');
            setSystemMessage("已登出");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    // --- 資料獲取 ---
    const fetchEvents = useCallback(async () => {
        if (!isAuthReady || !db) return;
        try {
            const eventsCollectionRef = collection(db, `artifacts/${appId}/public/data/events`);
            const q = query(eventsCollectionRef);
            const querySnapshot = await getDocs(q);
            const fetchedEvents = querySnapshot.docs.map(doc => ({ 
                id: doc.id, 
                ...doc.data(), 
                categories: doc.data().categories || ['Standard'],
                laneCount: doc.data().laneCount || 4,
                laneCapacity: doc.data().laneCapacity || 50, 
                googleMapLink: doc.data().googleMapLink || '',
                bannerUrl: doc.data().bannerUrl || '',
                paymentInfo: doc.data().paymentInfo || '',
                paymentQrCodeUrl: doc.data().paymentQrCodeUrl || '',
                initialFormat: doc.data().initialFormat || 'standard',
                callMode: doc.data().callMode || 'single', 
                strictSequence: doc.data().strictSequence ?? false,
                currentRound: doc.data().currentRound || 1,
                roundStatus: doc.data().roundStatus || 'active',
                roundsConfig: doc.data().roundsConfig || [],
                smokeState: doc.data().smokeState || { king: null, challenger: null, queue: [], wins: {} },
                tournamentState: doc.data().tournamentState || { matches: [] }
            }));
            setEvents(fetchedEvents);
        } catch (error) {
            console.error("Fetch error:", error);
        }
    }, [isAuthReady, db]);

    const fetchMyData = useCallback(async () => {
        if (!isAuthReady || !db || !user) return;
        try {
            const regCollectionRef = collection(db, `artifacts/${appId}/public/data/registrations`);
            const qReg = query(regCollectionRef, where("userId", "==", user.uid));
            onSnapshot(qReg, (snapshot) => {
                const myRegs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setMyRegistrations(myRegs);
            });
        } catch (error) {
            console.error("Fetch my data error:", error);
        }
    }, [isAuthReady, db, user]);

    useEffect(() => {
        if (isAuthReady) {
            fetchEvents();
            if (user) fetchMyData();
        }
    }, [isAuthReady, user, fetchEvents, fetchMyData]);

    const navigate = (page, event = null) => {
        setSelectedEvent(event);
        setCurrentPage(page);
        window.scrollTo(0, 0);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white"><Loader2 className="animate-spin mr-2" size={24} /> 正在初始化...</div>;

    // --- 頁面組件 ---

    // 1. 首頁 (EventList)
    const EventList = () => {
        const [filterRegion, setFilterRegion] = useState('');
        const [filterTime, setFilterTime] = useState('');
        const uniqueRegions = [...new Set(events.map(e => e.region).filter(r => r))];
        const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        const filteredEvents = sortedEvents.filter(event => {
            const matchesRegion = filterRegion === '' || event.region === filterRegion;
            const matchesTime = filterTime === '' || (filterTime === 'upcoming' && new Date(event.date) >= new Date()) || (filterTime === 'past' && new Date(event.date) < new Date());
            return matchesRegion && matchesTime;
        });

        const upcomingEvents = sortedEvents.filter(e => new Date(e.date) >= new Date());
        const featuredEvent = upcomingEvents.length > 0 
            ? upcomingEvents[0] 
            : (sortedEvents.length > 0 ? sortedEvents[sortedEvents.length - 1] : null);
        
        const recommendedEvents = sortedEvents
            .filter(e => e.id !== featuredEvent?.id)
            .sort(() => 0.5 - Math.random())
            .slice(0, 5);

        return (
            <div className="p-4 space-y-6 pb-24">
                <div className="flex justify-between items-center px-1">
                    <h2 className="text-xl font-bold text-white">{t('allEvents')}</h2>
                    <div className="flex gap-2 items-center">
                        <div className="flex items-center gap-2 bg-gray-800 rounded-full px-2 py-1 border border-gray-700">
                            <Globe size={12} className="text-gray-400"/>
                            <select value={lang} onChange={(e) => setLang(e.target.value)} className="bg-transparent text-[10px] text-gray-300 focus:outline-none cursor-pointer">
                                <option value="en">EN</option>
                                <option value="zh-TW">繁體</option>
                                <option value="zh-CN">简中</option>
                            </select>
                        </div>
                        <button onClick={handleLogout} className="text-xs text-gray-500 hover:text-red-400 flex items-center"><LogOut size={12} className="mr-1"/> {t('logout')}</button>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                    <select value={filterRegion} onChange={(e) => setFilterRegion(e.target.value)} className="p-2.5 rounded-xl bg-gray-800 text-white text-sm border border-gray-700 focus:ring-2 focus:ring-red-500 outline-none"><option value="">{t('allRegions')}</option>{uniqueRegions.map(r => <option key={r} value={r}>{r}</option>)}</select>
                    <select value={filterTime} onChange={(e) => setFilterTime(e.target.value)} className="p-2.5 rounded-xl bg-gray-800 text-white text-sm border border-gray-700 focus:ring-2 focus:ring-red-500 outline-none"><option value="">{t('allTimes')}</option><option value="upcoming">{t('upcoming')}</option><option value="past">{t('past')}</option></select>
                </div>

                {featuredEvent && (
                    <div onClick={() => navigate('detail', featuredEvent)} className="relative w-full h-48 bg-gray-800 rounded-3xl overflow-hidden cursor-pointer border border-gray-700 group">
                       {featuredEvent.bannerUrl ? (
                           <img src={featuredEvent.bannerUrl} alt="banner" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 transition duration-500"/>
                       ) : (
                           <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-black opacity-90"></div>
                       )}
                       <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-4">
                           <span className="bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded w-fit mb-2">HOT</span>
                           <h3 className="text-2xl font-black text-white shadow-black drop-shadow-lg">{featuredEvent.name}</h3>
                           <p className="text-gray-300 text-xs flex items-center shadow-black drop-shadow-md"><MapPin size={12} className="mr-1"/>{featuredEvent.region}</p>
                       </div>
                    </div>
                )}

                <div className="space-y-3">
                    {filteredEvents.length > 0 ? filteredEvents.map(event => (
                        <div key={event.id} onClick={() => navigate('detail', event)} className="bg-gray-800 p-4 rounded-2xl shadow-md border border-gray-700/50 active:bg-gray-700 transition cursor-pointer flex gap-3 relative overflow-hidden">
                            {event.bannerUrl && <div className="absolute inset-0 opacity-20"><img src={event.bannerUrl} className="w-full h-full object-cover" alt=""/></div>}
                            <div className="relative z-10 flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg font-semibold text-white line-clamp-1">{event.name}</h3>
                                    <div className="flex gap-1">
                                        {event.categories && event.categories.map(c => (
                                            <span key={c} className="text-[10px] bg-indigo-900 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-700">{c}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center text-sm text-gray-400 mt-2"><Calendar size={14} className="mr-1.5 text-red-400"/>{formatDateOnly(event.date)}</div>
                            </div>
                        </div>
                    )) : <div className="text-center text-gray-500 py-12 bg-gray-800/30 rounded-xl border border-dashed border-gray-700">{t('noEvents')}</div>}
                </div>
            </div>
        );
    };

    // 2. 活動詳情與報名 (EventDetail)
    const EventDetail = ({ event }) => {
        // ✅ 修復重點：所有 Hooks 必須在 return 之前呼叫，即使 event 是 null
        const [isRegistering, setIsRegistering] = useState(false);
        const [showCallAlert, setShowCallAlert] = useState(false); 
        const [showQualifyAlert, setShowQualifyAlert] = useState(false);
        const [notificationPermission, setNotificationPermission] = useState(Notification.permission);
        const [wakeLock, setWakeLock] = useState(null);
        
        // 編輯模式狀態 (使用可選鏈防止 event 為 null 時報錯)
        const [isEditing, setIsEditing] = useState(false);
        const [editForm, setEditForm] = useState({ 
            ...event, 
            categoriesStr: event?.categories ? event.categories.join(', ') : 'Standard' 
        });
        const [isSaving, setIsSaving] = useState(false);
        const [stageName, setStageName] = useState('');
        const [selectedCategory, setSelectedCategory] = useState(event?.categories?.[0] || 'Standard');

        const registration = myRegistrations.find(reg => reg.eventId === event?.id);
        const isCreator = user && event && event.creatorId === user.uid;
        const audioRef = useRef(null);
        const prevQualifiedRoundRef = useRef(registration?.qualifiedRound || 1);

        // 🛑 安全檢查：如果沒有 event 資料，顯示 Loading 畫面
        if (!event) return <div className="p-8 text-center text-white"><Loader2 className="animate-spin mx-auto mb-2"/> Loading event data...</div>;

        const getMapLink = () => event.googleMapLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.region)}`;

        useEffect(() => {
            if (registration?.called) {
                setShowCallAlert(true);
                if (navigator.vibrate) navigator.vibrate([500, 200, 500, 200, 1000]); 
                if (audioRef.current) audioRef.current.play().catch(e => console.log("Autoplay blocked:", e));
            }
        }, [registration?.called]);

        useEffect(() => {
            if (registration && registration.qualifiedRound > prevQualifiedRoundRef.current) {
                setShowQualifyAlert(true);
                if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 500, 100, 500]); 
                if (audioRef.current) audioRef.current.play().catch(e => console.log("Autoplay blocked:", e));
                prevQualifiedRoundRef.current = registration.qualifiedRound;
            }
        }, [registration?.qualifiedRound]);

        const handleRegistration = async () => {
            if (!db || !user || isRegistering) {
                if (!db) alert("Database Connection Error! Please check your API Key.");
                return;
            }
            if (!stageName.trim()) { 
                alert("請填寫舞台名稱 (Stage Name)"); 
                return; 
            }

            setIsRegistering(true);
            setSystemMessage(t('registerProcessing'));
            try {
                const regCollectionRef = collection(db, `artifacts/${appId}/public/data/registrations`);
                const q = query(regCollectionRef, where("eventId", "==", event.id), where("userId", "==", user.uid));
                const snapshot = await getDocs(q);
                if (!snapshot.empty) {
                    alert("您已經報名過此活動了！");
                    setIsRegistering(false);
                    return;
                }
                
                const newReg = {
                    eventId: event.id, userId: user.uid, 
                    stageName: stageName, category: selectedCategory,
                    queueNumber: null, 
                    laneAssignment: null,
                    isAssigned: false,
                    registrationTime: serverTimestamp(),
                    checkedIn: false, paid: false, nextRoundStatus: '', called: false,
                    qualifiedRound: 1
                };
                const docRef = await addDoc(regCollectionRef, newReg);
                setMyRegistrations(prev => [...prev, { id: docRef.id, ...newReg }]);
                navigate('registerSuccess', { ...event, temp: true });
            } catch (e) {
                console.error(e); 
                alert(`報名失敗: ${e.message}`);
                setSystemMessage(`${t('registerFail')}: ${e.message}`); 
                setIsRegistering(false);
            }
        };

        const handleUpdateEvent = async (e) => {
            e.preventDefault();
            if (!isCreator) return;
            setIsSaving(true);
            try {
                const cats = editForm.categoriesStr.split(',').map(s => s.trim()).filter(s => s);
                await updateDoc(doc(db, `artifacts/${appId}/public/data/events`, event.id), {
                    ...editForm,
                    categories: cats,
                    laneCount: parseInt(editForm.laneCount),
                    laneCapacity: parseInt(editForm.laneCapacity)
                });
                setSystemMessage(t('updateSuccess'));
                setIsEditing(false);
                fetchEvents();
            } catch (error) {
                alert("Update Failed: " + error.message);
            } finally {
                setIsSaving(false);
            }
        };

        const handleDeleteEvent = async () => {
            if (!isCreator) return;
            if (!confirm(t('deleteConfirm'))) return;
            setIsSaving(true);
            try {
                await deleteDoc(doc(db, `artifacts/${appId}/public/data/events`, event.id));
                setSystemMessage(t('deleteSuccess'));
                fetchEvents();
                navigate('browse');
            } catch (error) { alert(error.message); setIsSaving(false); }
        };

        const handleEndEvent = async () => {
             if (!isCreator) return;
             if (!confirm(t('endEventConfirm'))) return;
             try {
                 await updateDoc(doc(db, `artifacts/${appId}/public/data/events`, event.id), { roundStatus: 'closed' });
                 setSystemMessage(t('eventEnded'));
                 fetchEvents();
                 navigate('browse');
             } catch(e) { alert(e.message); }
        };
        
        const renderStatusBadge = (reg) => (
            <div className="flex space-x-2 text-sm mt-3 flex-wrap justify-center gap-2">
                <span className={`px-3 py-1 rounded-full font-semibold text-xs shadow-sm ${reg.checkedIn ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 border border-gray-600'}`}>
                    {reg.checkedIn ? `✅ ${t('statusCheckedIn')}` : `⏳ ${t('statusNotCheckedIn')}`}
                </span>
                <span className={`px-3 py-1 rounded-full font-semibold text-xs shadow-sm ${reg.paid ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 border border-gray-600'}`}>
                    {reg.paid ? `💰 ${t('statusPaid')}` : `❌ ${t('statusNotPaid')}`}
                </span>
            </div>
        );

        return (
            <div className="p-4 space-y-5 relative pb-24">
                <audio ref={audioRef} src="data:audio/mp3;base64,SUQzBAAAAAABAFRYWFgAAAASAAADbWFqb3JfYnJhbmQAbXA0MgBUWFhYAAAAEQAAA21pbm9yX3ZlcnNpb24AMABUWFhYAAAAHAAAA2NvbXBhdGlibGVfYnJhbmRzAGlzb21tcDQyAFRTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQxAAAAAAA0gAAAAABAAABAAAAAAAAAAABH//tQxAAAAAAA0gAAAAABAAABAAAAAAAAAAAB///tQxAAAAAAA0gAAAAABAAABAAAAAAAAAAAB//tQxAAAAAAA0gAAAAABAAABAAAAAAAAAAAB" /> 

                {showCallAlert && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in zoom-in duration-300">
                        <div className="bg-red-600 p-8 rounded-3xl shadow-2xl text-center max-w-xs w-full border-4 border-white animate-bounce">
                            <BellRing size={64} className="text-white mx-auto mb-4 animate-pulse" />
                            <h2 className="text-3xl font-black text-white mb-2">{t('itsYourTurn')}</h2>
                            <p className="text-lg text-white mb-6 font-bold opacity-90">{t('pleaseGoToStage')}</p>
                            <button onClick={() => { setShowCallAlert(false); if(audioRef.current) audioRef.current.pause(); }} className="bg-white text-red-600 px-8 py-3 rounded-full font-bold text-lg shadow-lg active:scale-95 transition w-full">{t('closeNotification')}</button>
                        </div>
                    </div>
                )}

                {showQualifyAlert && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in zoom-in duration-300">
                        <div className="bg-gradient-to-br from-yellow-500 to-yellow-700 p-8 rounded-3xl shadow-2xl text-center max-w-xs w-full border-4 border-yellow-300 animate-bounce">
                            <Trophy size={64} className="text-white mx-auto mb-4 animate-pulse" />
                            <h2 className="text-3xl font-black text-white mb-2">{t('qualifyAlertTitle')}</h2>
                            <p className="text-lg text-white mb-6 font-bold opacity-90">{t('qualifyAlertMsg')}</p>
                            <button onClick={() => { setShowQualifyAlert(false); if(audioRef.current) audioRef.current.pause(); }} className="bg-white text-yellow-700 px-8 py-3 rounded-full font-bold text-lg shadow-lg active:scale-95 transition w-full">{t('closeNotification')}</button>
                        </div>
                    </div>
                )}

                <button onClick={() => navigate('browse')} className="flex items-center text-gray-400 hover:text-white transition active:scale-95">
                    <ChevronLeft size={24} className="mr-1"/> <span className="font-medium">{t('backToEvents')}</span>
                </button>
                
                {/* Banner Image */}
                {event.bannerUrl && !isEditing && (
                    <div className="w-full h-48 rounded-3xl overflow-hidden mb-4 border border-gray-700">
                        <img src={event.bannerUrl} className="w-full h-full object-cover" alt="Banner" onError={(e) => e.target.style.display = 'none'} />
                    </div>
                )}

                <div className="bg-gray-800 p-6 rounded-3xl shadow-2xl border border-gray-700 relative overflow-hidden">
                    {isEditing ? (
                        <form onSubmit={handleUpdateEvent} className="space-y-4">
                            <h3 className="text-lg font-bold text-yellow-400 flex items-center"><Edit size={20} className="mr-2"/> {t('editEvent')}</h3>
                            <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full p-3 bg-gray-900 border border-gray-600 rounded-xl text-white" placeholder={t('eventNamePh')} required />
                            <input type="datetime-local" value={editForm.date} onChange={e => setEditForm({...editForm, date: e.target.value})} className="w-full p-3 bg-gray-900 border border-gray-600 rounded-xl text-white" required />
                            <input type="text" value={editForm.region} onChange={e => setEditForm({...editForm, region: e.target.value})} className="w-full p-3 bg-gray-900 border border-gray-600 rounded-xl text-white" placeholder={t('eventRegionPh')} required />
                            <input type="text" value={editForm.bannerUrl} onChange={e => setEditForm({...editForm, bannerUrl: e.target.value})} className="w-full p-3 bg-gray-900 border border-gray-600 rounded-xl text-white" placeholder={t('bannerUrlPh')} />
                            <input type="text" value={editForm.categoriesStr} onChange={e => setEditForm({...editForm, categoriesStr: e.target.value})} className="w-full p-3 bg-gray-900 border border-gray-600 rounded-xl text-white" placeholder={t('categoriesPh')} />
                            <textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} className="w-full p-3 bg-gray-900 border border-gray-600 rounded-xl text-white" rows="4" />
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-3 bg-gray-700 text-white rounded-xl">{t('cancelEdit')}</button>
                                <button type="submit" disabled={isSaving} className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl flex justify-center items-center">{isSaving ? <Loader2 className="animate-spin"/> : t('saveChanges')}</button>
                            </div>
                            <button type="button" onClick={handleDeleteEvent} className="w-full py-3 border border-red-600 text-red-500 font-bold rounded-xl mt-4">{t('deleteEvent')}</button>
                        </form>
                    ) : (
                        <>
                            <div className="flex justify-between items-start relative z-10">
                                <h2 className="text-3xl font-black text-white mb-2">{event.name}</h2>
                                {isCreator && <button onClick={() => setIsEditing(true)} className="bg-gray-700 text-gray-300 p-2 rounded-full hover:bg-gray-600"><Edit size={16} /></button>}
                            </div>
                            <div className="flex gap-2 mb-4 relative z-10 flex-wrap">
                                {event.categories && event.categories.map(c => (
                                    <span key={c} className="bg-indigo-900 text-indigo-300 px-2 py-1 rounded text-xs font-bold border border-indigo-700">{c}</span>
                                ))}
                            </div>

                            <div className="space-y-3 relative z-10">
                                <p className="text-gray-300 flex items-center"><Calendar size={18} className="mr-3 text-red-500"/><span className="text-sm font-medium">{formatDateTime(event.date)}</span></p>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start text-gray-300"><MapPin size={18} className="mr-3 text-red-500 mt-0.5"/><span className="text-sm font-medium">{event.region}</span></div>
                                    <a href={getMapLink()} target="_blank" rel="noopener noreferrer" className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-1.5 rounded-full transition flex items-center">{t('openMap')} <ExternalLink size={10} className="ml-1"/></a>
                                </div>
                                <div className="pt-4 border-t border-gray-700 mt-4"><p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">{event.description}</p></div>
                                
                                {event.roundStatus === 'closed' && <div className="mt-4 p-3 bg-red-900/30 text-red-400 border border-red-800 rounded text-center font-bold">{t('eventEnded')}</div>}
                            </div>
                        </>
                    )}
                </div>

                {(event.paymentInfo || event.paymentQrCodeUrl) && !isEditing && (
                    <div className="bg-gray-800 p-5 rounded-3xl border border-gray-700">
                        <h3 className="text-lg font-bold text-white flex items-center mb-3"><CreditCard size={20} className="mr-2 text-yellow-500"/> {t('paymentInfoTitle')}</h3>
                        {event.paymentInfo && <div className="bg-gray-900 p-4 rounded-xl text-sm text-gray-300 font-mono leading-relaxed whitespace-pre-wrap">{event.paymentInfo}</div>}
                        {event.paymentQrCodeUrl && (
                            <div className="mt-4 flex flex-col items-center">
                                <p className="text-xs text-gray-500 mb-2">{t('qrCode')}</p>
                                <div className="p-2 bg-white rounded-xl"><img src={event.paymentQrCodeUrl} alt="收款碼" className="w-40 h-40 object-contain" onError={(e) => {e.target.style.display='none'}} /></div>
                            </div>
                        )}
                    </div>
                )}
                
                {!isEditing && event.roundStatus !== 'closed' && (
                    <div className="fixed bottom-20 left-0 right-0 px-4 md:absolute md:bottom-auto md:px-0 z-20">
                        {isCreator ? (
                            <div className="space-y-2">
                                <button 
                                    onClick={() => navigate('manage', event)} 
                                    className="w-full max-w-md mx-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-xl transition transform active:scale-95 flex items-center justify-center text-lg"
                                >
                                    <Settings size={24} className="mr-2"/> {t('manageEventBtn')}
                                </button>
                                <button onClick={handleEndEvent} className="w-full bg-red-900/50 hover:bg-red-900 text-red-300 font-bold py-3 rounded-xl border border-red-800 flex items-center justify-center text-sm">
                                    <XCircle size={16} className="mr-2"/> {t('endEventBtn')}
                                </button>
                            </div>
                        ) : !registration ? (
                            <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700 shadow-xl space-y-3">
                                <input type="text" placeholder={t('stageNamePh')} value={stageName} onChange={e => setStageName(e.target.value)} className="w-full p-3 bg-gray-900 text-white rounded-xl border border-gray-600 outline-none"/>
                                {event.categories && event.categories.length > 0 && (
                                    <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="w-full p-3 bg-gray-900 text-white rounded-xl border border-gray-600 outline-none appearance-none">
                                        {event.categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                )}
                                <button onClick={handleRegistration} disabled={isRegistering} className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-bold py-4 rounded-xl flex items-center justify-center text-lg">
                                    {isRegistering ? <Loader2 className="animate-spin mr-2"/> : <Users size={24} className="mr-2"/>} {t('randomRegisterBtn')}
                                </button>
                            </div>
                        ) : (
                            <div className="bg-gray-800/90 backdrop-blur-lg p-4 rounded-2xl border border-green-600 shadow-2xl text-center max-w-md mx-auto relative overflow-hidden">
                                <p className="text-green-400 text-xs uppercase tracking-wider mb-1">{t('registered')}</p>
                                <p className="text-white my-1 text-sm">Stage Name: <span className="font-bold text-yellow-400">{registration.stageName}</span></p>
                                <p className="text-gray-400 text-xs mb-2">{t('category')}: {registration.category}</p>
                                {registration.laneAssignment ? (
                                    <p className="text-2xl font-black text-white">{registration.laneAssignment}-{formatNumber(registration.queueNumber)}</p>
                                ) : (
                                    <p className="text-lg text-yellow-400 font-bold animate-pulse my-2">{t('waitingForDraw')}</p>
                                )}
                                {renderStatusBadge(registration)}
                            </div>
                        )}
                    </div>
                )}
                
                {/* 底部墊高 */}
                <div className="h-32 md:hidden"></div>

                {systemMessage && <p className="text-sm text-yellow-400 text-center bg-black/50 p-2 rounded-lg backdrop-blur">{systemMessage}</p>}
            </div>
        );
    };

    // 3. 報名成功畫面 (RegistrationSuccess) ... (保持不變)
    const RegistrationSuccess = ({ event }) => (
        <div className="p-8 flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8">
            <div className="relative"><div className="absolute inset-0 bg-green-500/30 blur-3xl rounded-full"></div><CheckCircle size={100} className="text-green-500 relative z-10 animate-bounce"/></div>
            <div><h2 className="text-4xl font-black text-white mb-2">{t('congrats')}</h2><p className="text-gray-400">{t('successMsg')} <span className="text-white font-bold">{event.name}</span></p></div>
            <div className="bg-gray-800 p-8 rounded-3xl shadow-2xl w-full border border-gray-700">
                {event.laneAssignment ? (
                    <>
                        <p className="text-gray-400 text-sm uppercase tracking-widest mb-2">{t('yourNumber')}</p>
                        <div className="flex justify-center items-baseline text-white font-black tracking-widest">
                            <span className="text-7xl text-indigo-400">{event.laneAssignment}</span>
                            <span className="text-5xl mx-2">-</span>
                            <span className="text-8xl">{formatNumber(event.queueNumber)}</span>
                        </div>
                    </>
                ) : (
                    <div className="py-4">
                        <div className="text-yellow-400 text-xl font-bold mb-2">{t('waitingForDraw')}</div>
                        <p className="text-gray-400 text-sm">請先完成報到手續，主辦單位將在報名截止後進行抽籤分組。</p>
                    </div>
                )}
                <div className="mt-6 pt-6 border-t border-gray-700/50"><p className="text-sm text-yellow-500 font-medium flex items-center justify-center"><CreditCard size={14} className="mr-2"/> {t('rememberPayment')}</p></div>
            </div>
            <button onClick={() => navigate('browse')} className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 rounded-2xl transition">{t('backToHome')}</button>
        </div>
    );

    // 4. 創建活動頁面 (CreateEventForm) ... (保持不變)
    const CreateEventForm = () => {
        const [formData, setFormData] = useState({
            name: '', date: '', region: '', description: '', 
            laneCount: 4, laneCapacity: 50, 
            googleMapLink: '', bannerUrl: '', paymentInfo: '', paymentQrCodeUrl: '',
            initialFormat: 'standard'
        });
        const [categories, setCategories] = useState(['Standard']);
        const [catInput, setCatInput] = useState('');
        const [rounds, setRounds] = useState([{ round: 2, qualifiers: 64 }]); 
        const [isSubmitting, setIsSubmitting] = useState(false);

        const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value });
        const handleLaneLetterChange = (e) => { const letter = e.target.value; const count = letter.charCodeAt(0) - 64; setFormData({ ...formData, laneCount: count }); };
        const addRoundConfig = () => { setRounds([...rounds, { round: rounds.length + 2, qualifiers: 32 }]); };
        const updateRoundConfig = (index, key, value) => { const newRounds = [...rounds]; newRounds[index][key] = parseInt(value) || 0; setRounds(newRounds); };
        const removeRoundConfig = (index) => { setRounds(rounds.filter((_, i) => i !== index)); };
        const alphabetOptions = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

        const handleSubmit = async (e) => {
            e.preventDefault();
            if (!db || !user || isSubmitting) {
                 if (!db) alert("DB Error");
                 return;
            }
            setIsSubmitting(true);
            try {
                await addDoc(collection(db, `artifacts/${appId}/public/data/events`), { 
                    ...formData, 
                    categories: categories.length > 0 ? categories : ['Standard'],
                    creatorId: user.uid, timestamp: serverTimestamp(), status: 'active', callMode: 'single', strictSequence: false,
                    roundsConfig: rounds, currentRound: 1, roundStatus: 'active'
                });
                setSystemMessage(t('createSuccess')); setIsSubmitting(false); fetchEvents(); navigate('browse');
            } catch (error) {
                setSystemMessage(`${t('createFail')}: ${error.message}`); setIsSubmitting(false);
            }
        };

        const addCategory = () => {
            if(catInput.trim()) {
                setCategories([...categories, catInput.trim()]);
                setCatInput('');
            }
        };

        const removeCategory = (index) => {
            setCategories(categories.filter((_, i) => i !== index));
        };

        return (
            <div className="p-4 pb-24 space-y-4">
                <button onClick={() => navigate('browse')} className="flex items-center text-gray-400 hover:text-white transition"><ChevronLeft size={24}/> {t('backToHome')}</button>
                <h2 className="text-3xl font-bold text-white mb-6">{t('createEventTitle')}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-gray-800 p-5 rounded-3xl border border-gray-700 shadow-lg space-y-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">{t('basicInfo')}</h3>
                        <input type="text" name="name" placeholder={t('eventNamePh')} value={formData.name} onChange={handleChange} required className="w-full p-4 rounded-xl bg-gray-900 text-white border border-gray-700 focus:border-red-500 outline-none"/>
                        <div><label className="block text-gray-500 text-xs mb-2">{t('eventFormatLabel')}</label><select name="initialFormat" value={formData.initialFormat} onChange={handleChange} className="w-full p-4 rounded-xl bg-gray-900 text-white border border-gray-700 focus:border-red-500 outline-none appearance-none"><option value="standard">{t('formatStandard')}</option><option value="7tosmoke">{t('format7toSmoke')}</option><option value="tournament">{t('formatTournament')}</option></select></div>
                        <input type="datetime-local" name="date" value={formData.date} onChange={handleChange} required className="w-full p-4 rounded-xl bg-gray-900 text-white border border-gray-700 focus:border-red-500 outline-none"/>
                        <input type="text" name="region" placeholder={t('eventRegionPh')} value={formData.region} onChange={handleChange} required className="w-full p-4 rounded-xl bg-gray-900 text-white border border-gray-700 focus:border-red-500 outline-none"/>
                        <input type="text" name="bannerUrl" placeholder={t('bannerUrlPh')} value={formData.bannerUrl} onChange={handleChange} className="w-full p-4 rounded-xl bg-gray-900 text-white border border-gray-700 focus:border-red-500 outline-none"/>
                        <textarea name="description" placeholder={t('descPh')} value={formData.description} onChange={handleChange} rows="3" className="w-full p-4 rounded-xl bg-gray-900 text-white border border-gray-700 focus:border-red-500 outline-none"/>
                    </div>
                    <div className="bg-gray-800 p-5 rounded-3xl border border-gray-700 shadow-lg space-y-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">{t('compSettingsTitle')}</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-gray-500 text-xs mb-2">{t('laneCountPh')}</label><select value={getLaneName(formData.laneCount - 1)} onChange={handleLaneLetterChange} className="w-full p-4 rounded-xl bg-gray-900 text-white border border-gray-700 focus:border-red-500 outline-none transition appearance-none">{alphabetOptions.map((letter, idx) => (<option key={letter} value={letter}>{letter} ({idx + 1} Lane{idx > 0 ? 's' : ''})</option>))}</select></div>
                            <div><label className="block text-gray-500 text-xs mb-2">{t('laneCapacityPh')}</label><input type="number" name="laneCapacity" placeholder="50" value={formData.laneCapacity} onChange={handleChange} min="1" className="w-full p-4 rounded-xl bg-gray-900 text-white border border-gray-700 focus:border-red-500 outline-none"/></div>
                        </div>
                        
                        {/* Tag Input System */}
                        <div>
                            <label className="block text-gray-500 text-xs mb-2">{t('categoriesLabel')}</label>
                            <div className="flex gap-2 mb-2">
                                <input type="text" value={catInput} onChange={e => setCatInput(e.target.value)} className="flex-1 p-3 bg-gray-900 rounded-xl border border-gray-600 text-white" placeholder={t('categoryPh')} />
                                <button type="button" onClick={addCategory} className="bg-indigo-600 px-4 rounded-xl text-white"><Plus /></button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {categories.map((cat, i) => (
                                    <span key={i} className="bg-indigo-900 text-indigo-300 px-2 py-1 rounded-full text-sm flex items-center">
                                        {cat} <X size={14} className="ml-1 cursor-pointer hover:text-white" onClick={() => removeCategory(i)}/>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-800 p-5 rounded-3xl border border-gray-700 shadow-lg space-y-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">{t('paymentSettingsTitle')}</h3>
                        <textarea name="paymentInfo" placeholder={t('paymentDescPh')} value={formData.paymentInfo} onChange={handleChange} rows="3" className="w-full p-4 rounded-xl bg-gray-900 text-white border border-gray-700 focus:border-red-500 outline-none"/>
                        <input type="text" name="paymentQrCodeUrl" placeholder={t('paymentQrPh')} value={formData.paymentQrCodeUrl} onChange={handleChange} className="w-full p-4 rounded-xl bg-gray-900 text-white border border-gray-700 focus:border-red-500 outline-none"/>
                    </div>
                    <button type="submit" disabled={isSubmitting} className="w-full bg-red-600 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition flex items-center justify-center text-lg">{isSubmitting ? <Loader2 className="animate-spin" size={24} /> : t('publishBtn')}</button>
                </form>
            </div>
        );
    };

    const MyEvents = () => {
        const myJoinedEvents = events.filter(e => myRegistrations.some(r => r.eventId === e.id));
        return (
             <div className="p-4 space-y-4 pb-24">
                <h2 className="text-2xl font-bold text-white mb-4">{t('myEventsTitle')}</h2>
                {myJoinedEvents.length === 0 ? (
                    <div className="text-center text-gray-500 py-12 border border-dashed border-gray-700 rounded-xl">{t('noJoinedEvents')}</div>
                ) : (
                    <div className="space-y-3">
                        {myJoinedEvents.map(event => {
                             const reg = myRegistrations.find(r => r.eventId === event.id);
                             if (!reg) return null;
                             return (
                                <div key={event.id} onClick={() => navigate('detail', event)} className="bg-gray-800 p-4 rounded-2xl border border-gray-700 cursor-pointer active:bg-gray-700 transition">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-bold text-white text-lg">{event.name}</h3>
                                        <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded">{t('registered')}</span>
                                    </div>
                                    <p className="text-sm text-gray-400 flex items-center mb-3"><Calendar size={14} className="mr-2"/> {formatDateTime(event.date)}</p>
                                    <div className="flex items-center justify-between bg-gray-900/50 p-2 rounded-lg">
                                        <span className="text-xs text-gray-500">{t('yourNumber')}</span>
                                        {reg.laneAssignment ? (
                                            <span className="text-xl font-black text-indigo-400">{reg.laneAssignment}-{formatNumber(reg.queueNumber)}</span>
                                        ) : (
                                            <span className="text-xs text-yellow-400 animate-pulse">等待抽籤</span>
                                        )}
                                    </div>
                                </div>
                             );
                        })}
                    </div>
                )}
             </div>
        );
    };

    const ManagementList = () => {
        const myHostedEvents = events.filter(e => e.creatorId === user.uid);
        return (
             <div className="p-4 space-y-4 pb-24">
                <h2 className="text-2xl font-bold text-white mb-4">{t('manageListTitle')}</h2>
                {myHostedEvents.length === 0 ? (
                    <div className="text-center text-gray-500 py-12 border border-dashed border-gray-700 rounded-xl">{t('noHostedEvents')}</div>
                ) : (
                    <div className="space-y-3">
                        {myHostedEvents.map(event => (
                            <div key={event.id} className="bg-gray-800 p-4 rounded-2xl border-l-4 border-indigo-500 shadow-lg">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-white text-lg">{event.name}</h3>
                                        <p className="text-sm text-gray-400 mt-1">{formatDateTime(event.date)}</p>
                                    </div>
                                </div>
                                <button onClick={() => navigate('manage', event)} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center transition">
                                    <Settings size={16} className="mr-2"/> {t('enterManage')}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
             </div>
        );
    };

    // 7. Event Manager (後台) - 新增 Categories 切換與列印
    const EventManager = ({ event }) => {
        // ✅ 關鍵修復：安全初始化 Hook，防止 event 為 null 時當機
        const [currentCategory, setCurrentCategory] = useState(event?.categories?.[0] || 'Standard');
        
        if (!event) return <div className="p-8 text-center">Loading...</div>;

        const [activeTab, setActiveTab] = useState('checkin'); 
        const [allRegistrations, setAllRegistrations] = useState([]);
        const [callStatus, setCallStatus] = useState({ displayNumbers: [] });
        const [isProcessing, setIsProcessing] = useState(false);
        const [isPrintMode, setIsPrintMode] = useState(false);
        
        const REG_COL_PATH = `artifacts/${appId}/public/data/registrations`;
        const STATUS_DOC_PATH = `artifacts/${appId}/public/data/call_status/${event.id}`;
        
        useEffect(() => {
            if (!db) return;
            const unsubscribeStatus = onSnapshot(doc(db, STATUS_DOC_PATH), (docSnap) => {
                if (docSnap.exists()) setCallStatus(docSnap.data());
            });
            const q = query(collection(db, REG_COL_PATH), where("eventId", "==", event.id));
            const unsubscribeRegs = onSnapshot(q, (snapshot) => {
                setAllRegistrations(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
            });
            return () => { unsubscribeStatus(); unsubscribeRegs(); };
        }, [db, event.id]);

        const categoryRegistrations = allRegistrations.filter(r => (r.category || 'Standard') === currentCategory);

        const handleCallNext = async () => {
            if (!db || isProcessing) return;
            setIsProcessing(true); setSystemMessage(t('calculatingNext'));
            try {
                const availableRegs = categoryRegistrations.filter(r => r.checkedIn && !r.called && r.laneAssignment).sort((a,b) => a.queueNumber - b.queueNumber);
                if (availableRegs.length === 0) { setSystemMessage(t('noMorePlayers')); setIsProcessing(false); return; }
                
                const target = availableRegs[0];
                const nextDisplayNumbers = [target.queueNumber];
                
                const statusRef = doc(db, STATUS_DOC_PATH);
                await setDoc(statusRef, { displayNumbers: nextDisplayNumbers, updatedAt: serverTimestamp() }, { merge: true });
                await updateDoc(doc(db, REG_COL_PATH, target.id), { called: true });
                setSystemMessage(`${t('callSuccess')}: ${target.queueNumber}`);
            } catch (e) { console.error(e); } finally { setIsProcessing(false); }
        };

        const handleGenerateDraw = async () => {
            if (!confirm(t('drawWarning'))) return;
            setIsProcessing(true); setSystemMessage(t('drawing'));
            try {
                const eligiblePlayers = categoryRegistrations.filter(r => r.checkedIn && r.paid);
                if (eligiblePlayers.length === 0) throw new Error("No eligible players");
                const shuffled = [...eligiblePlayers].sort(() => 0.5 - Math.random());
                const batch = writeBatch(db);
                const laneCount = event.laneCount || 4;
                shuffled.forEach((reg, index) => {
                    const laneIndex = index % laneCount;
                    const laneChar = getLaneName(laneIndex);
                    const number = Math.floor(index / laneCount) + 1;
                    batch.update(doc(db, REG_COL_PATH, reg.id), { laneAssignment: laneChar, queueNumber: number, isAssigned: true });
                });
                await batch.commit();
                setSystemMessage(t('drawSuccess'));
            } catch (e) { setSystemMessage(e.message); } finally { setIsProcessing(false); }
        };

        const handlePrint = () => {
            setIsPrintMode(true);
            setTimeout(() => { window.print(); setIsPrintMode(false); }, 500);
        };

        if (isPrintMode) {
            return (
                <div className="p-8 bg-white text-black min-h-screen">
                    <h1 className="text-2xl font-bold mb-4 text-center">{event.name} - {t('printTitle')}</h1>
                    <h2 className="text-xl mb-4 text-center">Category: {currentCategory}</h2>
                    <table className="w-full border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border p-2">Lane-Num</th>
                                <th className="border p-2">Stage Name</th>
                                <th className="border p-2">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categoryRegistrations.filter(r => r.laneAssignment).sort((a,b) => a.queueNumber - b.queueNumber).map(r => (
                                <tr key={r.id}>
                                    <td className="border p-2 text-center font-bold">{r.laneAssignment}-{r.queueNumber}</td>
                                    <td className="border p-2">{r.stageName}</td>
                                    <td className="border p-2 text-center">{r.checkedIn ? 'Checked' : ''}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }

        return (
            <div className="p-4 pb-24 space-y-4">
                <div className="flex justify-between items-center">
                    <button onClick={() => navigate('detail', event)} className="flex items-center text-gray-400 hover:text-white"><ChevronLeft size={24}/> {t('backToEvents')}</button>
                    <div className="flex gap-2">
                         <button onClick={handlePrint} className="bg-gray-700 p-2 rounded hover:bg-gray-600"><Printer size={16}/></button>
                    </div>
                </div>
                
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                    <label className="text-xs text-gray-400 block mb-1">{t('category')}</label>
                    <select value={currentCategory} onChange={e => setCurrentCategory(e.target.value)} className="w-full p-2 bg-gray-900 text-white rounded border border-gray-600">
                        {event.categories && event.categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                <div className="flex bg-gray-800 rounded-xl overflow-hidden shadow-lg p-1">
                    {[ {k:'checkin',l:t('tabCheckIn'),i:ListChecks}, {k:'assignment',l:t('tabAssignment'),i:Shuffle}, {k:'calling',l:t('tabCalling'),i:Megaphone} ].map(tb => (
                        <button key={tb.k} onClick={() => setActiveTab(tb.k)} className={`flex-1 py-3 text-xs font-bold rounded-lg flex flex-col justify-center items-center gap-1 transition ${activeTab===tb.k?'bg-gray-700 text-white':'text-gray-500'}`}><tb.i size={18}/>{tb.l}</button>
                    ))}
                </div>

                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                    {activeTab === 'calling' && (
                        <div className="text-center">
                            <p className="text-gray-400 mb-2">{t('currentCall')} ({currentCategory})</p>
                            <div className="text-6xl font-black text-white mb-4">{callStatus.displayNumbers?.[0] || '--'}</div>
                            <button onClick={handleCallNext} disabled={isProcessing} className="w-full bg-green-600 py-4 rounded-xl font-bold text-white flex justify-center items-center">{isProcessing ? <Loader2 className="animate-spin"/> : t('callNext')}</button>
                        </div>
                    )}
                    {activeTab === 'assignment' && (
                        <div className="text-center">
                            <Dices size={40} className="mx-auto text-indigo-400 mb-4"/>
                            <p className="text-gray-400 mb-4">{t('drawStats').replace('{n}', categoryRegistrations.filter(r=>r.checkedIn && r.paid).length)}</p>
                            <button onClick={handleGenerateDraw} disabled={isProcessing} className="w-full bg-indigo-600 py-4 rounded-xl font-bold text-white flex justify-center items-center">{isProcessing ? <Loader2 className="animate-spin"/> : t('generateDrawBtn')}</button>
                        </div>
                    )}
                    {activeTab === 'checkin' && (
                        <div className="space-y-2">
                            {categoryRegistrations.map(reg => (
                                <div key={reg.id} className="flex justify-between items-center bg-gray-800 p-3 rounded border border-gray-700">
                                    <div>
                                        <div className="text-white font-bold">{reg.stageName || 'Unknown'}</div>
                                        <div className="text-xs text-gray-500">{reg.laneAssignment ? `${reg.laneAssignment}-${reg.queueNumber}` : 'No Num'}</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => updateDoc(doc(db, REG_COL_PATH, reg.id), { paid: !reg.paid })} className={`px-2 py-1 rounded text-xs ${reg.paid ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-gray-400'}`}>$</button>
                                        <button onClick={() => updateDoc(doc(db, REG_COL_PATH, reg.id), { checkedIn: !reg.checkedIn })} className={`px-2 py-1 rounded text-xs ${reg.checkedIn ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'}`}>In</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderPage = () => {
        if (currentPage === 'detail') return <EventDetail event={selectedEvent} />;
        if (currentPage === 'registerSuccess') return <RegistrationSuccess event={selectedEvent} />;
        if (currentPage === 'create') return <CreateEventForm />;
        if (currentPage === 'manage') return <EventManager event={selectedEvent} />;
        if (currentPage === 'my_events') return <MyEvents />;
        if (currentPage === 'manage_list') return <ManagementList />;
        return <EventList />;
    };

    const BottomNav = () => (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-md border-t border-gray-800 flex justify-around items-center p-2 pb-safe z-50 md:max-w-md md:mx-auto md:rounded-t-2xl">
            {[{n:t('navHome'),i:Grid,p:'browse'}, {n:t('navCreate'),i:PlusCircle,p:'create'}, {n:t('navMy'),i:UserIcon,p:'my_events'}, {n:t('navManage'),i:ClipboardList,p:'manage_list'}].map(i=>(
                <button key={i.p} onClick={()=>navigate(i.p)} className={`flex flex-col items-center justify-center p-2 w-full transition active:scale-90 ${currentPage===i.p || (currentPage==='detail' && i.p==='browse') ?'text-red-500':'text-gray-500 hover:text-gray-300'}`}><i.i size={26} strokeWidth={currentPage===i.p ? 2.5 : 2}/><span className="text-[10px] mt-1 font-medium">{i.n}</span></button>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-black flex flex-col items-center text-sans">
            <div id="app" className="w-full max-w-md min-h-screen flex flex-col bg-gray-900 text-white shadow-2xl relative">
                <header className="bg-gray-900/90 backdrop-blur-md text-white p-4 flex justify-between items-center sticky top-0 z-40 border-b border-gray-800"><h1 className="text-xl font-black tracking-tight flex items-center"><span className="text-red-600 mr-1 text-2xl">⚡</span> {t('appTitle')}</h1></header>
                <main className="flex-grow overflow-y-auto overflow-x-hidden relative">{renderPage()}</main>
                <BottomNav />
            </div>
        </div>
    );
};

export default App;