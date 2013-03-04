---
layout: post
title: 《Learning Python》学习笔记——22.高级模块话题
time: 2013-3-4
category: Python
---

#在模块中隐藏数据#
正如之前所说，Python模块会导出其文件顶层所赋值的所有变量名。没有对某一变量名进行声明，使其在模块内可见或不可见这种概念。实际上，如果客户想的话，是没有放置客户端修改模块内变量名的方法的。

在Python中，模块内的数据隐藏是一种惯例，而不是一种约束。

##最小化from \*的破坏:\_X和\_\_all\_\_##


- 如果把下划线放在变量前面，那就可以防止客户端使用from \*语句导入模块时，把其中的变量名复制出去，这只是最小化对对命名空间的破坏。
- 下划线不是"私有声明":你还是可以使用其他导入形式看见并修改这类变量名。如import。

另外，也可以在模块的顶层把需要复制出去的变量名赋值给变量名为\_\_all\_\_的变量，例如`__all__=["Error","encode","decode"]`，使用此功能时，from \*语句只会把列在\_\_all\_\_列表中的变量名复制出来。

\_\_all\_\_指出需要被复制的变量名，而\_X指出不被复制的变量名。

#混合用法模式:\_\_name\_\_和\_\_main\_\_#
每个模块都有个名为\_\_name\_\_的内置属性，Python会自动设置属性:

- 如果文件时以顶层程序文件执行，在启动时，\_\_name\_\_就会设置为字符串"\_\_main\_\_"
- 如果文件被导入，\_\_name\_\_就会改设成客户端所了解的模块名

这样模块自己就可以检测自己的\_\_name\_\_，来确定它是在执行还是在导入。

实际上，一个模块的\_\_name\_\_变量充当一个使用模式标志，允许它编写一个可导入的库和一个顶层脚本。

##以\_\_name\_\_进行单元测试##
通过\_\_name\_\_变量，我们可以在文件尾部添加测试代码，把测试代码放在\_\_name\_\_变量的测试中，这样当文件被导入时，测试代码不会运行；但文件当做脚本被运行时，则是运行测试代码，这样能极大提高开发的效率。
{% highlight python3 %}
if __name__=='__main__':
    do some test...
{% endhighlight %}

#修改模块搜索路径#
事实上，sysp.path是可以修改的，一旦人为修改后，就会对Python程序的导入产生影响，因为所有的导入和文件都共享同一个sys.path列表。

#import语句和from语句的as扩展#
import和from语句都可以扩展的，让模块可以在脚本中给予不同的变量名。
下面的语句:
{% highlight python3 %}
import modulename as name
{% endhighlight %}
相当于:
{% highlight python3 %}
import modulename
name = modulename
del name
{% endhighlight %}

#用名称字符串导入模块#
一条import或from语句中的模块名是直接编写的变量名称，有时候我们需要动态加载不同的模块，在Python中可以使用`exec`内置函数来实现:
{% highlight python3 %}
modname="string"
exec("import" + modname)
{% endhighlight %}

#过渡性模块重载#
当我们在重载一个模块的时候，Python只会重载你给出的模块，而不会自动重载那些嵌套了的模块。例如，如果要重载某个模块A，并且A导入模块B和C，重载只适用于A，不适用于B和C。A中导入B和C的语句在重载的时候重新运行，但是，它们只是获取已经载入的B和C模块对象。

一种比较好的方法是，编写一个通用的工具来进行过渡性重载，通过扫描模块的`__dict__`属性并检查每一项的type以找到要重新载入的嵌套模块。
{% highlight python3 %}
"""
reloadall.py:transively reload nested modules
"""

import types
from imp import reload

def status(module):
	print('reloading '+module.__name__)

def transive_reload(module,visited):
	if not module in visited:
		status(module)
		reload(module)
		visited[module]=None
		for attrobj in module.__dict__.values():
			if type(attrobj) == types.ModuleType:
				transive_reload(attrobj,visited)


def reload_all(*args):
	visited = {}
	for arg in args:
		if type(arg) == types.ModuleType:
			transive_reload(arg,visited)

if __name__=='__main__':
	import reloadall
	reload_all(reloadall)
{% endhighlight %}

#模块设计理念#
就像函数一样，模块也有设计方面的折中考虑:需要思考哪些函数放进模块、模块通信机制。以下是一些通用的概念:

- **总是在Python的模块内编写代码。**
- **模块耦合要降到最低:全局变量。**模块应尽可能和其他模块的全局变量无关。
- **最大化模块的粘性:同一目标。**
- **模块应该少去修改其他模块的变量。**

#模块陷阱#

##顶层代码的语句次序的重要性##
当模块首次导入(或重载)时，Python会从头到尾执行语句。这里有些和前向引用(forward reference)相关的含义，值得在此强调:

- 在导入时，模块文件顶层的程序代码(不在函数内)一旦Python运行到时，就会立刻执行。因此，该语句是无法引用文件后面位置赋值的变量名。
- 位于函数主体内的代码直到函数被调用后才会运行。因为函数内的变量名在函数实际执行前都不会解析，通常可以引用文件内任意地方的变量。

##from复制变量名，而不是连接##
如果我们在一个文件中导入另一个模块的一个变量，就会得到这个变量的拷贝，而不是对这个变量的连接。在导入者内修改变量名，只会重设该变量名在本地作用域版本的绑定值，而不是那个被导入的文件中的变量名。

然而，如果我们使用import获得了整个模块，然后赋值某个点号运算的变量名，就会修改相应的模块对象中的变量名。点号运算把Python定向到了模块对象的变量名，而不是导入者的变量名。

##reload不会影响from导入##
因为from在执行时会复制(赋值)变量名，所以不连接到变量名的那个模块。通过from导入的变量名就简单地变成了对象的引用，当from运行时，这个对象恰巧在被导入者内有着相同的变量名引用。

所以，重载被导入者对于使用from导入模块变量名的客户端没有影响。也就是说，客户端的变量名依然引用了通过from取出的原始对象，即使之后原始模块中的变量名进行了重新赋值。

为了保证重载更有效，可以使用import以及点号运算，来取代from。因为点号运算总是回到模块，这样就会找到模块重载后变量名的新的绑定值。

##递归形式的from导入无法工作##
如果使用import取出整个模块，那没什么问题，模块的变量名在稍后使用点号运算，在获得值之前都不会读取。但是，如果使用from语句来取出特定的变量名，必须记住，只能读取在模块中已经赋值的变量名。
