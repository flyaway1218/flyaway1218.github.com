---
layout: post
title: 《鸟哥的Linux私房菜:基础篇》学习笔记——16.认识系统服务(daemons)
time: 2013-2-14
category: LinuxBase
published: false
---


#什么是daemon与服务(service)#

service:常驻在内存中的进程，且可以提供一些系统或网络的功能
deemon:实现某个service的程序

##daemon的主要分类##

如果依据deamon的启动与管理方式来区分，基本上，可以将daemon分为可独立启动的stand alone，与通过一个super daemon来统一管理的服务这两大类
- **stand alone:此daemon可以自行单独启动服务**
	这种类型的daemon可以自动启动而不必通过其他机制的管理，daemon启动并加载到内存后就一直占用内存与系统资源。最大的优点就是:因为是一直存在在内存内持续提供服务，因此对于发生客户端请求时，stand alone的daemon响应速度较快。常见的stand alone daemon有www的daemon(httpd)、FTP的daemon(vsftpd)等
- **super daemon:一个特殊的daemon来统一管理**
	这种服务的启动方式则是通过一个统一的daemon来负责唤起服务。这个特殊的daemon就被称为super daemon。早期的super daemon是inetd这一个，后来则被xinetd所代替。这种机制有趣的地方在于:**当没有客户端请求时，各项服务都是未启动的状态，等到来自客户端的请求时，super daemon才会唤醒对应的服务，当客户端的请求结束后，被唤醒的这个服务也会关闭并释放系统资源**
	这种机制的好处是:1.由于super daemon负责唤醒各项服务，因此super daemon可以具有安全控管机制，就是类似网络防火墙的功能 2.由于服务在客户端连接结束后就关闭，因此不会一直占用系统资源。缺点是服务的反应时间会比较慢，因为该服务要先从磁盘加载到内存中去，常见的super daemon所管理的服务例如有telnet

另外需要注意的是，针对super daemon的处理模式有两种:
- multi-threaded(多线程)
- single-threaded(单线程)

在Linux中stand daemon与super daemon是可以共存的


如果以daemon提供服务的工作状态来区分，又可以将daemon分为两类，分别是:
- signal-control:这种daemon是通过信号来管理的，只要有任何客户端请求进来，它就会立即启动区处理，例如打印机的服务(supsd)
- interval-control:这种daemon则主要是每隔一段时间去主动执行某项工作，所以需要做的就是在配置文件中指定服务要进行的时间与工作，该服务在制定的时间才回去完成工作

**daemon的命名规则**

当开发一个服务时，通常程序的文件名是服务名后面加上一个'd',例如at和cron这两个服务，它们的程序文件名会被取为atd与crond

##服务与端口的对应##

网络服务需要和端口绑定，服务与端口的对应文件:`/etc/services`

##daemon的自动脚本与启动方式##

虽然提供某个服务的daemon只是一个进程，但是这个daemon的启动还需要执行文件、配置文件、执行环境等，要启动一个daemon，需要考虑的事情有很多，并非单纯执行一个进程就够了
通常distribution会给我们一个简单的shell script来进行启动的功能。该script可以进行环境的检查、配置文件的分析、PID文件的放置，以及相关重要交换文件的锁住(lock)操作，只要执行该script，上述的操作就一口气连续进行，最终就能够顺利且简单地启动这个daemon。
daemon相关文件的放置位置:

