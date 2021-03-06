---
layout: post
title: 《鸟哥的Linux私房菜:基础篇》学习笔记——3.首次登陆与在线求助man page 
time: 2013-2-14
category: LinuxBase
---


#在命令行模式下执行命令#

##开始执行命令##

命令行模式登陆后取得的程序被称为shell，这个程序负责最外层跟用户的通信工作。

**第一个被输入的数据绝对是命令或者是可执行文件**，无论命令中有几个空格，shell都视为一格。

另外需要注意的是，在Linux中，大小写是敏感的。

#Linux系统的在线求助系统man page#

man是manual的简写。

man中的数字说明表

|-------+------------------------------------------------------------|
|代号   |                                                            | 
|:------|:-----------------------------------------------------------|
| **1** |**用户在shell环境中可以操作的命令或可执行文件。**           |
|   2   |系统内核可调用的函数与工具等。                              |
|   3   |一些常用的函数与函数库，大部分为C的函数库。                 |
|   4   |设备文件的说明，通常在/dev下的文件                          |
| **5** |**配置文件或者是某些文件的格式**                            |
|   6   |游戏                                                        |
|   7   |惯例与协议等，例如Linux文件系统、网络协议、ASCII code等说明 |
| **8** |**系统管理员可用的管理命令。**　　　　　　　　　　　　　　  |
|   9   |跟kernel有关的文件                                          |
|-------+------------------------------------------------------------|

#正确的关机方法#

要关机时需要注意下面几件事情

- 查看系统的使用状态。
  - who:查看还有谁登陆在系统上
  - netstat -a:查看网络的联机状态
  - ps -aux:查看后台执行的程序
- 通知在线用户关机的时刻
- 正确的关机命令使用
  - sync:将数据同步写入到硬盘中
  - shutdown:惯用的关机命令
  - reboot,halt,poweroff:重启、关机

`shutdown -h now`立刻关机

