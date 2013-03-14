---
layout: post
title: 《Learning Python》学习笔记——31.异常对象
time: 2013-3-14
category: Python
---

在Python2.6和Python3.0中，内置异常和用户定义的的异常都是可以通过类实例对象来表示。这意味着，你必须使用面向对象编程来在程序中定义新的异常。

基于类的异常有如下特点:

- **提供类型分类，对今后的修改有更好的支持。**
- **它们附加了状态信息。**异常类提供了存储在try处理器中所使用的环境信息的合理地点，这样的话，可以拥有状态信息及可调用的方法，并且可以通过实例进行读取。
- **它们支持继承。**基于类的异常允许参与继承层次，从而可以获得并定制共同的行为。

事实上，所有内置异常都是类组织成继承树。在Python3.0中，用户定义的异常继承自内置异常超类。

#内置异常类#
在Python3.0中，所有熟悉的异常都是预定义的类，可以作为内置变量名。

- BaseException
  异常的顶级根类。这个类不能当作是由用户定义的类直接继承的(使用Exception)。它提供了子类所继承的默认的打印和状态保持行为。
- Exception
  与应用相关的异常的顶层根超类。这是BaseException的一个直接子类，并且是所有其他内置异常的超类。除了系统的退出事件类之外(SystemExit、KeyboardInterrupt和GeneratorExit)。几乎所有的用户定义的类都应该继承自这个类，而不是BaseException。当遵从这一惯例的时候，在一条try语句的处理器中指明Exception，会确保你的程序将捕获除了系统退出事件之外的所有异常，通常该事件时允许通过的。实际上，Exception变成了try语句中的一个全捕获，并且比一条空的Exception更精确。
- AtithmeticError
  所有数值错误的超类(并且是Exception的一个子类)
- OverflowError
  识别特定的数值错误的子类。

##默认打印和状态##
内置异常还提供了默认打印显示和状态保持。除非你重新定义类继承自它们的构造函数，传递给这些类的任何构造函数参数都会保存在实例的args元组属性中，并且当打印该实例的时候自动显示。
{% highlight python3 %}
raise IndexError                  #IndexError
raise IndexError('spam')          #IndexError:spam
{% endhighlight %}
