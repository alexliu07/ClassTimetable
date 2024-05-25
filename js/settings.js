const {ipcRenderer} = require("electron");

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
const classNameContainer = document.getElementById('classNameContainer');
const startTimeContainer = document.getElementById('startTimeContainer');
const endTimeContainer = document.getElementById('endTimeContainer');
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
for (let i in languages) {
    let tmpLang = document.createElement('option');
    tmpLang.value = languages[i]['id'];
    tmpLang.innerHTML = languages[i]['name'];
    langSel.appendChild(tmpLang);
    langList.push(tmpLang);
}

// 获取并显示程序版本
let version = ipcRenderer.sendSync('get-version');
versionHint.innerHTML = 'Class Timetable ' + String(version);

// 获取并显示设置内容
autostartSwitch.checked = ipcRenderer.sendSync('get-autostart');
dragSwitch.checked = ipcRenderer.sendSync('get-drag');
topSwitch.checked = ipcRenderer.sendSync('get-top');
let targetLang = ipcRenderer.sendSync('get-language');
for (let i in langList) if (langList[i].value === targetLang) langList[i].selected = true;
let targetTheme = ipcRenderer.sendSync('get-theme');
if (targetTheme === 'light') lightHint.selected = true;
else if (targetTheme === 'dark') darkHint.selected = true;
else themeDefault.selected = true;
delBtn.disabled = true;

// 切换页面
let page = ipcRenderer.sendSync('get-page');
if (page === 1) {
    timeTableSetting.style.display = 'block';
    timeTable.style.backgroundColor = '#00000050';
} else {
    generalSetting.style.display = 'block';
    general.style.backgroundColor = '#00000050';
}
timeTable.onclick = function () {
    if (page === 1) return;
    page = 1;
    ipcRenderer.send('set-page', 1);
    timeTableSetting.style.display = 'block';
    generalSetting.style.display = 'none';
    timeTable.style.backgroundColor = '#00000050';
    general.style.removeProperty('background-color');
}
general.onclick = function () {
    if (page === 2) return;
    page = 2;
    ipcRenderer.send('set-page', 2);
    timeTableSetting.style.display = 'none';
    generalSetting.style.display = 'block';
    general.style.backgroundColor = '#00000050';
    timeTable.style.removeProperty('background-color');
}

// 编辑课程表
let curSel = -1, elements = {};
/**
 * 将时间字符串转换为Date对象
 * @param str 时间字符串
 * @return {Date} Date对象
 */
const str2date = (str)=>{
    return new Date(1970, 0, 1, Number(str.substring(0, str.lastIndexOf(':'))), Number(str.substring(str.lastIndexOf(':') + 1)));
}
/**
 * 随机生成字符串
 * https://www.cnblogs.com/duhuo/p/15438032.html
 * @param e 长度
 * @returns {string} 生成的字符串
 */
const randomString = (e) => {
    e = e || 32;
    var t = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890",
        a = t.length,
        n = "";
    for (let i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a));
    return n
}
/**
 * 将时间转为字符串
 * @param time 时间(Date对象)
 * @returns {string} 小时:分钟
 */
const getTimeStr = (time) => {
    let TimeStrHt = String(time.getHours()), TimeStrMt = String(time.getMinutes());
    let TimeStrHour = TimeStrHt.length === 1 ? "0" + TimeStrHt : TimeStrHt;
    let TimeStrMinute = TimeStrMt.length === 1 ? "0" + TimeStrMt : TimeStrMt;
    return TimeStrHour + ":" + TimeStrMinute;
}
/**
 * 清除输入
 */
const clearInput = () => {
    className.value = "";
    startTime.value = "";
    endTime.value = "";
    for (let i = 0; i < weekday.length; i++) {
        if (weekday[i].checked) weekday[i].checked = false;
    }
    for (let i = 0; i < weekdayHint.length; i++) {
        if (weekdayHint[i].classList.contains('is-checked')) weekdayHint[i].classList.remove('is-checked');
    }
    classNameContainer.classList.remove('is-dirty');
    startTimeContainer.classList.remove('is-dirty');
    endTimeContainer.classList.remove('is-dirty');
    delBtn.disabled = true;
}
/**
 * 刷新指定天的课程列表
 * @param schedule 当天课程列表
 * @param day 当天星期
 */
