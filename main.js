const {app,ipcMain,BrowserWindow,Menu,nativeTheme} = require('electron')
const path = require('path')
const fs = require('fs')
const Store = require('electron-store');
const log = require('electron-log');
const windowStateKeeper = require('electron-window-state');

let translation,mainWin,setWin,page=1,version,appLang,langs=[];
//{'name':'中文','id':'zh-CN'}
const store = new Store();
log.initialize();

// 加载设置
const loadSettingP1 = ()=>{
    nativeTheme.themeSource = store.get('theme');
    if(store.get('lang') === 'system')appLang = getLanguage();
    else appLang = store.get('lang');
    translation = getTranslation(appLang);
}
const loadSettingP2 = ()=>{
    mainWin.setAlwaysOnTop(store.get('top'));
    mainWin.webContents.send('set-drag',store.get('drag'));
}
// 获取版本
const getVersion = ()=>{return JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json')))['version']}

// 获取语言列表
const getLanguageList = ()=>{
    let langs = [];
    const langFiles = fs.readdirSync(path.join(__dirname,'lang'));
    for(let i in langFiles){
        const tmpLang = JSON.parse(fs.readFileSync(path.join(__dirname,'lang/'+langFiles[i])));
        langs.push({'name':tmpLang['languageName'],'id':langFiles[i].substring(0, langFiles[i].lastIndexOf("."))})
    }
    return langs;
}
// 获取语言
const getLanguage = ()=>{
    for(let i in langs){
        let lang = app.getSystemLocale();
        if(lang === langs[i]['id'])return lang;
    }
    return 'en-US';
}
// 获取翻译
const getTranslation = (lang) =>{return JSON.parse(fs.readFileSync(path.join(__dirname, 'lang/' + lang + '.json')))}

// 创建主窗口
const createMainWindow = () =>{
    let winState = windowStateKeeper({defaultWidth:400,defaultHeight:200});
    const win = new BrowserWindow({
        width:winState.width,
        height:winState.height,
        x:winState.x,
        y:winState.y,
        autoHideMenuBar: true,
        frame:false,
        transparent:true,
        skipTaskbar:true,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false,
        }
    })
    win.loadFile(path.join(__dirname,'html/index.html'));
    win.setBackgroundMaterial("mica");
    winState.manage(win);
    // win.webContents.openDevTools({'mode':'detach'})
    return win;
}
// 创建设置窗口
const createSettingWindow = () =>{
    const win = new BrowserWindow({
        width:800,
        height:800,
        autoHideMenuBar: true,
        transparent:true,
        frame:false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false,
        }
    })
    win.setBackgroundMaterial("mica")
    win.loadFile(path.join(__dirname,'html/settings.html'))
    // win.webContents.openDevTools({'mode':'detach'})
    return win;
}
app.whenReady().then(()=>{
    // 初始化存储
    if(store.size === 0){
        log.info('Store is empty,initializing.')
        store.set('theme','system');
        store.set('lang','system');
        store.set('top',false);
        store.set('drag',true);
    }
    log.info('Get Language List');
    langs = getLanguageList();
    log.info('Load Settings Part 1');
    loadSettingP1();
    log.info('Create Main Window')
    mainWin = createMainWindow();
    version = getVersion();
    log.info('App Version:'+version);
    log.info('load Settings Part 2');
    loadSettingP2();
})

// 退出程序
app.on('window-all-closed',()=>{
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
                setWin = createSettingWindow();
            }
        },
        {
            label: translation['exit'],
            click:()=>{
                log.info('Quit App - from context menu');
                app.quit();
            }
        }
    ]
    const menu = Menu.buildFromTemplate(template)
    menu.popup({ window: BrowserWindow.fromWebContents(event.sender) })
})

// 获取翻译内容
ipcMain.on("get-translation", (event) => {
    log.info('get-translation');
    event.returnValue = translation;
});

// 关闭及最小化设置窗口
ipcMain.on('setting-window-control',(event,arg)=>{
    log.info('setting-window-control:'+arg);
    if(arg === 'close')setWin.destroy();
    else if(arg === 'minimize')setWin.minimize();
    event.returnValue = 0;
})

// 获取主题
ipcMain.on('get-theme',(event)=>{
    log.info('get-theme');
    event.returnValue = store.get('theme');
})
// 更换主题
ipcMain.on('change-theme',(event,arg)=>{
    log.info('change-theme:'+arg);
    nativeTheme.themeSource = arg;
    store.set('theme',arg);
    event.returnValue = 0;
})

// 获取版本
ipcMain.on('get-version',(event)=>{
    log.info('get-version');
    event.returnValue = version;
})

// 获取语言列表
ipcMain.on('get-languages',(event)=>{
    log.info('get-languages');
    event.returnValue = langs;
})
// 获取当前语言
ipcMain.on('get-language',(event)=>{
    log.info('get-language');
    event.returnValue = store.get('lang');
})
// 更改语言
ipcMain.on('set-language',(event,arg)=>{
    log.info('set-language:'+arg);
    store.set('lang',arg);
    if(arg === 'system')appLang = getLanguage();
    else appLang = arg;
    translation = getTranslation(appLang);
    mainWin.webContents.send('refresh');
    event.returnValue = 0;
})

// 获取当前页面
ipcMain.on('get-page',(event)=>{
    log.info('get-page');
    event.returnValue = page;
})
// 切换当前页面
ipcMain.on('set-page',(event,arg)=>{
    log.info('set-page:'+arg);
    page = arg;
    event.returnValue = 0;
})

// 获取窗口置顶
ipcMain.on('get-top',(event)=>{
    log.info('get-top');
    event.returnValue = store.get('top');
})
// 设置窗口置顶
ipcMain.on('set-top',(event,arg)=>{
    log.info('set-top:'+arg);
    store.set('top',arg);
    mainWin.setAlwaysOnTop(arg);
    event.returnValue = 0;
})

// 获取允许拖动
ipcMain.on('get-drag',(event)=>{
    log.info('get-drag');
    event.returnValue = store.get('drag');
})
// 设置允许拖动
ipcMain.on('set-drag',(event,arg)=>{
    log.info('set-drag:'+arg);
    store.set('drag',arg);
    mainWin.webContents.send('set-drag',arg);
    event.returnValue = 0;
})

// 获取开机启动
ipcMain.on('get-autostart',(event)=>{
    log.info('get-autostart');
    event.returnValue = app.getLoginItemSettings()['openAtLogin'];
})
// 设置开机启动
ipcMain.on('set-autostart',(event,arg)=>{
    log.info('set-autostart:'+arg);
    app.setLoginItemSettings({openAtLogin:arg});
    event.returnValue = 0;
})