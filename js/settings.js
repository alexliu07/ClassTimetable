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
// 设置相关
const themeSel = document.getElementById('themeSel');
const langSel = document.getElementById('langSel');
const topSwitch = document.getElementById('topSwitch');
const dragSwitch = document.getElementById('dragSwitch');
const autostartSwitch = document.getElementById('autostartSwitch');
// 编辑课程表相关
const className = document.getElementById('className');
const startTime = document.getElementById('startTime');
const endTime = document.getElementById('endTime');
const weekday = document.getElementsByName('weekday');
const row = document.getElementsByClassName('row');
const weekdayHint = document.getElementsByClassName('weekday');
// 提示相关
const snackBarContainer = document.getElementById('snackBarContainer');


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
delBtn.disabled = true;

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

// 编辑课程表
let schedules = [[],[],[],[],[],[],[]];
const clearInput = ()=>{
    // 清除输入
    className.value = "";
    startTime.value = "";
    endTime.value = "";
    for(let i = 0;i<weekday.length;i++){
        if(weekday[i].checked) weekday[i].checked = false;
    }
    for(let i = 0;i<weekdayHint.length;i++){
        if(weekdayHint[i].classList.contains('is-checked')) weekdayHint[i].classList.remove('is-checked');
    }
}
const refreshSchedule = (day)=>{
    // 重载课程列表
    for(let i in schedules[day])row[day].appendChild(schedules[day][i]['object']);
}
const sortBy = (attr,rev)=>{
    // 根据键值排序 https://blog.csdn.net/weixin_41192489/article/details/111400551
    if (rev === undefined) rev = 1;
    return function (a, b) {
        a = a[attr];
        b = b[attr];
        if (a < b)return rev * -1;
        if (a > b) return rev * 1;
        return 0;
    }
}
const isCrossTime = (schedule,day)=>{
    // 验证是否时间交叉
    for(let i in schedules[day]) {
        if (schedule['sTime'] > schedules[day][i]['startTime'] && schedule['sTime'] < schedules[day][i]['endTime'] || schedule['eTime'] > schedules[day][i]['startTime'] && schedule['eTime'] < schedules[day][i]['endTime'] || schedule['sTime'] <= schedules[day][i]['startTime'] && schedule['eTime'] >= schedules[day][i]['endTime']) {
            snackBarContainer.MaterialSnackbar.showSnackbar({message: translation['intersect']});
            __electronLog.info('Setting Timetable - Time Crossed');
            return true;
        }
    }
    return false;
}
// 拆分日程
const splitSchedule = (schedule)=>{return [{'name':schedule['name'],'sTime':schedule['sTime'],'eTime':new Date(1970,0,1,23,59)},{'name':schedule['name'],'sTime':new Date(1970,0,1,0,0),'eTime':schedule['eTime']}]}
const createElement = (name,sTime,eTime)=>{
    // 创建元素
    let tmpTd = document.createElement('td');
    tmpTd.className = 'classFrame mdl-data-table__cell--non-numeric';
    let tmpName = document.createElement('p');
    tmpName.className = 'classInfo';
    tmpName.innerHTML = name;
    let tmpTime = document.createElement('p');
    tmpTime.className = 'classInfo';
    tmpTime.innerHTML = sTime + ' - ' + eTime;
    tmpTd.appendChild(tmpName);
    tmpTd.appendChild(tmpTime);
    return tmpTd;
}
editBtn.onclick = function (){
    let name = className.value;
    let sTimeStr = startTime.value;
    let eTimeStr = endTime.value;
    let day;
    for(let i = 0;i<weekday.length;i++){
        if(weekday[i].checked){
            day = Number(weekday[i].value);
            break;
        }
    }
    // 验证留空
    if(name === "" || sTimeStr === "" || eTimeStr === "" || day === undefined){
        snackBarContainer.MaterialSnackbar.showSnackbar({message:translation['sthIsEmpty']});
        __electronLog.info('Setting Timetable - Something is Empty');
        return;
    }
    __electronLog.info('Setting Timetable - name:'+name+' sTime:'+sTimeStr+' eTime:'+eTimeStr+' day:'+day);
    // 开始时间必须早于结束时间，或跨天显示
    let sTime = new Date(1970,0,1,Number(sTimeStr.substring(0,sTimeStr.lastIndexOf(':'))),Number(sTimeStr.substring(sTimeStr.lastIndexOf(':')+1)));
    let eTime = new Date(1970,0,1,Number(eTimeStr.substring(0,eTimeStr.lastIndexOf(':'))),Number(eTimeStr.substring(eTimeStr.lastIndexOf(':')+1)));
    if(sTime - eTime === 0){
        snackBarContainer.MaterialSnackbar.showSnackbar({message:translation['sameTime']});
        __electronLog.info('Setting Timetable - Start time is the same as end time');
        return;
    }
    let t = {'name':name,'sTime':sTime,'eTime':eTime};
    // 存入数组并排序
    if(sTime > eTime){
        let tmpSchedule = splitSchedule(t);
        __electronLog.info('Setting Timetable - Start time later than end time');
        for(let j in tmpSchedule){
            if(tmpSchedule[j]['sTime']-tmpSchedule[j]['eTime'] === 0)continue;
            if(isCrossTime(tmpSchedule[j],day + j*1))return;
            let sTimeStrHt = String(tmpSchedule[j]['sTime'].getHours()),sTimeStrMt = String(tmpSchedule[j]['sTime'].getMinutes());
            let sTimeStrHour = sTimeStrHt.length === 1?"0" + sTimeStrHt:sTimeStrHt;
            let sTimeStrMinute = sTimeStrMt.length === 1?"0" + sTimeStrMt:sTimeStrMt;
            let sTimeStr = sTimeStrHour + ":" + sTimeStrMinute;
            let eTimeStrHt = String(tmpSchedule[j]['eTime'].getHours()),eTimeStrMt = String(tmpSchedule[j]['eTime'].getMinutes());
            let eTimeStrHour = eTimeStrHt.length === 1?"0" + eTimeStrHt:eTimeStrHt;
            let eTimeStrMinute = eTimeStrMt.length === 1?"0" + eTimeStrMt:eTimeStrMt;
            let eTimeStr = eTimeStrHour + ":" + eTimeStrMinute;
            schedules[day + j*1].push({'name':tmpSchedule[j]['name'],'startTime':tmpSchedule[j]['sTime'],'endTime':tmpSchedule[j]['eTime'],'object':createElement(tmpSchedule[j]['name'],sTimeStr,eTimeStr)});
            schedules[day + j*1].sort(sortBy('startTime',1));
            refreshSchedule(day+j*1);
        }
    }else{
        if(isCrossTime(t,day))return;
        schedules[day].push({'name':name,'startTime':sTime,'endTime':eTime,'object':createElement(name,sTimeStr,eTimeStr)});
        schedules[day].sort(sortBy('startTime',1));
        refreshSchedule(day);
    }
    clearInput();
}