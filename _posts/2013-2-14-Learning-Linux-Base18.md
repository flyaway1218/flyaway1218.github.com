---
layout: post
title: 《鸟哥的Linux私房菜:基础篇》学习笔记——18.启动流程、模块管理与Loader
time: 2013-2-14
category: LinuxBase
published: false
---


#Linux的启动流程分析#

##启动流程一览##

系统启动的过程如下:
1. 加载BIOS的硬件信息与进行自我测试，并依据设置取得一个可启动的设备
2. 读取并执行第一个启动设备内MBR的boot Loader(即是grub,spfdisk等程序)
3. 依据boot loader的设置加载Kernel,Kernel会开始检测硬件与加载驱动程序
4. 在硬件驱动成功之后，Kernel会主动调用init进程，而init会取得run-level信息
5. init执行/etc/rc.d/rc.sysinit文件来准备软件执行的操作环境(如网络、时区等)
6. init执行run-level的各个服务的启动(script)
7. init执行/etc/rc.d/rc.local文件
8. init执行终端机模拟程序mingetty来启动login进程，最后就等待用户登录

##BIOS,boot loader与kernel加载##

**Boot Loader的功能**
每个文件系统都会保留一块引导扇区(boot sector)提供操作系统安装boot loader，而通常操作系统默认都会安装一份loader到它根目录所在的文件系统的boot sector上。
每个操作系统默认是会安装一套boot loader到它自己的文件系统中，而在Linux系统安装时，你可以将boot loader安装到MBR去，也可以选择不安装。如果选择安装到MBR的话，那理论上你在MBR于boot sector都会保留一份boot loader程序。至于windows安装时，它默认会主动将MBR与boot sector都装上一份boot loader。所以，你会发现安装多重操作系统时，你的MBR经常会被不同的操作系统的boot loader覆盖

boot loader的主要功能如下:
- 提供菜单:用户可以选择不同的启动选项，这也是多重引导的重要功能
- 加载内核文件:直接指向可启动的程序区段来开始操作系统
- 转交其他loader:将引导装载功能转交给其他loader负责

但是，windows的boot loader是没有转交功能的！

**加载内核检测硬件与initrd的功能**
当我们通过boot loader的管理而开始读取内核文件后，接下来，Linux就会将内核解压缩到内存当中,并且利用内核的功能，开始测试与驱动各个周边设备，包括存储设备、CPU、网卡、声卡等。此时Linux内核会以自己的功能重新检测一次硬件，而不一定会使用BIOS检测到的硬件信息。也就是说，内核此时才开始接管BIOS后的工作。
一般来说，内核文件会被放置到/boot里面，并且取名为/boot/vmlinuz

为了硬件开发商与其他内核功能开发者的便利，因此Linux内核是可以通过动态加载内核模块的，这些内核模块就放置在/lib/modules目录内。由于模块放置到磁盘根目录内(要记得/lib不可以与/分别放在不同的分区)，因此在启动的过程中内核必须要挂载根目录，这样才能够读取内核模块提供加载驱动程序的功能,而且为了担心影响到磁盘内的文件系统，因此启动过程中根目录是以只读的方式来挂载的

一般来说，非必要的功能且可以编译成为模块的内核功能，目前的Linux distribution都会将它编译成为模块。因此，USB,SATA,SCSI等磁盘设备的驱动程序通常都是以模块的方式来存在的

虚拟文件系统(InitialRAM Disk)一般使用的文件名为/boot/initrd，这个文件的特色，它也能够通过boot loader来加载到内存中，然后这个文件会被解压缩并且在内存当中仿真成一个目录，且此仿真在内存当中的文件系统能够提供一个可执行的程序，通过该程序来加载启动过程中所需要的内核模块，通常这些模块就是USB,RAID,LVM,SCSI等文件系统与磁盘接口的驱动程序

事实上，initrd不是必须的，需要initrd最重要的原因是，当启动时无法挂载根目录的情况下，此时就一定需要initrd，例如的你根目录在特殊在磁盘接口(USB,SATA,SCSI)中，或者是你的文件系统较为特殊(LVM,RAID)，才会需要initrd
如果你的Linux是安装在IDE接口的磁盘上，并且使用默认的ext2/ext3文件系统，那么不需要initrd也能够顺利启动进入Linux的