**/etc/init.d/*:启动脚本放置处**
系统上几乎所有的服务启动脚本都放置在这里，事实上这是公认的目录。


**/etc/sysconfig/*:各服务的初始化环境配置文件**
几乎所有的服务都会将初始化的一些参数设置写入到这个目录下

**/etc/xinetd.conf,/etc/xinetd.d/*:super daemon配置文件**
super daemon的主要配置文件(其实是默认值)为`/etc/xinetd.d.conf`,但是super daemon只是一个统一管理的机制，它所管理的其他daemon的设置则写在`/etc/xinetd.d/*`里面

**/etc/*:各服务各自的配置文件**


**/var/lib/*:各服务产生的数据库**
一些会产生数据的服务都会将它的数据写入到`/var/lib/`目录下。举例来说，数据库管理系统MySQL的数据默认就是写入到`/var/lib/mysql/`这个目录下。

**/var/run/*:各服务的程序的PID记录处**
虽然之前说过，所有内存中的进程都是写入到`/proc/*`中的，但是，为了在管理服务时不影响其他的进程，所以daemon通常会将自己的PID记录一份到`/var/run/*`当中

**Stand alone的/etc/init.d/*启动**
之前说过，几乎系统上面所有服务的启动脚本都在`/etc/ini.d`下面，这里面的脚本会去检测环境、查找配置文件、加载distribution提供的函数功能、判断环境是否可以运行此daemon等，等一切都检测完成完毕且确定可以运行后，再以shell script的case...esac语法来启动、关闭、查看此daemon。

CentOS还提供了另外的可以启动stand alone服务的脚本，那就是service这个进程。其实service仅是一个script，它可以分析你执行的service后面的参数，然后根据你的参数再到`/etc/init.d`去去的正确的服务来start或stop

事实上，在Linux系统中，要开或关某个端口，就是需要启动或关闭某个服务。因此，你可以找出某个端口对应的服务及程序对应的服务，进而启动或关闭它，那么那个由该服务而启动的端口自然就会关掉

**super daemon的启动方式**
其实super daemon本身也是一个stand daemon的服务，因为super daemon要管理后续的其他服务，它当然自己要常驻在内存中，所以super daemon自己自动的方式与stand alone是相同的。但是它所管理的其他daemon就不是这样做了，必须要在配置文件中设置为启动该daemon才行。配置文件就是`/etc/xinetd.d/*`的所有文件

#解析super daemon的配置文件#
super daemon是一个总管进程，这个super daemon是xinetd这个进程实现的，这个xinetd可以进行安全性或者其他管理机制的控制，xinetd也能控制连接的行为，这些控制手段都可以让我们的某些服务更为安全、资源管理更为合理
super daemon的默认配置文件是`/etc/xinetd.conf`

##默认配置文件:xinetd.conf##

如果你启动某个supe daemon管理的服务，但是该服务设置值并没有`/etc/xinetd.conf`中指定的那些项目，那么该服务的设置值就以上述的默认值为主
既然这只是一个默认参数文件，那么自然有更多的服务参数文件。而所有的服务参数文件都在`/etc/xinetd.d`里面,其中的参数文件的格式如下所示:

{% highlight bash %}
service <service_name>
{
			<attribute>			<assign_op>			<value>				<value>			...
			....
}
{% endhighlight %}

第一行一定都有一个service，至于那个<service_name>里面的内容则与`/etc/services`有关，因为它可以对照着`/etc/services`内的服务名称与端口号来决定所要启动的port是哪个。相关的参数就在两个大括号中间。atribute是一些xinetd的管理参数，assign_op则是参数的设置方法，assign_op的主要设置形式有:
- =:表示后面的设置参数就是这样
- +=:表示后面的设置为在原来的设置里面加入新的参数
- -=:表示后面的设置为在原来的参数中舍弃这里输入的参数



#系统开启的服务#

##查看系统启动的服务##

服务名称与port对应的数据在`/etc/services`中
基本上，以`ps`来查看整个系统上面的服务是比较妥当的，因为它可以将全部的process都找出来。但是，如果只关心网络监听服务的话，利用`netstat`可以取得很多跟网络有关的服务信息，通过这个命令，我们可以轻易了解到网络的状态，并且可以通过PID与kill相关功能，将有问题的数据给它杀掉。当然，要更详细地取得PPID的话，才能够完全阻挡有问题的进程！

##设置开机后立即启动服务的方法##

Linux开机过程:
1. 打开计算机电源，开始读取BIOS并进行主机的自我测试
2. 通过BIOS取得第一个可开机设备，读取主要开机区(MBR)取得启动装载程序
3. 通过启动装载程序的设置，取得kernel并加载内存且检测系统硬件
4. 内核主动调用init进程
5. init进程开始执行系统初始化(`/etc/rc.d/rc.sysinit`)
5. 依据init的设置进行daemonstart(`/etc/rc.d/rc[0-6].d/*`)
6. 加载本机设置(`/etc/rc.d/rc.local`)

我们在启动Linux系统时，可以进入不同的模式，这模式我们称为执行等级(run level)。不同的执行等级有不同的功能与服务，目前所知道的正常的执行等级有两个，一个是具有X窗口界面的run level 5，另一个则是纯文本界面的run level 3.

**chkconfig:管理系统服务默认开机启动与否**
我们可以通过`chkconfig`命令很轻松地管理super daemon的服务

{% highlight bash %}
 #列出目前系统上面所有被chkconfig管理的服务
chkconfig --list | more
{% endhighlight %}

另外需要注意的是，`chkconfig`命令仅是设置开机默认启动的服务而已，所以该服务目前的状态如何是不知道的

