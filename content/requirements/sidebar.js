/* 
* doas -su mylife.root SideBar module - Js 脚本

* by BL.BlueLighting
* (C) Copyright 2025 BL.BlueLighting. All Rights Reserved.
* License: GPLv3

* Do not distribute without permission.
* Do not remove this header.
*/

window.com_status_ip = "127.0.0.1";
window.com_status_ports = "22";
window.com_status_mem = "739MiB";
window.com_status_norun = "/bin/humansh";
window.com_status_cucontent = "";
panel = document.getElementById("sidePanel");

// ============ 全局函数 ============
function showPanel() {
    const visible = panel.style.display === "flex";
    panel.style.display = visible ? "none" : "flex";
};

function updateStatus(ip, ports, mem, norun, cucontent) {
    if (ip) com_status_ip = ip;
    if (ports) com_status_ports = ports;
    if (mem) com_status_mem = mem;
    if (norun) com_status_norun = norun;
    if (cucontent) com_status_cucontent = cucontent;

    const html = `
    IP: ${com_status_ip}
    Ports: ${com_status_ports}
    Mem: ${com_status_mem}
    Now Running: ${com_status_norun}
    ${com_status_cucontent ? "\n" + com_status_cucontent : ""}
    `.trim();

    document.getElementById("statusContent").innerHTML = `<pre>${html}</pre>`;
};

function updateHelp(content) {
    document.getElementById("helpContent").innerHTML = `<pre>${content || "暂无帮助信息。"}</pre>`;
};