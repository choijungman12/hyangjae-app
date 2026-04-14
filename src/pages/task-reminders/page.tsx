import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import { useScrollY } from '@/hooks/useScrollY';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { CROPS } from '@/data/crops';

interface Task {
  id: string;
  cropId: string;
  cropName: string;
  taskType: 'planting' | 'harvesting' | 'maintenance';
  title: string;
  description: string;
  dueDate: Date;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  month: number;
}

export default function TaskReminders() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all' | 'planting' | 'harvesting' | 'maintenance'>('all');
  const [showCompleted, setShowCompleted] = useState(false);
  const scrollY = useScrollY();
  const [completedIds, setCompletedIds] = useLocalStorage<string[]>('task-completed-ids', []);

  useEffect(() => {
    generateTasks();
  }, []);

  const generateTasks = () => {
    const currentMonth = new Date().getMonth();
    const generatedTasks: Task[] = [];
    let taskId = 1;

    CROPS.forEach(crop => {
      // Generate planting tasks
      crop.planting.forEach(month => {
        const daysUntil = calculateDaysUntil(month);
        if (daysUntil >= -7 && daysUntil <= 30) {
          generatedTasks.push({
            id: `task-${taskId++}`,
            cropId: crop.id,
            cropName: crop.name,
            taskType: 'planting',
            title: `${crop.name} 정식 시기`,
            description: crop.tasks.planting,
            dueDate: getDateForMonth(month),
            priority: daysUntil <= 7 ? 'high' : daysUntil <= 14 ? 'medium' : 'low',
            completed: false,
            month
          });
        }
      });

      // Generate harvesting tasks
      crop.harvesting.forEach(month => {
        const daysUntil = calculateDaysUntil(month);
        if (daysUntil >= -7 && daysUntil <= 30) {
          generatedTasks.push({
            id: `task-${taskId++}`,
            cropId: crop.id,
            cropName: crop.name,
            taskType: 'harvesting',
            title: `${crop.name} 수확 시기`,
            description: crop.tasks.harvesting,
            dueDate: getDateForMonth(month),
            priority: daysUntil <= 7 ? 'high' : daysUntil <= 14 ? 'medium' : 'low',
            completed: false,
            month
          });
        }
      });

      // maintenance task를 항상 생성 (현재 달 기준)
      generatedTasks.push({
        id: `task-maint-${crop.id}-${currentMonth}`,
        cropId: crop.id,
        cropName: crop.name,
        taskType: 'maintenance',
        title: `${crop.name} 생육 관리`,
        description: crop.tasks.growing,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        priority: 'medium',
        completed: false,
        month: currentMonth
      });
    });

    const saved = completedIds;
    const tasksWithState = generatedTasks.map(t => ({
      ...t,
      completed: saved.includes(t.id)
    }));
    setTasks(tasksWithState.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()));
  };

  const calculateDaysUntil = (targetMonth: number): number => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    let targetDate = new Date(currentYear, targetMonth, 1);
    if (targetMonth < currentMonth) {
      targetDate = new Date(currentYear + 1, targetMonth, 1);
    }
    
    const diffTime = targetDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getDateForMonth = (month: number): Date => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    if (month < currentMonth) {
      return new Date(currentYear + 1, month, 1);
    }
    return new Date(currentYear, month, 1);
  };

  const getDaysUntil = (date: Date): number => {
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const toggleTaskComplete = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
    setCompletedIds(prev =>
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const filteredTasks = tasks.filter(task => {
    if (!showCompleted && task.completed) return false;
    if (filter === 'all') return true;
    return task.taskType === filter;
  });

  const upcomingTasks = filteredTasks.filter(task => !task.completed && getDaysUntil(task.dueDate) <= 7);
  const laterTasks = filteredTasks.filter(task => !task.completed && getDaysUntil(task.dueDate) > 7);
  const completedTasks = filteredTasks.filter(task => task.completed);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'from-red-400 to-orange-500';
      case 'medium': return 'from-yellow-400 to-orange-400';
      case 'low': return 'from-blue-400 to-cyan-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'planting': return 'ri-seedling-line';
      case 'harvesting': return 'ri-scissors-line';
      case 'maintenance': return 'ri-tools-line';
      default: return 'ri-checkbox-circle-line';
    }
  };

  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case 'planting': return 'from-green-400 to-emerald-500';
      case 'harvesting': return 'from-orange-400 to-red-500';
      case 'maintenance': return 'from-purple-400 to-pink-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-20 overflow-hidden">
      {/* Floating Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-20 right-10 w-64 h-64 bg-blue-300/30 rounded-full blur-3xl"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        ></div>
        <div 
          className="absolute bottom-40 left-10 w-80 h-80 bg-purple-300/30 rounded-full blur-3xl"
          style={{ transform: `translateY(${-scrollY * 0.2}px)` }}
        ></div>
      </div>

      {/* Header */}
      <header className="bg-white/70 backdrop-blur-xl shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="px-4 py-4 flex items-center gap-3">
          <Link to="/" className="w-10 h-10 flex items-center justify-center hover:bg-blue-50 rounded-xl transition-all duration-300 transform hover:scale-110">
            <i className="ri-arrow-left-line text-xl text-gray-700"></i>
          </Link>
          <h1 className="text-base font-black text-gray-900 flex-1">작업 알림</h1>
          <button 
            onClick={generateTasks}
            className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300"
          >
            <i className="ri-refresh-line text-xl text-white"></i>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 pt-6 pb-6 relative z-10">
        <div className="relative bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-black mb-2 drop-shadow-lg">작업 알림 시스템</h2>
                <p className="text-sm text-white/90 font-medium">중요한 농사 일정을 놓치지 마세요</p>
              </div>
              <div className="w-16 h-16 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30">
                <i className="ri-notification-3-line text-3xl text-white"></i>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center border border-white/20">
                <p className="text-2xl font-black mb-1">{upcomingTasks.length}</p>
                <p className="text-xs font-bold">긴급</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center border border-white/20">
                <p className="text-2xl font-black mb-1">{laterTasks.length}</p>
                <p className="text-xs font-bold">예정</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center border border-white/20">
                <p className="text-2xl font-black mb-1">{completedTasks.length}</p>
                <p className="text-xs font-bold">완료</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="px-4 pb-6 relative z-10">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-2 shadow-lg border border-gray-100">
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'all', label: '전체', icon: 'ri-list-check' },
              { id: 'planting', label: '정식', icon: 'ri-seedling-line' },
              { id: 'harvesting', label: '수확', icon: 'ri-scissors-line' },
              { id: 'maintenance', label: '관리', icon: 'ri-tools-line' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`py-3 px-2 rounded-xl font-bold text-xs transition-all duration-300 transform hover:scale-105 ${
                  filter === tab.id
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <i className={`${tab.icon} text-base block mb-1`}></i>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-xl rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300"
          >
            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
              showCompleted ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
            }`}>
              {showCompleted && <i className="ri-check-line text-white text-xs"></i>}
            </div>
            <span className="text-xs font-bold text-gray-700">완료된 작업 표시</span>
          </button>
        </div>
      </section>

      {/* Upcoming Tasks (Within 7 days) */}
      {upcomingTasks.length > 0 && (
        <section className="px-4 pb-6 relative z-10">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl shadow-xl animate-pulse">
                <i className="ri-alarm-warning-line text-xl text-white"></i>
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900">긴급 작업</h3>
                <p className="text-xs text-gray-500 font-medium">7일 이내 완료 필요</p>
              </div>
            </div>

            <div className="space-y-3">
              {upcomingTasks.map((task) => {
                const daysUntil = getDaysUntil(task.dueDate);
                const crop = CROPS.find(c => c.id === task.cropId);
                
                return (
                  <div 
                    key={task.id}
                    className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-4 border-2 border-red-200 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleTaskComplete(task.id)}
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          task.completed 
                            ? 'bg-green-500 border-green-500' 
                            : 'border-gray-300 hover:border-blue-400'
                        }`}
                      >
                        {task.completed && <i className="ri-check-line text-white text-sm"></i>}
                      </button>

                      <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg flex-shrink-0 bg-white">
                        <img 
                          src={crop?.image}
                          alt={task.cropName}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="text-sm font-black text-gray-900 mb-1">{task.title}</h4>
                            <p className="text-xs text-gray-600 font-medium">{task.description}</p>
                          </div>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <i className="ri-delete-bin-line text-red-500"></i>
                          </button>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r ${getTaskTypeColor(task.taskType)} text-white rounded-full text-xs font-bold shadow-sm`}>
                            <i className={getTaskTypeIcon(task.taskType)}></i>
                            {task.taskType === 'planting' ? '정식' : task.taskType === 'harvesting' ? '수확' : '관리'}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r ${getPriorityColor(task.priority)} text-white rounded-full text-xs font-bold shadow-sm`}>
                            <i className="ri-time-line"></i>
                            {daysUntil === 0 ? '오늘' : daysUntil === 1 ? '내일' : `${daysUntil}일 후`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Later Tasks */}
      {laterTasks.length > 0 && (
        <section className="px-4 pb-6 relative z-10">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl">
                <i className="ri-calendar-line text-xl text-white"></i>
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900">예정된 작업</h3>
                <p className="text-xs text-gray-500 font-medium">7일 이후 작업</p>
              </div>
            </div>

            <div className="space-y-3">
              {laterTasks.map((task) => {
                const daysUntil = getDaysUntil(task.dueDate);
                const crop = CROPS.find(c => c.id === task.cropId);
                
                return (
                  <div 
                    key={task.id}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleTaskComplete(task.id)}
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          task.completed 
                            ? 'bg-green-500 border-green-500' 
                            : 'border-gray-300 hover:border-blue-400'
                        }`}
                      >
                        {task.completed && <i className="ri-check-line text-white text-sm"></i>}
                      </button>

                      <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg flex-shrink-0 bg-white">
                        <img 
                          src={crop?.image}
                          alt={task.cropName}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="text-sm font-black text-gray-900 mb-1">{task.title}</h4>
                            <p className="text-xs text-gray-600 font-medium">{task.description}</p>
                          </div>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <i className="ri-delete-bin-line text-red-500"></i>
                          </button>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r ${getTaskTypeColor(task.taskType)} text-white rounded-full text-xs font-bold shadow-sm`}>
                            <i className={getTaskTypeIcon(task.taskType)}></i>
                            {task.taskType === 'planting' ? '정식' : task.taskType === 'harvesting' ? '수확' : '관리'}
                          </span>
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                            <i className="ri-calendar-line"></i>
                            {daysUntil}일 후
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Completed Tasks */}
      {showCompleted && completedTasks.length > 0 && (
        <section className="px-4 pb-6 relative z-10">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl">
                <i className="ri-checkbox-circle-line text-xl text-white"></i>
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900">완료된 작업</h3>
                <p className="text-xs text-gray-500 font-medium">수고하셨습니다!</p>
              </div>
            </div>

            <div className="space-y-3">
              {completedTasks.map((task) => {
                const crop = CROPS.find(c => c.id === task.cropId);
                
                return (
                  <div 
                    key={task.id}
                    className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-200 opacity-60"
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleTaskComplete(task.id)}
                        className="w-6 h-6 rounded-lg bg-green-500 border-2 border-green-500 flex items-center justify-center flex-shrink-0"
                      >
                        <i className="ri-check-line text-white text-sm"></i>
                      </button>

                      <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg flex-shrink-0 bg-white">
                        <img 
                          src={crop?.image}
                          alt={task.cropName}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="text-sm font-black text-gray-900 mb-1 line-through">{task.title}</h4>
                            <p className="text-xs text-gray-600 font-medium">{task.description}</p>
                          </div>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <i className="ri-delete-bin-line text-red-500"></i>
                          </button>
                        </div>

                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                          <i className="ri-checkbox-circle-line"></i>
                          완료됨
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Empty State */}
      {filteredTasks.length === 0 && (
        <section className="px-4 pb-6 relative z-10">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-12 border border-gray-100 text-center">
            <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl">
              <i className="ri-task-line text-5xl text-gray-400"></i>
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-2">작업이 없습니다</h3>
            <p className="text-sm text-gray-500 font-medium">필터를 변경하거나 새로고침 해보세요</p>
          </div>
        </section>
      )}

      {/* Tips */}
      <section className="px-4 pb-6 relative z-10">
        <div className="relative bg-gradient-to-br from-yellow-100 via-yellow-50 to-orange-100 rounded-3xl p-6 border-2 border-yellow-200 overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-300/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-300/30 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex gap-4">
            <div className="w-14 h-14 flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl shadow-lg">
              <i className="ri-lightbulb-flash-line text-2xl text-white"></i>
            </div>
            <div>
              <h4 className="text-sm font-black text-yellow-900 mb-2 flex items-center gap-2">
                <i className="ri-information-line"></i>
                작업 알림 활용 팁
              </h4>
              <p className="text-xs text-yellow-800 leading-relaxed font-medium">
                매일 아침 작업 목록을 확인하고, 우선순위가 높은 작업부터 처리하세요. 완료된 작업은 체크하여 진행 상황을 추적할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      <BottomNav />
    </div>
  );
}