##第一个进程init及配置文件/etc/inittab与runlevel##

在内核加载完毕进行完硬件检测与驱动程序加载后，此时你的主机硬件应该已经准备就绪了，此时内核会主动调用第一个进程，那就是/sbin/init.
/sbin/init最主要的功能就是准备软件执行的环境，包括系统的主机名、网络设置、语系处理、文件系统格式以及其他服务的启动.而所有的操作都会通过init的配置文件，即/etc/inittab来规划，而inittab内还有一个很重要的设置选项，那就是默认的run level(启动执行等级)

**run level:执行等级**
Linux通过设置run level来规定系统使用不同的服务来启动，让Linux的使用环境不同。基本上run level分为7个等级:
- 0-halt(系统直接关机)
- 1-single user mode(单用户维护模式，用在系统出问题时维护)
- 2-Multi-user,without NFS(类似下面的runlevel3,但无NFS服务)
- 3-Full multi-user mode(完整含有网络功能的纯文本模式)
- 4-unused(系统保留功能)
- 5-X11(与runlevel3类似，但加载使用X Window)
- 6-reboot(重新启动)

**/etc/inittab的内容与语法**

{% highlight bash %}
[设置选项]:[run level]:[init的操作行为]:[命令选项]
{% endhighlight %}

1. 设置选项:最多四个字符，代表init的主要工作选项，只是一个简单的代表说明
2. run level:该选项在哪些run level下面进行的意思。如果是35则代表run level 3/5都会执行
3. init的操作行为:主要可以进行的操作选项意义如下表:
    |-------------------+---------------------------------------------------------------------|
		|  inittab的设置值  |    意义说明                                                         |
    |:------------------|:--------------------------------------------------------------------|
    |  initdefault      |  代表默认的runlevel设置值                                           |
    |  sysinit          |  代表系统初始化的操作选项                                           |
    |  ctrlaltdel       |  代表[ctrl]+[alt]+[del]三个按键是否可以重新启动的设置               |
    |  wait             |  代表后面字段设置的命令项目必须要执行完毕才能继续下面的其他操作     |
    |  respawn          |  代表后面字段的命令可以无限制再生(重新启动)。举例来说，tty1的mingetty产生的可登陆界面，在你注销而结束后，系统再开一个新的可登陆界面等待下一个登录                                                    |
    |-------------------+---------------------------------------------------------------------|
4. 命令选项:即应该可以进行的命令，通常是一些script

##init处理系统初始化流程(/etc/rc.d/rc.sysinit)##

开始加载各项系统服务之前，得先设置好整个系统环境，主要利用/etc/rc.d/rc.sysinit这个shell script来设置好系统环境
如果使用vim去查阅/etc/rc.d/rc.sysinit的话，那么可以发现主要的工作大体有这么几项:
1. 取得网络环境与主机类型:
		读取网络配置文件/etc/sysconfig/network,取得主机名与默认网关(gateway)等网络环境
