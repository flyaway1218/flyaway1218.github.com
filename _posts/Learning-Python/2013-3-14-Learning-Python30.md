---
layout: post
title: 《Learning Python》学习笔记——30.异常编码细节
time: 2013-3-14
category: Python
---

#try/except/else语句#
{% highlight python3 %}
try:
    <statements>
except <name1>:
    <statements>
except (name2,name3):
    <statements>
except <name4> as <data>:
    <statements>
except:
    <statements>
else:
    <statements>
{% endhighlight %}
这里的语法和C++很相似，唯一要说明的是else语句，else下的语句表示没有引发异常时需要执行的代码。

except分句会捕捉try代码块执行时所发生的异常，而else子句只在try代码块执行时不发生异常时才会执行。

##try分句##

try语句的分句形式:

|-----------------------------+------------------------------------------|
|  分句形式                   |  说明                                    |
|:----------------------------|:-----------------------------------------|
|  except:                    |  捕捉所有(其他)异常类型                  |
|  except name:               |  只捕捉特定的异常                        |
|  except name,value          |  捕捉所列的异常和其额外的数据(或实例)    |
|  except (name1,name2)       |  捕捉任何列出的异常                      |
|  except (name1,name2),value |  捕捉任何列出的异常，并取得其额外数据    |
|  else:                      |  如果没有引起异常，就运行                |
|  finally:                   |  总是会运行此代码块                      |
|-----------------------------+------------------------------------------|

当有多个except子句的时候，Python是从上到下，从左到右寻找符合的异常。


#try/finally语句#
{% highlight python3 %}
try:
  <statements>
finally:
  <statements>
{% endhighlight %}

finally中的语句不管是否发生异常都会被执行，并且异常在finally中代码执行完全后，会继续向上层传递异常。

finally用于定义清理动作，无论异常是否引发或受到处理，都一定会在离开try前运行。

#统一try语句语法#
当把except和finally语法组合时，其部分的顺序必须是:

try -> except -> else -> finally

其中，else和finally是可选的，可能会有0个或多个except，但是，如果出现一个else的话，必须有至少一个except。

#raise语句#
要显示地触发异常，可以使用raise语句，其一般形式相当简单。
{% highlight python3 %}
raise <instance>     #Raise instance of class
raise <class>        #Make and raise instance of class
raise                #Reraise the most recent exception
{% endhighlight %}
在Python2.6和Python3.0中异常总是类的实例，第一种形式最常见，直接提供一个实例，要么是在raise之前创建的，要么是raise语句中自带的。如果我们传递一个类，Python就会调用不带构造函数的参数的类，以创建被引发的一个实例，这等同于在类引用后面添加圆括号。

当引发一个异常的时候，Python把引发的实例与该异常一起发送。如果一个try包含了一个名为except name as X:子句，变量X将会被分配给引发中所提供的实例。

不管你如何指定异常，异常总是通过实例对象来识别，并且大多数时候在任意给定的时刻激活。一旦异常在程序中某处一条except子句被捕获，就死掉了，除非由另一个raise语句或错误重新引发它。

#assert语句#
Python中还有一个assert语句，这种情况有些特殊。这是raise常见使用模式的语法简写，assert可视为条件式的raise语句。该语句形式为:
{% highlight python3 %}
asser <test>,<data>
{% endhighlight %}
执行起来就像如下的代码:
{% highlight python3 %}
if not <test>:
  raise AssertionError(<data>)
{% endhighlight %}
换句话说，如果test计算为假，Python就会引发异常:data项(如果提供了的话)是异常的额外数据。

#with/as环境管理器#
简而言之，with/as语句的设计是作为常见try/finally用法模式的替代方案。就像try/finally语句，with/as语句也是用于定义必须执行的"清理"行为，无论步骤中是否发生异常。不过，和try/finally不同的是，width语句支持更加丰富的基于对象的协议，可以为代码块定义进入和离开的操作。

##基本使用##
{% highlight python3 %}
with expression [as variable]:
  with-block
{% endhighlight %}
在这里的expression要返回一个对象，从而支持环境管理协议。如果可选的as子句存在，此对象也可返回一个值，赋值给变量名variable。

需要注意的是，这个variable不是expression的执行结果，expression的结果是支持环境协议的对象，这个variable会被赋值成将会在代码块中使用的其他值。然后，expression返回的对象可在with-block开始前，先执行启动程序，并且在该代码块结束之后，执行中止程序代码，不论这中间是否引发异常。

有些内置的Python对象已经支持环境管理协议，因此可以用于with语句。

{% highlight python3 %}
with open(r'c:\misc\data') as myfile:
  for line in myfile:
   print(line)
   ...more code here...
{% endhighlight %}
在这里，对open的调用，会返回一个简单文件对象，赋值给变量名myfile。然而，此对象也支持with语句所使用的环境管理协议。在这个with语句执行后，环境管理器机制保证由myfile所引用的文件对象会自动关闭，即使处理该文件时，for循环引发异常。

##环境管理协议##
尽管一些内置类型带有环境管理器，我还可以自己编写一耳光。要实现环境管理器，使用特殊的方法来接入with语句，该方法属于运算符重载的范畴。用在with语句中对象所需要的接口有点复杂，而多数程序员只需要直到如何使用现有的环境管理器。

以下是with语句实际工作方式:

1. 计算表达式，所得到的对象称为环境管理器，它必须有\_\_enter\_\_和\_\_exit\_\_方法。
2. 环境管理器的\_\_enter\_\_方法会被调用。如果as子句存在，其返回值会赋值给as子句中的变量，否则，直接丢弃。
3. 代码块中嵌套的代码会执行。
4. 如果with代码块引发异常，\_\_exit\_\_(type,value,traceback)方法就会被调用(带有异常细节)。这些也是由sys.exc\_info返回的相同值。如果此方法返回值为假，则异常会重新引发。否则，异常会终止。正常情况下异常时应该被重新引发，这样的话才能传递到with语句之外。
5. 如果with代码块没有引发异常，\_\_exit\_\_方法依然会被调用，其type、value以及traceback参数都会以None传递。
