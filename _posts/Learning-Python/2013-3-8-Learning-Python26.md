---
layout: post
title: 《Learning Python》学习笔记——26.运算符重载
time: 2013-3-8
category: Python
---

#基础知识#
实际上，"运算符重载"只是意味着在类方法中**拦截**内置的操作——当类的实例出现在内置操作中，Python自动调用你的方法，并且你的方法的返回值变成了相应操作的结果。

以下是对重载的关键概念的复习：

- 运算符重载让类拦截常规的Python运算。
- 类可重载所有Python表达式运算。
- 类也可重载打印、函数调用、属性点号运算等内置运算。
- 重载使类实例的行为像内置类型。
- 重载是通过提供特殊名称的类方法来实现的。

##常见的运算符重载方法##
在类中，对内置对象所能做的事，几乎都有相应的特殊名称的重载方法。

所有重载方法的名称前后都有两个下划线字符，以便把同类中定义的变量名区别开来。特殊方法名称和表达式或运算的映射关系，是由Python语言预先定义好的。

虽然运算符重载不是必须的，但是如果没有给出相应的运算符重载方法的话，大多数内置函数会对类实例失效。

#索引和分片:\_\_getitem\_\_和\_\_setitem\_\_#

{% highlight python3 %}
class Indexer:
    def __getitem__(self,index):
      return x ** 2

X = Indexer()

for i in range(5):
    print(X[i],end=' ')          #0,1,4,9,16
{% endhighlight %}

##拦截分片##
除了索引，对于 **分片表达式**也调用\_\_item\_\_。
{% highlight python3 %}
class Indexer:
    data=[5,6,7,8,9]
    def __getitem__(self,index):
      print('getitem:',index)
      return self.data[index]

X = Indexer()
X[0]              #getitem:0 5
X[2:4]            #getitem:slice(2,4,None)  [7,8]
{% endhighlight %}
当针对分片调用的时候，方法接受一个分片对象，它在一个新的索引表达式中直接传递给嵌套的列表索引。

#索引迭代:\_\_getitem\_\_#
for语句的作用是从0到更大的索引值，重复对序列进行索引运算，知道检测到超出边界的异常。因此，\_\_getitem\_\_也可以是Python中一种重载迭代的方法。
{% highlight python3 %}
class stepper:
    def __getitem__(self,i):
      return self.data[i]

X = stepper()
X.data="Spam"

X[1]                     #'p'

for item in X:
    print(item,end=' ')  #S p a m
{% endhighlight %}
任何支持for循环的类也会自动支持Python所有迭代环境。

#迭代器对象:\_\_iter\_\_和\_\_next\_\_#
尽管上面的 \_\_getitem\_\_技术有效，但它真的只是迭代的一种退而求其次的方法。如今，Python中所有的迭代环境都会先尝试\_\_iter\_\_，再尝试\_\_getitem\_\_。一般来说，应该先使用\_\_iter\_\_，它能够比 \_\_getitem\_\_更好地支持一般的迭代环境。

从技术角度来说，迭代环境是通过调用内置函数iter去尝试寻找\_\_iter\_\_方法来实现的，而这种方式应该返回一个迭代器对象。如果已经提供了，Python就会重复调用者个迭代对象的next方法，直到发生StopIteration异常。如果没有找到这类\_\_iter\_\_方法，Python会改用\_\_getitem\_\_机制，就像之前那样通过偏移量重复索引，直到引发IndexError异常。

##用户定义的迭代器##
{% highlight python3 %}
class Squares:
    def __intit__(self,start,stop):
      self.value=start-1
      self.stop=stop
    def __iter__(self):
      return self
    def __next__(self):
      if self.value==self.stop:
        raise StopIteration
      self.value+=1
      return self.value ** 2


from iters import Squares
for i in Squares(1,5):
    print(i,end=' ')
{% endhighlight %}
上面的代码中，迭代器对象就是实力self自己，所以只能是单个迭代器。

##有多个迭代器的对象##
{% highlight python3 %}
class SkipIterator:
  def __init__(self,wrapped):
    self.wrapped = wrapped
    self.offset = 0
  def __next__(self):
    if self.offset >= len(self.wrapped):
      raise StopIteration
    else:
      item=self.wrapped[self.offset]
      self.offset += 2
      return item

class SkipObject:
  def __init__(self,wrapped):
    self.wrapped = wrapped
  def __inter__(self):
    return SkipIterator(self.wrapped)


skipper = SkipIterator('abcdef')
for x in skipper:
  for y in skipper:
    print(x+y,end=' ')
{% endhighlight %}
上面的代码在每一次的迭代中都会获得独立的迭代器对象来记录自己的状态信息，所以每个激活状态下的循环都有自己在字符串中的位置。

#成员关系:\_\_contains\_\_、\_\_iter\_\_和\_\_getitem\_\_#
在迭代领域，通常把in成员关系运算符实现为一个迭代，使用\_\_iter\_\_方法或\_\_getitem\_\_方法。要支持更加特定的成员关系，类可以编写一个\_\_contains\_\_方法。这个方法优先于\_\_iter\_\_方法，\_\_iter\_\_方法优先于\_\_getitem\_\_方法。\_\_contains\_\_方法应该把成员关系定义为对一个**映射**应用键(并且可以使用快速查找)，以及用于**序列**的搜索。

