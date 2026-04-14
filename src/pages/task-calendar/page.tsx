import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import { useScrollY } from '@/hooks/useScrollY';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { CROPS, CROP_VISUAL } from '@/data/crops';

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
  month?: number;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  tasks: Task[];
}

export default function TaskCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const scrollY = useScrollY();
  const [completedIds, setCompletedIds] = useLocalStorage<string[]>('task-completed-ids', []);

  useEffect(() => {
    generateTasks();
  }, []);

  const generateTasks = () => {
    const generatedTasks: Task[] = [];
    let taskId = 1;
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    CROPS.forEach(crop => {
      // Generate planting tasks
      crop.planting.forEach(month => {
        let taskDate = new Date(currentYear, month, 1);
        if (taskDate < today) {
          taskDate = new Date(currentYear + 1, month, 1);
        }

        generatedTasks.push({
          id: `task-${taskId++}`,
          cropId: crop.id,
          cropName: crop.name,
          taskType: 'planting',
          title: `${crop.name} 정식`,
          description: crop.tasks.planting,
          dueDate: taskDate,
          priority: 'high',
          completed: false
        });
      });

      // Generate harvesting tasks
      crop.harvesting.forEach(month => {
        let taskDate = new Date(currentYear, month, 1);
        if (taskDate < today) {
          taskDate = new Date(currentYear + 1, month, 1);
        }

        generatedTasks.push({
          id: `task-${taskId++}`,
          cropId: crop.id,
          cropName: crop.name,
          taskType: 'harvesting',
          title: `${crop.name} 수확`,
          description: crop.tasks.harvesting,
          dueDate: taskDate,
          priority: 'medium',
          completed: false
        });
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
    setTasks(tasksWithState);
  };

  const getCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: CalendarDay[] = [];
    const currentDay = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const dayTasks = tasks.filter(task => 
        task.dueDate.getFullYear() === currentDay.getFullYear() &&
        task.dueDate.getMonth() === currentDay.getMonth() &&
        task.dueDate.getDate() === currentDay.getDate()
      );
      
      days.push({
        date: new Date(currentDay),
        isCurrentMonth: currentDay.getMonth() === month,
        tasks: dayTasks
      });
      
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const toggleTaskComplete = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
    setCompletedIds(prev =>
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
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
      case 'planting': return 'bg-green-500';
      case 'harvesting': return 'bg-orange-500';
      case 'maintenance': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const calendarDays = getCalendarDays();
  const selectedDayTasks = selectedDate 
    ? tasks.filter(task => 
        task.dueDate.getFullYear() === selectedDate.getFullYear() &&
        task.dueDate.getMonth() === selectedDate.getMonth() &&
        task.dueDate.getDate() === selectedDate.getDate()
      )
    : [];

  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pb-20 overflow-hidden">
      {/* Floating Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-20 right-10 w-64 h-64 bg-blue-300/30 rounded-full blur-3xl"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        ></div>
        <div 
          className="absolute bottom-40 left-10 w-80 h-80 bg-indigo-300/30 rounded-full blur-3xl"
          style={{ transform: `translateY(${-scrollY * 0.2}px)` }}
        ></div>
      </div>

      {/* Header */}
      <header className="bg-white/70 backdrop-blur-xl shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="px-4 py-4 flex items-center gap-3">
          <Link to="/" className="w-10 h-10 flex items-center justify-center hover:bg-blue-50 rounded-xl transition-all duration-300 transform hover:scale-110">
            <i className="ri-arrow-left-line text-xl text-gray-700"></i>
          </Link>
          <h1 className="text-base font-black text-gray-900 flex-1">작업 달력</h1>
          <Link
            to="/task-reminders"
            className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300"
          >
            <i className="ri-list-check text-xl text-white"></i>
          </Link>
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
                <h2 className="text-2xl font-black mb-2 drop-shadow-lg">작업 달력 보기</h2>
                <p className="text-sm text-white/90 font-medium">날짜별 작업을 한눈에 확인하세요</p>
              </div>
              <div className="w-16 h-16 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30">
                <i className="ri-calendar-check-line text-3xl text-white"></i>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center border border-white/20">
                <i className="ri-seedling-line text-2xl mb-1"></i>
                <p className="text-xs font-bold">정식</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center border border-white/20">
                <i className="ri-scissors-line text-2xl mb-1"></i>
                <p className="text-xs font-bold">수확</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center border border-white/20">
                <i className="ri-tools-line text-2xl mb-1"></i>
                <p className="text-xs font-bold">관리</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Calendar Controls */}
      <section className="px-4 pb-6 relative z-10">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={goToPreviousMonth}
              className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-300 transform hover:scale-110"
            >
              <i className="ri-arrow-left-s-line text-xl text-gray-700"></i>
            </button>
            
            <div className="text-center">
              <h3 className="text-lg font-black text-gray-900">
                {currentDate.getFullYear()}년 {monthNames[currentDate.getMonth()]}
              </h3>
            </div>

            <button
              onClick={goToNextMonth}
              className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-300 transform hover:scale-110"
            >
              <i className="ri-arrow-right-s-line text-xl text-gray-700"></i>
            </button>
          </div>

          <button
            onClick={goToToday}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            오늘로 이동
          </button>
        </div>
      </section>

      {/* Calendar Grid */}
      <section className="px-4 pb-6 relative z-10">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-4 border border-gray-100">
          {/* Day Names */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((day, index) => (
              <div 
                key={day} 
                className={`text-center py-2 text-xs font-black ${
                  index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-700'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const hasPlanting = day.tasks.some(t => t.taskType === 'planting');
              const hasHarvesting = day.tasks.some(t => t.taskType === 'harvesting');
              const hasMaintenance = day.tasks.some(t => t.taskType === 'maintenance');
              
              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(day.date)}
                  className={`aspect-square rounded-xl p-1 transition-all duration-300 transform hover:scale-105 ${
                    !day.isCurrentMonth 
                      ? 'bg-gray-50 opacity-40' 
                      : isToday(day.date)
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg'
                      : day.tasks.length > 0
                      ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200'
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <span className={`text-xs font-bold mb-1 ${
                      isToday(day.date) ? 'text-white' : !day.isCurrentMonth ? 'text-gray-400' : 'text-gray-900'
                    }`}>
                      {day.date.getDate()}
                    </span>
                    
                    {day.tasks.length > 0 && (
                      <div className="flex gap-0.5 flex-wrap justify-center">
                        {hasPlanting && (
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        )}
                        {hasHarvesting && (
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                        )}
                        {hasMaintenance && (
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs text-gray-600 font-medium">정식</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-xs text-gray-600 font-medium">수확</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-xs text-gray-600 font-medium">관리</span>
            </div>
          </div>
        </div>
      </section>

      {/* Selected Date Tasks Modal */}
      {selectedDate && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end animate-fadeIn"
          onClick={() => setSelectedDate(null)}
        >
          <div 
            className="bg-white rounded-t-3xl w-full max-h-[70vh] overflow-y-auto animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-gray-200 px-4 py-4 flex items-center justify-between z-10">
              <div>
                <h3 className="text-lg font-black text-gray-900">
                  {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  {selectedDayTasks.length}개의 작업
                </p>
              </div>
              <button 
                onClick={() => setSelectedDate(null)}
                className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <i className="ri-close-line text-xl text-gray-700"></i>
              </button>
            </div>

            <div className="p-6">
              {selectedDayTasks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl">
                    <i className="ri-calendar-line text-4xl text-gray-400"></i>
                  </div>
                  <p className="text-sm text-gray-500 font-medium">이 날짜에 예정된 작업이 없습니다</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDayTasks.map((task) => {
                    const crop = CROPS.find(c => c.id === task.cropId);
                    
                    return (
                      <div 
                        key={task.id}
                        className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-4 border border-gray-200 hover:shadow-xl transition-all duration-300"
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

                          <div className={`w-12 h-12 rounded-xl shadow-lg flex-shrink-0 flex items-center justify-center bg-gradient-to-br ${crop ? CROP_VISUAL[crop.id]?.gradient ?? 'from-gray-300 to-gray-400' : 'from-gray-300 to-gray-400'}`}>
                            <span className="text-2xl">{crop ? (CROP_VISUAL[crop.id]?.emoji ?? '🌱') : '🌱'}</span>
                          </div>

                          <div className="flex-1">
                            <h4 className={`text-sm font-black text-gray-900 mb-1 ${task.completed ? 'line-through' : ''}`}>
                              {task.title}
                            </h4>
                            <p className="text-xs text-gray-600 font-medium mb-2">{task.description}</p>
                            
                            <span className={`inline-flex items-center gap-1 px-3 py-1 ${getTaskTypeColor(task.taskType)} text-white rounded-full text-xs font-bold shadow-sm`}>
                              <i className={getTaskTypeIcon(task.taskType)}></i>
                              {task.taskType === 'planting' ? '정식' : task.taskType === 'harvesting' ? '수확' : '관리'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <section className="px-4 pb-6 relative z-10">
        <div className="relative bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100 rounded-3xl p-6 border-2 border-blue-200 overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-300/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-300/30 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex gap-4">
            <div className="w-14 h-14 flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl shadow-lg">
              <i className="ri-lightbulb-flash-line text-2xl text-white"></i>
            </div>
            <div>
              <h4 className="text-sm font-black text-blue-900 mb-2 flex items-center gap-2">
                <i className="ri-information-line"></i>
                달력 활용 팁
              </h4>
              <p className="text-xs text-blue-800 leading-relaxed font-medium">
                날짜를 클릭하면 해당 날짜의 작업 목록을 확인할 수 있습니다. 색상 점으로 작업 유형을 빠르게 파악하세요.
              </p>
            </div>
          </div>
        </div>
      </section>

      <BottomNav />
    </div>
  );
}
