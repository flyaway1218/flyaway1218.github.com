---
layout: post
title: 《鸟哥的Linux私房菜:基础篇》学习笔记——6.Linux磁盘与文件系统管理
time: 2013-2-14
category: LinuxBase
published: false
---


#认识EXT2文件系统#

##文件系统特性##

目前我们在格式化时已经不再说成针对分区来格式化了，通常我们可以称呼**一个可被挂载的数据为一个文件系统而不是一个分区**

Ext2文件系统:
- super block:记录此文件系统的整体信息，包括inode/block的总量、使用量、剩余量，以及文件系统的格式与相关信息等
- inode:记录文件的属性，一个文件占用一个inode，同时记录此文件的数据所在的block号码
- block:实际记录文件的内容，若文件太大时，会占用多个block

##Linux的Ext2文件系统(inode)##

**文件系统一开始就将inode与block规划好了，除非重新格式化(或者利用resize2fs等命令更改文件系统大小),否则indoe与block固定后就不再变动。**

如果文件系统高达数百GB时，那么将所有的inode与block放置在一起将是很不明智的决定，因为inode与block的数量太大时，不容易管理。因此Ext2文件系统在格式化的时候基本上是区分为多个块组的，每个块组都有独立的inode/block/superblock系统。

在整体规划中，**文件系统最前面有一个启动删除(boot sector)，这个启动扇区可以安装引导装载程序**，这个设计可以用来制作出多重引导环境。

每一个块组(block group)都有以下六部分组成:

1. **data block(数据块)**
		data block是用来放置文件内容的地方，在Ext2文件系统中所支持的block大小有1KB,2KB及4KB三种。每个block都有编号,方便inode的记录。由于block大小而产生的Ext2文件系统限制如表所示:

|-------------------------+-----------+-----------+-----------|
|  Blcok大小              |    1KB    |    2KB    |    4KB    |
|:-----------------------:|:---------:|:---------:|:---------:|
|  最大单一文件限制       |   16GB    |  256GB    |    2TB    |
|  最大文件系统总容量     |    2TB    |    8TB    |   16TB    |
|-------------------------+-----------+-----------+-----------|

		注意事项:
			- 原则上，block的大小与数量在格式化完后就不能再改变了(除非重新格式化)
			- 每个block内最多只能够放置一个文件的数据
			- 如果文件大于block的大小，则一个文件会占用多个block数量
			- 若文件小于block，则该block的剩余空间就不能再被使用了(导致空间浪费)

2. **inodetable(indoe表格)**
		inode记录的文件数据至少有下面这些:
			- 该文件的访问模式(read/write/excute)
			- 该文件的所有者与组(owner/group)
			- 该文件的大小
			- 该文件创建或状态改变的时间(ctime)
			- 最近一次的读取时间(atime)
			- 最近修改的时间(mtime)
			- 定义文件特性的标志(flag),如SetUID等。
			- 该文件真正内容的指向(pointer)
		
		inode的数量与大小也是在格式化时就已经固定了。
		
		每个inode大小均固定为128bytes
		每个文件仅会占用一个inode而已,因此，文件系统能够创建的文件数量与inode的数量有关

3. **Superblock**
		Superblock是记录整个文件系统相关信息的地方，没有Superblock，就没有这个文件系统了。它记录的信息主要有:
			- block与inode的总量
			- 未使用与已使用的inode/block数量
			- block与inode的大小(block为1K,2K,4K   inode为128bytes)
			- 文件系统的挂载时间、最近一次写入数据的时间、最近一次检验磁盘(fsck)的时间等文件系统的相关信息
			- 一个validbit数值，若此文件系统已被挂载，则validbit为0，若未被挂载，则validbit为1
	
		此外，需要特别注意的是，整个文件系统应该只有一个Superblock,但是后续的block group不一定含有superblock，若含有，则这个superblock应该是第一个block group内superblock的备份。


4. **File system Descritption(文件系统描述说明)**
		这个区段可以描述每个block group的开始于结束的block号码，以及说明每个区段(superblock,bitmap,inodemap,data block)分别介于哪一个block号码之间。这部分也能够用dumpe2fs来查看的。

