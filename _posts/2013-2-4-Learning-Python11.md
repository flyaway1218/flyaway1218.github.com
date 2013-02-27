---
title: 《Learning Python》学习笔记——11.while和for循环
time: 2013-2-4
layout: post
category: Python
---

#while循环#

while语句是Python语言中最通用的迭代结构，简而言之，只要顶端测试一直计算到真值，就会重复执行一个语句块。

##一般格式##

{% highlight python3 %}
while <test>:
  <statements1>
else:
  <statements2>
{% endhighlight %}

##break,continue,pass和循环else##

**break**

跳出最近所在的循环(跳过整个循环语句)。

**continue**

跳到最近所在循环的开头处(来到循环的首行)。

**pass**

什么事也不做，只是空占位符语句。

**循环else块**

只有当前循环正常离开时才会执行(也就是没有碰到break语句)

##一般循环格式##

加入break和continue语句后，while的一般格式变为:

{% highlight python3 %}
while <test1>:
  <statements1>
  if <test2>:break
  if <test3>:continue
else:
  <statements2>
{% endhighlight %}

##pass##

pass语句是无运算的占位符，当语法需要语句并且还没有任何实用的语句可写时，就可以使用它。

##循环else##

在while语句中加入else和C/C++中的语法不太一样，这里详细说明一下。else后面的代码只有当循环正常结束时才会执行，如果是用break跳出循环的，这部分代码就不会运行，具体看一个求质数的例子:

{% highlight python3 %}
x = y // 2
while x > 1:
  if y % x == 0:
    print(y,'has factor',x)
    break
  x -= 1
else:
  print(y,'is prime')
{% endhighlight %}

再看一个对比的例子，没有使用else的情况:

{% highlight python3 %}
found=False
while x and not found:
  if (matchx[0]):
    print('Ni')
    found=True
  else:
    x=x[1:]
if not found:
  print('not found')
{% endhighlight %}

使用else后的情况:

{% highlight python3 %}
while x:
  if (match(x[0])):
    print('Ni')
    break
else:
  print('not found')
{% endhighlight %}

#for循环#

for循环在Python中是一个通用的序列迭代器:可以遍历任何有序的序列对象内元素。for语句可以用于字符串、列表、元组、其他内置可迭代对象。

##一般格式##

{% highlight python3 %}
for <target> in <object>:
  <statements>
else:
  <statements>
{% endhighlight %}

此处的else的作用和while语句中的一样。另外需要注意的是，当Python运行for循环时，会逐个将序列对象中的元素赋值给目标，然后为每个元素执行循环体。


#编写循环的技巧#

- 内置**range**函数:返回一系列连续增加的整数，可作为for中的索引
- 内置**zip**函数:返回并行元素的元组的列表，可用于在for中遍历数个数列

##循环计数器:while和range##

**range**

当range函数只有一个参数时，会返回从零算起的整数列表，但其中不包括该参数的值。如果传进两个参数，那第一个参数是上边界，第二个参数是下边界。如果传进三个参数时，第三个参数表示步进值。

range提供了一种简单的方法，重复特定次数的动作:

{% highlight python3 %}
for i in range(5):
  print(i,'Pythons')
{% endhighlight %}

相应的C++代码则是:

{% highlight c++ %}
int i;
for(i = 0;i < 5;++i)
{
  std::cout<<i<<"Python";
}
{% endhighlight %}

##并行遍历:zip和map##

zip会取得一个或多个序列为参数，然后返回元组的列表，将这些序列中的并排的元素配成对。

{% highlight python3 %}
L1=[1,2,3,4]
L2=[5,6,7,8]
list(zip(L1,L2))
{% endhighlight %}

上述代码的执行结果是:[(1,5),(2,6),(3,7),(4,8)]

当参数的长度不同时，zip会以最短序列的长度为准来截断所得到的元组。

使用zip构造字典:

{% highlight python3 %}
keys=['spam','eggs','totast']
values=[1,2,5]
D = dict(zip(keys,values))
{% endhighlight %}

##产生偏移和元素:enumerate##

enumerate函数一个比较新的内置函数，它能同时返回元素值和偏移值:

{% highlight python3 %}
s='spam'
for (offset,item) in enumerate(s):
  print(item,'appears at offset',offset)
{% endhighlight %}
