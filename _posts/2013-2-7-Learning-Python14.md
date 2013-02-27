---
layout: post
title: 《Learning Python》学习笔记——14.函数基础
time: 2013-2-7
category: Python
---

#为何使用函数#

- 最大化代码的重用和最小化代码冗余
- 流程的分解

#编写函数#

##def语句##
在Python中创建一个函数是通过`def`关键字进行的，`def`语句将创建一个函数对象并将其赋值给一个变量名。`def`语句一般的格式如下所示:
{% highlight python3 %}
def <name>(arg1,arg2,... argN):
    <statements>
{% endhighlight %}
通常情况下，函数体中会有一个`return`语句，可以出现在函数体的任何位置，它表示函数调用的结束，并将结果返回至函数调用处。但是`return`语句是可选的，并不是必须的。从技术角度上说，一个没有返回值的函数自动返回了none对象，但是这个值可以被忽略掉。

##def语句是实时执行的##
Python的`def`语句实际上是一个可执行的语句:当它运行的时候，它创建一个新的函数对象并将其赋值给一个变量名。(请记住，Python中所有的语句都是实时运行的，没有对像独立编译时间这样的流程)因为它是一个语句，它可以出现在任一语句可以出现的地方——甚至是嵌套在其他语句中。
{% highlight python3 %}
if test:
   def func():
       ...
else:
   def func():
       ...
...
func()
{% endhighlight %}
它在运行时简单地给一个变量名进行赋值。与C语言这样的编译语言不同，Python函数在程序运行之前并不需要全部定义，更确切地说，`def`在运行时才评估，而在`def`之中的代码在函数调用时才会评估。

就像Python中其他语句一样，函数仅仅是对象，在程序执行时它清除地记录在了内存之中。实际上，除了调用之外，函数允许任意的属性附加到记录信息以供随后使用:
{% highlight python3 %}
othername=func	#Assign function object
othername()	#Call func again

func()		#call object
func.attr=value	#attach attribute
{% endhighlight %}

#一个例子:定义和调用#
{% highlight python3 %}
def times(x,y):
    return x*y

times(2,4)	#return 8
times(3.12,4)	#return 12.56
times('Ni',4)	#return 'NiNiNi'
{% endhighlight %}
上面代码中对函数的三次调用都能正确运行，因为"*"对数字和序列都有效，在Python我们从未对变量、参数或者返回值有过类似的声明，我们可以把times用作数字的乘法或是序列的重复。

换句话说，**函数times的作用决定于传递给它的参数，**这是Python的核心概念之一。

需要强调的是，如果我们传入了一个不支持函数操作的参数，Python会自动检测出不匹配，并抛出一个异常，这样就能减少我们编写不必要的类型检测代码。

##局部变量##
所有在函数内部定义的变量默认都是局部变量，所有的局部变量都会在函数调用时出现，并在函数退出时消失。
