/**
 * 帅动画 - countdown.js
*/
(function() {
    'use strict';
    
    // 全局函数
    window.gocountdown = function(callback, duration = 3) {
        
        // 如果特效已经在运行，先移除之前的
        const existingOverlay = document.getElementById('countdown-overlay');
        if (existingOverlay) {
            document.body.removeChild(existingOverlay);
        }
        
        // 创建特效容器
        const overlay = document.createElement('div');
        overlay.id = 'countdown-overlay';
        
        // 创建并注入CSS样式
        if (!document.getElementById('countdown-styles')) {
            if (document.getElementById('countdown-styles')) {
                document.head.removeChild(document.getElementById('countdown-styles'));
            }

            const style = document.createElement('style');
            style.id = 'countdown-styles';
            style.textContent = `
                #countdown-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 999999;
                    overflow: hidden;
                }
                
                #countdown-overlay::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(255, 0, 0, 0.1);
                    z-index: 1;
                    opacity: 0;
                    animation: fadeInMask 0.5s ease forwards;
                }
                
                .countdown-red-line {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 4px;
                    background: linear-gradient(to right, rgba(255, 0, 0, 0.3), #ff0000, rgba(255, 0, 0, 0.3));
                    z-index: 2;
                    box-shadow: 0 0 20px rgba(255, 0, 0, 0.8);
                    animation: lineDown ${duration}s linear forwards;
                }
                
                .countdown-text {
                    position: absolute;
                    top: 15px;
                    left: 50%;
                    transform: translateX(-50%);
                    color: #ff0000;
                    font-size: clamp(2rem, 5vw, 3.5rem);
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: clamp(3px, 2vw, 10px);
                    z-index: 3;
                    text-shadow: 0 0 15px rgba(255, 0, 0, 0.9);
                    font-family: 'Arial Black', 'Segoe UI', sans-serif;
                    animation: textDown ${duration}s linear forwards;
                }
                
                @keyframes fadeInMask {
                    0% { opacity: 0; }
                    100% { opacity: 1; }
                }
                
                @keyframes lineDown {
                    0% { top: -4px; }
                    100% { top: 100%; }
                }
                
                @keyframes textDown {
                    0% {
                        top: -30px;
                        opacity: 0;
                    }
                    10% {
                        opacity: 1;
                    }
                    90% {
                        opacity: 1;
                    }
                    100% {
                        top: calc(100% - 60px);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        // 创建红线
        const redLine = document.createElement('div');
        redLine.className = 'countdown-red-line';
        
        // 创建文字
        const text = document.createElement('div');
        text.className = 'countdown-text';
        text.textContent = 'COUNTDOWN';
        
        // 添加到容器
        overlay.appendChild(redLine);
        overlay.appendChild(text);
        
        // 添加到页面
        document.body.appendChild(overlay);
        
        // 动画结束后执行回调
        setTimeout(() => {
            // 移除特效
            if (overlay.parentNode) {
                document.body.removeChild(overlay);
            }
            
            // 执行回调函数
            if (typeof callback === 'function') {
                callback();
            }
        }, duration * 1000);
    };
    
    // 添加停止特效的函数
    window.stopCountdown = function() {
        const overlay = document.getElementById('countdown-overlay');
        if (overlay && overlay.parentNode) {
            document.body.removeChild(overlay);
            return true;
        }
        return false;
    };
    
    // 添加重新开始特效的函数
    window.restartCountdown = function(callback, duration = 3) {
        window.stopCountdown();
        setTimeout(() => {
            window.gocountdown(callback, duration);
        }, 50);
    };
    
    console.log('倒计时红线特效已加载！使用 gocountdown(callback, duration) 调用。');
    
})();