2. 测试与挂载内存设备/proc及USB设备/sys
3. 决定是否启动SELinux
4. 启动系统的随机数生成器
5. 设置终端机(console)字体
6. 设置显示于启动过程中的欢迎界面(textbanner)
7. 设置系统时间(clock)与时区设置:需读入/etc/sysconfig/clock设置值
8. 设置设备的检测与Plug and Play(PnP)参数的测试
9. 用户自定义模块加载
		用户可以在/etc/sysconfig/modules/*.modules中加入自定义的模块，则此时会被加载到系统当中
10. 加载内核的相关设置
		系统会主动去读取/etc/sysctl.conf这个文件的设置值，使内核功能成为我们想要的样子
11. 设置主机与初始化电源管理模块(ACPI)
12. 初始化软件磁盘阵列:主要是通过/etc/mdadm.conf来设置好
13. 初始化LVM的文件系统功能
14. 以fsck检验磁盘文件系统:会进行filesystem check
15. 进行磁盘配额quota的转换(非必要)
16. 重新以可读写模式挂载系统磁盘
17. 启动quota功能:所以我们不需要自定义quotaon的操作
18. 启动系统伪随机数生成器(pseudo-random)
19. 清除启动过程中的临时文件
20. 将启动相关信息加载/var/log/dmesg文件中

##启动系统服务与相关启动配置文件(/etc/rc.d/rc N & /etc/sysconfig)##

加载内核让整个系统准备接受命令来工作，再经过/etc/rc.d/rc.sysinit的系统模块与相关硬件信息的初始化后，我们需要启动系统所需要的各项服务。这个时候，依据我们在/etc/inittab里面提到的run level设置值，就可以来决定启动的服务选项了。各个不同的runlevel的shell script放置在/etc/rc.d/中，/etc/rc.d/rc5的意义是这样的:
- 通过外部第一号参数($1)来取得想要执行的脚本目录，即由/etc/rc.d/rc 5可以取得/etc/rc5.d/这个目录来准备处理相关的脚本程序
- 找到/etc/rc5.d/K??*开头的文件，并进行"/etc/rc5.d/K??*stop"的操作
- 找到/etc/rc5.d/S??*开头的文件，并进行"/etc/rc5.d/K??*start"的操作

/etc/rcN.d/目录下的文件很有趣，主要具有几个特点:
- 文件名全部以Sxx或Kxx开头，其中xx为数字，且这些数字在文件之间是有相关性的，即这些数字就是文件的执行顺序
- 全部是连接文件，连接到stand alone服务启动的目录/etc/init.d/去

##用户自定义开机启动程序(/etc/rc.d/rc.local)##

在完成默认runlevel指定的各项服务启动后，如果还有其他操作想要完成时，直接将它写入/etc/rc.d/rc.local,那么该工作就会在启动的时候自动加载

##根据/etc/inttab的设置加载终端机或X Window界面##

在完成了系统所有服务的启动后，接下来Linux就会启动终端机或者是X Window来等待用户登录。实际参考的选项是/etc/inittab内的这一段:

{% highlight bash %}
1:2345:respawn:/sbin/mingetty tty1
2:2345:respawn:/sbin/mingetty tty2
3:2345:respawn:/sbin/mingetty tty3
4:2345:respawn:/sbin/mingetty tty4
5:2345:respawn:/sbin/mingetty tty5
6:2345:respawn:/sbin/mingetty tty6
x:5:respawn:/etc/X11/prefdm -nodaemon
{% endhighlight %}

这一段表示在run level 2/3/4/5时，都会执行/sbin/mingetty，而且执行六个，这也是为何我们Linux会提供六个的纯文本终端机的设置所在，因为mingetty就是在启动终端机的命令

##启动过程会用到的主要配置文件##

**关于模块:/etc/modprobe.conf**

这个文件大多在与指定系统内的硬件所使用的模块，这个文件通常系统是可以自行产生的，所以不必动手去处理它。不过，如果系统检测到错误的驱动程序，或者是你想要使用更新的驱动程序来对应相关的硬件设备时，你就得自行手动处理一下这个文件了

**/etc/sysconfig/***

在整个启动过程当中，老是读取的一些服务的相关配置文件都是记录在/etc/sysconfig目录下的。其中几个重要的文件有:

- authconfig
	这个文件主要设置用户的身份认证的机制，包括是否使用本机的/etc/passwd,/etc/shadow等，以及/etc/shadow密码记录使用何种加密算法，还有是否使用外部服务器提供的账号验证(NIS,LDAP)等。系统默认使用MD5加密算法，并且不使用外部的身份验证机制
- clock
	此文件用于设置Linux主机的时区，可以使用格林威治时间(GMT),也可以使用北京的本地时间(local)。基本上，在clock文件内的设置选项"ZONE"所参考的时区位于/usr/share/zoneinof目录下的相对路径中，而且要修改时区的话，还得将/usr/share/zoneinfo/Asia/Shanghai这个文件复制成为/etc/localtime才行
- i18n
	用于设置一些语系的使用 
- keyboard & mouse
	keyboard与mouse就是设置键盘与鼠标的形式
- network
	可以设置是否要启动网络，以及设置主机名还有网关(GATEWAY)这两个重要信息
- network-scripts/
	主要用于设置网卡

##Run level的切换##

依据启动是否自动进入不同run level的设置，有以下结论:
1. 要每次启动都执行某个默认的run level，则需要修改/etc/inittab内的设置选项
2. 如果仅只是暂时更改系统的run level时，则使用init[0-6]来进行run level的更改，但下次重新启动时，依旧会是以/etc/inittab的设置为准
3. 可以通过`runlevel`命令来查看当前系统的run level。执行结果有两个，左边是前一个runlevel,右边代表目前的runlevel

#内核与内核模块#

- 内核:/boot/vmlinuz或/boot/vmlinuz-version
- 内核解压缩所需RAMDisk:/boot/initrd(/boot/initrd-version)
- 内核模块:/lib/modules/version/kernel或/lib/modules/$(uname-r)/kernel
- 内核源码:/usr/src/linux或/usr/src/kernels(要安装才会有！默认不安装)

如果该内核被顺利加载到系统当中，那么就会有几个信息记录下来:
- 内核版本:/proc/version
- 系统内核版本:/proc/sys/kernel

如果有个新硬件，但是操作系统却不支持，需要这么做:

- 重新编译内核，并加入最新的硬件驱动程序源码
- 将该硬件的驱动程序编译成为模块，在启动时加载该模块

##内核模块与依赖性##

基本上，内核模块的放置处是在/lib/modules/$(uname -r)/kernel当中，里面还分成了几个目录:

- arch:与硬件平台有关的选项，例如cpu等级
- crypto:内核所支持的加密技术，例如md5或者des等
- drivers:一些硬件的驱动程序，例如网卡、显卡、PCI相关硬件等
- fs:内核所支持的文件系统
- lib:一些函数库
- net:与网络有关的各项协议数据，还有防火墙模块(net/ipv4/netfilter/*)
- sound:与音效有关的各项模块

要了解内核，就必须要了解内核模块之间的相关性。Linux当然会提供一些模块依赖性的解决方案，那就是/lib/modules/$(uname -r)/modules.dep这个文件，它记录了在内核支持的模块的各项依赖性
可以利用`depmod`这个命令来创建该文件

##内核模块的查看##

可以利用`lsmod`命令来查看目前内核加载了多少模块
使用lsmod之后，系统会显示出目前已经存在于内核当中的模块，显示的内容包括:

- 模块名称(Module)
- 模块的大小(size)
- 此模块是否被其他模块所使用(used by)

想要查看每个模块的具体信息，可以使用`moinfo`命令

##内核模块的加载与删除##

当我们要自行手动加载模块时，有很多方法，最简单而且建议的是使用modprobe这个命令来加载模块，这是因为modprobe会主动去查找modules.dep的内容，先克服了模块的依赖性后，才决定需要加载的模块有哪些。
也可以使用`insmod`命令来完全由用户自行加载一个完整文件名的模块，并不会主动分析模块依赖性

#Boot Loader:Grub#

##boot loader的两个stage##

Linux将boot loader的程序代码执行与设置加载分别分成两个阶段(stage)来执行:

- Step1:执行boot loader主程序
	第一阶段为执行boot loader的主程序，这个主程序必须要被安装在启动区，即是MBR或者是boot sector。但是MBR实在太小了，所以MBR或boot sector通常仅安装boot loader的最小主程序，并没有安装loader的相关配置文件。
- Step2:主程序加载配置文件
	第二阶段为通过boot loader加载所有配置文件与相关的环境参数文件(包括文件系统定义与主要配置文件menu.list)，一般来说，配置文件都在/boot下面，与grub相关的文件都放置在/boot/grub中。

/boot/grub目录下最重要的就是配置文件(menu.lst)以及各种文件系统的定义！loader读取了这种文件系统定义数据后，就能够认识文件系统并读取该文件系统内的内核文件。

##grub的配置文件/boot/grub/menu.lst与菜单类型##

**硬盘与分区在grub中的代号**

grub的最重要的工作之一就是从磁盘当中加载内核文件，以让内核能够顺利驱动整个系统的硬件。grub对硬盘的代码设置与传统的Linux磁盘代号是完全不一样的！grub对硬盘的识别使用的是如下的代号:

`hd0,0`

需要的地方有这么几个:

- 硬盘代号以小括号()括起来
- 硬盘以hd表示，后面会接一组数字
- 以"查找顺序"作为硬盘的编号，而不是依照硬盘扁平电缆的顺序
- 第一个查找到的硬盘为0号，第二个为1号，以此类推
- 每块硬盘的第一个分区代号为0，依序类推

**/boot/grub/menu.lst配置文件**

