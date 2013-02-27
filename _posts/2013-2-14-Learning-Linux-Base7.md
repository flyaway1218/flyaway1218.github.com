---
layout: post
title: 《鸟哥的Linux私房菜:基础篇》学习笔记——7.文件与文件系统的压缩与打包
time: 2013-2-14
category: LinuxBase
published: false
---


#Linux系统常见的压缩命令#

常见的压缩文件扩展名:
*.z					compress程序压缩的文件
*.gz				gzip程序压缩的文件(**常用**)
*.bz2				bzip2程序压缩的文件(**常用**)
*.tar				tar程序打包的数据，并没有压缩过
*.tar.gz		tar程序打包的文件，其中经过gzip的压缩
*.tar.bz2		tar程序打包的文件，其中经过bzip2的压缩

##gzip,zcat##

目前gzip可以解开compress、zip与gzip等软件所压缩的文件。
gzip所新建的文件的后缀名是.gz
另外值得一说的是，使用gzip压缩的文件能在Windows系统中被winRAR解压缩
**注意:默认情况下使用gzip压缩之后，源文件就不存在了**


##bzip2,bzcat##

gzip是用来替代compress的，而bzip2是用来替代gzip的，它比gzip还要好用。
用法和gzip几乎一样

#打包命令:tar#

gzip和bzip2只能压缩单个文件，不能压缩多个文件，此时为了能把多个文件压缩到一起，要使用tar命令。
tar命令可以将多个目录或文件打包成一个大文件，同时还可以通过gzip/bzip2的支持，将该文件同时进行压缩。

最简单的使用tar就只要记忆下面的方式即可:

- 压缩:`tar -jcv -f filename.tar.bz2`+要被压缩的文件或目录名称
- 查询:`tar -jtv -f filename.tar.bz2`
- 解压缩:`tar -jxv -f filename.tar.bz2 -C`+欲解压缩的目录

**注意，命令中的`-f filename`必须紧紧连在一起，-f的位置不能和其他参数交换**

#光盘写入工具#

在命令行中实现刻录行为，通常的做法是这样的:

- 先将所需要备份的数据构建成为一个镜像文件(iso)，利用mkisofs命令来处理
- 将该镜像文件刻录至光盘或DVD当中，利用cdrecord命令来处理

