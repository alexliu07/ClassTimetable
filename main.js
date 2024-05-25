const {app, ipcMain, BrowserWindow, Menu, nativeTheme} = require('electron')
const path = require('path')
const fs = require('fs')
const Store = require('electron-store');
const log = require('electron-log');
const windowStateKeeper = require('electron-window-state');

let translation, mainWin, setWin = -1, page = 1, version, appLang, langs = [],
    weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
//{'name':'中文','id':'zh-CN'}
const store = new Store();
log.initialize();

// 加载设置
const loadSettingP1 = () => {
    nativeTheme.themeSource = store.get('theme');
    if (store.get('lang') === 'system') appLang = getLanguage();
    else appLang = store.get('lang');
    translation = getTranslation(appLang);
}
const loadSettingP2 = () => {
    mainWin.setAlwaysOnTop(store.get('top'));
    mainWin.webContents.send('set-drag', store.get('drag'));
}
// 获取版本
const getVersion = () => {
    return JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json')).toString())['version']
}

// 获取语言列表
const getLanguageList = () => {
    let langs = [];
    const langFiles = fs.readdirSync(path.join(__dirname, 'lang'));
    for (let i in langFiles) {
        const tmpLang = JSON.parse(fs.readFileSync(path.join(__dirname, 'lang/' + langFiles[i])).toString());
        langs.push({'name': tmpLang['languageName'], 'id': langFiles[i].substring(0, langFiles[i].lastIndexOf("."))})
    }
    return langs;
}
// 获取语言
const getLanguage = () => {
    for (let i in langs) {
        let lang = app.getSystemLocale();
        if (lang === langs[i]['id']) return lang;
    }
    return 'en-US';
}
// 获取翻译
const getTranslation = (lang) => {
    return JSON.parse(fs.readFileSync(path.join(__dirname, 'lang/' + lang + '.json')).toString())
}

// 创建主窗口
const createMainWindow = () => {
    let winState = windowStateKeeper({defaultWidth: 400, defaultHeight: 200});
    const win = new BrowserWindow({
        width: winState.width,
        height: winState.height,
        x: winState.x,
        y: winState.y,
        autoHideMenuBar: true,
        frame: false,
        transparent: true,
        skipTaskbar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    })
    win.loadFile(path.join(__dirname, 'html/index.html'));
    win.setBackgroundMaterial("mica");
    winState.manage(win);
    // win.webContents.openDevTools({'mode':'detach'})
    return win;
}
// 创建设置窗口
const createSettingWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 850,
        autoHideMenuBar: true,
        transparent: true,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    })
    win.setBackgroundMaterial("mica")
    win.loadFile(path.join(__dirname, 'html/settings.html'))
    win.webContents.openDevTools({'mode': 'detach'})
    return win;
}
app.whenReady().then(() => {
    // 初始化存储
    if (store.size === 0) {
        log.info('Store is empty,initializing.')
        store.set('theme', 'system');
        store.set('lang', 'system');
        store.set('top', false);
        store.set('drag', true);
        store.set('schedules', {
            'monday': [],
            'tuesday': [],
            'wednesday': [],
            'thursday': [],
            'friday': [],
            'saturday': [],
            'sunday': []
        });
    }
    log.info('Get Language List');
    langs = getLanguageList();
    log.info('Load Settings Part 1');
    loadSettingP1();
    log.info('Create Main Window')
    mainWin = createMainWindow();
    version = getVersion();
    log.info('App Version:' + version);
    log.info('load Settings Part 2');
    loadSettingP2();
})

// 退出程序
app.on('window-all-closed', () => {
    log.info('Every window is closed,quitting app.')
    if (process.platform !== 'darwin') app.quit()
})

// 展示右键菜单
ipcMain.on('show-context-menu', (event) => {
    log.info('show-context-menu');
    const template = [
        {
            label: translation['edit'],
            click: () => {
                log.info('Create Setting Window - from context menu')
                if(setWin === -1) setWin = createSettingWindow();
                else if(setWin.isDestroyed())setWin = createSettingWindow();
                else log.info('Create Setting Window - already have a setting window, ignoring')
            }
        },
        {
            label: translation['exit'],
            click: () => {
                log.info('Quit App - from context menu');
                app.quit();
            }
        }
    ]
    const menu = Menu.buildFromTemplate(template)
    menu.popup({window: BrowserWindow.fromWebContents(event.sender)})
})

// 获取翻译内容
ipcMain.on("get-translation", (event) => {
    log.info('get-translation');
    event.returnValue = translation;
});

// 关闭及最小化设置窗口
ipcMain.on('setting-window-control', (event, arg) => {
    log.info('setting-window-control:' + arg);
    if (arg === 'close') setWin.destroy();
    else if (arg === 'minimize') setWin.minimize();
})

// 获取主题
ipcMain.on('get-theme', (event) => {
    log.info('get-theme');
    event.returnValue = store.get('theme');
})
// 更换主题
ipcMain.on('change-theme', (event, arg) => {
    log.info('change-theme:' + arg);
    nativeTheme.themeSource = arg;
    store.set('theme', arg);
})

// 获取版本
ipcMain.on('get-version', (event) => {
    log.info('get-version');
    event.returnValue = version;
})

// 获取语言列表
ipcMain.on('get-languages', (event) => {
    log.info('get-languages');
    event.returnValue = langs;
})
// 获取当前语言
ipcMain.on('get-language', (event) => {
    log.info('get-language');
    event.returnValue = store.get('lang');
})
// 更改语言
ipcMain.on('set-language', (event, arg) => {
    log.info('set-language:' + arg);
    store.set('lang', arg);
    if (arg === 'system') appLang = getLanguage();
    else appLang = arg;
    translation = getTranslation(appLang);
    mainWin.webContents.send('refresh');
})

