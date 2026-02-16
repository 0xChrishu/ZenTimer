// 番茄钟应用
class PomodoroTimer {
    constructor() {
        // 默认设置
        this.settings = {
            pomodoroTime: 25,
            shortBreakTime: 5,
            longBreakTime: 15,
            soundEnabled: true,
            notificationEnabled: true
        };

        // 当前状态
        this.currentMode = 'pomodoro'; // pomodoro, shortBreak, longBreak
        this.timeLeft = this.settings.pomodoroTime * 60;
        this.isRunning = false;
        this.pomodoroCount = 0;
        this.interval = null;

        // DOM 元素
        this.elements = {
            timerDisplay: document.getElementById('timerDisplay'),
            startPauseBtn: document.getElementById('startPauseBtn'),
            resetBtn: document.getElementById('resetBtn'),
            modeIndicator: document.getElementById('modeIndicator'),
            modeDot: document.getElementById('modeDot'),
            modeText: document.getElementById('modeText'),
            pomodoroCount: document.getElementById('pomodoroCount'),
            modeBtns: document.querySelectorAll('.mode-btn'),
            settingsBtn: document.getElementById('settingsBtn'),
            settingsPanel: document.getElementById('settingsPanel'),
            saveSettingsBtn: document.getElementById('saveSettingsBtn'),
            container: document.querySelector('.container')
        };

        this.init();
    }

    init() {
        // 加载保存的设置和计数
        this.loadFromStorage();
        this.updateDisplay();
        this.updateModeDisplay();
        this.attachEventListeners();
        this.requestNotificationPermission();
    }

    // 本地存储
    saveToStorage() {
        localStorage.setItem('pomodoroSettings', JSON.stringify(this.settings));
        localStorage.setItem('pomodoroCount', this.pomodoroCount.toString());
    }

    loadFromStorage() {
        const savedSettings = localStorage.getItem('pomodoroSettings');
        const savedCount = localStorage.getItem('pomodoroCount');

        if (savedSettings) {
            this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
        }

        if (savedCount) {
            this.pomodoroCount = parseInt(savedCount);
            this.elements.pomodoroCount.textContent = this.pomodoroCount;
        }

        // 更新设置面板的值
        document.getElementById('pomodoroTime').value = this.settings.pomodoroTime;
        document.getElementById('shortBreakTime').value = this.settings.shortBreakTime;
        document.getElementById('longBreakTime').value = this.settings.longBreakTime;
        document.getElementById('soundEnabled').checked = this.settings.soundEnabled;
        document.getElementById('notificationEnabled').checked = this.settings.notificationEnabled;
    }

