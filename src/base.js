/* 
* doas -su mylife.root Base Framework

* by BL.BlueLighting
* (C) Copyright 2025 BL.BlueLighting. All Rights Reserved.
* License: GPLv3

* Do not distribute without permission.
* Do not remove this header.

  2025 / 10 / 04 
  Version 1.0.0
    Initial version
    2025 / 10 / 04 13:40
  Version 1.0.1
    Fix: 修复了部分浏览器下进度条不显示的问题
    2025 / 10 / 04 14:43
*/

console.log("doas -su mylife.root");
console.log("    Base Framework Loaded.");
console.log("        by BL.BlueLighting 2025");


const output = document.getElementById('output');
const cmdline = document.getElementById('cmdline');

var STORAGE_KEY = 'doas-root-of-mylife-key';

// 设置 STORAGE_KEY 以区分章节
// STORAGE_KEY = 'doas-root-of-mylife-chapter1-key'; // 序章

function setStorageKeyForChapter(chapterId){
    STORAGE_KEY = `doas-root-of-mylife-chapter${chapterId}-key`;
}

// 命令表与上下文
const commands = new Map();
const history = [];
let historyIndex = null;
const context = { __vars: {} };
let storyWhere = 0;
let nextStory = false;
let accessGiven = false;
let asking = false;
let askCallback = null;

// 从 LocalStorage 恢复
function loadState(){
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw){
        try{
            const data = JSON.parse(raw);
            if(data.history) history.push(...data.history);
            if(data.variables) Object.assign(context.__vars, data.variables);
            if(typeof data.storyWhere === 'number') storyWhere = data.storyWhere;
            if(typeof data.nextStory === 'boolean') nextStory = data.nextStory;
            if(typeof data.accessGiven === 'boolean') accessGiven = data.accessGiven;
        }catch(e){ console.warn('加载状态失败:', e); }
    }
}

// 保存状态
function saveState(){
    const data = {
        history: history.slice(),
        variables: Object.assign({}, context.__vars),
        storyWhere,
        nextStory,
        accessGiven
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// 解析 echoContent 富文本语法
function parseEchoContent(content){
    let html = String(content);

    // 颜色解析
    html = html.replace(/\[color:\s*([^\]]+)\](.*?)\[\/endcolor\]/gis, (m, color, text)=>{
        return `<span style="color:${color}">${text}</span>`;
    });

    // runCommand 提示解析
    html = html.replace(/\[runCommand\s+command=([^\]]+)\]\((.*?)\)\[\/endrunning\]/gis, (m, cmd, args)=>{
        return `Try: <span style="color:blue">${cmd}</span> <span style="color:gray">(${args})</span>`;
    });

    // 假进度条解析
    html = html.replace(/\[progress(?:\s+max=(\d+))?(?:\s+timeAdd=([\d.]+))?\]\[\/progress\]/gis, (m, max, timeAdd)=>{
        const maxVal = parseFloat(max) || 100;
        const add = parseFloat(timeAdd) || 1.5;
        const id = 'progress-' + Math.random().toString(36).slice(2);
        setTimeout(()=>{
        let val = 0;
        const el = document.getElementById(id);
        const timer = setInterval(()=>{
            val += add;
            if(val >= maxVal){ val = maxVal; clearInterval(timer); }
            el.style.width = (val / maxVal * 100) + '%';
            el.textContent = Math.floor(val) + '%';
        }, 100);
        }, 0);
        return `<div style="background:#333;width:100%;height:20px;border-radius:4px;overflow:hidden;">
                <div id="${id}" style="background:#4caf50;width:0%;height:100%;color:#fff;text-align:center;font-size:12px;"></div>
                </div>`;
    });

    return html;
}

/**
 * 输出内容到终端，逐行显示
 * @param {string} content - 输出文本，可带换行
 * @param {boolean} [noSleep=false] - 是否跳过逐行延迟
 * @param {number} [delay=90] - 每行延迟毫秒
 */
function echoContent(content, noSleep = false, delay = 90){
    const lines = String(content).split('\n');
    let index = 0;

    cmdline.disabled = true;

    function outputNextLine() {
        if(index >= lines.length){
            cmdline.disabled = false;
            cmdline.focus();
            return;
        }
        const el = document.createElement('div');
        el.innerHTML = parseEchoContent(lines[index]);
        output.appendChild(el);
        output.scrollTop = output.scrollHeight;
        index++;

        if(noSleep){
            // 立即输出剩余行
            outputNextLine();
        } else {
            // 使用 requestAnimationFrame + setTimeout 保证浏览器渲染
            setTimeout(() => requestAnimationFrame(outputNextLine), delay);
        }
    }

    outputNextLine();
}