menu.lst的配置文件的内容主要是:

{% highlight bash %}
default=0
timeout=5
splashimage=(hd0,0)/grub/splish.xpm.gz
hiddenmenu
title CentOS(2.6.18-92.e15)
	root (hd0,0)
	kernel /vimlinuz-2.6.18-92.e15 ro root=LABEL/1 rhgb quiwt
	initrd /initrd-2.6.18-92.e15.img
{% endhighlight %}

title以前的四行都输属于grub的整体设置，至于title后面才是指定启动的内核文件或者是boot loader控制权

- default
  配置文件中有几个title，启动的时候就会有几个菜单可以选择。由于grub起始号码为0号，因此default=0代表使用第一个title选项来启动的意思。default的意思是，如果在读秒时间结束前都没有按键，grub默认使用此title选项(在此为0号)来启动。
- timeout=5
  启动时会进行读秒，如果在5秒内没有按下任何按键，就会使用default后面接的那个title进行启动。timeout=0代表直接使用default值进行启动而不读秒，timeout=-1则代表直接进入菜单不读秒了。
- splashimage=(hd0,0)/grub/splash.xpm.gz
  后台图示文件的路径
- hiddenmenu
  设置启动时是否要显示菜单，如果想默认显示菜单，把这个选项注释掉就行了。

