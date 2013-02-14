---
layout: post
title: 《Learning Python》学习笔记——15.作用域
time: 2013-2-7
category: Python
---

#Python作用域#
在一个Python程序只用变量名时，Python创建、改变或查找变量名都是在所谓的命名空间(一个保存变量名的地方)中进行的。也就是说，在代码中变量名被赋值的位置决定了这个变量名能被访问到的范围,也即决定了它存在于哪个命名空间中。

除了打包程序之外，函数还为程序增加了一个额外的命名空间层:默认情况下，一个函数所有变量名都是与函数的命名空间相关联的。这意味着:

- 一个在def内的定义的变量能够在def内的代码使用,不能在函数的外部应用这样的变量名。
- def之中的变量名与def之外的变量名并不冲突，一个在def之外被赋值的变量X与在这个def之中赋值的变量X是完全不同的变量。

##作用域法则##
在开始编写函数之前，我们编写的所有代码都是位于一个模块的顶层(也就是说，并不是嵌套在def之中)，所以我们使用的变量名要么是存在于模块文件本身，要么就是Python内置预先定义好的。函数定义本地作用域，而模块定义的全局作用域。这两个作用域有如下关系:

- **内嵌的模块是全局作用域**
  每个模块都是一个全局作用域(也就是说，一个创建于模块文件顶层的变量的命名空间)。对于模块外部来说，该模块的全局变量就成为了这个模块对象的属性，但是在这个模块中能够像简单的变量一样使用。
- **全局作用域的作用范围仅限于单个文件**
  这里的全局指的是在一个文件的顶层的变量名仅对于这个文件内部的代码而言是全局的。在Python中是没有基于一个单个的、无所不包的情景文件的全局作用域的。
- **每次对函数的调用都创建了一个新的本地作用域**
- **赋值的变量名除非声明为全局变量或非局部变量，否则均为局部变量**
- **所有的变量名都可以归纳为本地、全局或者内置的**

##变量名解析:LEGB原则##
Python的变量名解析机制有时称为LEGB法则，当在**函数**中使用未认证的变量名时，Python搜索4个作用域:

1. 本地作用域(L)
2. 上一层结构中def或lambda的本地作用域(E)(其实就是函数嵌套的情况)
3. 全局作用域(G)
4. 最后是内置作用域(B)

Python按顺序在上面4个作用域中查找变量，并且在第一个能够找到这个变量名的地方停下来，如果在这4个作用域中都没找到，Python会报错。

这里需要强调的是，上面四个作用域是函数中代码的搜索过程，也就是说，**在函数中能直接使用上一层中的变量！**
{% highlight python3 %}
s=10
def times(x,y):
    x=s
    return x*y

times(3,4)	#return 40 not 12
{% endhighlight %}

##内置作用域##