// 获取当前页面
ipcMain.on('get-page', (event) => {
    log.info('get-page');
    event.returnValue = page;
})
// 切换当前页面
ipcMain.on('set-page', (event, arg) => {
    log.info('set-page:' + arg);
    page = arg;
})

// 获取窗口置顶
ipcMain.on('get-top', (event) => {
    log.info('get-top');
    event.returnValue = store.get('top');
})
// 设置窗口置顶
ipcMain.on('set-top', (event, arg) => {
    log.info('set-top:' + arg);
    store.set('top', arg);
    mainWin.setAlwaysOnTop(arg);
})

// 获取允许拖动
ipcMain.on('get-drag', (event) => {
    log.info('get-drag');
    event.returnValue = store.get('drag');
})
// 设置允许拖动
ipcMain.on('set-drag', (event, arg) => {
    log.info('set-drag:' + arg);
    store.set('drag', arg);
    mainWin.webContents.send('set-drag', arg);
})

// 获取开机启动
ipcMain.on('get-autostart', (event) => {
    log.info('get-autostart');
    event.returnValue = app.getLoginItemSettings()['openAtLogin'];
})
// 设置开机启动
ipcMain.on('set-autostart', (event, arg) => {
    log.info('set-autostart:' + arg);
    app.setLoginItemSettings({openAtLogin: arg});
})

// 添加日程
/**
 * 根据键值排序
 * https://blog.csdn.net/weixin_41192489/article/details/111400551
 * @param attr 排序属性
 * @param rev 排序方式，1 代表升序，-1 代表降序
 * @returns {(function(*, *): (*|number))|*}
 */
const sortBy = (attr, rev) => {
    if (rev === undefined) rev = 1;
    return function (a, b) {
        a = a[attr];
        b = b[attr];
        if (a < b) return rev * -1;
        if (a > b) return rev * 1;
        return 0;
    }
}

/**
 * 验证是否时间交叉
 * @param schedule 日程字典
 * @param day 星期
 * @returns {boolean} 是否有交叉
 */
const isCrossTime = (schedule, day) => {
    let schedules = store.get('schedules.'+weekdays[day]);
    for (let i in schedules) {
        if (new Date(schedule['startTime']) > new Date(schedules[i]['startTime']) && new Date(schedule['startTime']) < new Date(schedules[i]['endTime']) || new Date(schedule['endTime']) > new Date(schedules[i]['startTime']) && new Date(schedule['endTime']) < new Date(schedules[i]['endTime']) || new Date(schedule['startTime']) <= new Date(schedules[i]['startTime'] && schedule['endTime']) >= new Date(schedules[i]['endTime'])) return true;
    }
    return false;
}
/**
 * 添加日程
 * @param schedule 日程字典
 * @param day 星期
 * @return 当天日程
 */
const addSchedule = (schedule,day)=>{
    let tmpDay = store.get('schedules.' + weekdays[day]);
    tmpDay.push(schedule);
    tmpDay.sort(sortBy('startTime', 1));
    store.set('schedules.' + weekdays[day], tmpDay);
    return tmpDay;
}
// 添加日程表，返回当天列表排序后结果
ipcMain.on('add-schedule', (event, args) => {
    let id = args[0], scheduleName = args[1], sTime = args[2], eTime = args[3], day = args[4];
    log.info('add-schedule:'+args);
    let tmpSchedule = {
        'id': id,
        'name': scheduleName,
        'startTime': sTime,
        'endTime': eTime
    };
    if(isCrossTime(tmpSchedule,day)){
        event.returnValue = -1;
        return;
    }
    event.returnValue = addSchedule(tmpSchedule,day);
})
// 删除课程表
ipcMain.on('del-schedule',(event,args)=>{
    log.info('del-schedule:'+args);
    let id = args[0],day = args[1];
    let tmpList = store.get('schedules.'+weekdays[day]);
    for(let i = 0;i<tmpList.length;i++){
        if(tmpList[i]['id'] === id){
            tmpList.splice(i,1);
            break;
        }
    }
    store.set('schedules.'+weekdays[day],tmpList);
    event.returnValue = tmpList;
})
// 获取课程表
ipcMain.on('get-schedule',(event,arg)=>{
    log.info('get-schedule:'+arg);
    event.returnValue = store.get('schedules.'+weekdays[arg]);
})
//编辑课程表
ipcMain.on('edit-schedule',(event,args)=>{
    log.info('edit-schedule:'+args);
    let id=args[0],day=args[1],tName=args[2],tsTime=args[3],teTime=args[4],tDay=args[5];
    let tmpList = store.get('schedules.'+weekdays[day]);
    // 临时删除原本的日程
    for(let i = 0;i<tmpList.length;i++){
        if(tmpList[i]['id'] === id){
            tmpList.splice(i,1);
            break;
        }
    }
    // 验证是否重复
    let tmpSchedule = {
        'id': id,
        'name': tName,
        'startTime': tsTime,
        'endTime': teTime
    }
    if(isCrossTime(tmpSchedule,tDay)){
        // 有重复的
        event.returnValue = -1;
        return;
    }
    //没有重复的就添加并删除旧日程
    store.set('schedules.'+weekdays[day],tmpList);
    event.returnValue = addSchedule(tmpSchedule,tDay);
})