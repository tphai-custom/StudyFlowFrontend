import { StudySession, Task } from '@/types';
import { formatDuration } from '@/utils/taskUtils';

interface ScheduleViewProps {
  sessions: StudySession[];
  tasks: Task[];
}

export default function ScheduleView({ sessions, tasks }: ScheduleViewProps) {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">Chưa có lịch học</p>
        <p className="text-sm mt-2">
          Thêm nhiệm vụ và cài đặt thời gian rảnh để tạo lịch học tự động
        </p>
      </div>
    );
  }

  // Group sessions by date
  const sessionsByDate = sessions.reduce((acc, session) => {
    const dateKey = session.date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(session);
    return acc;
  }, {} as Record<string, StudySession[]>);

  // Sort dates
  const sortedDates = Object.keys(sessionsByDate).sort((a, b) => {
    const dateA = sessionsByDate[a][0].date;
    const dateB = sessionsByDate[b][0].date;
    return dateA.getTime() - dateB.getTime();
  });

  const getTaskById = (taskId: string) => {
    return tasks.find(t => t.id === taskId);
  };

  return (
    <div className="space-y-6">
      {sortedDates.map(dateKey => {
        const daySessions = sessionsByDate[dateKey];
        const totalMinutes = daySessions.reduce((sum, s) => sum + s.durationMinutes, 0);

        return (
          <div key={dateKey} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3 pb-2 border-b">
              <h3 className="font-semibold text-gray-800">{dateKey}</h3>
              <span className="text-sm text-gray-600">
                Tổng: {formatDuration(totalMinutes)}
              </span>
            </div>

            <div className="space-y-2">
              {daySessions
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map(session => {
                  const task = getTaskById(session.taskId);
                  if (!task) return null;

                  return (
                    <div
                      key={session.id}
                      className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800">{task.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {session.startTime} - {session.endTime}
                            <span className="ml-2">
                              ({formatDuration(session.durationMinutes)})
                            </span>
                          </p>
                        </div>
                        {session.completed && (
                          <span className="text-green-600 ml-2">✓</span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
