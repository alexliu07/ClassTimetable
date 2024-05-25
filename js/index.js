const {ipcRenderer} = require("electron");

// 注册组件
// 文本相关
const hintText1 = document.getElementById("hintText1");
const hintText2 = document.getElementById("hintText2");
const hintText3 = document.getElementById("hintText3");
const hintText3n = document.getElementById("hintText3n");
// 模式显示
const emptyEvent1 = document.getElementById("emptyEvent1");
const preEvent2 = document.getElementById("preEvent2");
const normalEvent3 = document.getElementById("normalEvent3");
// 拖动相关
const dragBar = document.getElementById('dragBar');

//右键菜单
window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    ipcRenderer.send('show-context-menu');
})

// 获取翻译
const translation = ipcRenderer.sendSync("get-translation");
document.title = translation['classTimetable'];
hintText1.innerHTML = translation['emptySchedule'];
hintText2.innerHTML = translation['nextSchedule'];
hintText3n.innerHTML = translation['nextSchedule'];
hintText3.innerHTML = translation['currentSchedule'];

//刷新页面
ipcRenderer.on("refresh", () => {
    location.reload()
});

//允许拖动
ipcRenderer.on('set-drag', (event, arg) => {
    dragBar.style.webkitAppRegion = arg ? 'drag' : 'no-drag'
})