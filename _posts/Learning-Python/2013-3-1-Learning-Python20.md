---
layout: post
title: 《Learning Python》学习笔记——20.模块代码编写基础
category: Python
time: 2013-3-1
---

#模块的创建#
任何.py文件都会被自动认为是Python模块，在模块顶层指定的所有变量名都会变成其属性(与模块对象结合的变量名)，并且可以导出供客户端来使用。

当一个模块被导入时，Python会自动把内部模块映射到外部文件名，也就是通过把模块搜索路径中的目录加在前面，而把.py或其他后缀名加在后面。例如，名为M的模块最后会映射到某个包含程序代码的外部文件:<directory>\M.<extension>

#模块的使用#
客户端可以执行import或from语句，以使用我们刚才编写的简单模块文件。如果模块还没有加载，这个两个语句就会去搜索、编译已经执行模块文件程序。主要的差别在于，import会读取整个模块，from将获取(或者说是复制)模块特定的变量名。

假设我们有一个名为module1.py的文件，其中的内容如下所示:
{% highlight python3 %}
def printer(x):
  print(x)
{% endhighlight %}

##import语句##
{% highlight python3 %}
import module1
module1.printer("Hello world!")    #Prints Hello wordl!
{% endhighlight %}
上面的例子中，变量名module1有两个不同的目的:识别要被载入的外部文件，同时会生成脚本中的变量，在文件加载后，用来引用模块对象。

##from语句##

{% highlight python3 %}
from module1 import printer
printer("Hello world!")            #Prints Hello wordl!
{% endhighlight %}
这和上一个例子有着相同的效果，但是from语句出现时，导入的变量名会复制到作用域内，在脚本中使用该变量名可以少输入一些代码。

##from * 语句##

{% highlight python3 %}
from module1 import *
printer("Hello world!")            #Prints Hello wordl!
{% endhighlight %}
`from *`会获取的模块顶层所有赋了值的变量名的拷贝，和import比只是多了一个步骤:把模块中的所有变量名复制到了进行导入的作用域之内。从根本上讲，这就是把一个模块的命名空间融入另一个模块之中。

##导入只发生一次##
模块会在第一次import或from时载入并执行，并且只在第一次如此，Python只对每个文件的每个进程做一次操作，之后的导入操作都只会取出已加载的模块对象。

第二次和其后的导入并不会重新执行此模块的代码，只是从Python内部模块表中取出已创建的模块对象。

##import和from是赋值语句##
就像def一样，import和from是可执行的语句，而不是编译期间的声明，而且它们可以嵌套在if测试中，出现在函数def之中等。直到执行程序时，Python执行到这些语句，才会进行解析。换句话来说，被导入的模块和变量名，直到它们所对应的import或from语句执行后，才可以使用。此外，就像def一样，import和from都是隐性的赋值语句。

- import将整个模块对象赋值给一个变量名
- from将一个或多个变量名赋值给另一个模块中的同名对象

以from复制的变量名会变成对共享对象的引用，就像函数的参数，对已取出的变量名重新赋值，对于复制之处的模块并没有影响，但是修改一个已取出的可变对象，则会影响导入的模块内的对象。

##文件间变量名的改变##
一个像这样的from语句
{% highlight python3 %}
from modules import name1,name2
{% endhighlight %}
与下面这些语句是等效的

{% highlight python3 %}
import module
name1 = module.name1
name2 = module.name2
del module
{% endhighlight %}
需要的注意的是，from第一步也是普通的导入操作，因此，from总是会把整个模块导入到内存中，无论是从这个文件中复制出多少变量名。

##from语句潜在的陷阱##
from语句有破坏命名空间的潜质，如果使用from导入变量，而那些变量碰巧和作用域中现有变量同名，变量就会悄悄地被覆盖掉。使用简单地import语句就不会有这种问题。

#模块命名空间#

##文件生成命名空间##
在模块文件顶层(也就是不在函数或类的主体内)每一个赋值了的变量名都会变成该模块的属性。

- 模块语句会在首次导入时执行
- 顶层的赋值语句会创建模块属性
- 模块的命名空间能够通过属性`__dict__`或`dir(M)`获取
- 模块是一个独立的作用域

##导入和作用域##
不导入一个文件，就无法存取该文件内所定义的变量名。也就是说，你不可能自动看见另一个文件内的变量名，无论程序中的导入结构或函数调用的结构是什么样的。变量的含义一定是由源代码中的赋值语句的位置决定的，而属性总是伴随着对对象的请求。

另外需要注意的是，导入操作不会赋予被导入文件中的代码对上层代码的可见度:被导入的文件无法看见进行导入的文件内的变量名。

#重载模块#
Python只会在模块第一次导入时才会加载和执行该模块的代码，之后的导入只会使用已经加载的模块对象，而不会重载或重新执行文件的代码。但是reload函数会强制已加载的代码重新载入并重新执行。

##reload基础##
与import和from不同的是:

- reload是Python中的内置函数，而不是语句
- 传给reload的是已经存在的模块对象，而不是变量名
- reload是Python3.0中位于模块之中，并且必须先导入才能使用

{% highlight python3 %}
import module
...
...                 #Change the module file
...

from imp import reload
reload(module)
...use module.attributes..
{% endhighlight %}
当调用reload时，Python会重读模块文件的源代码，重新执行其顶层语句。**reload会在适当的地方修改模块对象，reload并不会删除并重建模块对象**

- reload会在磨矿当前命名空间内执行模块文件的新代码
- 文件中顶层赋值语句会使得变量名换成新值
- 重载会影响所有使用import读取了模块的客户端
- 重载只会对以后使用from的客户端造成影响
