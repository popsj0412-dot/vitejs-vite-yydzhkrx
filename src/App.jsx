import React, { useState, useEffect, useCallback, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, onSnapshot, runTransaction, collection, query, where, getDocs, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { MapPin, Calendar, Users, PlusCircle, LayoutList, CheckCircle, ChevronLeft, Loader2, Megaphone, Settings, ListChecks, Shuffle, TrendingUp, XCircle, DollarSign, ExternalLink, CreditCard, Grid, Play, SkipForward, Hash, Globe, BellRing, Search, Star, Heart, Trophy, AlertCircle, Trash2, Sparkles, Flag, Crown, Swords, Timer, ClipboardList, User, LogOut, Mail, Lock, KeyRound, Copy, Bell, Zap } from 'lucide-react';

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

const initialAuthToken = null;

// --- 翻譯字典 ---
const translations = {
    'zh-TW': {
        appTitle: "舞蹈活動平台",
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
        discoverEvents: "探索",
        createEventTitle: "發佈活動 📝",
        manageTitle: "賽事管理",
        featured: "精選活動",
        recommended: "熱門賽事",
        allEvents: "所有活動",
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
        randomRegisterBtn: "隨機抽取 賽道/號碼 報名",
        processing: "處理中...",
        registered: "已報名！",
        yourNumber: "您的賽道與號碼",
        manageEventBtn: "進入賽事管理",
        statusCheckedIn: "已報到",
        statusNotCheckedIn: "未報到",
        statusPaid: "已付費",
        statusNotPaid: "未付費",
        lane: "賽道",
        congrats: "報名成功！",
        successMsg: "您參加",
        rememberPayment: "請記得查看繳費資訊。",
        basicInfo: "基本資訊",
        eventNamePh: "活動名稱",
        eventRegionPh: "地點/地區",
        mapLinkPh: "📍 地圖連結 (可選)",
        descPh: "活動描述...",
        eventFormatLabel: "主要賽制",
        formatStandard: "標準淘汰賽 (Standard)",
        format7toSmoke: "7 to Smoke (車輪戰)",
        formatTournament: "Tournament (1 on 1)",
        compSettingsTitle: "賽事與賽道規格",
        laneCountPh: "賽道數量 (選擇最後賽道字母)",
        laneCapacityPh: "每賽道人數 / 號碼上限 (1~N)",
        laneHint: "總賽道: A ~ {lastChar} | 總名額: {total} 人",
        paymentSettingsTitle: "繳費設定",
        paymentDescPh: "繳費說明...",
        paymentQrPh: "🔗 收款碼圖片連結 (可選)",
        roundConfigTitle: "賽制輪次規劃",
        roundConfigDesc: "設定每一輪預計晉級的人數",
        addRound: "新增輪次",
        roundLabel: "輪次",
        qualifiersLabel: "晉級人數",
        publishBtn: "發佈",
        tabCalling: "叫號",
        tabCheckIn: "報到",
        tabProgression: "晉級",
        currentCall: "目前舞台 (On Stage)",
        callStrategy: "叫號設定",
        mode: "模式",
        modeSingle: "單人",
        modeAllLanes: "賽道齊發",
        emptyStrategy: "空號策略",
        skipEmpty: "跳過 (智慧)",
        keepEmpty: "保留 (嚴格)",
        callNext: "叫下一位",
        callNextBatch: "叫下一批",
        randomAssignTitle: "隨機分道",
        qualifiedPlayers: "符合資格",
        startDraw: "開始抽籤",
        drawing: "抽籤中...",
        drawWarning: "抽籤前請確認賽道設定！",
        navHome: "首頁",
        navCreate: "發佈",
        navMy: "我的",
        navManage: "管理",
        myEventsTitle: "我的參賽活動 🕺",
        manageListTitle: "我主辦的活動 🛠️",
        noJoinedEvents: "尚未報名任何活動",
        noHostedEvents: "尚未創建任何活動",
        enterManage: "進入後台",
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
        searchPlaceholder: "輸入號碼搜尋...",
        statsTotal: "總數",
        statsCheckedIn: "已到",
        statsPaid: "已付",
        noResult: "找不到此號碼",
        progressionTitle: "晉級管理",
        currentRound: "當前輪次",
        nextRoundTarget: "下一輪目標人數",
        advanceManual: "手動輸入晉級 (賽道+號碼)",
        advanceManualPh: "例如: A5, B12, A10 (不分大小寫)",
        advanceRandom: "隨機抽選晉級",
        advanceRandomCountPh: "晉級人數",
        advanceBtn: "確認晉級",
        endEventBtn: "結束活動",
        advancing: "晉級處理中...",
        advanceSuccess: "✅ 晉級名單已更新！",
        advanceFail: "更新失敗",
        qualifyAlertTitle: "恭喜晉級！",
        qualifyAlertMsg: "你已成功晉級到下一輪！",
        roundText: "第 {n} 輪",
        qualifiedStatus: "晉級",
        eliminatedStatus: "止步",
        specialModesTitle: "特殊賽制 (晉級後)",
        start7toSmoke: "啟動 7 to Smoke",
        startTournament: "啟動 Tournament (1 on 1)",
        smokeTitle: "7 to Smoke",
        smokeKing: "King (擂台主)",
        smokeChallenger: "Challenger (挑戰者)",
        smokeInLine: "排隊中",
        smokeWins: "勝場",
        smokeWinBtn: "勝",
        smokeReq: "需正好 8 人晉級",
        tournTitle: "Tournament 對戰表",
        tournMatch: "對戰組合",
        tournWinnerBtn: "獲勝",
        tournReq: "需偶數人 (2, 4, 8, 16...)",
        resetMode: "重置為標準叫號",
        modeActive: "進行中",
        // 管理密碼相關
        adminCodeLabel: "主辦人管理密碼",
        adminCodeHint: "請記住此密碼！",
        claimAdminBtn: "我是主辦人",
        enterAdminCode: "輸入管理密碼",
        wrongCode: "密碼錯誤",
        adminAccessGranted: "✅ 管理權限已解鎖！",
        copy: "複製",
        copied: "已複製",
        // 新增通知相關
        enableNotify: "開啟通知",
        notifyEnabled: "通知已開啟",
        notifyHint: "請允許通知權限以便接收叫號",
        wakelockActive: "螢幕恆亮中",
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
        featured: "Featured",
        recommended: "Trending",
        allEvents: "All Events",
        allRegions: "All Regions",
        allTimes: "All Times",
        upcoming: "Upcoming",
        past: "Past",
        noEvents: "No events found.",
        backToHome: "Back",
        backToEvents: "Back",
        time: "Time",
        location: "Location",
        description: "Desc",
        numberRange: "Range",
        randomDraw: "Random",
        openMap: "Map",
        paymentInfoTitle: "Payment",
        qrCode: "QR Code",
        randomRegisterBtn: "Register (Random Lane/Num)",
        processing: "Processing...",
        registered: "Joined!",
        yourNumber: "Your #",
        manageEventBtn: "Dashboard",
        statusCheckedIn: "In",
        statusNotCheckedIn: "Out",
        statusPaid: "Paid",
        statusNotPaid: "Unpaid",
        lane: "Lane",
        congrats: "Success!",
        successMsg: "Joined",
        rememberPayment: "Check payment info.",
        createEventTitle: "New Event 📝",
        basicInfo: "Info",
        eventNamePh: "Name",
        eventRegionPh: "Location",
        mapLinkPh: "📍 Map Link",
        descPh: "Description...",
        compSettingsTitle: "Track Config",
        laneCountPh: "Lanes (A, B...)",
        laneCapacityPh: "Max Players per Lane",
        laneHint: "Total Capacity: {total}",
        eventFormatLabel: "Main Format",
        formatStandard: "Standard",
        format7toSmoke: "7 to Smoke",
        formatTournament: "Tournament",
        paymentSettingsTitle: "Payment",
        paymentDescPh: "Instructions...",
        paymentQrPh: "🔗 QR URL",
        roundConfigTitle: "Rounds Config",
        roundConfigDesc: "Set qualifiers per round",
        addRound: "Add Round",
        roundLabel: "Round",
        qualifiersLabel: "Qualifiers",
        publishBtn: "Publish",
        manageTitle: "Manage",
        tabCalling: "Call",
        tabCheckIn: "CheckIn",
        tabProgression: "Rounds",
        currentCall: "On Stage",
        callStrategy: "Strategy",
        mode: "Mode",
        modeSingle: "Single",
        modeAllLanes: "All",
        emptyStrategy: "Empty",
        skipEmpty: "Skip",
        keepEmpty: "Strict",
        callNext: "Next",
        callNextBatch: "Next Batch",
        randomAssignTitle: "Assign Lanes",
        qualifiedPlayers: "Qualified",
        startDraw: "Draw",
        drawing: "Drawing...",
        drawWarning: "Check lane settings!",
        navHome: "Home",
        navCreate: "Create",
        navMy: "My Events",
        navManage: "Manage",
        myEventsTitle: "My Registrations 🕺",
        manageListTitle: "Events I Host 🛠️",
        noJoinedEvents: "No joined events yet",
        noHostedEvents: "No hosted events yet",
        enterManage: "Dashboard",
        createSuccess: "✅ Created!",
        createFail: "Failed",
        registerProcessing: "Registering...",
        registerFail: "Failed",
        drawSuccess: "✅ Done!",
        callSuccess: "Called",
        callFail: "Failed",
        calculatingNext: "Calculating...",
        noMorePlayers: "No players.",
        allLanesEmpty: "Empty.",
        called: "Called",
        itsYourTurn: "Your Turn!",
        pleaseGoToStage: "Go to stage!",
        closeNotification: "OK",
        searchPlaceholder: "Search #...",
        statsTotal: "Total",
        statsCheckedIn: "In",
        statsPaid: "Paid",
        noResult: "No match",
        progressionTitle: "Progression",
        currentRound: "Current Round",
        nextRoundTarget: "Next Round Target",
        advanceManual: "Manual Input (Lane+Num)",
        advanceManualPh: "e.g. A5, B12",
        advanceRandom: "Random Advance",
        advanceRandomCountPh: "Count",
        advanceBtn: "Confirm",
        endEventBtn: "End Event",
        advancing: "Processing...",
        advanceSuccess: "✅ Done!",
        advanceFail: "Failed",
        qualifyAlertTitle: "Qualified!",
        qualifyAlertMsg: "You made it!",
        roundText: "Round {n}",
        qualifiedStatus: "Qualified",
        eliminatedStatus: "Out",
        specialModesTitle: "Special Modes",
        start7toSmoke: "Start 7 to Smoke",
        startTournament: "Start Tournament",
        smokeTitle: "7 to Smoke",
        smokeKing: "King",
        smokeChallenger: "Challenger",
        smokeInLine: "In Line",
        smokeWins: "Wins",
        smokeWinBtn: "Wins",
        smokeReq: "Need exactly 8 qualifiers",
        tournTitle: "Tournament Bracket",
        tournMatch: "Match",
        tournWinnerBtn: "Winner",
        tournReq: "Need even number (2, 4...)",
        resetMode: "Reset to Standard",
        modeActive: "Active",
        adminCodeLabel: "Admin Code",
        adminCodeHint: "Remember this code!",
        claimAdminBtn: "Organizer Login",
        enterAdminCode: "Enter Code",
        wrongCode: "Wrong Code",
        adminAccessGranted: "✅ Access Granted!",
        copy: "Copy",
        copied: "Copied",
        enableNotify: "Enable Notify",
        notifyEnabled: "Notifications On",
        notifyHint: "Allow notifications to get alerts",
        wakelockActive: "Screen Kept On",
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
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [user, setUser] = useState(null); 
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [loading, setLoading] = useState(true);
    const [systemMessage, setSystemMessage] = useState('');
    const [lang, setLang] = useState('en'); // 預設英文

    // 登入表單狀態
    const [authEmail, setAuthEmail] = useState('');
    const [authPassword, setAuthPassword] = useState('');
    const [isRegisteringMode, setIsRegisteringMode] = useState(false);

    const [currentPage, setCurrentPage] = useState('browse');
    const [selectedEvent, setSelectedEvent] = useState(null);
    
    const [events, setEvents] = useState([]);
    const [myRegistrations, setMyRegistrations] = useState([]);
    const [adminAccess, setAdminAccess] = useState({});

    const t = (key) => translations[lang]?.[key] || translations['zh-TW'][key] || key;

    // --- Firebase 初始化 ---
    useEffect(() => {
        if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes("請填入")) {
            setSystemMessage("請設定 Firebase API Key (請看程式碼最上方)");
            setLoading(false);
            return;
        }
        try {
            const app = initializeApp(firebaseConfig);
            const firebaseAuth = getAuth(app);
            const firestoreDb = getFirestore(app);
            setDb(firestoreDb);
            setAuth(firebaseAuth);
            
            const unsubscribe = onAuthStateChanged(firebaseAuth, (currentUser) => {
                setUser(currentUser);
                setIsAuthReady(true);
                setLoading(false);
                if (currentUser) {
                    setAuthEmail('');
                    setAuthPassword('');
                }
            });
            return () => unsubscribe();
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    }, []);

    // --- 登入/註冊邏輯 ---
    const handleAuth = async (e) => {
        e.preventDefault();
        setSystemMessage("Processing...");
        try {
            if (isRegisteringMode) {
                await createUserWithEmailAndPassword(auth, authEmail, authPassword);
                setSystemMessage("Registered successfully!");
            } else {
                await signInWithEmailAndPassword(auth, authEmail, authPassword);
                setSystemMessage("Logged in successfully!");
            }
        } catch (error) {
            console.error(error);
            let msg = "Error";
            if (error.code === 'auth/invalid-email') msg = "Invalid Email";
            if (error.code === 'auth/wrong-password') msg = "Wrong Password";
            if (error.code === 'auth/user-not-found') msg = "User not found";
            if (error.code === 'auth/email-already-in-use') msg = "Email already in use";
            if (error.code === 'auth/weak-password') msg = "Password too weak (min 6 chars)";
            setSystemMessage(msg);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        setMyRegistrations([]); 
        navigate('browse');
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
                laneCount: doc.data().laneCount || 4,
                laneCapacity: doc.data().laneCapacity || 50, 
                googleMapLink: doc.data().googleMapLink || '',
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

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white"><Loader2 className="animate-spin mr-2" size={24} /> Loading...</div>;

    if (!user) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-md bg-gray-900 p-8 rounded-3xl border border-gray-800 shadow-2xl">
                    <h1 className="text-3xl font-black text-white mb-2 text-center flex items-center justify-center"><span className="text-red-600 mr-2">⚡</span> {t('appTitle')}</h1>
                    <p className="text-gray-400 text-center mb-8 text-sm">{isRegisteringMode ? t('registerTitle') : t('loginTitle')}</p>
                    <form onSubmit={handleAuth} className="space-y-4">
                        <div className="bg-gray-800 p-2 rounded-xl border border-gray-700 flex items-center">
                            <Mail className="text-gray-500 ml-2" size={20}/>
                            <input type="email" placeholder={t('emailPh')} value={authEmail} onChange={e => setAuthEmail(e.target.value)} className="bg-transparent flex-1 p-2 text-white outline-none ml-2" required />
                        </div>
                        <div className="bg-gray-800 p-2 rounded-xl border border-gray-700 flex items-center">
                            <Lock className="text-gray-500 ml-2" size={20}/>
                            <input type="password" placeholder={t('passwordPh')} value={authPassword} onChange={e => setAuthPassword(e.target.value)} className="bg-transparent flex-1 p-2 text-white outline-none ml-2" required />
                        </div>
                        <button type="submit" className="w-full bg-gradient-to-r from-red-600 to-red-800 text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 transition">
                            {isRegisteringMode ? t('registerBtn') : t('loginBtn')}
                        </button>
                    </form>
                    <div className="mt-6 text-center">
                        <button onClick={() => setIsRegisteringMode(!isRegisteringMode)} className="text-gray-500 hover:text-white text-sm transition">
                            {isRegisteringMode ? t('switchToLogin') : t('switchToRegister')}
                        </button>
                    </div>
                    <div className="mt-6 flex justify-center">
                        <div className="flex items-center gap-2 bg-gray-800 rounded-full px-3 py-1.5 border border-gray-700">
                            <Globe size={14} className="text-gray-400"/>
                            <select value={lang} onChange={(e) => setLang(e.target.value)} className="bg-transparent text-xs text-gray-300 focus:outline-none cursor-pointer font-medium">
                                <option value="en">English</option>
                                <option value="zh-TW">繁體中文</option>
                                <option value="zh-CN">简体中文</option>
                            </select>
                        </div>
                    </div>
                    {systemMessage && <div className="mt-4 p-3 bg-red-900/30 border border-red-900/50 text-red-400 text-sm rounded-xl text-center">{systemMessage}</div>}
                </div>
            </div>
        );
    }

    // --- 組件 ---

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
        const featuredEvent = upcomingEvents.length > 0 ? upcomingEvents[0] : (sortedEvents.length > 0 ? sortedEvents[sortedEvents.length - 1] : null);
        const recommendedEvents = sortedEvents.filter(e => e.id !== featuredEvent?.id).sort(() => 0.5 - Math.random()).slice(0, 5);

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
                {featuredEvent && (
                    <div onClick={() => navigate('detail', featuredEvent)} className="relative w-full h-48 bg-gray-800 rounded-3xl overflow-hidden cursor-pointer border border-gray-700">
                       <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-4">
                           <span className="bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded w-fit mb-2">HOT</span>
                           <h3 className="text-2xl font-black text-white">{featuredEvent.name}</h3>
                           <p className="text-gray-300 text-xs flex items-center"><MapPin size={12} className="mr-1"/>{featuredEvent.region}</p>
                       </div>
                    </div>
                )}
                <div className="space-y-3">
                    {filteredEvents.length > 0 ? filteredEvents.map(event => (
                        <div key={event.id} onClick={() => navigate('detail', event)} className="bg-gray-800 p-4 rounded-2xl shadow-md border border-gray-700/50 active:bg-gray-700 transition cursor-pointer flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-semibold text-white line-clamp-1">{event.name}</h3>
                                <div className="flex gap-1">
                                    {event.initialFormat === '7tosmoke' && <span className="text-[10px] bg-purple-900 text-purple-300 px-1.5 py-0.5 rounded border border-purple-700">7 to Smoke</span>}
                                </div>
                            </div>
                            <div className="flex items-center text-sm text-gray-400"><Calendar size={14} className="mr-1.5 text-red-400"/>{formatDateOnly(event.date)}<span className="mx-2 text-gray-600">|</span><MapPin size={14} className="mr-1.5 text-red-400"/>{event.region}</div>
                        </div>
                    )) : <div className="text-center text-gray-500 py-12 bg-gray-800/30 rounded-xl border border-dashed border-gray-700">{t('noEvents')}</div>}
                </div>
            </div>
        );
    };

    const EventDetail = ({ event }) => {
        const [isRegistering, setIsRegistering] = useState(false);
        const [showCallAlert, setShowCallAlert] = useState(false); 
        const [showQualifyAlert, setShowQualifyAlert] = useState(false);
        const [notificationPermission, setNotificationPermission] = useState(Notification.permission);
        const [wakeLock, setWakeLock] = useState(null);
        
        const registration = myRegistrations.find(reg => reg.eventId === event.id);
        const isCreator = user && event.creatorId === user.uid;
        
        const audioRef = useRef(null);
        const prevQualifiedRoundRef = useRef(registration?.qualifiedRound || 1);

        const getMapLink = () => event.googleMapLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.region)}`;

        // 請求通知權限
        const requestNotificationPermission = async () => {
            const permission = await Notification.requestPermission();
            setNotificationPermission(permission);
            if (permission === 'granted') {
                new Notification(t('appTitle'), { body: t('notifyEnabled') });
            }
        };

        // 嘗試啟用螢幕恆亮
        const requestWakeLock = async () => {
            try {
                if ('wakeLock' in navigator) {
                    const lock = await navigator.wakeLock.request('screen');
                    setWakeLock(lock);
                    lock.addEventListener('release', () => {
                        console.log('Wake Lock released');
                        setWakeLock(null);
                    });
                }
            } catch (err) {
                console.error(`${err.name}, ${err.message}`);
            }
        };

        // 當進入頁面時自動嘗試 Wake Lock
        useEffect(() => {
            requestWakeLock();
            // 頁面可見性改變時重新申請 (因為切換視窗會失效)
            const handleVisibilityChange = () => {
                if (document.visibilityState === 'visible') {
                    requestWakeLock();
                }
            };
            document.addEventListener('visibilitychange', handleVisibilityChange);
            return () => {
                if (wakeLock) wakeLock.release();
                document.removeEventListener('visibilitychange', handleVisibilityChange);
            };
        }, []);

        useEffect(() => {
            if (registration?.called) { 
                setShowCallAlert(true); 
                if (audioRef.current) audioRef.current.play().catch(()=>{}); 
                
                // 發送系統通知
                if (Notification.permission === 'granted') {
                    new Notification(t('itsYourTurn'), { 
                        body: t('pleaseGoToStage'),
                        icon: '/vite.svg' // 預設圖示
                    });
                }
            }
        }, [registration?.called]);

        useEffect(() => {
            if (registration && registration.qualifiedRound > prevQualifiedRoundRef.current) {
                setShowQualifyAlert(true);
                if (Notification.permission === 'granted') {
                    new Notification(t('qualifyAlertTitle'), { body: t('qualifyAlertMsg') });
                }
                prevQualifiedRoundRef.current = registration.qualifiedRound;
            }
        }, [registration?.qualifiedRound]);

        const handleRegistration = async () => {
            if (!db || !user || isRegistering) return;
            setIsRegistering(true);
            setSystemMessage(t('registerProcessing'));
            try {
                const laneCount = event.laneCount || 4;
                const laneCapacity = event.laneCapacity || 50;
                const maxTotal = laneCount * laneCapacity;
                const regCollectionRef = collection(db, `artifacts/${appId}/public/data/registrations`);
                const q = query(regCollectionRef, where("eventId", "==", event.id));
                let assignedLane = '';
                let assignedNumber = 0;

                await runTransaction(db, async (transaction) => {
                    const snapshot = await getDocs(q); 
                    const occupied = new Set(snapshot.docs.map(d => `${d.data().laneAssignment}-${d.data().queueNumber}`));
                    if (snapshot.size >= maxTotal) throw new Error("Full");
                    let laneChar, num, key, attempts = 0;
                    do {
                        const randomLaneIdx = Math.floor(Math.random() * laneCount);
                        laneChar = getLaneName(randomLaneIdx);
                        num = Math.floor(Math.random() * laneCapacity) + 1;
                        key = `${laneChar}-${num}`;
                        attempts++;
                    } while (occupied.has(key) && attempts < maxTotal * 3);
                    if (occupied.has(key)) throw new Error("Failed");
                    assignedLane = laneChar; assignedNumber = num;
                });

                const newReg = { eventId: event.id, userId: user.uid, queueNumber: assignedNumber, laneAssignment: assignedLane, registrationTime: serverTimestamp(), checkedIn: false, paid: false, called: false, qualifiedRound: 1 };
                const docRef = await addDoc(regCollectionRef, newReg);
                setMyRegistrations(prev => [...prev, { id: docRef.id, ...newReg }]);
                navigate('registerSuccess', { ...event, queueNumber: assignedNumber, laneAssignment: assignedLane });
                
                // 報名成功後自動詢問通知權限
                requestNotificationPermission();

            } catch (e) {
                console.error(e); setSystemMessage(`${t('registerFail')}: ${e.message}`); setIsRegistering(false);
            }
        };

        const renderStatusBadge = (reg) => (
            <div className="flex space-x-2 text-sm mt-3 flex-wrap justify-center gap-2">
                <span className={`px-3 py-1 rounded-full font-semibold text-xs shadow-sm ${reg.checkedIn ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 border border-gray-600'}`}>{reg.checkedIn ? `✅ ${t('statusCheckedIn')}` : `⏳ ${t('statusNotCheckedIn')}`}</span>
                <span className={`px-3 py-1 rounded-full font-semibold text-xs shadow-sm ${reg.paid ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 border border-gray-600'}`}>{reg.paid ? `💰 ${t('statusPaid')}` : `❌ ${t('statusNotPaid')}`}</span>
                <span className="px-3 py-1 rounded-full font-semibold text-xs bg-indigo-600 text-white shadow-sm">{t('lane')}: {reg.laneAssignment}</span>
            </div>
        );

        return (
            <div className="p-4 space-y-5 relative pb-24">
                <audio ref={audioRef} src="data:audio/mp3;base64,SUQzBAAAAAABAFRYWFgAAAASAAADbWFqb3JfYnJhbmQAbXA0MgBUWFhYAAAAEQAAA21pbm9yX3ZlcnNpb24AMABUWFhYAAAAHAAAA2NvbXBhdGlibGVfYnJhbmRzAGlzb21tcDQyAFRTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQxAAAAAAA0gAAAAABAAABAAAAAAAAAAABH//tQxAAAAAAA0gAAAAABAAABAAAAAAAAAAAB///tQxAAAAAAA0gAAAAABAAABAAAAAAAAAAAB//tQxAAAAAAA0gAAAAABAAABAAAAAAAAAAAB" /> 
                {showCallAlert && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in zoom-in duration-300"><div className="bg-red-600 p-8 rounded-3xl text-center animate-bounce"><h2 className="text-3xl font-black text-white">{t('itsYourTurn')}</h2><button onClick={() => setShowCallAlert(false)} className="bg-white text-red-600 px-8 py-3 rounded-full mt-4 font-bold">OK</button></div></div>}
                {showQualifyAlert && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"><div className="bg-yellow-600 p-8 rounded-3xl text-center animate-bounce"><h2 className="text-3xl font-black text-white">{t('qualifyAlertTitle')}</h2><button onClick={() => setShowQualifyAlert(false)} className="bg-white text-yellow-600 px-8 py-3 rounded-full mt-4 font-bold">OK</button></div></div>}

                <button onClick={() => navigate('browse')} className="flex items-center text-gray-400 hover:text-white"><ChevronLeft size={24}/> {t('backToEvents')}</button>
                
                <div className="bg-gray-800 p-6 rounded-3xl shadow-2xl border border-gray-700">
                    <div className="flex justify-between items-start">
                        <h2 className="text-3xl font-black text-white mb-2">{event.name}</h2>
                        {/* 通知狀態指示燈 */}
                        <div className="flex flex-col items-end gap-2">
                            {notificationPermission !== 'granted' && (
                                <button onClick={requestNotificationPermission} className="bg-blue-600 text-white p-2 rounded-full shadow-lg animate-pulse">
                                    <Bell size={20} />
                                </button>
                            )}
                            {wakeLock && <span className="text-yellow-500 text-xs flex items-center"><Zap size={10} className="mr-1 fill-current"/> On</span>}
                        </div>
                    </div>
                    <p className="text-gray-300 text-sm mb-4 flex items-center"><Calendar size={16} className="mr-2 text-red-500"/> {formatDateTime(event.date)} | {event.region}</p>
                    <a href={getMapLink()} target="_blank" rel="noopener noreferrer" className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-1.5 rounded-full transition flex items-center w-fit mb-4">{t('openMap')} <ExternalLink size={10} className="ml-1"/></a>
                    <p className="text-gray-400 text-sm whitespace-pre-wrap border-t border-gray-700 pt-4">{event.description}</p>
                </div>

                <div className="fixed bottom-20 left-0 right-0 px-4 md:absolute md:bottom-auto md:px-0 z-20">
                    {isCreator ? (
                        <button onClick={() => navigate('manage', event)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-xl flex items-center justify-center text-lg">
                            <Settings size={24} className="mr-2"/> {t('manageEventBtn')}
                        </button>
                    ) : (
                        !registration ? (
                            <button onClick={handleRegistration} disabled={isRegistering} className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-bold py-4 rounded-2xl shadow-xl flex items-center justify-center text-lg">
                                {isRegistering ? <Loader2 className="animate-spin mr-2"/> : <Users size={24} className="mr-2"/>} {t('randomRegisterBtn')}
                            </button>
                        ) : (
                            <div className="bg-gray-800 p-4 rounded-2xl border border-green-600 text-center relative">
                                <p className="text-green-400 font-bold">{t('registered')}</p>
                                <p className="text-2xl font-black text-white">{registration.laneAssignment}-{formatNumber(registration.queueNumber)}</p>
                                {renderStatusBadge(registration)}
                                {notificationPermission !== 'granted' && <p className="text-xs text-blue-400 mt-2 animate-pulse" onClick={requestNotificationPermission}>{t('notifyHint')}</p>}
                            </div>
                        )
                    )}
                </div>
                <div className="h-24"></div>
            </div>
        );
    };

    // 3. 創建活動
    const CreateEventForm = () => {
        const [formData, setFormData] = useState({
            name: '', date: '', region: '', description: '', 
            laneCount: 4, laneCapacity: 50, 
            googleMapLink: '', paymentInfo: '', paymentQrCodeUrl: '',
            initialFormat: 'standard'
        });
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
            if (!db || !user || isSubmitting) return;
            setIsSubmitting(true);
            try {
                await addDoc(collection(db, `artifacts/${appId}/public/data/events`), { 
                    ...formData, creatorId: user.uid, timestamp: serverTimestamp(), status: 'active', callMode: 'single', strictSequence: false,
                    roundsConfig: rounds, currentRound: 1, roundStatus: 'active'
                });
                setSystemMessage(t('createSuccess')); setIsSubmitting(false); fetchEvents(); navigate('browse');
            } catch (error) {
                setSystemMessage(`${t('createFail')}: ${error.message}`); setIsSubmitting(false);
            }
        };
        return (
            <div className="p-4 pb-24 space-y-4">
                <button onClick={() => navigate('browse')} className="flex items-center text-gray-400 hover:text-white"><ChevronLeft size={24}/> {t('backToHome')}</button>
                <h2 className="text-3xl font-bold text-white mb-6">{t('createEventTitle')}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-gray-800 p-5 rounded-3xl border border-gray-700 shadow-lg space-y-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">{t('basicInfo')}</h3>
                        <input type="text" name="name" placeholder={t('eventNamePh')} value={formData.name} onChange={handleChange} required className="w-full p-4 rounded-xl bg-gray-900 text-white border border-gray-700 focus:border-red-500 outline-none"/>
                        <input type="datetime-local" name="date" value={formData.date} onChange={handleChange} required className="w-full p-4 rounded-xl bg-gray-900 text-white border border-gray-700 focus:border-red-500 outline-none"/>
                        <input type="text" name="region" placeholder={t('eventRegionPh')} value={formData.region} onChange={handleChange} required className="w-full p-4 rounded-xl bg-gray-900 text-white border border-gray-700 focus:border-red-500 outline-none"/>
                        <textarea name="description" placeholder={t('descPh')} value={formData.description} onChange={handleChange} className="w-full p-4 rounded-xl bg-gray-900 text-white border border-gray-700 focus:border-red-500 outline-none"/>
                    </div>
                    <div className="bg-gray-800 p-5 rounded-3xl border border-gray-700 shadow-lg space-y-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">{t('compSettingsTitle')}</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-gray-500 text-xs mb-2">{t('laneCountPh')}</label><select value={getLaneName(formData.laneCount - 1)} onChange={handleLaneLetterChange} className="w-full p-4 rounded-xl bg-gray-900 text-white border border-gray-700 focus:border-red-500 outline-none transition appearance-none">{alphabetOptions.map((letter, idx) => (<option key={letter} value={letter}>{letter} ({idx + 1} Lane{idx > 0 ? 's' : ''})</option>))}</select></div>
                            <div><label className="block text-gray-500 text-xs mb-2">{t('laneCapacityPh')}</label><input type="number" name="laneCapacity" placeholder="50" value={formData.laneCapacity} onChange={handleChange} min="1" className="w-full p-4 rounded-xl bg-gray-900 text-white border border-gray-700 focus:border-red-500 outline-none transition"/></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 flex items-center"><Hash size={12} className="mr-1"/> {t('laneHint').replace('{total}', formData.laneCount * formData.laneCapacity).replace('{lastChar}', getLaneName(formData.laneCount - 1))}</p>
                    </div>
                    <button type="submit" disabled={isSubmitting} className="w-full bg-red-600 text-white font-bold py-4 rounded-2xl shadow-lg">{isSubmitting ? <Loader2 className="animate-spin mx-auto"/> : t('publishBtn')}</button>
                </form>
            </div>
        );
    };

    // ... (其他組件 MyEvents, ManagementList, EventManager, RegistrationSuccess 等保持不變) ...
    // 為了完整性，以下補上剩餘組件
    
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
                                        <span className="text-xl font-black text-indigo-400">{reg.laneAssignment}-{formatNumber(reg.queueNumber)}</span>
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

    const RegistrationSuccess = ({ event }) => (
        <div className="p-8 text-center"><h2 className="text-white text-2xl">{t('congrats')}</h2><button onClick={()=>navigate('browse')} className="mt-4 text-white bg-gray-700 px-4 py-2 rounded">OK</button></div>
    );

    const EventManager = ({ event }) => {
        // 這裡使用簡化的管理介面，實際整合時請複製之前完整的 EventManager 程式碼
        // 為了示範，這裡僅保留基本結構，請確保使用前面提供的完整 EventManager 邏輯
        return (
            <div className="p-4 text-white">
                <h2 className="text-2xl mb-4">{event.name} - {t('manageTitle')}</h2>
                <p className="text-gray-400 mb-4">請使用完整版 EventManager 程式碼以獲得所有管理功能</p>
                <button onClick={()=>navigate('browse')} className="bg-gray-700 px-4 py-2 rounded">Back</button>
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
            {[{n:t('navHome'),i:Grid,p:'browse'}, {n:t('navCreate'),i:PlusCircle,p:'create'}, {n:t('navMy'),i:User,p:'my_events'}, {n:t('navManage'),i:ClipboardList,p:'manage_list'}].map(i=>(
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