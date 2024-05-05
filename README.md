# 课程表
### 一个展示当前课程和下个课程，以及课程进度的程序
***
## 重要提示
程序尚未完工，目前还无法使用
***
## 程序功能

- [ ] 显示当前课程
- [ ] 显示下个课程
- [ ] 显示课程进度
- [ ] 编辑课程表
- [ ] 课程表导出/导入
- [x] 程序开机启动
- [x] 程序窗口置顶
- [x] 程序窗口拖动控制
- [x] 多语言支持(目前仅支持中文、英文)
- [x] 深色模式支持
- [x] 记忆窗口位置大小
***
## 使用说明
在主界面窗口(除距顶部约15%高度的区域)右键唤出菜单，可以选择编辑或退出程序
***
## 窗口拖动说明
主程序窗口：在允许拖动的情况下，拖动距顶部约15%高度的区域以拖动窗口
设置程序窗口：拖动顶栏以拖动窗口
***
## 源码使用说明
- 使用`npm install`以安装`package.json`中记录的依赖库
- 执行`npm run start`以运行程序
***
## 使用到的依赖库
- 主程序：<a href="https://github.com/electron/electron">Electron</a>
- 日志记录：<a href="https://github.com/megahertz/electron-log">electron-log</a>
- 数据存储：<a href="https://github.com/sindresorhus/electron-store">electron-store</a>
- 窗口位置大小记忆：<a href="https://github.com/mawie81/electron-window-state">electron-window-state</a>
- 网页样式美化：<a href="https://github.com/google/material-design-lite">Material Design Lite</a>