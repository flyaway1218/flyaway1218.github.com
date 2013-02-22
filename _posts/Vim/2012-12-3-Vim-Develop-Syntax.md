---
layout: post
title: Vim自定义语法高亮
time: 2012-12-3
category: Vim
---

#基本的语法命令#
在定义一种新的语法规则之前，首先要做的就是清楚已经定义的旧规则:
{% highlight vim %}
:syntax clear
{% endhighlight %}
这对于最终的语法文件来说并不是必须的，但在实验这些功能时还是十分有用的。

## 列出已定义的语法项 ##
查看当前已经定义的语法项：
{% highlight vim %}
:syntax
{% endhighlight %}

## 大小些敏感 ##
下面的命令决定了语法规则的匹配是否是大小写敏感的:
{% highlight vim %}
:syntax case mathch 
:syntax case ignore
{% endhighlight %}
`match`表示大小写敏感,`ignore`表示不敏感

`:syntax case`命令可以出现在一个语法文件的任意位置并影响该位置以后的语法定义。


# 关键字 #
下面的命令定义一个关键字:
{% highlight vim %}
:syntax keyword {group} {keyword} ...
{% endhighlight %}
`{group}`是语法组的名字。使用`:highlight`命令你可以将一组颜色方案应用到该`{group}`上。`{keyword}`参数指定了实际的关键字，下面是一个例子:
{% highlight vim %}
:syntax keyword xType int long char
:syntax keyword xStatement if then else endif
{% endhighlight %}
根据约定，每个组名都前缀以该语言的filetype,本例中定义了x语言，所以前缀是x。为了方便其他人比较好的理解，在实际编写语法文件的时候，最好还是遵守这个约定。


现在可以把定义好的x组名于标准的Vim组名联系起来。
{% highlight vim %}
:highlight link xType Type
:highlight link xStatement Statement
{% endhighlight %}

##生僻的关键字##
定义的关键字必须是`iskeyword`选项的定义。如果你用到了额外的字符，该关键字将不会被匹配到。

> `iskeyword`是vim中一个选项，vim会把这个选项中的字符做为单词的组成字符。也就是说，一个单词由`iskeyword`选项中定义的字符构成，它前面、后面的字符不在`iskeyword`选项定义的字符中。简单的说，`iskeyword`是用来确定单词的分界的。可以通过`:help iskeyword`来进行查看，vim的默认值是"a-z,A-Z,48-57,_,.,-,>"，其中的48-57表示的是ASCII码中的数字0-9。

若x语言要再关键字中使用`-`字符，可以这样做：
{% highlight vim %}
:setlocal iskeyword+=-
:syntax keyword xStatement when-not
{% endhighlight %}
**注意**:关键字只适用于一个完整的词,所以像nextone这样的是不会被匹配到的。

# 匹配 #
如果要定义一个复杂的语法项，比如匹配一个标示符，那就需要用到match语法：
{% highlight vim %}
:syntax match xIdenifier /\<\l\+>/
{% endhighlight %}
**注意:关键字会凌驾于任何其他语法项定义，所以`if`,`then`将被认为是关键字，而不是标示符。**

上面的命令中的最后一部分是一个模式，`//`用于界定一个模式，也可以用`/`之外的字符，如`+`或`"`号。

# 区域 #
如果在x语言中，字符串定义为由两个双引号包围起来的字符序列。要高亮一个字符串需要定义一个区域。该区域以双引号结尾。定义如下：
{% highlight vim %}
:syntax region xString start=/"/ end=/"/
{% endhighlight %}
`start`和`end`分别定义了该区域的开始和结尾。

