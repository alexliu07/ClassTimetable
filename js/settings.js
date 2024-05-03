const { ipcRenderer} = require("electron");

// 注册组件
// 文本相关
const title = document.getElementById('title');
const timeTable = document.getElementById('timeTable');
const general = document.getElementById('general');
const mondayText = document.getElementById('mondayText');
const tuesdayText = document.getElementById('tuesdayText');
const wednesdayText = document.getElementById('wednesdayText');
const thursdayText = document.getElementById('thursdayText');
const fridayText = document.getElementById('fridayText');
const saturdayText = document.getElementById('saturdayText');
const sundayText = document.getElementById('sundayText');
const editScheduleHint = document.getElementById('editScheduleHint');
const classNameHint = document.getElementById('classNameHint');
const startTimeHint = document.getElementById('startTimeHint');
const endTimeHint = document.getElementById('endTimeHint');
const dayHint = document.getElementById('dayHint');
const mondayHint = document.getElementById('mondayHint');
const tuesdayHint = document.getElementById('tuesdayHint');
const wednesdayHint = document.getElementById('wednesdayHint');
const thursdayHint = document.getElementById('thursdayHint');
const fridayHint = document.getElementById('fridayHint');
const saturdayHint = document.getElementById('saturdayHint');
const sundayHint = document.getElementById('sundayHint');
const editBtn = document.getElementById('editBtn');
const importBtn = document.getElementById('importBtn');
const exportBtn = document.getElementById('exportBtn');
const delBtn = document.getElementById('delBtn');
const switchHint = document.getElementById('switchHint');
const autostartHint = document.getElementById('autostartHint');
const dragHint = document.getElementById('dragHint');
const topHint = document.getElementById('topHint');
const selectsHint = document.getElementById('selectsHint');
const langSelHint = document.getElementById('langSelHint');
const themeSelHint = document.getElementById('themeSelHint');
const aboutHint = document.getElementById('aboutHint');
const versionHint = document.getElementById('versionHint');
const langDefault = document.getElementById('langDefault');
const themeDefault = document.getElementById('themeDefault');
const lightHint = document.getElementById('lightHint');
const darkHint = document.getElementById('darkHint');
// 页面相关
const timeTableSetting = document.getElementById('timeTableSetting');
const generalSetting = document.getElementById('generalSetting');
// 窗口相关
const close = document.getElementById('close');
const minimize = document.getElementById('minimize');
// 配色相关
const themeSel = document.getElementById('themeSel');
// 语言相关
const langSel = document.getElementById('langSel');
// 置顶相关
const topSwitch = document.getElementById('topSwitch');
// 拖动相关
const dragSwitch = document.getElementById('dragSwitch');
// 开机启动相关
const autostartSwitch = document.getElementById('autostartSwitch');


// 获取翻译
const translation = ipcRenderer.sendSync("get-translation");
document.title = title.innerHTML = translation['setting'];
timeTable.innerHTML = translation['classTimetable'];
general.innerHTML = translation['general'];
mondayText.innerHTML = mondayHint.innerHTML = translation['monday'];
tuesdayText.innerHTML = tuesdayHint.innerHTML = translation['tuesday'];
wednesdayText.innerHTML = wednesdayHint.innerHTML = translation['wednesday'];
thursdayText.innerHTML = thursdayHint.innerHTML = translation['thursday'];
fridayText.innerHTML = fridayHint.innerHTML = translation['friday'];
saturdayText.innerHTML = saturdayHint.innerHTML = translation['saturday'];
sundayText.innerHTML = sundayHint.innerHTML = translation['sunday'];
editScheduleHint.innerHTML = translation['createSchedule'];
classNameHint.innerHTML = translation['className'];
startTimeHint.innerHTML = translation['startTime'];
endTimeHint.innerHTML = translation['endTime'];
dayHint.innerHTML = translation['day'];
editBtn.innerHTML = translation['add'];
importBtn.innerHTML = translation['import'];
exportBtn.innerHTML = translation['export'];
delBtn.innerHTML = translation['delete'];
switchHint.innerHTML = translation['generalSettings'];
autostartHint.innerHTML = translation['startupLaunch'];
dragHint.innerHTML = translation['allowDrag'];
topHint.innerHTML = translation['atTop'];
selectsHint.innerHTML = translation['otherSettings'];
langSelHint.innerHTML = translation['languageSelect'];
themeSelHint.innerHTML = translation['themeSelect'];
langDefault.innerHTML = themeDefault.innerHTML = translation['followSystem'];
lightHint.innerHTML = translation['light'];
darkHint.innerHTML = translation['dark'];
aboutHint.innerHTML = translation['about'];

// 获取并显示语言列表
let languages = ipcRenderer.sendSync('get-languages');
let langList = [];
for(let i in languages){
    let tmpLang = document.createElement('option');
    tmpLang.value = languages[i]['id'];
    tmpLang.innerHTML = languages[i]['name'];
    langSel.appendChild(tmpLang);
    langList.push(tmpLang);
}

// 获取并显示程序版本
let version = ipcRenderer.sendSync('get-version');
versionHint.innerHTML = 'Class Timetable '+String(version);

// 获取并显示设置内容
autostartSwitch.checked = ipcRenderer.sendSync('get-autostart');
dragSwitch.checked = ipcRenderer.sendSync('get-drag');
topSwitch.checked = ipcRenderer.sendSync('get-top');
let targetLang = ipcRenderer.sendSync('get-language');
for(let i in langList)if(langList[i].value === targetLang)langList[i].selected = true;
let targetTheme = ipcRenderer.sendSync('get-theme');
if(targetTheme === 'light')lightHint.selected = true;
else if(targetTheme === 'dark')darkHint.selected = true;
else themeDefault.selected = true;

// 切换页面
let page = ipcRenderer.sendSync('get-page');
if(page === 1){
    timeTableSetting.style.display = 'block';
    timeTable.style.backgroundColor = '#00000050';
}else{
    generalSetting.style.display = 'block';
    general.style.backgroundColor = '#00000050';
}

timeTable.onclick = function (){
    if(page === 1)return;
    page = 1;
    ipcRenderer.sendSync('set-page',1);
    timeTableSetting.style.display = 'block';
    generalSetting.style.display = 'none';
    timeTable.style.backgroundColor = '#00000050';
    general.style.removeProperty('background-color');
}
general.onclick = function (){
    if(page === 2)return;
    page = 2;
    ipcRenderer.sendSync('set-page',2);
    timeTableSetting.style.display = 'none';
    generalSetting.style.display = 'block';
    general.style.backgroundColor = '#00000050';
    timeTable.style.removeProperty('background-color');
}

// 关闭及最小化窗口
close.onclick = function (){ipcRenderer.sendSync('setting-window-control','close')}
minimize.onclick = function (){ipcRenderer.sendSync('setting-window-control','minimize')}

// 更换主题配色
themeSel.onchange = function (){ipcRenderer.sendSync('change-theme',themeSel.options[themeSel.selectedIndex].value)}

// 切换语言
langSel.onchange = function (){
    ipcRenderer.sendSync('set-language',langSel.options[langSel.selectedIndex].value);
    location.reload();
}

// 窗口置顶
topSwitch.onchange = function (){ipcRenderer.sendSync('set-top',topSwitch.checked)}

// 允许拖动
dragSwitch.onchange = function (){ipcRenderer.sendSync('set-drag',dragSwitch.checked)}

// 开机启动
autostartSwitch.onchange = function (){ipcRenderer.sendSync('set-autostart',autostartSwitch.checked)}