5. **block bitmap(块对照表)**
		记录使用与未使用的block号码

6. **inode bitmap(inode对照表)**
		记录使用与未使用的inode号码
		
##与目录树的关系##

**目录**

当我们在Linux下的Ext2文件系统新建一个目录时，Ext2会分配一个inode与至少一块block给该目录。此时，
inode:记录该目录的相关权限与属性
block:记录这个目录下的文件名与该文件所占用的inode号码数据(**目录并不会只占用一个block,当该目录下文件太多时，系统会多分配一个block**)

**目录树与读取**

正因为Ext2中文件名是记录在目录的block中的，所以新增/删除/重命名文件名与目录的w权限有关，要读取某个文件，必然会经过其父目录的indoe与block

由于目录树是由根目录开始读起，因此系统通过挂载信息可以找到挂载点的inode号码(通常一个文件系统的最顶层inode号码会由2号开始)，此时就能够得到根目录的inode内容，并依据inode读取根目录的block内的文件名数据，再一层层地往下读到正确的文件名。


##Ext2/Ext3文件的访问与日志文件系统的功能##

当我们新增一个文件时，此时文件系统的行为是:

1. 先确定用户对于欲添加文件的目录是否具有w与x的权限，若有的话才能添加
2. 根据inode bitmap找到没有使用的inode号码，并将新文件的权限/属性写入
3. 根据block bitmap找到没有使用中的block号码，并将实际的数据写入block中，且更新inode的block指向数据
4. 将刚才写入的inode与block数据同步更新inode bitmap与block bitmap,并更新superblock

通常来说，我们将inode table与data block称为数据存放区域，而superblock、block bitmap与inode bitmap等区段就被称为metadata(中间数据)

**日志文件系统**

在文件系统中规划出一个块，该块专门记录写入或修订文件时的步骤，那就可以简化一致性检查的步骤了，也就是说:
1. 预备:当系统要写入一个文件时，会先在日志记录块中记录某个文件准备要写入的信息。
2. 实际写入:开始写入文件的权限与数据;开始更新mata data的数据
3. 结束:完成数据与meta data的更新之后，在日志记录块中完成该文件的记录

##Linux文件系统的操作##

Linux系统上的文件系统与内存有非常大的关系:
- 系统会将常用的文件数据放置到主存储器的缓冲区，以加速文件系统的读/写
- Linux的物理内存最后都会被用光，这是正常的情况，可加速系统性能
- 你可以手动使用sync来强迫内存中设置为Dirty的文件会写到磁盘中
- 若正常关机时，关机命令会主动调用sync来将内存的数据回写入磁盘内
- 但若不正常关机(如断点、死机或其他不明原因),由于数据尚未回写到磁盘内，因此重新启动后可能会花很多时间在进行磁盘检查，甚至可能导致文件系统的损毁(非磁盘损坏)

##挂载点(mount point)的意义##

将文件系统与目录树结合的操作我们称为**挂载**
**挂载一定是目录，该目录为进入该文件系统的入口**
文件系统只有被挂载到目录树中才能被使用


#文件系统的简单操作#

##磁盘与目录的容量:df,du##

df:列出文件系统的整体磁盘使用量
du:评估文件系统的磁盘使用量

df命令主要读取的数据几乎都是针对整个文件系统，因此读取的范围主要是在Super block内信息，所以命令显示结果的速度非常迅速
du命令其实会直接到文件系统内去查找所有的文件数据，所以会显示得比较慢


##连接文件:In##

Linux中的连接文件有两种:一种是类似Windows的快捷方式功能的文件，另一种则是通过文件系统的inode连接来产生新文件名，而不是产生新文件


**hard link(硬连接或实际连接)**

提出问题:有没有可能多个文件名对应到同一个inode号码呢？
hard link只是在某个目录下新建一条文件名连接到某个inode号码的关联记录而已(类似于指针，指向同一个inode号码/内存地址)

- hard link仅能够在单一文件系统中进行，不能跨文件系统
- hard link不能连接到目录
- hard link不会占用inode和block
- 每一个目录的`.`与`..`均是hard link实现的，所以当新建一个目录时，它的连接数至少是2(一个是目录名,一个是自己的`.`),同时它的父目录的连接数会加1(新目录的`..`)

