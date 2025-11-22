import React, { useState, useEffect, useCallback, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, onSnapshot, runTransaction, collection, query, where, getDocs, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { MapPin, Calendar, Users, PlusCircle, LayoutList, CheckCircle, ChevronLeft, Loader2, Megaphone, Settings, ListChecks, Shuffle, TrendingUp, XCircle, DollarSign, ExternalLink, CreditCard, Grid, Play, SkipForward, Hash, Globe, BellRing, Search, Star, Heart, Trophy, AlertCircle, Trash2, Sparkles, Flag, Crown, Swords, Timer, ClipboardList, User } from 'lucide-react';

// --- 請修改這裡 ---
// 1. 設定您的 App ID (可自訂)
const appId = 'dance-event-demo-01'; 

// 2. 填入您的 Firebase 設定 (從 Firebase Console -> Project Settings -> General -> Your apps 取得)
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

// --- 以下程式碼不需要修改 ---

const translations = {
    'zh-TW': {
        appTitle: "舞蹈活動平台",
        discoverEvents: "探索",
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
        registerBtn: "立即報名",
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
        createEventTitle: "發佈活動 📝",
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
        manageTitle: "賽事管理",
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
        modeActive: "進行中"
    },
    'zh-CN': {
        appTitle: "舞蹈活动平台",
        discoverEvents: "探索",
        featured: "精选活动",
        recommended: "热门赛事",
        allEvents: "所有活动",
        allRegions: "所有地区",
        allTimes: "所有时间",
        upcoming: "即将到来",
        past: "已结束",
        noEvents: "目前没有符合条件的活动。",
        backToHome: "返回",
        backToEvents: "返回列表",
        time: "时间",
        location: "地点",
        description: "描述",
        numberRange: "号码范围",
        randomDraw: "随机抽取",
        openMap: "开启地图",
        paymentInfoTitle: "缴费信息",
        qrCode: "收款码",
        registerBtn: "立即报名",
        randomRegisterBtn: "抽取号码报名",
        processing: "处理中...",
        registered: "已报名！",
        yourNumber: "您的号码",
        manageEventBtn: "进入赛事管理",
        statusCheckedIn: "已报到",
        statusNotCheckedIn: "未报到",
        statusPaid: "已付费",
        statusNotPaid: "未付费",
        lane: "赛道",
        congrats: "报名成功！",
        successMsg: "您参加",
        rememberPayment: "请记得查看缴费信息。",
        createEventTitle: "发布活动 📝",
        basicInfo: "基本信息",
        eventNamePh: "活动名称",
        eventRegionPh: "地点/地区",
        mapLinkPh: "📍 地图链接 (可选)",
        descPh: "活动描述...",
        eventFormatLabel: "主要赛制",
        formatStandard: "标准淘汰赛 (Standard)",
        format7toSmoke: "7 to Smoke (车轮战)",
        formatTournament: "Tournament (1 on 1)",
        compSettingsTitle: "赛事与赛道规格",
        laneCountPh: "赛道数量 (选择最后赛道字母)",
        laneCapacityPh: "每赛道人数 / 号码上限 (1~N)",
        laneHint: "总赛道: A ~ {lastChar} | 总名额: {total} 人",
        paymentSettingsTitle: "缴费设定",
        paymentDescPh: "缴费说明...",
        paymentQrPh: "🔗 收款码图片链接 (可选)",
        roundConfigTitle: "赛制轮次规划",
        roundConfigDesc: "设定每一轮预计晋级的人数",
        addRound: "新增轮次",
        roundLabel: "轮次",
        qualifiersLabel: "晋级人数",
        publishBtn: "发布",
        manageTitle: "赛事管理",
        tabCalling: "叫号",
        tabCheckIn: "报到",
        tabProgression: "晋级",
        currentCall: "目前舞台 (On Stage)",
        callStrategy: "叫号设定",
        mode: "模式",
        modeSingle: "单人",
        modeAllLanes: "赛道齐发",
        emptyStrategy: "空号策略",
        skipEmpty: "跳过 (智慧)",
        keepEmpty: "保留 (严格)",
        callNext: "叫下一位",
        callNextBatch: "叫下一批",
        randomAssignTitle: "随机分道",
        qualifiedPlayers: "符合资格",
        startDraw: "开始抽签",
        drawing: "抽签中...",
        drawWarning: "抽签前请确认赛道设定！",
        navHome: "首页",
        navCreate: "发布",
        navMy: "我的",
        navManage: "管理",
        myEventsTitle: "我的参赛活动 🕺",
        manageListTitle: "我主办的活动 🛠️",
        noJoinedEvents: "尚未报名任何活动",
        noHostedEvents: "尚未创建任何活动",
        enterManage: "进入后台",
        createSuccess: "✅ 发布成功！",
        createFail: "发布失败",
        registerProcessing: "报名中...",
        registerFail: "报名失败",
        drawSuccess: "✅ 抽签完成！",
        callSuccess: "叫号成功",
        callFail: "叫号失败",
        calculatingNext: "计算中...",
        noMorePlayers: "无待叫选手。",
        allLanesEmpty: "全赛道无人。",
        called: "已叫号",
        itsYourTurn: "轮到你了！",
        pleaseGoToStage: "请立即前往舞台！",
        closeNotification: "收到",
        searchPlaceholder: "输入号码搜索...",
        statsTotal: "总数",
        statsCheckedIn: "已到",
        statsPaid: "已付",
        noResult: "找不到此号码",
        progressionTitle: "晋级管理",
        currentRound: "当前轮次",
        nextRoundTarget: "下一轮目标人数",
        advanceManual: "手动输入晋级 (赛道+号码)",
        advanceManualPh: "例如: A5, B12, A10 (不分大小写)",
        advanceRandom: "随机抽选晋级",
        advanceRandomCountPh: "晋级人数",
        advanceBtn: "确认晋级",
        endEventBtn: "结束活动",
        advancing: "晋级处理中...",
        advanceSuccess: "✅ 晋级名单已更新！",
        advanceFail: "更新失败",
        qualifyAlertTitle: "恭喜晋级！",
        qualifyAlertMsg: "你已成功晋级到下一轮！",
        roundText: "第 {n} 轮",
        qualifiedStatus: "晋级",
        eliminatedStatus: "止步",
        specialModesTitle: "特殊赛制 (晋级后)",
        start7toSmoke: "启动 7 to Smoke",
        startTournament: "启动 Tournament (1 on 1)",
        smokeTitle: "7 to Smoke",
        smokeKing: "King (擂台主)",
        smokeChallenger: "Challenger (挑战者)",
        smokeInLine: "排队中",
        smokeWins: "胜场",
        smokeWinBtn: "胜",
        smokeReq: "需正好 8 人晋级",
        tournTitle: "Tournament 对战表",
        tournMatch: "对战组合",
        tournWinnerBtn: "获胜",
        tournReq: "需偶数人 (2, 4, 8, 16...)",
        resetMode: "重置为标准叫号",
        modeActive: "进行中",
    },
    'en': {
        appTitle: "Dance Platform",
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
        registerBtn: "Register",
        randomRegisterBtn: "Register (Random)",
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
    }
};

// --- 輔助函數 ---
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
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [loading, setLoading] = useState(true);
    const [systemMessage, setSystemMessage] = useState('');
    const [lang, setLang] = useState('zh-TW');

    const [currentPage, setCurrentPage] = useState('browse');
    const [selectedEvent, setSelectedEvent] = useState(null);
    
    const [events, setEvents] = useState([]);
    const [myRegistrations, setMyRegistrations] = useState([]);

    const t = (key) => translations[lang]?.[key] || translations['zh-TW'][key] || translations['en'][key] || key;

    // --- Firebase 初始化 ---
    useEffect(() => {
        if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes("請填入")) {
            setSystemMessage("請設定 Firebase API Key (請看程式碼最上方)");
            setLoading(false);
            return;
        }
        const app = initializeApp(firebaseConfig);
        const firebaseAuth = getAuth(app);
        const firestoreDb = getFirestore(app);
        setDb(firestoreDb);
        setAuth(firebaseAuth);
        const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                try {
                    if (initialAuthToken) await signInWithCustomToken(firebaseAuth, initialAuthToken);
                    else await signInAnonymously(firebaseAuth);
                } catch (error) {
                    console.error("認證失敗:", error);
                    setSystemMessage(`認證錯誤: ${error.message}`);
                }
            }
            setIsAuthReady(true);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

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
            console.error("獲取活動列表失敗:", error);
        }
    }, [isAuthReady, db]);

    const fetchMyData = useCallback(async () => {
        if (!isAuthReady || !db || !userId) return;
        try {
            const regCollectionRef = collection(db, `artifacts/${appId}/public/data/registrations`);
            const qReg = query(regCollectionRef, where("userId", "==", userId));
            onSnapshot(qReg, (snapshot) => {
                const myRegs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setMyRegistrations(myRegs);
            });
        } catch (error) {
            console.error("獲取我的資料失敗:", error);
        }
    }, [isAuthReady, db, userId]);

    useEffect(() => {
        if (isAuthReady) {
            fetchEvents();
            if (userId) fetchMyData();
        }
    }, [isAuthReady, userId, fetchEvents, fetchMyData]);

    const navigate = (page, event = null) => {
        setSelectedEvent(event);
        setCurrentPage(page);
        window.scrollTo(0, 0);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white"><Loader2 className="animate-spin mr-2" size={24} /> 正在初始化...</div>;

    // --- 頁面組件 ---

    // 1. 首頁 (EventList) - 包含精選 Banner
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

        // 🚀 智慧導航：檢查是否為主辦人
        const handleEventClick = (event) => {
            if (userId === event.creatorId) {
                navigate('manage', event);
            } else {
                navigate('detail', event);
            }
        };

        return (
            <div className="p-4 space-y-6 pb-24">
                {featuredEvent && (
                    <div className="space-y-2">
                        <h2 className="text-lg font-bold text-white flex items-center px-1">
                            <Sparkles size={18} className="mr-1 text-yellow-400"/> {t('featured')}
                        </h2>
                        <div 
                            onClick={() => handleEventClick(featuredEvent)}
                            className="relative w-full h-64 bg-gray-800 rounded-3xl shadow-2xl overflow-hidden cursor-pointer border border-gray-700 group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-black opacity-90 group-hover:opacity-100 transition duration-500"></div>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-600/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-pink-600/30 transition duration-500"></div>
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl -ml-10 -mb-10"></div>
                            
                            <div className="absolute inset-0 p-6 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/30 to-transparent">
                                <div className="mb-auto flex justify-between items-start">
                                    <span className="bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider shadow-lg">HOT</span>
                                    <div className="flex gap-1">
                                        {featuredEvent.initialFormat === '7tosmoke' && <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center"><Crown size={10} className="mr-1"/> 7 to Smoke</span>}
                                        {featuredEvent.initialFormat === 'tournament' && <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center"><Trophy size={10} className="mr-1"/> Tournament</span>}
                                    </div>
                                </div>
                                <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center text-xs text-white font-mono w-fit mb-2">
                                    <Calendar size={12} className="mr-2 text-red-400"/>
                                    {formatDateOnly(featuredEvent.date)}
                                </div>
                                <h3 className="text-3xl font-black text-white leading-tight mb-2 drop-shadow-md group-hover:scale-[1.01] transition-transform origin-left">{featuredEvent.name}</h3>
                                <div className="flex items-center text-gray-300 text-sm"><MapPin size={14} className="mr-1.5 text-red-400"/><span className="truncate">{featuredEvent.region}</span></div>
                            </div>
                        </div>
                    </div>
                )}

                {recommendedEvents.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-1"><h2 className="text-lg font-bold text-white flex items-center">{t('recommended')}</h2></div>
                        <div className="flex space-x-4 overflow-x-auto pb-4 snap-x scrollbar-hide" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
                            {recommendedEvents.map(event => (
                                <div key={event.id} onClick={() => handleEventClick(event)} className="flex-none w-64 bg-gray-800 rounded-2xl shadow-lg border border-gray-700 overflow-hidden snap-center transform transition hover:scale-[1.02] active:scale-95 cursor-pointer relative">
                                    <div className="h-28 bg-gradient-to-r from-gray-900 to-gray-800 flex items-center justify-center relative"><span className="text-3xl filter grayscale hover:grayscale-0 transition">🕺</span><div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md px-2 py-1 rounded-md text-[10px] text-white font-mono">{formatDateOnly(event.date)}</div></div>
                                    <div className="p-4"><h3 className="text-base font-bold text-white truncate">{event.name}</h3><p className="text-xs text-gray-400 flex items-center mt-1 truncate"><MapPin size={10} className="mr-1"/>{event.region}</p></div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white px-1">{t('allEvents')}</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <select value={filterRegion} onChange={(e) => setFilterRegion(e.target.value)} className="p-2.5 rounded-xl bg-gray-800 text-white text-sm border border-gray-700 focus:ring-2 focus:ring-red-500 outline-none"><option value="">{t('allRegions')}</option>{uniqueRegions.map(r => <option key={r} value={r}>{r}</option>)}</select>
                        <select value={filterTime} onChange={(e) => setFilterTime(e.target.value)} className="p-2.5 rounded-xl bg-gray-800 text-white text-sm border border-gray-700 focus:ring-2 focus:ring-red-500 outline-none"><option value="">{t('allTimes')}</option><option value="upcoming">{t('upcoming')}</option><option value="past">{t('past')}</option></select>
                    </div>
                    <div className="space-y-3">
                        {filteredEvents.length > 0 ? filteredEvents.map(event => (
                            <div key={event.id} onClick={() => handleEventClick(event)} className="bg-gray-800 p-4 rounded-2xl shadow-md border border-gray-700/50 active:bg-gray-700 transition cursor-pointer flex flex-col gap-2">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg font-semibold text-white line-clamp-1">{event.name}</h3>
                                    <div className="flex gap-1">
                                        {event.initialFormat === '7tosmoke' && <span className="text-[10px] bg-purple-900 text-purple-300 px-1.5 py-0.5 rounded border border-purple-700">7 to Smoke</span>}
                                        {event.initialFormat === 'tournament' && <span className="text-[10px] bg-blue-900 text-blue-300 px-1.5 py-0.5 rounded border border-blue-700">Tournament</span>}
                                    </div>
                                </div>
                                <div className="flex items-center text-sm text-gray-400"><Calendar size={14} className="mr-1.5 text-red-400"/>{formatDateOnly(event.date)}<span className="mx-2 text-gray-600">|</span><MapPin size={14} className="mr-1.5 text-red-400"/>{event.region}</div>
                            </div>
                        )) : <div className="text-center text-gray-500 py-12 bg-gray-800/30 rounded-xl border border-dashed border-gray-700">{t('noEvents')}</div>}
                    </div>
                </div>
            </div>
        );
    };

    // 2. 活動詳情與報名 (EventDetail)
    const EventDetail = ({ event }) => {
        const [isRegistering, setIsRegistering] = useState(false);
        const [showCallAlert, setShowCallAlert] = useState(false); 
        const [showQualifyAlert, setShowQualifyAlert] = useState(false);
        const registration = myRegistrations.find(reg => reg.eventId === event.id);
        const isCreator = userId === event.creatorId; // 檢查是否為主辦人
        const audioRef = useRef(null);
        const prevQualifiedRoundRef = useRef(registration?.qualifiedRound || 1);

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
            if (!db || !userId || isRegistering) return;
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

                    let laneChar, num, key;
                    let attempts = 0;
                    do {
                        const randomLaneIdx = Math.floor(Math.random() * laneCount);
                        laneChar = getLaneName(randomLaneIdx);
                        num = Math.floor(Math.random() * laneCapacity) + 1;
                        key = `${laneChar}-${num}`;
                        attempts++;
                    } while (occupied.has(key) && attempts < maxTotal * 3);
                    
                    if (occupied.has(key)) throw new Error("Failed");
                    
                    assignedLane = laneChar;
                    assignedNumber = num;
                });

                const newReg = {
                    eventId: event.id, userId: userId, 
                    queueNumber: assignedNumber, 
                    laneAssignment: assignedLane,
                    registrationTime: serverTimestamp(),
                    checkedIn: false, paid: false, nextRoundStatus: '', called: false,
                    qualifiedRound: 1
                };
                const docRef = await addDoc(regCollectionRef, newReg);
                const statusDocRef = doc(db, `artifacts/${appId}/public/data/call_status`, event.id);
                await setDoc(statusDocRef, { updatedAt: serverTimestamp() }, { merge: true });
                setMyRegistrations(prev => [...prev, { id: docRef.id, ...newReg }]);
                navigate('registerSuccess', { ...event, queueNumber: assignedNumber, laneAssignment: assignedLane });
            } catch (e) {
                console.error(e); setSystemMessage(`${t('registerFail')}: ${e.message}`); setIsRegistering(false);
            }
        };
        
        const renderStatusBadge = (reg) => (
            <div className="flex space-x-2 text-sm mt-3 flex-wrap justify-center gap-2">
                <span className={`px-3 py-1 rounded-full font-semibold text-xs shadow-sm ${reg.checkedIn ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 border border-gray-600'}`}>
                    {reg.checkedIn ? `✅ ${t('statusCheckedIn')}` : `⏳ ${t('statusNotCheckedIn')}`}
                </span>
                <span className={`px-3 py-1 rounded-full font-semibold text-xs shadow-sm ${reg.paid ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 border border-gray-600'}`}>
                    {reg.paid ? `💰 ${t('statusPaid')}` : `❌ ${t('statusNotPaid')}`}
                </span>
                {reg.laneAssignment && (
                    <span className="px-3 py-1 rounded-full font-semibold text-xs bg-indigo-600 text-white shadow-sm">
                        {t('lane')}: {reg.laneAssignment}
                    </span>
                )}
            </div>
        );

        const currentEventRound = event.currentRound || 1;
        const userRound = registration?.qualifiedRound || 1;
        const isQualified = userRound >= currentEventRound;

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
                
                <div className="bg-gray-800 p-6 rounded-3xl shadow-2xl border border-gray-700 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <h2 className="text-3xl font-black text-white mb-4 relative z-10">{event.name}</h2>
                    
                    {/* 賽制標籤 */}
                    <div className="flex gap-2 mb-4 relative z-10">
                        {event.initialFormat === '7tosmoke' && <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-bold flex items-center w-fit"><Crown size={12} className="mr-1"/> 7 to Smoke</span>}
                        {event.initialFormat === 'tournament' && <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold flex items-center w-fit"><Trophy size={12} className="mr-1"/> Tournament</span>}
                    </div>

                    <div className="space-y-3 relative z-10">
                        <p className="text-gray-300 flex items-center"><Calendar size={18} className="mr-3 text-red-500"/><span className="text-sm font-medium">{formatDateTime(event.date)}</span></p>
                        <div className="flex items-start justify-between">
                            <div className="flex items-start text-gray-300"><MapPin size={18} className="mr-3 text-red-500 mt-0.5"/><span className="text-sm font-medium">{event.region}</span></div>
                            <a href={getMapLink()} target="_blank" rel="noopener noreferrer" className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-1.5 rounded-full transition flex items-center">{t('openMap')} <ExternalLink size={10} className="ml-1"/></a>
                        </div>
                        <div className="pt-4 border-t border-gray-700 mt-4"><p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">{event.description}</p></div>
                        
                        <div className="flex items-center pt-2 text-xs text-gray-500 font-mono bg-gray-900/50 p-2 rounded-lg">
                            <Hash size={14} className="mr-2 text-gray-400"/>
                            {t('lane')} {getLaneName(0)} ~ {getLaneName(event.laneCount-1)} | 1 ~ {event.laneCapacity}
                        </div>
                        
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                            <span className="text-sm text-gray-400">{t('currentRound')}: <span className="text-white font-bold">{t('roundText').replace('{n}', currentEventRound)}</span></span>
                            {event.roundStatus === 'closed' && <span className="text-xs bg-red-900/50 text-red-300 px-2 py-1 rounded border border-red-800">活動結束</span>}
                        </div>
                    </div>
                </div>

                {(event.paymentInfo || event.paymentQrCodeUrl) && (
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
                
                <div className="fixed bottom-20 left-0 right-0 px-4 md:absolute md:bottom-auto md:px-0 z-20">
                    {isCreator ? (
                        // 🛡️ 主辦人視圖：顯示管理按鈕，取代報名按鈕
                        <button 
                            onClick={() => navigate('manage', event)} 
                            className="w-full max-w-md mx-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-xl transition transform active:scale-95 flex items-center justify-center text-lg"
                        >
                            <Settings size={24} className="mr-2"/> {t('manageEventBtn')}
                        </button>
                    ) : registration ? (
                        <div className="bg-gray-800/90 backdrop-blur-lg p-4 rounded-2xl border border-gray-700 shadow-2xl text-center max-w-md mx-auto relative overflow-hidden">
                            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">{t('registered')}</p>
                            <div className="flex justify-center items-baseline text-white">
                                <span className="text-3xl font-black text-indigo-400 mr-2">{registration.laneAssignment}</span>
                                <span className="text-2xl font-light">-</span>
                                <span className="text-4xl font-black ml-2">{formatNumber(registration.queueNumber)}</span>
                            </div>
                            {currentEventRound > 1 && (
                                <div className={`mt-2 py-1 px-3 rounded text-xs font-bold inline-block ${isQualified ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                                    {isQualified ? `🌟 ${t('qualifiedStatus')} ${t('roundText').replace('{n}', currentEventRound)}` : `⏹ ${t('eliminatedStatus')} ${t('roundText').replace('{n}', userRound)}`}
                                </div>
                            )}
                            {renderStatusBadge(registration)}
                        </div>
                    ) : (
                        <button onClick={handleRegistration} disabled={isRegistering} className="w-full max-w-md mx-auto bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-4 rounded-2xl shadow-xl transition transform active:scale-95 flex items-center justify-center text-lg">
                            {isRegistering ? <><Loader2 className="animate-spin mr-2" size={24} /> {t('processing')}</> : <><Users size={24} className="mr-2"/> {t('randomRegisterBtn')}</>}
                        </button>
                    )}
                </div>
                
                {/* 底部墊高 */}
                <div className="h-16 md:hidden"></div>

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
                <p className="text-gray-400 text-sm uppercase tracking-widest mb-2">{t('yourNumber')}</p>
                <div className="flex justify-center items-baseline text-white font-black tracking-widest">
                    <span className="text-7xl text-indigo-400">{event.laneAssignment}</span>
                    <span className="text-5xl mx-2">-</span>
                    <span className="text-8xl">{formatNumber(event.queueNumber)}</span>
                </div>
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
            if (!db || !userId || isSubmitting) return;
            setIsSubmitting(true);
            try {
                await addDoc(collection(db, `artifacts/${appId}/public/data/events`), { 
                    ...formData, creatorId: userId, timestamp: serverTimestamp(), status: 'active', callMode: 'single', strictSequence: false,
                    roundsConfig: rounds, currentRound: 1, roundStatus: 'active'
                });
                setSystemMessage(t('createSuccess')); setIsSubmitting(false); fetchEvents(); navigate('browse');
            } catch (error) {
                setSystemMessage(`${t('createFail')}: ${error.message}`); setIsSubmitting(false);
            }
        };
        return (
            <div className="p-4 pb-24 space-y-4">
                <button onClick={() => navigate('browse')} className="flex items-center text-gray-400 hover:text-white transition"><ChevronLeft size={24} className="mr-1"/> {t('backToHome')}</button>
                <h2 className="text-3xl font-bold text-white mb-6">{t('createEventTitle')}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-gray-800 p-5 rounded-3xl border border-gray-700 shadow-lg space-y-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">{t('basicInfo')}</h3>
                        <input type="text" name="name" placeholder={t('eventNamePh')} value={formData.name} onChange={handleChange} required className="w-full p-4 rounded-xl bg-gray-900 text-white border border-gray-700 focus:border-red-500 outline-none transition"/>
                        <div><label className="block text-gray-500 text-xs mb-2">{t('eventFormatLabel')}</label><select name="initialFormat" value={formData.initialFormat} onChange={handleChange} className="w-full p-4 rounded-xl bg-gray-900 text-white border border-gray-700 focus:border-red-500 outline-none transition appearance-none"><option value="standard">{t('formatStandard')}</option><option value="7tosmoke">{t('format7toSmoke')}</option><option value="tournament">{t('formatTournament')}</option></select></div>
                        <input type="text" name="region" placeholder={t('eventRegionPh')} value={formData.region} onChange={handleChange} required className="w-full p-4 rounded-xl bg-gray-900 text-white border border-gray-700 focus:border-red-500 outline-none transition"/>
                        <input type="text" name="googleMapLink" placeholder={t('mapLinkPh')} value={formData.googleMapLink} onChange={handleChange} className="w-full p-4 rounded-xl bg-gray-900 text-white border border-gray-700 focus:border-red-500 outline-none transition"/>
                        <input type="datetime-local" name="date" value={formData.date} onChange={handleChange} required className="w-full p-4 rounded-xl bg-gray-900 text-white border border-gray-700 focus:border-red-500 outline-none transition"/>
                        <textarea name="description" placeholder={t('descPh')} value={formData.description} onChange={handleChange} rows="3" className="w-full p-4 rounded-xl bg-gray-900 text-white border border-gray-700 focus:border-red-500 outline-none transition"/>
                    </div>
                    <div className="bg-gray-800 p-5 rounded-3xl border border-gray-700 shadow-lg space-y-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">{t('compSettingsTitle')}</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-gray-500 text-xs mb-2">{t('laneCountPh')}</label><select value={getLaneName(formData.laneCount - 1)} onChange={handleLaneLetterChange} className="w-full p-4 rounded-xl bg-gray-900 text-white border border-gray-700 focus:border-red-500 outline-none transition appearance-none">{alphabetOptions.map((letter, idx) => (<option key={letter} value={letter}>{letter} ({idx + 1} Lane{idx > 0 ? 's' : ''})</option>))}</select></div>
                            <div><label className="block text-gray-500 text-xs mb-2">{t('laneCapacityPh')}</label><input type="number" name="laneCapacity" placeholder="50" value={formData.laneCapacity} onChange={handleChange} min="1" className="w-full p-4 rounded-xl bg-gray-900 text-white border border-gray-700 focus:border-red-500 outline-none transition"/></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 flex items-center"><Hash size={12} className="mr-1"/> {t('laneHint').replace('{total}', formData.laneCount * formData.laneCapacity).replace('{lastChar}', getLaneName(formData.laneCount - 1))}</p>
                    </div>
                    <div className="bg-gray-800 p-5 rounded-3xl border border-gray-700 shadow-lg space-y-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">{t('roundConfigTitle')}</h3>
                        <p className="text-xs text-gray-500">{t('roundConfigDesc')}</p>
                        {rounds.map((round, index) => (
                            <div key={index} className="flex gap-2 items-center">
                                <div className="flex-1 bg-gray-900 p-3 rounded-xl border border-gray-700 text-white text-sm flex items-center"><span className="text-gray-400 mr-2">{t('roundLabel')} {round.round}:</span><input type="number" value={round.qualifiers} onChange={(e) => updateRoundConfig(index, 'qualifiers', e.target.value)} className="bg-transparent w-full outline-none text-right" placeholder="Qualifiers"/><span className="ml-2 text-gray-500">人</span></div>
                                <button type="button" onClick={() => removeRoundConfig(index)} className="p-3 bg-red-900/30 text-red-400 rounded-xl hover:bg-red-900/50"><Trash2 size={18}/></button>
                            </div>
                        ))}
                        <button type="button" onClick={addRoundConfig} className="w-full py-2 border border-dashed border-gray-600 rounded-xl text-gray-400 hover:text-white hover:border-gray-400 text-sm flex items-center justify-center"><PlusCircle size={16} className="mr-1"/> {t('addRound')}</button>
                    </div>
                    <div className="bg-gray-800 p-5 rounded-3xl border border-gray-700 shadow-lg space-y-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">{t('paymentSettingsTitle')}</h3>
                        <textarea name="paymentInfo" placeholder={t('paymentDescPh')} value={formData.paymentInfo} onChange={handleChange} rows="3" className="w-full p-4 rounded-xl bg-gray-900 text-white border border-gray-700 focus:border-red-500 outline-none transition"/>
                        <input type="text" name="paymentQrCodeUrl" placeholder={t('paymentQrPh')} value={formData.paymentQrCodeUrl} onChange={handleChange} className="w-full p-4 rounded-xl bg-gray-900 text-white border border-gray-700 focus:border-red-500 outline-none transition"/>
                    </div>
                    <button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition flex items-center justify-center text-lg">{isSubmitting ? <Loader2 className="animate-spin" size={24} /> : t('publishBtn')}</button>
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
        const myHostedEvents = events.filter(e => e.creatorId === userId);
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

    // 7. Event Manager (後台) ... (保持完整功能)
    const EventManager = ({ event }) => {
        const [activeTab, setActiveTab] = useState('calling');
        const [allRegistrations, setAllRegistrations] = useState([]);
        const [callStatus, setCallStatus] = useState({ displayNumbers: [], currentSequence: 1 });
        const [isProcessing, setIsProcessing] = useState(false);
        const [laneSettings, setLaneSettings] = useState({ count: event.laneCount, capacity: event.laneCapacity });
        const [callSettings, setCallSettings] = useState({ callMode: event.callMode || 'single', strictSequence: event.strictSequence || false });
        
        const REG_COL_PATH = `artifacts/${appId}/public/data/registrations`;
        const STATUS_DOC_PATH = `artifacts/${appId}/public/data/call_status/${event.id}`;
        const EVENT_DOC_REF = doc(db, `artifacts/${appId}/public/data/events`, event.id);
        
        useEffect(() => {
            if (!db) return;
            const unsubscribeStatus = onSnapshot(doc(db, STATUS_DOC_PATH), (docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setCallStatus({ displayNumbers: data.displayNumbers || [], currentSequence: data.currentSequence || 1 });
                }
            });
            const q = query(collection(db, REG_COL_PATH), where("eventId", "==", event.id));
            const unsubscribeRegs = onSnapshot(q, (snapshot) => {
                setAllRegistrations(snapshot.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => a.queueNumber - b.queueNumber));
            });
            return () => { unsubscribeStatus(); unsubscribeRegs(); };
        }, [db, STATUS_DOC_PATH, REG_COL_PATH, event.id]);

        const saveCallSettings = async (newSettings) => { setCallSettings(newSettings); if (db) await updateDoc(EVENT_DOC_REF, newSettings); };

        const handleCallNext = async () => {
            if (!db || isProcessing) return;
            setIsProcessing(true); setSystemMessage(t('calculatingNext'));
            try {
                const availableRegs = allRegistrations.filter(r => r.checkedIn && !r.called && r.laneAssignment);
                const sortedRegs = [...availableRegs].sort((a, b) => a.queueNumber - b.queueNumber);
                let nextDisplayNumbers = []; let updates = []; let nextSeq = callStatus.currentSequence;

                if (callSettings.callMode === 'single') {
                    if (callSettings.strictSequence) {
                        nextDisplayNumbers = [nextSeq];
                        const target = sortedRegs.find(r => r.queueNumber === nextSeq);
                        if (target) updates.push(target.id);
                        nextSeq++;
                    } else {
                        if (sortedRegs.length > 0) {
                            const target = sortedRegs[0];
                            nextDisplayNumbers = [target.queueNumber];
                            updates.push(target.id);
                            nextSeq = target.queueNumber + 1; 
                        } else {
                            setSystemMessage(t('noMorePlayers')); setIsProcessing(false); return;
                        }
                    }
                } else {
                    const lanes = [...new Set(allRegistrations.map(r => r.laneAssignment).filter(l => l))].sort();
                    lanes.forEach(lane => {
                        const candidate = sortedRegs.find(r => r.laneAssignment === lane);
                        if (candidate) { nextDisplayNumbers.push(candidate.queueNumber); updates.push(candidate.id); }
                    });
                    if (nextDisplayNumbers.length === 0) { setSystemMessage(t('allLanesEmpty')); setIsProcessing(false); return; }
                }

                const statusRef = doc(db, STATUS_DOC_PATH);
                await setDoc(statusRef, { displayNumbers: nextDisplayNumbers, currentSequence: nextSeq, updatedAt: serverTimestamp() }, { merge: true });
                for (const regId of updates) { await updateDoc(doc(db, REG_COL_PATH, regId), { called: true }); }
                setSystemMessage(`${t('callSuccess')}: ${nextDisplayNumbers.join(', ')}`);
            } catch (e) { console.error(e); setSystemMessage(`${t('callFail')}: ${e.message}`); } finally { setIsProcessing(false); }
        };

        const handleStart7toSmoke = async () => {
            const qualified = allRegistrations.filter(r => r.qualifiedRound === event.currentRound);
            if (qualified.length !== 8) { setSystemMessage(t('smokeReq')); return; }
            const shuffled = [...qualified].sort(() => 0.5 - Math.random());
            const newState = { king: shuffled[0].id, challenger: shuffled[1].id, queue: shuffled.slice(2).map(r => r.id), wins: {} };
            await updateDoc(EVENT_DOC_REF, { callMode: '7tosmoke', smokeState: newState });
            setSystemMessage("7 to Smoke Started!");
        };

        const handleSmokeWin = async (winnerId) => {
            const state = event.smokeState;
            const loserId = winnerId === state.king ? state.challenger : state.king;
            const newWins = { ...state.wins, [winnerId]: (state.wins[winnerId] || 0) + 1 };
            let newKing = state.king; let newChallenger = state.challenger; let newQueue = [...state.queue];
            if (winnerId === state.challenger) { newKing = state.challenger; newQueue.push(state.king); } else { newQueue.push(state.challenger); }
            newChallenger = newQueue.shift(); 
            await updateDoc(EVENT_DOC_REF, { smokeState: { king: newKing, challenger: newChallenger, queue: newQueue, wins: newWins } });
        };

        const handleStartTournament = async () => {
            const qualified = allRegistrations.filter(r => r.qualifiedRound === event.currentRound);
            if (qualified.length < 2 || qualified.length % 2 !== 0) { setSystemMessage(t('tournReq')); return; }
            const shuffled = [...qualified].sort(() => 0.5 - Math.random());
            const matches = [];
            for (let i = 0; i < shuffled.length; i += 2) { matches.push({ p1: shuffled[i].id, p2: shuffled[i+1].id, winner: null }); }
            await updateDoc(EVENT_DOC_REF, { callMode: 'tournament', tournamentState: { matches } });
            setSystemMessage("Tournament Started!");
        };

        const handleTournamentWin = async (matchIndex, winnerId) => {
            const newMatches = [...event.tournamentState.matches];
            newMatches[matchIndex].winner = winnerId;
            await updateDoc(doc(db, REG_COL_PATH, winnerId), { qualifiedRound: event.currentRound + 1 });
            await updateDoc(EVENT_DOC_REF, { tournamentState: { matches: newMatches } });
        };

        // Sub-components (defined inside EventManager to access state)
        const CallingStatusTab = () => {
            const displayNums = callStatus.displayNumbers;
            return (
                <div className="space-y-4">
                    <div className="bg-gray-800 p-4 rounded-xl border border-gray-600 mb-4">
                         <h3 className="text-sm text-gray-400 mb-2 flex items-center"><Settings size={14} className="mr-1"/> {t('callStrategy')}</h3>
                         <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between"><span className="text-white text-sm">{t('mode')}:</span><div className="flex bg-gray-700 rounded p-1"><button onClick={() => saveCallSettings({...callSettings, callMode: 'single'})} className={`px-3 py-1 text-xs rounded transition ${callSettings.callMode === 'single' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>{t('modeSingle')}</button><button onClick={() => saveCallSettings({...callSettings, callMode: 'all_lanes'})} className={`px-3 py-1 text-xs rounded transition ${callSettings.callMode === 'all_lanes' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>{t('modeAllLanes')}</button></div></div>
                            {callSettings.callMode === 'single' && <div className="flex items-center justify-between"><span className="text-white text-sm">{t('emptyStrategy')}:</span><div className="flex bg-gray-700 rounded p-1"><button onClick={() => saveCallSettings({...callSettings, strictSequence: false})} className={`px-3 py-1 text-xs rounded transition ${!callSettings.strictSequence ? 'bg-green-600 text-white' : 'text-gray-400'}`}>{t('skipEmpty')}</button><button onClick={() => saveCallSettings({...callSettings, strictSequence: true})} className={`px-3 py-1 text-xs rounded transition ${callSettings.strictSequence ? 'bg-red-600 text-white' : 'text-gray-400'}`}>{t('keepEmpty')}</button></div></div>}
                         </div>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-xl shadow-inner border-b-4 border-red-500 text-center"><p className="text-lg text-red-300 font-semibold mb-3">{t('currentCall')}</p><div className="flex justify-center items-center gap-4 flex-wrap min-h-[100px]">{displayNums.length > 0 ? displayNums.map((num, idx) => (<div key={idx} className="text-6xl font-black text-white p-4 bg-red-700 rounded-xl shadow-lg border-2 border-red-400 min-w-[100px] animate-in zoom-in duration-300">{formatNumber(num)}</div>)) : <span className="text-4xl text-gray-500">--</span>}</div></div>
                    <button onClick={handleCallNext} disabled={isProcessing} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-lg shadow-md transition flex items-center justify-center text-lg active:scale-95">{isProcessing ? <Loader2 className="animate-spin mr-2" size={24} /> : <Megaphone size={24} className="mr-2"/>}{callSettings.callMode === 'all_lanes' ? t('callNextBatch') : t('callNext')}</button>
                </div>
            );
        };

        const SevenToSmokeUI = () => {
            const state = event.smokeState; if (!state || !state.king) return <div>Loading...</div>;
            const getDancer = (id) => allRegistrations.find(r => r.id === id);
            const king = getDancer(state.king); const challenger = getDancer(state.challenger);
            return (
                <div className="space-y-6"><div className="flex justify-between items-center bg-purple-900/50 p-4 rounded-xl border border-purple-500"><div className="text-center w-1/2 border-r border-purple-700"><Crown size={32} className="mx-auto text-yellow-400 mb-2"/><p className="text-xs text-purple-300 uppercase">{t('smokeKing')}</p><p className="text-2xl font-black text-white">{king ? `${king.laneAssignment}-${formatNumber(king.queueNumber)}` : '?'}</p><p className="text-xl text-yellow-400 font-bold">{state.wins[state.king] || 0} Wins</p><button onClick={() => handleSmokeWin(state.king)} className="mt-2 bg-yellow-600 text-white text-xs px-4 py-2 rounded-lg font-bold">{t('smokeWinBtn')}</button></div><div className="text-center w-1/2"><Swords size={32} className="mx-auto text-red-400 mb-2"/><p className="text-xs text-red-300 uppercase">{t('smokeChallenger')}</p><p className="text-2xl font-black text-white">{challenger ? `${challenger.laneAssignment}-${formatNumber(challenger.queueNumber)}` : '?'}</p><p className="text-xl text-gray-400 font-bold">{state.wins[state.challenger] || 0} Wins</p><button onClick={() => handleSmokeWin(state.challenger)} className="mt-2 bg-red-600 text-white text-xs px-4 py-2 rounded-lg font-bold">{t('smokeWinBtn')}</button></div></div><div className="bg-gray-800 p-4 rounded-xl"><p className="text-sm text-gray-400 mb-2 flex items-center"><Users size={14} className="mr-1"/> {t('smokeInLine')}</p><div className="flex gap-2 overflow-x-auto pb-2">{state.queue.map((id, idx) => { const d = getDancer(id); return <div key={idx} className="bg-gray-700 px-3 py-1 rounded text-sm whitespace-nowrap">{idx+1}. {d ? `${d.laneAssignment}-${formatNumber(d.queueNumber)}` : '?'}</div> })}</div></div></div>
            );
        };

        const TournamentUI = () => {
            const matches = event.tournamentState?.matches || []; const getDancer = (id) => allRegistrations.find(r => r.id === id);
            return (
                <div className="space-y-4"><h3 className="text-xl font-bold text-white flex items-center"><Trophy size={20} className="mr-2 text-yellow-500"/> {t('tournTitle')}</h3><div className="space-y-3">{matches.map((match, idx) => { const p1 = getDancer(match.p1); const p2 = getDancer(match.p2); const isFinished = !!match.winner; return (<div key={idx} className={`bg-gray-800 p-3 rounded-xl border ${isFinished ? 'border-gray-700 opacity-60' : 'border-blue-500'}`}><div className="flex justify-between items-center mb-2"><span className="text-xs text-gray-500">Battle {idx + 1}</span>{isFinished && <span className="text-xs bg-green-900 text-green-300 px-2 rounded">Finished</span>}</div><div className="flex justify-between items-center"><div className={`text-center ${match.winner === match.p1 ? 'text-green-400 font-bold' : 'text-white'}`}><p className="text-lg">{p1 ? `${p1.laneAssignment}-${formatNumber(p1.queueNumber)}` : '?'}</p>{!isFinished && <button onClick={() => handleTournamentWin(idx, match.p1)} className="text-xs bg-gray-700 px-2 py-1 rounded mt-1 hover:bg-green-600">{t('tournWinnerBtn')}</button>}</div><span className="text-gray-500 font-bold">VS</span><div className={`text-center ${match.winner === match.p2 ? 'text-green-400 font-bold' : 'text-white'}`}><p className="text-lg">{p2 ? `${p2.laneAssignment}-${formatNumber(p2.queueNumber)}` : '?'}</p>{!isFinished && <button onClick={() => handleTournamentWin(idx, match.p2)} className="text-xs bg-gray-700 px-2 py-1 rounded mt-1 hover:bg-green-600">{t('tournWinnerBtn')}</button>}</div></div></div>); })}</div></div>
            );
        };

        const CheckInTab = () => {
            const [searchTerm, setSearchTerm] = useState('');
            const handleToggle = async (regId, field) => { if (!db) return; await updateDoc(doc(db, REG_COL_PATH, regId), { [field]: !allRegistrations.find(r => r.id === regId)[field] }); };
            const filteredRegs = allRegistrations.filter(reg => reg.queueNumber.toString().includes(searchTerm));
            const total = allRegistrations.length; const checkedInCount = allRegistrations.filter(r => r.checkedIn).length; const paidCount = allRegistrations.filter(r => r.paid).length;
            return (
                <div className="space-y-4"><div className="bg-gray-800 p-4 rounded-xl border border-gray-600 space-y-3"><div className="flex justify-between text-xs text-gray-400 px-1"><span>{t('statsTotal')}: {total}</span><span className="text-green-400">{t('statsCheckedIn')}: {checkedInCount}</span><span className="text-yellow-400">{t('statsPaid')}: {paidCount}</span></div><div className="relative"><Search className="absolute left-3 top-2.5 text-gray-500" size={16} /><input type="number" placeholder={t('searchPlaceholder')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-gray-900 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-700 focus:border-indigo-500 outline-none placeholder-gray-600"/></div></div><div className="max-h-96 overflow-y-auto bg-gray-900 rounded-lg p-2 space-y-2">{filteredRegs.length > 0 ? filteredRegs.map(reg => (<div key={reg.id} className={`flex flex-col p-3 bg-gray-800 rounded-lg border-l-4 transition ${reg.called ? 'border-gray-500 opacity-60' : 'border-yellow-500'}`}><div className="flex justify-between items-start mb-2"><div><span className="text-3xl font-black text-white mr-2">{formatNumber(reg.queueNumber)}</span>{reg.called && <span className="text-xs bg-gray-600 px-2 py-0.5 rounded text-white inline-block">{t('called')}</span>}</div><div className="text-right">{reg.laneAssignment ? <span className="text-xs font-bold text-indigo-400 bg-indigo-900/30 px-2 py-1 rounded">{reg.laneAssignment}</span> : <span className="text-xs text-gray-500">--</span>}</div></div><div className="grid grid-cols-2 gap-2"><button onClick={() => handleToggle(reg.id, 'paid')} className={`flex items-center justify-center px-3 py-2 rounded-lg text-sm font-bold transition border ${reg.paid ? 'bg-green-600 border-green-600 text-white' : 'bg-transparent border-gray-600 text-gray-400'}`}><DollarSign size={14} className="mr-1"/> {reg.paid ? t('statusPaid') : t('statusNotPaid')}</button><button onClick={() => handleToggle(reg.id, 'checkedIn')} className={`flex items-center justify-center px-3 py-2 rounded-lg text-sm font-bold transition border ${reg.checkedIn ? 'bg-blue-600 border-blue-600 text-white' : 'bg-transparent border-gray-600 text-gray-400'}`}><ListChecks size={14} className="mr-1"/> {reg.checkedIn ? t('statusCheckedIn') : t('statusNotCheckedIn')}</button></div></div>)) : <p className="text-center text-gray-500 py-8">{t('noResult')}</p>}</div></div>
            );
        };

        const ProgressionTab = () => {
            const [manualInput, setManualInput] = useState('');
            const [randomCount, setRandomCount] = useState('');
            const currentRound = event.currentRound || 1;
            const roundStatus = event.roundStatus || 'active';
            const nextRoundConfig = event.roundsConfig?.find(r => r.round === currentRound + 1);
            const targetQualifiers = nextRoundConfig ? nextRoundConfig.qualifiers : '未設定';

            const handleAdvance = async (method) => {
                if (!db || isProcessing) return;
                setIsProcessing(true); setSystemMessage(t('advancing'));
                try {
                    let qualifiedIds = [];
                    const currentQualifiedRegs = allRegistrations.filter(r => (r.qualifiedRound || 1) === currentRound && r.checkedIn && r.paid);
                    if (method === 'manual') {
                        const entries = manualInput.split(/[,，\s]+/).filter(s => s.trim());
                        for (const entry of entries) {
                            const match = entry.match(/^([A-Za-z])(\d+)$/i);
                            if (match) {
                                const laneChar = match[1].toUpperCase();
                                const num = parseInt(match[2]);
                                const target = currentQualifiedRegs.find(r => r.laneAssignment === laneChar && r.queueNumber === num);
                                if (target) qualifiedIds.push(target.id);
                            }
                        }
                        if (qualifiedIds.length === 0) throw new Error("No matches");
                    } else if (method === 'random') {
                        const count = parseInt(randomCount);
                        if (!count || count > currentQualifiedRegs.length) throw new Error("Invalid count");
                        const shuffled = [...currentQualifiedRegs].sort(() => 0.5 - Math.random());
                        qualifiedIds = shuffled.slice(0, count).map(r => r.id);
                    }
                    for (const id of qualifiedIds) { await updateDoc(doc(db, REG_COL_PATH, id), { qualifiedRound: currentRound + 1 }); }
                    await updateDoc(EVENT_DOC_REF, { currentRound: currentRound + 1 });
                    setSystemMessage(t('advanceSuccess')); setManualInput(''); setRandomCount('');
                } catch (e) { setSystemMessage(`${t('advanceFail')}: ${e.message}`); } finally { setIsProcessing(false); }
            };

            const handleEndEvent = async () => { if(confirm("Sure?")) { await updateDoc(EVENT_DOC_REF, { roundStatus: 'closed' }); } };

            if (roundStatus === 'closed') return <div className="p-8 text-center text-gray-400 bg-gray-800 rounded-xl">Closed</div>;

            return (
                <div className="space-y-6">
                    <div className="bg-gray-800 p-4 rounded-xl border border-gray-600 flex justify-between items-center"><div><p className="text-sm text-gray-400">{t('currentRound')}</p><p className="text-2xl font-bold text-white">{t('roundText').replace('{n}', currentRound)}</p></div><div className="text-right"><p className="text-sm text-gray-400">{t('nextRoundTarget')}</p><p className="text-xl font-bold text-yellow-400">{targetQualifiers} 人</p></div></div>
                    <div className="bg-gray-700 p-5 rounded-2xl space-y-4"><h3 className="text-lg font-bold text-white flex items-center"><Trophy size={20} className="mr-2 text-yellow-500"/> {t('advanceManual')}</h3><input type="text" value={manualInput} onChange={(e) => setManualInput(e.target.value)} placeholder={t('advanceManualPh')} className="w-full p-3 bg-gray-800 text-white rounded-xl border border-gray-600 focus:border-yellow-500 outline-none"/><button onClick={() => handleAdvance('manual')} disabled={isProcessing} className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-3 rounded-xl transition">{t('advanceBtn')}</button></div>
                    <div className="bg-gray-700 p-5 rounded-2xl space-y-4"><h3 className="text-lg font-bold text-white flex items-center"><Shuffle size={20} className="mr-2 text-purple-400"/> {t('advanceRandom')}</h3><input type="number" value={randomCount} onChange={(e) => setRandomCount(e.target.value)} placeholder={t('advanceRandomCountPh')} className="w-full p-3 bg-gray-800 text-white rounded-xl border border-gray-600 focus:border-purple-500 outline-none"/><button onClick={() => handleAdvance('random')} disabled={isProcessing} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition">{t('advanceBtn')}</button></div>
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-5 rounded-2xl border border-gray-700"><h3 className="text-lg font-bold text-white mb-4 flex items-center"><Sparkles size={18} className="mr-2 text-yellow-400"/> {t('specialModesTitle')}</h3><div className="grid grid-cols-1 gap-3"><button onClick={handleStart7toSmoke} className="bg-purple-700 hover:bg-purple-600 text-white py-3 rounded-xl font-bold flex items-center justify-center transition"><Crown size={18} className="mr-2"/> {t('start7toSmoke')}</button><button onClick={handleStartTournament} className="bg-blue-700 hover:bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center transition"><Trophy size={18} className="mr-2"/> {t('startTournament')}</button><button onClick={() => updateDoc(EVENT_DOC_REF, { callMode: 'single' })} className="bg-gray-700 hover:bg-gray-600 text-gray-300 py-2 rounded-xl text-sm font-medium mt-2">{t('resetMode')}</button></div></div>
                    <button onClick={handleEndEvent} className="w-full py-3 text-red-400 border border-red-900/50 rounded-xl hover:bg-red-900/20">{t('endEventBtn')}</button>
                </div>
            );
        };

        const renderContent = () => {
            if (event.callMode === '7tosmoke') return <SevenToSmokeUI />;
            if (event.callMode === 'tournament') return <TournamentUI />;
            if (activeTab === 'calling') return <CallingStatusTab />;
            if (activeTab === 'checkin') return <CheckInTab />;
            if (activeTab === 'progression') return <ProgressionTab />;
            return <CallingStatusTab />;
        };

        return (
            <div className="p-4 pb-24 space-y-4">
                <button onClick={() => navigate('detail', event)} className="flex items-center text-gray-400 hover:text-white mb-4"><ChevronLeft size={24}/> {t('backToEvents')}</button>
                <h2 className="text-2xl font-bold text-white">{event.name} - {t('manageTitle')}</h2>
                <div className="flex bg-gray-800 rounded-xl overflow-hidden shadow-lg p-1">
                    {[ {k:'calling',l:t('tabCalling'),i:Megaphone}, {k:'checkin',l:t('tabCheckIn'),i:ListChecks}, {k:'progression',l:t('tabProgression'),i:TrendingUp} ].map(tb => (
                        <button key={tb.k} onClick={() => setActiveTab(tb.k)} className={`flex-1 py-3 text-xs font-bold rounded-lg flex flex-col justify-center items-center gap-1 transition ${activeTab===tb.k?'bg-gray-700 text-white shadow-sm':'text-gray-500 hover:text-gray-300'}`}><tb.i size={18}/>{tb.l}</button>
                    ))}
                </div>
                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                    {renderContent()}
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
            {[{n:t('navHome'),i:Grid,p:'browse'}, {n:t('navCreate'),i:PlusCircle,p:'create'}, {n:t('navMy'),i:User,p:'my_events'}, {n:t('navManage'),i:ClipboardList,p:'manage_list'}].map(i=>(
                <button key={i.p} onClick={()=>navigate(i.p)} className={`flex flex-col items-center justify-center p-2 w-full transition active:scale-90 ${currentPage===i.p || (currentPage==='detail' && i.p==='browse') || (currentPage==='registerSuccess' && i.p==='browse') ?'text-red-500':'text-gray-500 hover:text-gray-300'}`}><i.i size={26} strokeWidth={currentPage===i.p ? 2.5 : 2}/><span className="text-[10px] mt-1 font-medium">{i.n}</span></button>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-black flex flex-col items-center text-sans">
            <div id="app" className="w-full max-w-md min-h-screen flex flex-col bg-gray-900 text-white shadow-2xl relative">
                <header className="bg-gray-900/90 backdrop-blur-md text-white p-4 flex justify-between items-center sticky top-0 z-40 border-b border-gray-800"><h1 className="text-xl font-black tracking-tight flex items-center"><span className="text-red-600 mr-1 text-2xl">⚡</span> {t('appTitle')}</h1><div className="flex items-center gap-2 bg-gray-800 rounded-full px-3 py-1.5 border border-gray-700"><Globe size={14} className="text-gray-400"/><select value={lang} onChange={(e) => setLang(e.target.value)} className="bg-transparent text-xs text-gray-300 focus:outline-none cursor-pointer font-medium"><option value="zh-TW">繁體</option><option value="zh-CN">简中</option><option value="en">EN</option><option value="ja">JP</option><option value="ko">KR</option></select></div></header>
                <main className="flex-grow overflow-y-auto overflow-x-hidden relative">{renderPage()}</main>
                <BottomNav />
            </div>
        </div>
    );
};

export default App;