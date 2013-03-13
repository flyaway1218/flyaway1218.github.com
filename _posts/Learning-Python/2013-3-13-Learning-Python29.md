---
layout: post
title: 《Learning Python》学习笔记——29.异常基础
time: 2013-3-13
category: Python
---

#捕获异常#

{% highlight python3 %}
def fetcher(obj,index):
  return obj[index]

x = 'spam'
try:
  fetcher(x,4)
except IndexError:
  print('got exception')
print('continuing')  
{% endhighlight %}


#引发异常#

{% highlight python3 %}
try:
  raise IndexError
except IndexError:
  print('got exception')
{% endhighlight %}
如果没有捕获到异常，用户定义的异常就会向上传递，直到顶层默认的异常处理器，并通过标准出错消息终止该程序。

#用户定义的异常#
用户定义的异常能够通过类编写，它继承自一个内置的异常类:通常这个类名称为Exception。
{% highlight python3 %}
class bad(Exception):
  pass

def doomed():
  raise Bad()

try:
  doomed()
except bad:
  print('got Bad')
{% endhighlight %}

#终止行为#
可以在finally中定义一些一定会在执行时收尾的行为，无论try中代码是否发生异常。