命令: `ln  /etc/crontab /root/crontab`


**symbolic link(符号连接，也即快捷方式)**

基本上，symbolic link就是在创建一个独立的文件，而这个文件会让数据的读取指向它连接的那个文件名。
symbolic link是可以和Windows中的快捷方式画上等号，由symbolic link创建的文件作为一个独立的新文件，所以会占用掉inode与block

- symbolic link是可以连接目录的

命令:`ln -s /etc/crontab crontab2`

> ln命令默认是创建hard link，加上`-s`时，是创建symbolic link

#磁盘的分区、格式化、检验与挂载#

为系统新增一个硬盘时，有以下动作需要完成

1. 对磁盘分区，以新建可用的分区
2. 对该分区进行格式化(format),以创建系统可用的文件系统
3. 对刚才新建好的文件系统进行检验
4. 在Linux系统上，需要创建挂载点(也即是目录)，并将它挂在上来

##磁盘分区:fdisk##

fdisk只有root才能执行


##磁盘挂载与卸载##

进行挂载之前，最好要确定几件事情:

- 单一文件系统不应该被重复挂载在不同的挂载点(目录)中
- 单一目录不应该重复挂载多个文件系统
- 作为挂载点的目录理论上应该是空目录才行

如果你要用来挂载的目录里面并不是空的，那么挂载的文件系统之后，原目录下的东西就会暂时消失，被隐藏掉了，但不是被覆盖，新分区卸载之后，原来数据会再次显示出来。

mount:挂载
umount:卸载

#设置开机挂载#

##开机挂载/etc/fstab及/etc/mtab##

系统挂载的限制:

- 根目录/是必须挂载的，而且一定要先于其他mount point被挂载进来
- 其他挂载点必须为已新建的目录，可任意指定，但一定要遵守必须的系统目录架构原则
- 所有挂载点在同一时间之内，只能挂载一次
- 所有分区在同一时间之内，只能挂载一次
- 如若进行挂载，你必须现将工作目录移到挂载点之外

/etc/fstab中的内容:

|---------------+---------------+--------------+--------------+--------+--------|
|     Devic     |  Mount point  |  filesystem  |  parameters  |  dump  |  fsck  |
|:-------------:|:-------------:|:------------:|:------------:|:------:|:------:|
|  LABEL=/1     |      /        |    ext3      |  defaults    |   1    |   1    |
|  LABEL=/home  |      /home    |    ext3      |  defaults    |   1    |   2    |
|  LABEL=/boot  |      /boot    |    ext3      |  defaults    |   1    |   2    |
|---------------+---------------+--------------+--------------+--------+--------|

这六个字段非常重要

**第一列**:磁盘设备文件名或设备的Label
**第二列**:挂载点
**第三列**:磁盘分区的文件系统
**第四列**:文件系统参数
**第五列**:能否被dump备份命令作用。0代表不要被dump备份，1代表要每天进行dump操作，2代表其他不定日期的dump备份操作
**第六列**:是否以fsck检验扇区。0代表不要检验，1表示最早检验，2也是代表要检验，不过1会比较早被检验。通常根目录是1，其他是2就可以了。


#内存交换空间#

一共有三种方式来创建swap:

- 装系统时就设置好
- 设置一个swap分区
- 创建一个虚拟内存的文件

##使用物理分区构建swap##

1. **分区**:先使用fdisk在你的磁盘中分出一个分区给系统作为swap。由于Linux的fdisk默认会将分区的ID设置为Linux的文件系统，所以你可能还得要设置一下system ID就是了。
2. **格式化**:利用新建swap格式的"mkswap 设备文件名"就能够格式化分区成为swap格式
3. **使用**:最后将该swap设备启动，方法为"swapon 设备文件名"
4. **查看**:最终通过free命令来查看内存的使用情况


##使用文件构建swap##

1. 使用dd命令新增一个大容量的文件
2. 使用mkswap将这个文件格式化为swap的文件格式
3. 使用swapon来启动这个swap
4. 使用swapoff关掉swap file
