---
title: Physics Research
published: 2024-10-12
description: 'A simple method to capture data from a website, generate diagrams and expose them to the public network without a defined API.'
image: ''
tags: ['OpenFrp', '内网穿透', '网络']
category: '网络'
draft: true
---

![1726914216842](1726914216842.png)

 It's a little bit embarrassing. 

---

I was making software in my physics research. The software was supposed to summarize the data from hardware and generated diagrams.

I couldn't get the data from hardware directly. The data it got will upload to a platform online. The platform will sort the data into a chart and show it to users. Specifically:

![1726912484820](1726912484820.png)

I read the documents about the website's API, bullshit.

I tried to use F12 to catch the data packages. I discovered that the website will send a request when I turn to a new page. Just like the picture below. I tried to turn to the next page for 4 times, at the same time, it sent `forward` requests for 4 times. 

![1726912514810](1726912514810.png)

According to the title of the requests:

![1726912612501](1726912612501.png)