#属性引用:\_\_getattr\_\_和\_\_setattr\_\_#
\_\_getattr\_\_方法是拦截属性点号运算。更确切地说，当通过对**未定义**(不存在)属性名称和实例进行点号运算时，就会用属性名称作为字符串调用这个方法。如果Python可以通过其继承树搜索流程找到这个属性，该方法就不会被调用。
{% highlight python3 %}
class empty:
  def __getattr__(self,attrname):
    if attrname == "age":
      return 40
    else:
      raise AttributeError,attrname


X = empty()
X.age        #Print 40

X.name       #AttributeError:name
{% endhighlight %}
有个相关的重载方法 \_\_setattr\_\_会拦截所有属性的赋值语句。如果定义了这个方法，`self.attr=value`会变成`self.__setattr__('attr',value)`。这个很危险，因为在\_\_setattr\_\_中对任何self属性做赋值，都会再次调用\_\_setattr\_\_，导致无穷递归循环。解决的方法是，通过对属性字典做索引运算来赋值任何实例属性。也就是说，是使用`self.__dict__['name']=x`，而不是`self.name=x`。
{% highlight python3 %}
class accesscontrol:
  def __setattr__(self,attr,value):
    if attr=='age':
      self.__dict__[attr]=value
    else:
      raise AttributeError,attr+'not allowed'
{% endhighlight %}

##其他属性管理工具##
还有一些其他的方式来管理Python中的属性访问:

- \_\_getattribute\_\_方法来拦截所有的属性获取，而不只是那些未定义的，但是，当使用它的时候，必须比使用\_\_getattr\_\_更小心地避免循环。
- Property内置函数允许我们把方法和特定属性上的获取和设置操作关联起来。
- **描述符**提供了一个协议，把一个类的\_\_get\_\_和\_\_set\_\_方法与特定类属性的访问关联起来。

#\_\_repr\_\_和\_\_str\_\_会返回字符串表达形式#
如果定义了 \_\_repr\_\_方法，那么当类的实例打印或转换成字符串时，这个方法(或者其近亲\_\_str\_\_)就会自动调用。这些方法可替对象定义更好的显示格式，而不是使用默认的实例显示。

**两种显示方法**

- 打印操作会首先尝试\_\_str\_\_和str内置函数。它通常应该返回一个用户友好的显示。
- \_\_repr\_\_用于所有其他环境中：用于交互模式下提示回应以及repr函数，它通常应该返回一个编码字符串，可以用来重新创建对象，或者给开发者一个详细的显示。

总而言之， \_\_repr\_\_用于任何地方，除了当定义了一个\_\_str\_\_的时候。\_\_str\_\_只用于打印操作。如果想让所有环境都有统一的显示，\_\_repr\_\_是最好的选择。

#右侧加法和原处加法:\_\_radd\_\_和\_\_iadd\_\_#
从技术上讲， \_\_add\_\_方法并不支持+运算符右侧使用实例对象。要实现这类表达式，而支持**可互换**的运算符，可以一并编写\_\_radd\_\_方法。只有当+右侧对象是类实例对象，而左边对象不是类实例时，Python才会调用\_\_radd\_\_。在其他所有情况下，则由左侧对象调用\_\_add\_\_方法。


#Call表达式：\_\_call\_\_#
当调用实例时，使用 \_\_call\_\_方法，如果定义了，Python就会为实例应用函数调用表达式运行\_\_call\_\_方法。这样可以让类实例的外观和用法类似于函数。
{% highlight python3 %}
class Callee:
  def __call__(self,*pargs,**kargs):
    print('Called:',pargs,kargs)

C = Callee()
C(1,2,3)               #Called:(1,2,3){}
C(1,2,3,x=4,y=5)       #Called:(1,2,3){'y':5,'x':4}
{% endhighlight %}
直接的效果是，带有一个 \_\_call\_\_的类和实例，支持与常规函数和方法完全相同的参数语法和语义。


#比较:\_\_lt\_\_、\_\_gt\_\_和其他方法#
类可以定义方法来捕获所有的6种比较运算符:<、>、<=、>=、==和!=。这些方法通常很容易使用，但是，记住如下的一些限制:

- 比较方法没有右端形式。相反，当只有一个运算数支持比较的时候，使用其对应方法。
- 比较运算没有隐式关系。==并不意味着!=是假的。


#布尔测试#
类也可以定义赋予其实例布尔特性的方法，在布尔环境中，Python首先尝试\_\_bool\_\_来获取一个直接的布尔值，然后，如果没有该方法，就尝试\_\_len\_\_，类根据对象的长度确定一个真值。
{% highlight python3 %}
class Truth:
  def __bool__(self):return True

X = Truth()

if X:print('yes!')                #yes
{% endhighlight %}
如果没有定义真的方法，对象毫无疑义地看做是真。

#对象析构函数:\_\_del\_\_#
每当实例产生时，就会调用 \_\_init\_\_构造函数。每当实例空间被收回时，它的\_\_del\_\_析构函数就会被调用。
