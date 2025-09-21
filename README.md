# 腕上课表
### 一个在Android Wear展示当前课程和下个课程，以及课程进度的程序
***
## 程序功能

- 显示课程列表
- 在复杂功能中显示当前课程、下个课程、课程进度
- 课程表导入

[//]: # (- [ ] 编辑课程表)

[//]: # (- [x] 程序开机启动)

[//]: # (- [x] 程序窗口置顶)

[//]: # (- [x] 程序窗口拖动控制)

[//]: # (- [x] 多语言支持&#40;目前仅支持中文、英文&#41;)

[//]: # (- [x] 深色模式支持)

[//]: # (- [x] 记忆窗口位置大小)
***
## 使用说明
使用能导出 [CSES 通用课程表交换文件](https://github.com/SmartTeachCN/CSES) 的课程表类软件(如[Class Widgets](https://classwidgets.rinlit.cn/zh/)和[ClassIsland](https://classisland.tech/))导出 CSES 通用课程表交换文件 (以yaml为文件后缀)<br>
手表端打开APP，在手机端APP导入该文件，程序会自动将数据传输到手表<br>
数据传输部分使用 [Wear-Msger](https://github.com/ichenhe/Wear-Msger) 实现，目前仅支持Wear OS手表<br>
复杂功能目前仅支持RANGED_VALUE类型，数据更新可能会有延迟，若想减少延迟，可以将本APP移出 **设置 - 电池 - 休眠应用程序** 列表(这会导致大量电量消耗)
***
