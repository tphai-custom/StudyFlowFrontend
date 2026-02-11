'use client';

import { useState, useEffect } from 'react';
import { Task, StudySession, UserAvailability, TimeBlock } from '@/types';
import { createTask } from '@/utils/taskUtils';
import { generateSchedule, validateSchedule } from '@/lib/scheduler';
import TaskList from '@/components/TaskList';
import TaskForm from '@/components/TaskForm';
import ScheduleView from '@/components/ScheduleView';
import AvailabilityForm from '@/components/AvailabilityForm';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [availability, setAvailability] = useState<UserAvailability>({
    timeBlocks: [],
    maxDailyStudyMinutes: 240, // Default 4 hours
  });
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showAvailabilityForm, setShowAvailabilityForm] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const storedTasks = localStorage.getItem('studyflow_tasks');
    const storedAvailability = localStorage.getItem('studyflow_availability');
    
    if (storedTasks) {
      const parsed = JSON.parse(storedTasks);
      // Convert date strings back to Date objects
      const tasksWithDates = parsed.map((task: any) => ({
        ...task,
        deadline: new Date(task.deadline),
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
      }));
      setTasks(tasksWithDates);
    }
    
    if (storedAvailability) {
      setAvailability(JSON.parse(storedAvailability));
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem('studyflow_tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  // Save availability to localStorage
  useEffect(() => {
    if (availability.timeBlocks.length > 0) {
      localStorage.setItem('studyflow_availability', JSON.stringify(availability));
    }
  }, [availability]);

  // Regenerate schedule when tasks or availability changes
  useEffect(() => {
    if (tasks.length > 0 && availability.timeBlocks.length > 0) {
      const newSessions = generateSchedule({ tasks, availability });
      setSessions(newSessions);
    }
  }, [tasks, availability]);

  const handleAddTask = (taskData: {
    title: string;
    description?: string;
    deadline: Date;
    difficulty: 'easy' | 'medium' | 'hard' | 'very-hard';
    estimatedMinutes: number;
  }) => {
    try {
      const newTask = createTask(taskData);
      setTasks([...tasks, newTask]);
      setShowTaskForm(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Lỗi khi tạo nhiệm vụ');
    }
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const handleUpdateAvailability = (newAvailability: UserAvailability) => {
    setAvailability(newAvailability);
    setShowAvailabilityForm(false);
  };

  const validation = sessions.length > 0 ? validateSchedule(sessions, availability) : { valid: true, warnings: [] };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            StudyFlow
          </h1>
          <p className="text-gray-600">
            Không bao giờ quên deadline, không bao giờ học dồn
          </p>
        </header>

        {/* Action Buttons */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setShowTaskForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            ➕ Thêm nhiệm vụ
          </button>
          <button
            onClick={() => setShowAvailabilityForm(true)}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            ⚙️ Cài đặt thời gian rảnh
          </button>
        </div>

        {/* Warning messages */}
        {!validation.valid && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-yellow-400 text-xl">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Cảnh báo: Lịch học có vấn đề
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="list-disc pl-5 space-y-1">
                    {validation.warnings.map((warning, idx) => (
                      <li key={idx}>{warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Initial Setup Message */}
        {availability.timeBlocks.length === 0 && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-blue-400 text-xl">ℹ️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Chào mừng đến với StudyFlow!
                </h3>
                <p className="mt-2 text-sm text-blue-700">
                  Hãy bắt đầu bằng cách cài đặt thời gian rảnh của bạn để StudyFlow có thể tạo lịch học tối ưu.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Task List */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Nhiệm vụ của bạn
            </h2>
            <TaskList
              tasks={tasks}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
            />
          </div>

          {/* Schedule View */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Lịch học được tạo
            </h2>
            <ScheduleView
              sessions={sessions}
              tasks={tasks}
            />
          </div>
        </div>

        {/* Modals */}
        {showTaskForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <TaskForm
                onSubmit={handleAddTask}
                onCancel={() => setShowTaskForm(false)}
              />
            </div>
          </div>
        )}

        {showAvailabilityForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <AvailabilityForm
                initialAvailability={availability}
                onSubmit={handleUpdateAvailability}
                onCancel={() => setShowAvailabilityForm(false)}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
