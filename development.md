# 二次开发须知 Development Information

## newCommand 函数
`newCommand()` 函数为创建一个命令行函数的命令，参数如下：

    commandName: 命令名称
    params: 参数列表，["名称:类型"]
    handler: 函数

示例：`newCommand("test", ["test:string"], function(api) {echoContent(api.args [0])})`

## echoContent 函数
`echoContent` 函数为输出内容的函数，参数如下：

    content: 输出内容：
        raw:
            [color:(颜色昵称)/(Hex 色号)](内容)[/endcolor]
            [progress max=(最大进度) timeAdd(每秒增加的值)][/progress]
            [runCommand command=(函数名)](参数)[/endrunning]

## 其他的请参考 base.js 中的注释，若有不清楚的请提 Issue，后续我会补齐。