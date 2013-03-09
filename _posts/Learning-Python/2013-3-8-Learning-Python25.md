---
layout: post
title: 《Learning Python》学习笔记——25.类代码编写细节
time: 2013-3-8
category: Python
---

#class语句#
class语句是对象的创建者，并且是一个隐式的赋值运算——执行时，产生类对象。

##一般形式##
{% highlight python3 %}
class <name>(superclass,...):
    data=value
    def method(self,...):
      self.member=value
{% endhighlight %}

##说明##
当Python执行class语句的时候(不是调用类)，会从头至尾执行其主体内的所有语句。在这个过程中，进行的赋值运算会在这个作用域中创建变量名，从而成为对应的类对象内的属性。所有由这个类对象产生的实例对象，都会继承这个属性，这种累属性可以用来贯穿所有实例的信息。(这有点像C++中的静态数据成员)

但是，如果我们对实例对象的属性进行赋值运算会在该实例对象内创建或修改变量名，而不是在共享的类对象中。通常情况下，继承属性只会在属性 **引用**时发生，而不是在赋值运算时发生:对对象属性进行赋值总是会修改该对象，除此之外没有其他的影响。
{% highlight python3 %}
class SharedData:
    spam=42

x = SharedData()
y = SharedData()
x.spam,y.spam                      #Print (42,42)

SharedData.spam=99
x.spam,y.spam,SharedData.spam      #Print (99,99,99)

x.spam=88
x.spam,y.spam,SharedData.spam      #Print (88,99,99)
{% endhighlight %}

#方法#
从程序设计的角度来说，方法的工作方式和简单函数完全一致，唯一的产别就是:方法的第一个参数总是接受方法调用的隐形主体，也就是实例对象。

换句话说，Python会自动把实例方法的调用对应到类方法函数
{% highlight python3 %}
instance.method(args...)
{% endhighlight %}
上面的代码会被替换成
{% highlight python3 %}
class.method(instance,args...)
{% endhighlight %}
在类方法中，按惯例第一个参数通常都称为self(严格的说，只有其位置重要，而不是它的名称)。这个参数给方法提供了一个钩子，从而返回调用的主题，也就是实例对象:因为类可以产生许多实例对象，所以需要这个参数来管理每个实例彼此各不相同的数据。

在Python中，self一定要在程序代码中明确地写出:方法一定要通过self来取出或修改由当前方法或正在处理的实例的属性。

##调用超类构造函数##
在构造实例的时候，Python会找出并且只调用一个\_\_init\_\_方法，如果要保证子类的构造方法也会执行超类构造时的逻辑，一般都必须通过类明确地调用超类的\_\_init\_\_方法。

你也可以在同一个类中写几个 \_\_init\_\_方法，但只会使用最后的定义。

#继承#
在Python中，当对对象进行点号运算时，就会发生继承，而且涉及了搜索属性定义树。每次使用object.attr形式的表达式时(object是实例或类对象)，Python会从头至尾搜索命名空间，先从对象开始，寻找所能找到的第一个attr。这包括在方法中对self属性的引用。因为树中较低的定义会覆盖较高的定义，继承构成了专有化的基础。

##属性树的构造##

- 实例属性是由命名空间内self属性进行赋值运算而生成的。
- 类属性是通过class语句内的语句(赋值语句)而生成的。
- 超类的连接是通过class语句首行括号内列出类而生成的。