整体设置的地方大概就是这样，而下面那个title则是显示启动的设置项目。启动时可以**选择直接指定内核文件启动或将boot loader控制权转移到下个loader。(此过程称为chain-loader)**每个title后面接的是该启动项目名称的显示，即在菜单出现时菜单上面的名称。

当直接指定内核启动时:

-  root
   代表的是内核文件放置的那个分区，而不是根目录。
- kernel
   内核的文件名，文件名后面接的是内核的参数。root=LABEL=/1指的是Linux的根目录在哪个分区的意思，rhgb为彩色显示，quiet表示安静模式。(屏幕不会输出内核检测的信息)
- initrd
  就是之前提到的initrd制作出的RAM Disk的文件名。

利用chain loader的方式传教控制权时:

所谓的chain loader(引导装载程序的连接)仅是在将控制权交给下一个boot loader而已，所以kernel不需要识别kernel的文件名，它只是将boot的控制权交给下一个boot sector或MBR内的boot loader而已

一般来说，chain loader的设置只需要两个就够了，一个是预计要前往的boot sector所在的分区代号，另一个则是设置chain loader的那个分区的boot sector(第一个扇区)上！(具体的设置不再列出来了，等需要双系统启动时，再查阅相关的grub资料)

##initrd的重要性与创建新的initrd文件##

之前已经提到过initrd了，它的目的在于提供启动过程中所需要的最重要的内核模块，以让系统启动过程可以顺利完成。会需要initrd的原因，是因为内核模块放置于/lib/modules/$(uname -r)/kernel/当中，这些模块必须要根目录(/)被挂载时才能够被读取。但是如果内核本身不具备磁盘的驱动程序时，当然无法加载根目录，也就没有办法取得驱动程序，造成两难的地步。

initrd可以将/lib/modules/...内的启动过程当中一定需要的模块打包成一个文件(文件名就是initrd)，然后在启动时通过主机的INT13硬件功能将该文件读出来解压缩，并且initrd在内存内会仿真成为根目录，由于此虚拟文件系统(Initial RAM Disk)主要包含磁盘与文件系统的模块，因此我们的内核最后就能够认识实际的磁盘，那就能够进行实际根目录的挂载。所以说，**initrd内所包含的模块多是与启动过程有关，而主要以文件系统及硬盘模块(如usb,SCSI)等。**

一般来说，需要initrd的情况有:

- 根目录所在磁盘为SATA、USB或SCSI等连接接口
- 根目录所在文件系统为LVM、RAID等特殊格式
- 根目录所在文件系统为非传统Linux"认识"的文件系统时
- 其他必须要在内核加载时提供的模块

