---
layout: post
title: 《Learning Python》学习笔记——17.函数的高级话题
time: 2013-2-22
category: Python
---

#函数设计概念#

- 耦合性:对于输入使用参数并且输出使用return语句。
- 耦合性:只有在真正必要的情况下使用全局变量。
- 耦合性:不要改变可变类型的参数，除非调用者希望这样做。
- 聚合性:每一个函数都应该有一个单一的、统一的目标。
- 大小:每一个函数应该相对较小。
- 耦合:避免直接改变在另一个模块文件中的变量。

#函数对象:属性和注解#

##间接函数调用##
由于Python函数是对象，我们可以编写通用的处理他们的程序。函数对象可以赋值给其他的名字、传递给其他函数、嵌入到数据结构、从一个函数返回给另一个函数等等，就好像它们是简单的数字或字符串。

把函数赋值给其他变量:
{% highlight python3 %}
def echo(message):
  print(message)

x = echo
x('Indirect call!')    #Prints:Indirect call!
{% endhighlight %}
传递给其他函数:
{% highlight python3 %}
def indirect(func,arg):
    func(arg)

indirect(echo,'Argument call')    #Prints:Argument call
{% endhighlight %}
把函数对象填入到数据结构中:
{% highlight python3 %}
schedule=[(echo,'Spam!'),(echo,'Ham!')]
for (func,arg) in schedule:
    func(arg)
{% endhighlight %}
从上述的代码中可以看到，Python是非常灵活的！

##函数内省##
由于函数是对象，我们可以用用常规的对象工具来处理函数。
{% highlight python3 %}
func.__name__
dir(func)
{% endhighlight %}

内省工具允许我们探索实现细节，例如函数已经附加了代码对象，代码对象提供了函数的本地变量和参数等方面的细节：
{% highlight python3 %}
dir(func.__code__)
func.__code__.co_varnames
func.__code__.co_argument
{% endhighlight %}
工具编写者可以利用这些信息来管理函数。

##函数属性##
函数对象不仅局限于上一小节中列出的系统定义的属性，我们也可以向函数附加任意的用户定义的属性:
{% highlight python3 %}
func.count=0
func.count+=1

func.handles='Button-Press'
{% endhighlight %}
这样的属性可以用来直接把状态信息附加到函数对象，而不必使用全局、非本地和类等其他技术。和非本地不同，这样的属性信息可以在函数自身的任何地方访问。这种变量的名称对于一个函数来说是本地的，但是，其值在函数退出后仍然保留。属性与对象相关而不是与作用域相关，但直接效果是类似的。

##Python3.0中的函数注解##
在Python3.0也可以给函数对象附加注解信息——与函数的参数相关的任意的用户定义的数据。Python为声明注解提供了特殊的语法，但是，它自身不做任何事情；注解完全是可选的，并且，出现的时候只是直接附加到函数对象的\_\_annotations\_\_属性以供其他用户使用。

从语法上讲，函数注解编写在def头部行，对于参数，它们出现在紧随参数名之后的冒号之后；对于返回值，它们编写于紧跟在参数列表之后的一个`->`之后。
{% highlight python3 %}
def func(a:'spam',b:(1,10),c:float) -> int:
    return a+b+c
{% endhighlight %}
注解和没注解过的函数在功能和使用上完全一样，只不过，注解过的函数，Python会将它们的注解的数据收集到字典中并将它们附加到函数对象自身。参数名变成键，如果编写了返回值注解的话，它存储在键`return`下，而注解的值则是赋给了注解表达式的结果:
{% highlight python3 %}
func.__annotations__
 #Prints:{'a':'spam','c':<class 'float'>,'b':(1,10),'return':<class 'int'>}
{% endhighlight %}
**注意点**

- 如果编写了注解的话，仍然可以对参数使用默认值，例如:`a:'spam'=4` 意味着参数a的默认值是4，并且用字符串'spam'注解它。
- 在函数头部的各部分之间使用空格是可选的。
- 注解只在`def`语句中有效。