const refreshSchedule = (schedule, day) => {
    for (let i = 0; i < schedule.length; i++) {
        let sTime = new Date(schedule[i]['startTime']);
        let eTime = new Date(schedule[i]['endTime']);
        if (!elements[schedule[i]['id']]) elements[schedule[i]['id']] = createElement(schedule[i]['name'], getTimeStr(sTime), getTimeStr(eTime), day, schedule[i]['id']);
        row[day].appendChild(elements[schedule[i]['id']]);
    }
}
/**
 * 拆分日程到两天
 * @param schedule 日程字典
 * @returns {[{eTime: Date, name, sTime: Date},{eTime: Date, name, sTime: Date}]} 选中天的日程和后一天的日程
 */
const splitSchedule = (schedule) => {
    return [{
        'name': schedule['name'],
        'sTime': schedule['sTime'],
        'eTime': new Date(1970, 0, 1, 23, 59)
    }, {'name': schedule['name'], 'sTime': new Date(1970, 0, 1, 0, 0), 'eTime': schedule['eTime']}]
}
/**
 * 创建HTML表格元素
 * @param name 日程名称
 * @param sTime 日程开始时间 字符串
 * @param eTime 日程结束时间 字符串
 * @param day 星期
 * @param id 标识符
 * @returns {HTMLTableCellElement} 表格元素
 */
const createElement = (name, sTime, eTime, day, id) => {
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
    tmpTd.onclick = function () {
        if (curSel[0] === id) {
            // 取消选中
            tmpTd.style.removeProperty('background-color');
            clearInput();
            curSel = -1;
            editBtn.innerHTML = translation['add'];
            editScheduleHint.innerHTML = translation['createSchedule'];
        } else {
            // 将当前的取消选中
            if (curSel !== -1) {
                elements[curSel[0]].style.removeProperty('background-color');
                clearInput();
            }
            // 选中
            tmpTd.style.backgroundColor = '#00000050';
            className.value = name;
            startTime.value = sTime;
            endTime.value = eTime;
            weekday[day].checked = true;
            weekdayHint[day].classList.add('is-checked');
            curSel = [id, day];
            editBtn.innerHTML = translation['save'];
            editScheduleHint.innerHTML = translation['editSchedule'];
            classNameContainer.classList.add('is-dirty');
            startTimeContainer.classList.add('is-dirty');
            endTimeContainer.classList.add('is-dirty');
            delBtn.disabled = false;
        }
    }
    return tmpTd;
}
// 启动时刷新所有日程
for(let i=0;i<7;i++)refreshSchedule(ipcRenderer.sendSync('get-schedule',i),i);
/**
 * 添加日程到日程列表并排序
 * @param name 日程名称
 * @param sTimeStr 开始时间 字符串
 * @param eTimeStr 结束时间 字符串
 * @param day 星期
 * @returns {number} 状态码，1 为未成功，0 为成功
 */
