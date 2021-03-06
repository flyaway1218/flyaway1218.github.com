---
layout: post
title: 《鸟哥的Linux私房菜:基础篇》学习笔记——20.软件安装:RPM、SRPM与YUM功能
time: 2013-2-14
category: LinuxBase
published: false
---


#软件管理器简介#

##Linux界的两大主流:RPM与DPKG##
目前Linux界软件自动安装方式最常见的有两种，分别是:

- dpkg:这个机制最早是由Debian Linux社区所开发出来的，只要派生于Debian的其他Linux distribution大多使用dpkg这个机制来管理软件，包括B2D,Ubuntu
- RPM:这个机制最早是由Red Hat这家公司开发的，后来因为很好用，因此很多distribution就使用这个机制来作为软件安装的管理方式，包括Fedora,CentOS,SuSE

|------------------------+-----------------+-----------------+----------------|
|  distribution代表      |  软件管理机制   |  使用命令       |  在线升级机制  |
|:-----------------------|:----------------|:----------------|:---------------|
|  Red Hat/Fedora        |  RPM            |   rpm,rpmbuild  |  YUM(yum)      |
|  Debian/Ubuntu         |  DPKG           |  dpkg           |  APT(apt-get)  |
|------------------------+-----------------+-----------------+----------------|

##什么是RPM与SRPM##
RPM全名是"RedHat Package Manager",简称则为RPM。RPM是以一种数据库记录的方式来将你所需要的软件安装到你的Linux系统的一套管理机制。

RPM最大特点就是将你要安装的软件先编译过，并且打包成为RPM机制的安装包，通过包装好的软件里默认的数据库记录这个软件要安装时必须具备的依赖软件属性，当安装在你的Linux主机时，RPM会先依照软件里头的数据查询Linux主机的依赖属性是否满足，若满足则予以安装，若不满足则不予安装。那么安装的时候就将该软件的信息整个写入RPM的数据库中，以便未来的查询、验证与反安装。这样一来的有点是:

- 由于已经编译完成并且打包完毕，所以软件传输与安装上很方便(不需要再重新编译)
- 由于软件的信息都已经记录在Linux主机的数据库上了，很方便查询、升级与反安装。


SRPM:所谓的SRPM，就是Source RPM的意思，也就是这个RPM文件里面含有源码。这个SRPM所提供的软件内容并没有经过编译，它提供的是源码。
通常SRPM的扩展名是以***.src.rpm这种格式来命名的。虽然是源码，但它仍然含有该软件所需要的依赖性软件说明以及所有RPM文件所提供的数据，同时，它与RPM不同的是，它也提供了参数设置文件(就是configure与makefile)。所以，如果下载的是SRPM，那么要安装该软件时，必须要:

- 先将该软件以RPM管理的方式编译，此时SPRM会被编译成为RPM文件
- 然后将编译完成的RPM文件安装到Linux系统当中

|------------+--------------+----------------+----------------+----------------------|
|  文件格式  |  文件名格式  |  直接安装与否  |  内含程序类型  |  可否修改参数并编译  |
|:-----------|:-------------|:---------------|:---------------|:---------------------|
|  RPM       |  xxx.rpm     |  可            |  已编译        |  不可                |
|  SRPM      |  xxx.src.rpm |  不可          |  未编译的源代码|  可                  |
|------------+--------------+----------------+----------------+----------------------|

##什么是i386、i586、i686、noarch、x86_64##
RPM软件的命名方式:`软件名称-版本信息-发布版本次数.适合的.扩展名`

例如:`re-pppoe-3.1-5.i386.rpm`

操作平台说明:

|------------+-----------------------------------------|
|  平台名称  |  适合平台说明                           |
|:-----------|:----------------------------------------|
|  i386      |  几乎适用于所有的x86平台，不论是旧的pentum或者是新的Intel Core2与K8系列的CPU等，都可以正常工作。那个i指的是Intel兼容的CPU的意思，386是CPU的级别   |
|  i586      |  就是针对586级别的计算机进行优化编译。  |
|  i686      |  针对685级别的计算机进行优化编译        |
|  x86_64    |  针对64位的CPU进行优化编译设置。        |
|  noarch    |  就是没有任何硬件等级上的限制。         |
|------------+-----------------------------------------|

##RPM的优点##

- RPM内含已经编译过的程序与设置文件等数据，可以让用户免除重新编译的困扰。
- RPM在被安装之前，会先检查系统的硬盘容量、操作系统版本等，可避免文件被错误安装。
- RPM文件本身提供软件版本信息、依赖属性软件名称、软件用途说明、软件所含文件等信息，便于了解软件。
- RPM管理的方式使用数据库记录RPM文件的相关参数，便于升级、删除、查询与验证。

#RPM软件管理程序:rpm#

##RPM默认的安装路径##
每一个软件的相关的信息都会被写入/var/lib/rpm/目录下的数据库文件中。
软件内的文件的放置目录:

|-------------------+--------------------------------------|
|      目录         |   说明                               |
|:------------------|:-------------------------------------|
|      /etc         |   一些设置文件放置的目录             |
|      /usr/bin     |   一些可执行文件                     |
|      /usr/lib     |   一些程序使用的动态函数库           |
|  /usr/share/doc   |   一些基本的软件使用手册与帮助文档   |
|  /usr/share/man   |   一些man page文件                   |
|-------------------+--------------------------------------|

##RPM安装(install)##

{% highlight bash %}
rpm -ivh package_name

 #-i:install的意思
 #-v:查看更详细的安装信息画面
 #-h:以安装信息栏显示安装进度
{% endhighlight %}

##RPM升级与更新(upgrade/freshen)##
关于升级参数的说明:

|--------+----------------------------------------------------------------------------------------------------------------|
|  参数  |  差别                                                                                                          |
|:-------|:---------------------------------------------------------------------------------------------------------------|
|  -Uvh  |  后面接的如果没有安装过，则系统将予以直接安装；若后面接的软件有安装过旧版本，则系统自动更新至新版              |
|  -Fvh  |  如果后面接的软件并为安装到你的Linux系统上，则该软件不会被安装；亦即只有已安装到你Linux系统内的软件才会被升级  |
|--------+----------------------------------------------------------------------------------------------------------------|

##RPM查询(query)##

{% highlight bash %}
rpm -qa
rpm -qp[licdR]  已安装的软件名称
rpm -qf 存在于系统上面的某个文件名
rpm -qpp[licdR] 未安装的某个文件名称

 #参数说明:
 #-q:仅查询，后面接的软件名称是否有安装
 #-qa:列出所有的已经安装到本机的Linux系统上面的所有软件名称
 #-qi:列出该软件的详细信息(information)，包含开发商、版本说明等
 #-ql:列出该软件所有的文件与目录所在的完整文件名(list)
 #-qc:列出该软件的所有设置文件
 #-qd:列出该软件的所有帮助文件
 #-qR:列出与该软件有关的依赖软件所含的文件
 #-qf:由后面接的文件名称找出文件属于哪一个已安装的软件
{% endhighlight %}

##RPM验证与数字证书(Verify/Signature)##
验证(Verify)的功能主要提供系统管理员一个有用的管理机制，其作用的方式是使用/var/lib/rpm下面的数据库内容来比较目前Linux系统的环境下的所有软件文件。


