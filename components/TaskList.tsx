import { Task } from '@/types';
import { 
  formatDeadline, 
  formatDuration, 
  getUrgency, 
  getCompletionPercentage,
  getDifficultyLabel,
  getStatusLabel,
  updateTaskProgress 
} from '@/utils/taskUtils';

interface TaskListProps {
  tasks: Task[];
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export default function TaskList({ tasks, onUpdateTask, onDeleteTask }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">Chưa có nhiệm vụ nào</p>
        <p className="text-sm mt-2">Thêm nhiệm vụ đầu tiên để bắt đầu!</p>
      </div>
    );
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    // Sort by status (pending/in-progress first, then completed)
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;
    // Then by deadline
    return a.deadline.getTime() - b.deadline.getTime();
  });

  const handleMarkComplete = (task: Task) => {
    const updatedTask = updateTaskProgress(task, task.estimatedMinutes);
    onUpdateTask(updatedTask);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 border-red-500 text-red-800';
      case 'high': return 'bg-orange-100 border-orange-500 text-orange-800';
      case 'medium': return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      default: return 'bg-green-100 border-green-500 text-green-800';
    }
  };

  return (
    <div className="space-y-4">
      {sortedTasks.map(task => {
        const urgency = getUrgency(task);
        const completion = getCompletionPercentage(task);
        const urgencyColor = getUrgencyColor(urgency);

        return (
          <div
            key={task.id}
            className={`border-l-4 rounded-lg p-4 ${urgencyColor} ${
              task.status === 'completed' ? 'opacity-60' : ''
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg">{task.title}</h3>
              <button
                onClick={() => onDeleteTask(task.id)}
                className="text-red-500 hover:text-red-700 ml-2"
                title="Xóa"
              >
                🗑️
              </button>
            </div>

            {task.description && (
              <p className="text-sm mb-2 opacity-80">{task.description}</p>
            )}

            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
              <div>
                <span className="font-medium">Deadline:</span> {formatDeadline(task.deadline)}
              </div>
              <div>
                <span className="font-medium">Độ khó:</span> {getDifficultyLabel(task.difficulty)}
              </div>
              <div>
                <span className="font-medium">Thời gian:</span> {formatDuration(task.estimatedMinutes)}
              </div>
              <div>
                <span className="font-medium">Trạng thái:</span> {getStatusLabel(task.status)}
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span>Tiến độ</span>
                <span>{completion}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${completion}%` }}
                />
              </div>
            </div>

            {task.status !== 'completed' && (
              <button
                onClick={() => handleMarkComplete(task)}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors text-sm"
              >
                ✓ Đánh dấu hoàn thành
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
