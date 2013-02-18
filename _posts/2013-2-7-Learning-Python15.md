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

内置作用域是通过一个名为__builtin__的标准模块来实现的，但是这个变量名自身并没有放入内置作用域内，所以必须导入这个文件才能够使用它。在Python3.0中，可以使用以下的代码来查看到底预定义了哪些变量:

{% highlight python3 %}
import builtins
dir(builtins)
{% endhighlight %}

因此，事实上有两种方法可以引用一个内置函数:通过LEGB法则带来的好处，或者手动导入__builtin__模块。其中第二种方法在一些复杂的任务里是很有用的，因为一些局部变量有可能会覆盖内置的变量或函数。再次强调的是，**LEGB法则只使它找到的第一处变量名的地方生效!**


#global语句#
global语句是一个命名空间的声明，它告诉Python解释器打算生成一个或多个全局变量，也就是说，存在于整个模块内部作用域(命名空间)的变量名。关于全局变量名:

- 全局变量是位于模块文件内部顶层的变量名。
- 全局变量如果是在函数内部被赋值的话，必须经过声明。
- 全局变量名在函数的内部不经过声明也可以被引用。

global语句包含了关键字global，其后跟着一个或多个由逗号分开的变量名。当在函数主题被赋值或引用时，所有列出来的变量名将被映射到整个模块的作用域内。
举个例子:

{% highlight python3 %}
X=88
def func():
  global X
  X = 99

func()
print(X)	#Prints 99
{% endhighlight %}

#作用域和嵌套函数#
这部分内容是关于LEGB查找法则中E这一层的，它包括了任意嵌套函数内部的本地作用域。嵌套作用域有时也叫做静态嵌套作用域。实际上，嵌套是一个语法上嵌套的作用域，它是对应于程序源代码的物理结构上的嵌套结构。

##嵌套作用域的细节##
对于一个函数来说:

- 一个引用(X)首先在本地(函数内)作用域查找变量名X；之后会在代码的语法上嵌套了的函数中的本地作用域，从内到外查找；之后查找当前的全局作用域(模块文件)；最后在内置作用域内(模块__builtin__)。全局声明将会直接从全局(模块文件)作用域进行搜索。其实就是从引用X的地方开始，一层一层网上搜索，直到找到的第一个X。
- 在默认情况下，一个赋值(X=value)创建或修改了变量名X的当前作用域。如果X在函数内部声明为全局变量，它将会创建或改变变量名X为整个模块的作用域。另一方面，如果X在函数内部声明为nonlocal，赋值会修改最近的嵌套函数的本地作用域中的名称X。

##嵌套作用域举例##

{% highlight python3 %}
X = 99
def f1():
  X = 88
  def f2():
    print(X)
  f2()
f1()	#Prints 88:enclosing def local
{% endhighlight %}
首先需要说明的是，上面这段代码是合法的，def是一个简单的执行语句，可以出现在任意其他语句能够出现的地方，包括嵌套在另一个def之中。代码中，f2是在f1中定义的函数，在此情况下，f2是一个临时函数，仅在f1内部执行的过程中存在(并且只对f1中的代码可见)。通过LEGB查找法则，f2内的X自动映射到了f1的X。

值得注意的是，**这个嵌套作用域查找在嵌套的函数已经返回后也是有效的。**
{% highlight python3 %}
X = 99
def f1():
  X = 88
  def f2():
    print(X)	#Remember X in enclosing def scope
  return f2	#Return f2 but don't call it

action = f1()	#Make return function
action()	#Call it now:Prints 88
{% endhighlight %}

上述代码中，不管调用几次action函数，返回值都是88，f2记住了f1中嵌套作用域中的X，尽管此时f1已经不处于激活的状态。

**工厂函数**

上述这些行为有时叫做闭合(closure)或者工厂函数——一个能够记住嵌套作用域的变量值的函数，即使那个作用域也许已经不存在了。通常来说，使用类来记录状态信息时更好的选择，但是像这样的工厂函数也提供了一种替代方案。
具体的例子:

{% highlight python3 %}
def maker(N):
  def action(X):
    return X ** N
  return action

f=maker(2)	#Pass 2 to N
f(3)		#Pass 3 to X,N remembers 2: 3**2,Return 9
f(4)		#return 4**2

g=maker(3)	#g remembers 3,f remembers 2
g(3)		#return 27
f(3)		#return 9

{% endhighlight %}
从上面代码中可以看到，f和g函数分别记录了不同的N值，也就是记录了不同的状态，每一次对这个工厂函数进行赋值，都会得到一个状态信息的集合，每个函数都有自己的状态信息，由maker中的变量N保持。