const addSchedule = (name, sTimeStr, eTimeStr, day) => {
    // 验证留空
    if (name === "" || sTimeStr === "" || eTimeStr === "" || day === undefined) {
        snackBarContainer.MaterialSnackbar.showSnackbar({message: translation['sthIsEmpty']});
        __electronLog.info('Setting Timetable - Something is Empty');
        return 1;
    }
    __electronLog.info('Setting Timetable - name:' + name + ' sTime:' + sTimeStr + ' eTime:' + eTimeStr + ' day:' + day);
    // 不允许开始结束时间相同
    let sTime = str2date(sTimeStr);
    let eTime = str2date(eTimeStr);
    if (sTime - eTime === 0) {
        snackBarContainer.MaterialSnackbar.showSnackbar({message: translation['sameTime']});
        __electronLog.info('Setting Timetable - Start time is the same as end time');
        return 1;
    }
    let t = {'name': name, 'sTime': sTime, 'eTime': eTime};
    //随机生成标识符
    let id = randomString(8);
    // 存入数组并排序
    if (sTime > eTime) {
        // 需要拆分
        let tmpSchedule = splitSchedule(t);
        __electronLog.info('Setting Timetable - Start time later than end time');
        let newId = [curSel===-1?id:curSel[0],randomString(8)];
        for (let j in tmpSchedule) {
            if (tmpSchedule[j]['sTime'] - tmpSchedule[j]['eTime'] === 0) continue;
            let tmpList;
            if(curSel === -1 || Number(j) === 1) tmpList = ipcRenderer.sendSync('add-schedule', [newId[j], tmpSchedule[j]['name'], tmpSchedule[j]['sTime'].toISOString(), tmpSchedule[j]['eTime'].toISOString(), day + j * 1]);
            else tmpList = ipcRenderer.sendSync('edit-schedule',[curSel[0],curSel[1],tmpSchedule[j]['name'], tmpSchedule[j]['sTime'].toISOString(), tmpSchedule[j]['eTime'].toISOString(), day + j * 1]);
            if (tmpList === -1) {
                snackBarContainer.MaterialSnackbar.showSnackbar({message: translation['intersect']});
                __electronLog.info('Setting Timetable - Time Crossed');
                return 1;
            }
            if(curSel!== -1){
                elements[curSel[0]].remove();
                elements[curSel[0]] = null;
            }
            refreshSchedule(tmpList, day + j * 1);
        }
    } else {
        // 不需拆分
        let tmpList
        if(curSel === -1) tmpList = ipcRenderer.sendSync('add-schedule', [id, name, sTime.toISOString(), eTime.toISOString(), day]);
        else tmpList = ipcRenderer.sendSync('edit-schedule',[curSel[0],curSel[1],name,sTime.toISOString(), eTime.toISOString(), day]);
        if (tmpList === -1) {
            snackBarContainer.MaterialSnackbar.showSnackbar({message: translation['intersect']});
            __electronLog.info('Setting Timetable - Time Crossed');
            return 1;
        }
        if(curSel!== -1){
            elements[curSel[0]].remove();
            elements[curSel[0]] = null;
        }
        refreshSchedule(tmpList, day);
    }
    if(curSel !== -1)refreshSchedule(ipcRenderer.sendSync('get-schedule',curSel[1]),curSel[1]);
    return 0;
}

editBtn.onclick = function () {
    let name = className.value;
    let sTimeStr = startTime.value;
    let eTimeStr = endTime.value;
    let day;
    for (let i = 0; i < weekday.length; i++) {
        if (weekday[i].checked) {
            day = Number(weekday[i].value);
            break;
        }
    }
    // 添加或编辑日程
    if (addSchedule(name, sTimeStr, eTimeStr, day)) return;
    clearInput();
    if(curSel !== -1)elements[curSel[0]].style.removeProperty('background-color');
    curSel = -1;
    editBtn.innerHTML = translation['add'];
    editScheduleHint.innerHTML = translation['createSchedule'];
}
// 删除日程
delBtn.onclick = function (){
    let tmpList = ipcRenderer.sendSync('del-schedule',curSel);
    refreshSchedule(tmpList,curSel[1]);
    clearInput();
    editBtn.innerHTML = translation['add'];
    editScheduleHint.innerHTML = translation['createSchedule'];
    elements[curSel[0]].remove();
    elements[curSel[0]] = null;
    curSel = -1;
}


// 关闭及最小化窗口
close.onclick = function () {
    ipcRenderer.send('setting-window-control', 'close')
}
minimize.onclick = function () {
    ipcRenderer.send('setting-window-control', 'minimize')
}

// 更换主题配色
themeSel.onchange = function () {
    ipcRenderer.send('change-theme', themeSel.options[themeSel.selectedIndex].value)
}
// 切换语言
langSel.onchange = function () {
    ipcRenderer.send('set-language', langSel.options[langSel.selectedIndex].value);
    location.reload();
}
// 窗口置顶
topSwitch.onchange = function () {
    ipcRenderer.send('set-top', topSwitch.checked)
}
// 允许拖动
dragSwitch.onchange = function () {
    ipcRenderer.send('set-drag', dragSwitch.checked)
}
// 开机启动
autostartSwitch.onchange = function () {
    ipcRenderer.send('set-autostart', autostartSwitch.checked)
}