#匿名函数:lambda#
除了`def`语句之外，Python还提供了一种生成函数对象的表达式形式。由于它与LISP语言中的一个工具很相似，所以称为lambda。就像`def`一样，这个表达式创建了一个之后能够调用的函数，但是它返回了一个函数而不是将这个函数赋值给一个变量名。这也就是lambda有时叫做匿名函数的原因。实际上，它们常常以一个行内函数定义的形式使用，或者用作推迟执行一些代码。

##lambda表达式##
lambda的一般形式是关键字lambda，之后是一个或多个参数，紧跟的是一个冒号，之后是一个表达式：
{% highlight python3 %}
lambda argument1,argument2,...argumentN:expression using arguments
{% endhighlight %}
由lambda表达式所返回的函数对象与由def创建并赋值后的函数对象工作起来是完全一样的，但是lambda有一些不同之处让其在扮演特定的角色时很有用。

- **lambda是一个表达式，而不是一个语句。**
- **lambda的主体是一个单个的表达式，而不是一个代码块。**

一下两段代码生成了同样功能的函数:
{% highlight python3 %}
def func(x,y,z):return x+y+z
func(2,3,4)                   #Return 9

f = lambda x,y,z : x + y + z
f(2,3,4)                      #Return 9
{% endhighlight %}

默认参数也能在lambda中使用
{% highlight python3 %}
x=(lambda a="fee",b="fie",c="foe": a+b+c)
x("wee")                      #Prints:'weefiefoe'
{% endhighlight %}

在lambda主体中的代码像在def内的代码一样都遵循相同的作用域查找法则。

##为什么要使用lambda##
通常来说，lambda起到了一种函数速写的作用，允许在使用的代码内嵌入一个函数的定义。它们总是可选的，因为总是能够用def来代替。

lambda通常用来编写跳转表:
{% highlight python3 %}
L=[lambda x: x ** 2,
   lambda x: x ** 3,
   lambda x: x ** 4]

for f in L:
  print(f(2))            #Prints:4,8,16
print(L[0](3))           #Prints:9
{% endhighlight %}
实际上，我们可以用Python中的字典或者其他数据结构来构建更多种类的行为表:
{% highlight python3 %}
key='got'
{'already':(lambda: 2+2),
 'got':(lambda: 2*4),
 'one':(lambda: 2 ** 6)}[key]()          #Prints:8
{% endhighlight %}
这样编写代码可以使字典成为更加通用的多路分支工具。

最后需要注意的是，lambda也是可以嵌套的
{% highlight python3 %}
((lambda x:(lambda y: x+y))(99))(4)      #Prints:103
{% endhighlight %}

#在序列中映射函数:map#
map函数会对一个序列对象中的每个元素应用被传入的函数，并且返回一个包含了所有函数调用结果的一个列表。
{% highlight python3 %}
counters=[1,2,3,4]
def inc(x):return x+10
list(map(inc,counters))         #[11,12,13,14]
{% endhighlight %}
由于map期待传入一个函数，它恰好是lambda最常出现的地方之一。
{% highlight python3 %}
list(map((lambda x: x+10),counters))  #[11,12,13,14]
{% endhighlight %}

#函数式编程工具:filter和reduce#
在Python内置函数中，map函数是用来进行函数式编程的这类工具中最简单的内置函数代表。所谓的函数式编程就是对序列应用一些函数的工具。例如过滤出一些元素(filter)，以及对每对元素都应用函数并运行到最后的结果(reduce)。
{% highlight python3 %}
list(filter((lambda x: x>0),range(-5,5)))   #[1,2,3,4]
{% endhighlight %}
序列中的元素若其返回值是真的话，将会被加入到结果列表中。

reduce接受一个迭代器来处理，但是，它自身不是一个迭代器，它返回一个单个的结果。
{% highlight python3 %}
from functools import reduce   #Import in 3.0,not in 2.6
reduce((lambda x,y: x+y),[1,2,3,4])  #Return:10
reduce((lambda x,y: x*y),[1,2,3,4])  #Return:24
{% endhighlight %}
上面两个reduce调用，计算了一个列表中所有元素的累加和与累积乘积。
