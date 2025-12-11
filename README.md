<div align="center">
  <img src="./README.logo.png" style="width: 100px; height: 100px;">
  <h1>doas -su mylife.root</h1>
  <p>- 别名 DoasRootOfMyLife -</p>
</div>


# 目前进度
- 序章：开发完成，剧情就是普通拯救自己；
- 第一章：开发完成，剧情为老友重回，学会 sql injects (菜鸟级的那种)
- 第二章：正在开发，剧情为拯救 manAI，~~暑假愉快结束（假~~

# 架构介绍
    - base.js: 基本框架，提供了游戏进行的必要函数；
    - commands.js：游戏主要内容，基于 base.js 开发；
    - chapter.html: 游戏承载页面，引入 base.js commands.js 并提供基本 UI；
      (另外一提 chapters/second 里的 chapter.html 引入了 base64 和 jQuery)
  
# 灵感来源
看 知乎 有个问答 “假如你获得了大脑的 Root 权限你会干什么” 下面 ForkKILLET 回答有感。

Chapter 1 中的 SudoerOfMyself 在 Github 也有仓库，链接 <a href="https://github.com/ForkKILLET/SudoerOfMyself/">ForkKILLET/SudoerOfMyself</a> ~~也算是一种致敬了~~

# 多语言计划
没有。这东西大量依靠中文，我没办法做多语言。

谁如果很闲想加语言，可以 Fork 下来创建仓库，改名为 DoasRootOfMyLife-XX (语言两字码)

然后在**本仓库**提 Issue，@我让我添加到下面这个列表，或者你自己加，提 PR 并 @ 我。

| 语言作者 / Author      | 仓库链接 / Repo links| 语言 / Language |
| ----------- | ----------- | ----------- |
| BL.BlueLighting      | <a href="https://github.com/BL-BlueLighting/DoasRootOfMyLife">本仓库</a>       | 中文 / Chinese / CN |

# 如何创建自己的改版？
很简单，查看 <a href="https://bl-bluelighting.github.io/DoasRootOfMyLife/development">二次开发须知</a>
后自己写一份 commands.js 替换原版的就可以了。

然后在**本仓库**提 Issue，@我让我添加到下面这个列表，或者你自己加，提 PR 并 @ 我。

| 改版作者 / Author      | 仓库链接 / Repo links | 改版昵称 / Name of version |
| ----------- | ----------- | ----------- |
| BL.BlueLighting      | <a href="https://github.com/BL-BlueLighting/DoasRootOfMyLife">本仓库</a>       | doas -u mylife.root 原版 |
