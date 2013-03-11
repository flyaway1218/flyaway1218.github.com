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

##继承方法的专有化##
继承树的搜索模式，成为了将系统专有化的最好方式。因为继承会现在子类寻找变量名，然后才查找超类，子类就可以对超类的属性重新定义来取代默认的行为。实际上，你可以把整个系统做成类的层次，再新增外部的子类对其进行扩展，而不是在原处修改已经存在的逻辑。

##接口类技术##
{% highlight python3 %}
class Super(self):
  def method(self):
    print('in Super.method')
  def delegate(self):
    self.action()

class Inheritor(Super):
  pass

class Replacer(Super):
  def method(self):
    print('in Replacer.method')

class Extender(Super):
  def method(self):
    print('starting Extender.method')
    Super.method(self)
    print('ending Extender.method')

class Provider(Super):
  def action(self):
    print('in Provider.action')

if __name__=='__main__':
  for klass in (Inheritor,Replacer,Extender):
    print('\n'+klass.__name__+'...')
    klass().method()
  print('\nProvider...')
  x = Provider()
  x.delegate()
{% endhighlight %}

##抽象超类##
当上面的Provider实例调用delegate方法时，有两个独立的继承搜索会发生:

1. 在最初的x.delegate的调用中，Python会搜索Provider实例和它上层的对象，直到在Super中找到delegate的方法。实例x像往常一样传递给这个方法的self参数。
2. 在Super.delegate方法中，self.action会对self以及它上层的对象启动新的独立继承搜索。因为self指的是Provider实例，在Provider类中就会找到action方法。

这种"填空"的代码结构一般就是OOP的软件框架。

更加实际的例子是这样的:
{% highlight python3 %}
class Super:
  def delegate(self):
    self.action
  def action(self):
    assert False,'action must be defined'
{% endhighlight %}

#命名空间:完整的内容#

- 无点号运算的变量名与作用域相对应
- 点号的属性名使用的是对象的命名空间
- 有些作用域会对对象的命名空间进行初始化(模块和类)

##简单变量名:如果赋值就不是全局变量##
无点号的简单变量名遵循之前的LEGB作用域法则，具体如下:

- 赋值语句(X = value)
  使变量名成为本地变量:在当前作用域内，创建或修改变量名X，除非声明它是全局变量。
- 引用(X)
  在当前作用域内搜索变量名，之后是在任何嵌套的函数中，然后是在当前的全局作用域，最后在内置作用域中搜索。

##属性名称:对象命名空间##
点号的属性名指的是特定对象的属性，并且遵循模块和类的规则。就类和实例对象而言，引用规则增加了继承搜索这个流程。

- 赋值语句(object.X = value)
  在进行点号运算的对象的命名空间内创建或修改属性名称X，并没有其他作用。继承树搜索只发生在属性引用时，而不是属性的赋值运算时。
- 引用(object.X)
  就基于类的对象而言，会在对象内搜索属性名称X，然后是在其上所有可读取的类(使用继承搜索流程)。对于基于类的对象而言(模块)，则是从对象中直接读取X。

##命名空间字典##
模块的命名空间实际上是以字典的形式实现的，并且可以由内置属性 \_\_dict\_\_显示这一点。类和实例对象也是如此：属性点号运算其实内部就是字典索引运算，而属性继承其实就是搜索链接的字典而已。实际上，实例和类对象就是Python中带有链接的字典而已。

- \_\_class\_\_属性链接到实例的类
- \_\_bases\_\_属性是一个元组，包含了超类的链接
- \_\_dict\_\_属性是实例对象的命名空间

{% highlight python3  %}
class super:
  def hello(self):
    self.data1 = 'spam'

class sub(super):
  def hola(self):
    self.data2 = 'eggs'

X = sub()
X.__dict__         #Instance namespace dict {}

X.__class__        #Class of instance  <class '__main__.sub'>
sub.__bases__      #Superclass of class (<class '__main__super'>,)
super.__bases__    #(<class 'object'>)
{% endhighlight %}

当类为self属性赋值时，会填入实例对象。也就是说，属性最后会位于实例的属性名命名空间字典内，而不是类的。实例对象的命名空间保存了数据，会随实例的不同而不同。
{% highlight python3 %}
Y = sub()

X.hello()
X.__dict__              #{'data1':'spam'}

X.hola()
X.__dict__              #{'data1':'spam','data2':'eggs'}

sub.__dict__.keys()     #['__module__','__doc__','hola']
super.__dict__.keys()     #['__dict__','__module__','__weakref__','__doc__','hello']


Y.__dict__              #{}
{% endhighlight %}
注意字典类的其他含有下划线的变量名。Python会自动设置这些变量，它们中的大多数都不会在一般程序中用到。

因为属性实际上是Python的字典键，所以其实有两种方式可以读取并对其进行赋值:通过点号运算或者通过键索引运算。

{% highlight python3 %}
X.data1,X.__dict__['data']         #('spam','spam')

X.data3='totast'
X.__dict__                         #{'data1':'spam','data3':'totast','data2':'eggs'}

X.__dict__['data3']='ham'
X.data3                            #'ham'
{% endhighlight %}
不过这种等效的关系只适用于实际中附加在实例上的属性。因为属性点号运算也会执行继承搜索，所以可以存取命名空间字典索引无法读取的属性。继承的属性X.hello无法由X.\_\_dict\_\_['hello']读取。