// 保存当前历史和变量到 JSON 文件
function saveContent(){
    const data = {
        savedAt: new Date().toISOString(),
        history: history.slice(),
        variables: Object.assign({}, context.__vars),
        storyWhere,
        nextStory
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `terminal-save-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

// 注册命令接口
function newCommand(name, paramDefs, handler){
    if(typeof name !== 'string') throw new Error('命令名必须为字符串');
    if(!Array.isArray(paramDefs)) paramDefs = [];
    if(typeof handler !== 'function') throw new Error('命令处理函数必须为函数');
    commands.set(name, { paramDefs: paramDefs.slice(), handler });
}

// 命令解析工具
function tokenize(str){
    const tokens = [];
    let cur = '';
    let inQuote = false;
    let quoteChar = '';
    for(const ch of str){
        if(inQuote){
        if(ch === quoteChar){
            inQuote = false;
            quoteChar = '';
            tokens.push(cur);
            cur = '';
        } else cur += ch;
        } else {
        if(ch === '"' || ch === "'"){
            inQuote = true;
            quoteChar = ch;
        } else if(/\s/.test(ch)){
            if(cur!==''){ tokens.push(cur); cur=''; }
        } else cur += ch;
        }
    }
    if(cur!=='') tokens.push(cur);
    return tokens;
}

// 执行命令行
async function executeLine(rawLine){
    if (asking) {
        callAsk(rawLine);
        asking = false;
        return;
    }

    if(!rawLine.trim()) return;
    echoContent(`$ ${rawLine}`);
    history.push(rawLine);
    historyIndex = null;

    const tokens = tokenize(rawLine);
    const cmd = tokens.shift();
    const entry = commands.get(cmd);
    if(!entry){
        echoContent(`未找到命令: ${cmd}`);
        saveState();
        return;
    }

    try{
        const api = {
            args: tokens.slice(),
            context: context.__vars,
            echo: echoContent,
            save: saveContent,
            setVar(k,v){ context.__vars[k] = v; },
            getVar(k){ return context.__vars[k]; },
            storyWhere,
            nextStory,
            setStoryWhere(v){ storyWhere = v; },
            setNextStory(v){ nextStory = v; }
        };
        const result = await entry.handler(api);
        if(typeof result === 'string' && result.startsWith('nextSTEP')){
            nextStory = true;
            storyWhere++;
        }
    } catch(err){
        echoContent(`命令执行出错: ${err.message || err}`);
        console.error(err);
    }
    saveState();
}

// 输入框事件
cmdline.addEventListener('keydown', async (e)=>{
    if(e.key === 'Enter'){
        const line = cmdline.value;
        cmdline.value = '';
        await executeLine(line);
    } else if(e.key === 'ArrowUp'){
        if(history.length === 0) return;
        if(historyIndex === null) historyIndex = history.length - 1;
        else historyIndex = Math.max(0, historyIndex - 1);
        cmdline.value = history[historyIndex];
        e.preventDefault();
    } else if(e.key === 'ArrowDown'){
        if(history.length === 0) return;
        if(historyIndex === null) return;
        historyIndex = Math.min(history.length - 1, historyIndex + 1);
        cmdline.value = history[historyIndex] || '';
        if(historyIndex === history.length - 1) historyIndex = null;
        e.preventDefault();
    }
});

// reset 函数
function reset(){
    localStorage.clear();
    location.reload();
}

// 添加 ask 函数
function ask(prompt, callback) {
    if (typeof prompt !== 'string') {
        throw new Error('提示文本必须是字符串');
    }
    if (typeof callback !== 'function') {
        throw new Error('回调函数必须是函数');
    }
    
    asking = true;
    askCallback = callback;
    echoContent(prompt);
}

function callAsk(response) {
    if (askCallback) {
        askCallback(response);
        askCallback = null;
    }
}

// 向外暴露接口
window.FrameworkAPI = {
    output,
    cmdline,
    STORAGE_KEY,
    commands,
    history,
    historyIndex,
    context,
    storyWhere,
    nextStory,
    loadState,
    saveState,
    parseEchoContent,
    echoContent,
    saveContent,
    newCommand,
    tokenize,
    executeLine,
    reset
};