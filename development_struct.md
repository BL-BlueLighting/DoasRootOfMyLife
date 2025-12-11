<div align="center">
  <img src="./README.logo.png" style="width: 100px; height: 100px;">
  <h1>doas -su mylife.root</h1>
  <p>- 别名 DoasRootOfMyLife -</p>
  <h2>二次开发项目结构</h2>
  <h3><a href="./development">二次开发须知</a></h3>
</div>

# 请完整阅读本文，否则您的游戏可能会出现奇奇怪怪的 bug。

## 结构

    content

    |- chapters
        |- [自定义]
            |- webtries (WebTry 页面)
               | [自定义, N 个 html].html
               |- capturer.html
               |- webtry.html
            |- chapter.html (游戏页面)
            |- commands.js (游戏主逻辑)
    |- requirements
        |- achieve.js
        |- base.js
        |- jquery.js
        |- sidebar.js
        |- webtryContact.js

    .index.html (章节选择界面)

其中，直接标了名字的必须从本仓库复制过去，并且记得定期更新，差不多一周更新一次即可，且最好选在周日下午（因为这个时候我正好在写作业）