**作用域与带有循环变量的默认参数相比较**

在已给出的法则中有一个值得注意的特例：如果lambda或者def在函数中定义，嵌套在一个循环之中，并且嵌套的函数引用了一个上层作用域的变量，该变量被循环所改变，所有在这个循环中产生的函数都将会有相同的值——在最后一次循环中完成时被引用变量的值。具体的例子:

{% highlight python3 %}
def makeActions():
  acts=[]
  for i in range(5):			#Tries to remember each i
    acts.append(lambda x: i ** x)	#All remember same last it
  return acts
{% endhighlight %}
尽管是在尝试创建一个函数列表，使得每个函数拥有不同的状态值，但是事实上，这个列表中的函数的状态值都是一样的，是4。因为嵌套作用域中的变量在嵌套的函数被调用时才进行查找，所以它们实际上记住的是同样的值(在最后一次循环迭代中循环变量的值)。

为了能让这类代码能够工作，必须使用默认参数把当前的值传递给嵌套作用域的变量。因为默认参数是在嵌套函数创建时评估的(而不是在其稍后调用时)，每一个函数记住了自己的变量i的值。

{% highlight python3 %}
def makeActions():
  acts=[]
  for i in range(5):			#Use default instead
    acts.append(lambda x,i=i: i ** x)	#Remember current i
  return acts
{
{% endhighlight %}

#nonlocal语句#
事实上，在Python3.0中，我们也可以修改嵌套作用域变量，只要我们在一条nonlocal语句中声明它们。使用这条语句，嵌套的def可以对嵌套函数中的名称进行读取和写入访问。nonlocal应用于一个嵌套的函数的作用域中的一个名称，而不是所有def之外的全局模块作用域——它们可能只存在于一个嵌套的函数中，并且不能由一个嵌套的def中第一次赋值创建。

换句话说，nonlocal即允许对嵌套的函数作用域中的名称变量赋值，并且把这样的名称作用域查找限制在嵌套的def。


##nonlocal基础##
{% highlight python3 %}
def func():
  nonlocal name1,name2...
{% endhighlight %}
这条语句允许一个嵌套函数来修改在一个语法嵌套函数的作用域中定义的一个或多个名称。在Python 2.X中，当一个函数def嵌套在另一个函数中，嵌套的函数可以引用上一层函数中定义的各种变量，但是不能修改它们。在Python3.0中，在一条nonlocal语句中声明嵌套的作用域，使得嵌套的函数能够赋值，并且由此也能够修改这样的名称。

除了允许修改嵌套的def中的名称，nonlocal语句还加快了引用——就像global语句一样，nonlocal使得对该语句中列出的名称的查找从嵌套的def的作用域中开始，而不是从声明函数的本地作用域开始，也就是说，nonlocal也意味着"完全略过我的本地作用域"。

实际上，当执行到nonlocal语句的时候，nonlocal中列出的名称必须在一个嵌套的def中提前定义过，否则，将会产生一个错误。直接效果和global很相似:global意味着名称位于上一层的模块中，nonlocal意味着它们位于一个上一层的def函数中。nonlocal甚至更加严格——作用域查找只限定在嵌套的def。也就是说，nonlocal只能出现在嵌套的def中，而不能在模块的全局作用域中或def之外的内置作用域中。

当在一个函数中使用的时候，global和nonlocal语句都在某种程度上限制了查找规则:

- global使得作用域查找从嵌套的模块的作用域开始，并且允许对那里的名称赋值。如果名称不存在与该模块中，作用域查找继续到内置作用域，但是，对全局名称的赋值总是在模块作用域中创建或修改它们。
- nonlocal限制作用域查找只是嵌套的def，要求名称已经存在于那里，并且允许对它们赋值。作用域查找不会继续到全局或内置作用域。

##nonlocal应用##

**使用nonlocal进行修改**

{% highlight python3 %}
def tester(start):
  state = start		#each call gets its own state
  def nested(label):
    nonlocal state	#remember state in enclosing scope
    print(label,state)
    state+=1		#Allowed to change it if onolocal
  return nested


F = tester(0) 		#Increments state on each call
F('spam')		#Prints:spam 0
F('ham')		#Prints:ham 1
F('eggs')		#Prints:eggs 2
{% endhighlight %}

**边界情况**

- 当执行一条nonlocal语句时，nonlocal名称必须已经在一个嵌套的def作用域中赋值过，否则将会得到一个错误。
- nonlocal限制作用域查找仅为嵌套的def，nonlocal不会在嵌套的模块的全局作用域或所有def之外的内置作用域中查找。
