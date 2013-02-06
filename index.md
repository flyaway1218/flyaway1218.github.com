---
layout: page
title: Flyaway's Wiki
special-title: 目录
description: "Flyaway的Wiki"
---

{% include JB/setup  %}

{% for category in site.categories  %}
<h1> {{ category[0] | join:"/"  }}  </h1>
<ul>
{% assign pages_list = category[1] %}
{% include JB/pages_list %}
</ul>
{% endfor  %}

