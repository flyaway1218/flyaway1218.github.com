---
title: 《Learning Python》学习笔记——1.Python如何运行程序
time: 2013-1-25
layout: post
category: Python
---


#Python解释器简介#

Python不仅是一门编程语言，也是一个名为解释器的软件包。解释器是一种让其他程序运行起来的程序。实际上，解释器是代码与机器的计算机硬件之间的软件逻辑层。在UNIX/Linux上，Python通常是安装在/usr目录下的。

#程序执行#

##程序员的视角##

Python程序的源代码通常是以.py来命名的，当你将代码保存为一个文本文件之后，你必须告诉Python解释器去执行这个文件。

##Python的视角##

当Python运行脚本时，在代码开始进行处理之前，Python还会执行一些步骤。确切地说，第一步是编译成所谓的"字节码",之后将其转发到所谓的"虚拟机"中.

**字节码编译**

编译是一个简单的翻译步骤，而且字节码是源代码底层的、与平台无关的表现形式。概括地说，Python通过把每一条源语句分解为单一步骤来将这些源语句翻译成一组字节码指令，这些字节码可以提高执行速度。
编译好的字节码文件将会被Python自动保存为.pyc文件。

**Python虚拟机(PVM)**

一旦程序编译成字节码，之后的字节码发送到通常称为Python虚拟机(Python Virtual Machine,PVM)上来执行，实际上它不是一个独立的程序，不需要安装。事实上，PVM就是迭代运行字节码指令的一个大循环，一个接一个地完成操作。PVM是Python的运行引擎，它时常表现为Python系统的一部分，并且它是实际运行脚本的组件。从技术上讲，它才是所谓"Python解释器"的最后一步。

#Python实现的替代者#

- **CPython**

  原始的标准的Python实现方式，它运行的速度最快、最完整而且也是最健全的。它可以脚本化C和C++组件

- **JPython**

  JPython是一种Python语言的替代实现方式，其目的是为了与Java编程语言集成。

- **IronPython**

  Python的第三种实现方式是IronPython(比CPython和JPython都要新)，其设计目的是让Python程序可以与Windows平台上的.NET框架以及与之对应的Linux上开源的Mono编写的应用相集成