如果需要Vim跳过以\"形式表达的脱字符，这要在命令中用到`skip`关键字:
{% highlight vim %}
:syntax region xString start=/"/ skip=/\\"/ end=/"/
{% endhighlight %}
两个`\\`匹配到一个真正的反斜杠`\`字符，因为反斜杠`\`在模式中是一个特殊字符。

## `region`和`match`的区别##

- `match`:是一个完整的模式，一次匹配一整个字符序列。
- `region`:是一个区域以`start`指定的模式为开始，以`end`指定的模式为结束。区域中的`end`模式可能被匹配到也可能不被匹配。

#嵌套#
{% highlight vim %}
%Get input TODO: Skip white space
{% endhighlight %}
现在假设要让`TODO`以黄色来高亮显示，尽管它已经在一个定义为蓝色高亮的注释中。要让Vim识别这种情况，可以定义下面的语法组:
{% highlight vim %}
:syntax keyword xTodo contained
:syntax match xComment /%.*/ contains=xTodo
{% endhighlight %}

- `contained`参数告诉Vim该关键字只能存在于另一个语法项中。
- `contains=xTodo`则说明允许一个组名xTodo的语法元素嵌套在其中。

##递归嵌套##
x语言定义了以花括号`{}`括起来的部分分为一个代码块。当然一个代码可以包含另一个代码块。这样需要下面的定义：
{% highlight vim %}
:syntax region xBlock start-/{/ end=/}/ contains=xBlock
{% endhighlight %}

##保留行尾##
为了避免一个被包含语法项吃掉行尾，要在命令中加一个额外的`keepend`参数。这个参数可以使Vim正确处理需要匹配到行尾两次的语法项。
{% highlight vim %}
:syntax region xComment start=/%/ end=/$/ contained
:syntax region xPreProc start=/#/ end=/$/ contains=xComment keepend
{% endhighlight %}

#后续组#
如果有如下的语句:
{% highlight c %}
if (condition) then
{% endhighlight %}
但是你希望这三个部分用不同的规则来高亮，你可以这样做:
{% highlight vim %}
:syntax match xif /if/ nextgroup=xIfCondition skipwhite
:syntax match xIfCondition /([^)]*)/ contained nextgroup=xThen skipwhite
:syntax match xThen /then/ contained
{% endhighlight %}
`nextgroup`参数指定哪些组可以跟在该组后面，这个参数并不是必须的。如果由它指定的任何一个组都不符合匹配，Vim什么也不做。
- `skipwhite`参数告诉vim空白字符(空格和跳格键)可以出现在语法项之间。
- `skipnl`允许语法项之间出现断行。
- `skipempty`允许出现空行

需要注意的是:`skipnl`并不会跳过任何空行，它要求断行之后必须有东西被匹配到才行。

#其他参数#

##匹配一个区域##
`matchgroup`参数可以以另外一种高亮组来处理区域的首尾部分。
{% highlight vim %}
:syntax region xInside matchgroup=xParen start=/(/ end=/)/
{% endhighlight %}
上面代码告诉vim，上述区域的首尾都是用xParen组来高亮，而且中间其他部分用xInside来高亮。

##偏移##
如果想要定义一个区域匹配"if"之后的"()"之间的内容。但是却不包含"if"和"("、")"本身，这可以通过匹配模式中的偏移来实现。例如:
{% highlight vim %}
:syntax region xCond start=/if\s*(/ms=e+1 end=/)/me=s-1
{% endhighlight %}
起始模式的偏移是"ms=e+1","ms"代表"Match Start"。它定义了一个自目标字符串起始位置的偏移。通常匹配的起始位置就是模式目标的起始位置。"e+1"则告诉vim匹配的起始位置始自模式目标的结束处再向前偏移一个字符。结束模式的偏移是"me=s-1","me"是指"Match End","s-1"意为模式目标的起始处的上一个字符。

##单行##
"online"参数告诉vim要匹配的区域不能跨越多行。

##后续行##
如果需要定义一个预处理语法。预处理行第一列的#开始，直到该行结束。同时可以以\结束的行又指示到下一行将延续未竟的预处理定义。要应付这种情况就需要在语法项中包含一个指向后续行的模式。
{% highlight vim %}
:syntax region xPreProc start=/^#/ end=/$/ contains=xLineContinue
:syntax match xLineContinue "\\$" contained
{% endhighlight %}

#聚簇#
如果一些语句中包含了一些共同的语法元素:数字和标示符，我们可以这样定义:
{% highlight vim %}
:syntax match xFor /^for.*/ contains=xNumber,xIdent
:syntax match xIf /^if.*/ contains=xNumber,xIdent
:syntax match xWhile /^while.*/ contains=xNumber,xIdent
{% endhighlight %}
但是每一个语法项都要重复"contains"的内容，比较麻烦，而且修改起来更加麻烦。vim提供了一个叫做语法簇的工具，来避免上述的问题:
{% highlight vim %}
:syntax cluster xState contains=xNumber,xIndent
{% endhighlight %}
簇被用在其他以syntax语法定义语句中。就像语法组一样，它们的名字以@开始。你可以这样简化上述的例子:
{% highlight vim %}
:syntax match xFor /^for.*/ contains=@xState
:syntax match xIf /^if.*/ contains=@xState
:syntax match xWhile /^while.*/ contains=#xState
{% endhighlight %}

#包含另一个语法文件#
在很多情况，我们可能需要引用另外一个语法文件，例如C++的语法就是C语法的一个超集，在这种情况下，vim提供了在一个语法中读取另一个语法文件的功能:
{% highlight vim %}
:runtime! syntax/c.vim
{% endhighlight %}
`:runtime!`会在由"runtimepath"指定的目录中寻找"syntax/c.vim"文件。

#同步#
vim对文本进行语法高亮，需要能够"断章取义"，程序写到哪里，它就要跟到哪里，并且能正确的进行语法高亮。vim提供了`:syntax sync`命令，它告诉vim如何确定当前的境况。比如，下面的命令告诉Vim回溯查找c风格的注释，并从注释的起始处开始对该语法进行着色:
{% highlight vim %}
:syntax sync ccomment
{% endhighlight %}
此外，还有可以以一些参数调整该命令的处理细节。`minlines`参数告诉Vim最少要往回查找多少行，`maxlines`告诉编辑器最多检查多少行。
{% highlight vim %}
:syntax sync ccomment minlines=10 maxlines=500
{% endhighlight %}

#安装一个语法文件#
当你有一个新的语法文件的时候，把它放在`runtimepath`指定的路径下名为"syntax"的目录。语法文件的名字必需与文件类型名一致，以".vim"为扩展名。

#可移植语法文件的布局要求#
文件开头的样板注释:
{% highlight vim %}
"Vim syntax file
"Language: C
"Maintainer: Bram Moolenaar<Bram@vim.org>
"Last Change: 2001 Jun 18
"Remark: Included by the C++ syntax
{% endhighlight %}