    // 请求通知权限
    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    // 绑定事件
    attachEventListeners() {
        this.elements.startPauseBtn.addEventListener('click', () => this.toggleTimer());
        this.elements.resetBtn.addEventListener('click', () => this.resetTimer());

        this.elements.modeBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchMode(btn.dataset.mode));
        });

        this.elements.settingsBtn.addEventListener('click', () => this.toggleSettings());
        this.elements.saveSettingsBtn.addEventListener('click', () => this.saveSettings());

        // 点击设置面板外部关闭
        document.addEventListener('click', (e) => {
            if (!this.elements.settingsPanel.contains(e.target) &&
                e.target !== this.elements.settingsBtn) {
                this.elements.settingsPanel.classList.remove('show');
            }
        });
    }

    // 切换计时器状态
    toggleTimer() {
        if (this.isRunning) {
            this.pause();
        } else {
            this.start();
        }
    }

    // 开始
    start() {
        this.isRunning = true;
        this.elements.startPauseBtn.textContent = '暂停';
        this.elements.modeText.textContent = this.getModeRunningText();

        this.interval = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();

            if (this.timeLeft <= 0) {
                this.complete();
            }
        }, 1000);
    }

    // 暂停
    pause() {
        this.isRunning = false;
        this.elements.startPauseBtn.textContent = '继续';
        this.elements.modeText.textContent = '已暂停';
        clearInterval(this.interval);
    }

    // 重置
    resetTimer() {
        this.pause();
        this.timeLeft = this.getModeTime() * 60;
        this.elements.startPauseBtn.textContent = '开始';
        this.updateDisplay();
        this.updateModeDisplay();
    }

    // 完成
    complete() {
        this.pause();

        if (this.currentMode === 'pomodoro') {
            this.pomodoroCount++;
            this.elements.pomodoroCount.textContent = this.pomodoroCount;
            this.saveToStorage();

            // 每4个番茄后建议长休息
            if (this.pomodoroCount % 4 === 0) {
                this.showNotification('番茄完成！', '你已经完成了4个番茄，该休息一下了！');
            } else {
                this.showNotification('番茄完成！', '休息一下吧！');
            }
        } else {
            this.showNotification('休息结束！', '准备开始新的番茄吧！');
        }

        this.playSound();
        this.elements.modeText.textContent = this.getModeCompleteText();
    }

    // 切换模式
    switchMode(mode) {
        if (this.isRunning) {
            if (!confirm('计时器正在运行，确定要切换模式吗？')) {
                return;
            }
            this.pause();
        }

        this.currentMode = mode;
        this.timeLeft = this.getModeTime() * 60;
        this.elements.startPauseBtn.textContent = '开始';

        // 更新模式按钮状态
        this.elements.modeBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        // 更新容器颜色类
        this.elements.container.className = 'container mode-' + mode.toLowerCase();

        this.updateDisplay();
        this.updateModeDisplay();
    }

    // 获取当前模式的时间（分钟）
    getModeTime() {
        switch (this.currentMode) {
            case 'pomodoro':
                return this.settings.pomodoroTime;
            case 'shortBreak':
                return this.settings.shortBreakTime;
            case 'longBreak':
                return this.settings.longBreakTime;
            default:
                return 25;
        }
    }

    // 获取模式运行时的文本
    getModeRunningText() {
        switch (this.currentMode) {
            case 'pomodoro':
                return '专注中...';
            case 'shortBreak':
                return '短休息中...';
            case 'longBreak':
                return '长休息中...';
            default:
                return '运行中';
        }
    }

    // 获取模式完成时的文本
    getModeCompleteText() {
        switch (this.currentMode) {
            case 'pomodoro':
                return '番茄完成！';
            case 'shortBreak':
                return '短休息结束';
            case 'longBreak':
                return '长休息结束';
            default:
                return '完成';
        }
    }

    // 更新显示
    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        this.elements.timerDisplay.textContent = display;
        document.title = `${display} - 番茄钟`;
    }

    // 更新模式显示
    updateModeDisplay() {
        const modeNames = {
            'pomodoro': '专注模式',
            'shortBreak': '短休息',
            'longBreak': '长休息'
        };
        this.elements.modeText.textContent = modeNames[this.currentMode];
    }

    // 播放提示音
    playSound() {
        if (!this.settings.soundEnabled) return;

        // 使用 Web Audio API 生成提示音
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }

    // 显示通知
    showNotification(title, body) {
        if (!this.settings.notificationEnabled) return;

        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: body,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🍅</text></svg>'
            });
        }
    }

    // 切换设置面板
    toggleSettings() {
        this.elements.settingsPanel.classList.toggle('show');
    }

    // 保存设置
    saveSettings() {
        this.settings.pomodoroTime = parseInt(document.getElementById('pomodoroTime').value);
        this.settings.shortBreakTime = parseInt(document.getElementById('shortBreakTime').value);
        this.settings.longBreakTime = parseInt(document.getElementById('longBreakTime').value);
        this.settings.soundEnabled = document.getElementById('soundEnabled').checked;
        this.settings.notificationEnabled = document.getElementById('notificationEnabled').checked;

        this.saveToStorage();

        // 如果计时器未运行，更新当前时间
        if (!this.isRunning) {
            this.timeLeft = this.getModeTime() * 60;
            this.updateDisplay();
        }

        this.elements.settingsPanel.classList.remove('show');

        // 显示保存成功提示
        this.showNotification('设置已保存', '你的设置已成功保存！');
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new PomodoroTimer();
});
