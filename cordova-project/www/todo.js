document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const taskList = document.getElementById('taskList');
    const remainingSpan = document.getElementById('remaining');
    const taskDate = document.getElementById('taskDate');
    const taskDuration = document.getElementById('taskDuration');
    const colorOptions = document.querySelectorAll('.color-option');
    const calendarGrid = document.getElementById('calendarGrid');
    const currentMonthEl = document.getElementById('currentMonth');
    
    // 设置默认日期为今天
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    taskDate.value = formattedDate;
    
    // 颜色选择功能
    let selectedColor = 'blue';
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            // 移除所有选中状态
            colorOptions.forEach(opt => opt.classList.remove('selected'));
            // 设置当前选中状态
            option.classList.add('selected');
            selectedColor = option.dataset.color;
        });
    });
    
    // 日历功能
    let currentDate = new Date();
    
    // 从localStorage加载任务
    let tasks;
    try {
        tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    } catch (e) {
        tasks = [];
        localStorage.removeItem('tasks'); // 清除无效数据
    }
    
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        updateStats();
    }
    
    function renderTasks(filterDate = null) {
        taskList.innerHTML = '';
        
        // 过滤任务（如果提供了日期）
        const filteredTasks = filterDate ? 
            tasks.filter(task => task.date === filterDate) : tasks;
        
        filteredTasks.forEach((task, index) => {
              // 使用唯一ID标识任务
              const taskId = task.id || index; // 兼容旧数据

              const li = document.createElement('li');
              li.className = `task-item ${task.completed ? 'completed' : ''}`;
              li.dataset.color = task.color;
            
            // 格式化日期显示
            const taskDateObj = new Date(task.date);
            const formattedTaskDate = taskDateObj.toLocaleDateString('zh-CN', {
                month: 'short',
                day: 'numeric'
            });
            
            li.innerHTML = `
                <input type="checkbox" ${task.completed ? 'checked' : ''} 
                    onchange="toggleTask('${taskId}')">
                <div class="task-info">
                    <span class="task-text">${task.text}</span>
                    <div>
                        <span class="task-date">${formattedTaskDate}</span>
                        <span class="task-duration">${task.duration}分钟</span>
                    </div>
                </div>
                <span class="delete-btn" onclick="deleteTask('${taskId}')">✕</span>
            `;
            taskList.appendChild(li);
        });
    }
    
    // 渲染日历
    function renderCalendar() {
        calendarGrid.innerHTML = '';
        currentMonthEl.textContent = currentDate.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long'
        });
        
        const daysInMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
            0
        ).getDate();
        
        const firstDayOfMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            1
        ).getDay();
        
        // 添加星期标题
        const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
        weekdays.forEach(day => {
            const header = document.createElement('div');
            header.className = 'calendar-weekday';
            header.textContent = day;
            calendarGrid.appendChild(header);
        });
        
        // 添加空白天数
        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            calendarGrid.appendChild(emptyDay);
        }
        
        // 添加日期天数
        for (let day = 1; day <= daysInMonth; day++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';
            
            // 检查是否是今天
            const isToday = day === today.getDate() && 
                           currentDate.getMonth() === today.getMonth() && 
                           currentDate.getFullYear() === today.getFullYear();
            
            if (isToday) {
                dayEl.classList.add('active');
            }
            
            // 格式化日期用于比较
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            
            // 添加日期数字
            const dayNumber = document.createElement('div');
            dayNumber.className = 'calendar-day-number';
            dayNumber.textContent = day;
            dayEl.appendChild(dayNumber);
            
            // 添加任务指示器
            const dayTasks = tasks.filter(task => task.date === dateStr);
            if (dayTasks.length > 0) {
                const tasksIndicator = document.createElement('div');
                tasksIndicator.className = 'calendar-day-tasks';
                
                // 添加最多3个任务指示器
                const indicatorsToShow = Math.min(dayTasks.length, 3);
                for (let i = 0; i < indicatorsToShow; i++) {
                    const indicator = document.createElement('div');
                    indicator.className = 'calendar-task-indicator';
                    
                    // 设置指示器颜色
                    switch(dayTasks[i].color) {
                        case 'blue': indicator.style.backgroundColor = '#3b82f6'; break;
                        case 'purple': indicator.style.backgroundColor = '#8b5cf6'; break;
                        case 'pink': indicator.style.backgroundColor = '#ec4899'; break;
                        case 'green': indicator.style.backgroundColor = '#10b981'; break;
                        case 'yellow': indicator.style.backgroundColor = '#f59e0b'; break;
                        default: indicator.style.backgroundColor = '#9ca3af';
                    }
                    
                    tasksIndicator.appendChild(indicator);
                }
                
                dayEl.appendChild(tasksIndicator);
            }
            
            // 添加点击事件以筛选任务
            dayEl.addEventListener('click', () => {
                // 移除其他日期的选中状态
                document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('active'));
                dayEl.classList.add('active');
                renderTasks(dateStr);
            });
            
            calendarGrid.appendChild(dayEl);
        }
    }
    
    // 月份导航
    window.prevMonth = function() {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    }
    
    window.nextMonth = function() {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    }
    
    window.addTask = function() {
        const text = taskInput.value.trim();
        const date = taskDate.value;
        const duration = parseInt(taskDuration.value);
        
        if (text && date && duration) {
            tasks.push({
            id: Date.now().toString(), // 添加唯一ID
            text,
            completed: false,
            date,
            duration,
            color: selectedColor
        });
            taskInput.value = '';
            saveTasks();
            renderTasks();
            renderCalendar();
        }
    }
    
    window.toggleTask = function(id) {
        const taskIndex = tasks.findIndex(t => t.id === id || (!t.id && tasks.indexOf(t) == id));
        if (taskIndex !== -1) {
            tasks[taskIndex].completed = !tasks[taskIndex].completed;
            saveTasks();
            renderTasks();
            renderCalendar();
        }
    }
    
    window.deleteTask = function(id) {
        const taskIndex = tasks.findIndex(t => t.id === id || (!t.id && tasks.indexOf(t) == id));
        if (taskIndex !== -1) {
            tasks.splice(taskIndex, 1);
            saveTasks();
            renderTasks();
            renderCalendar();
        }
    }
    
    window.clearCompleted = function() {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
        renderCalendar();
    }
    
    function updateStats() {
        const remaining = tasks.filter(task => !task.completed).length;
        remainingSpan.textContent = remaining;
    }
    
    // 初始化
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });
    
    // 初始渲染
    renderTasks();
    renderCalendar();
    updateStats();
});