/* 
* doas -su mylife.root Achievement Module - Js 脚本

* by BL.BlueLighting
* (C) Copyright 2025 BL.BlueLighting. All Rights Reserved.
* License: GPLv3

* Do not distribute without permission.
* Do not remove this header.
*/

var STORAGE_KEY = 'doas-root-of-mylife-key-achieves';

// 设置 STORAGE_KEY 以区分自制和官方

function setStorageKeyForGame(gameId){
    STORAGE_KEY = `doas-root-of-mylife-key-achieves-game-${gameId}`;
}

// 获取成就列表

var achieves = [];
function getAchieves() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw){
        try{
            const data = JSON.parse(raw);
            if(data.achieve) achieves = data.achieve; 
        }catch(e){ console.warn('加载状态失败:', e); }
    }
}

// 保存成就

function saveAchieve() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(achieves));
}

// 获取成就

function addAchieve(achieve_name, level) {
    var achieve = "[ " + level + " ] " + achieve_name
    echoContent("[ 成就 ] 「 " + level + " 」 " + achieve_name + " 获得。");
    achieves.push(achieve);
    saveAchieve();
}

// 查看成就

function lookAchieves() {
    echoContent("doas -su mylife.root - 成就系统 所有成就");
    for (var i = 0; i < achieves.length; i++) {
        echoContent(achieves [i]);
    }
}

// 开放接口挂载

window.AchievementAPI = {
    getAchieves,
    saveAchieve,
    addAchieve,
    lookAchieves,
    achieves
};