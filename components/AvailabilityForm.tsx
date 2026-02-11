import { useState } from 'react';
import { UserAvailability, TimeBlock } from '@/types';

interface AvailabilityFormProps {
  initialAvailability: UserAvailability;
  onSubmit: (availability: UserAvailability) => void;
  onCancel: () => void;
}

const DAYS = [
  { key: 'monday', label: 'Thứ 2' },
  { key: 'tuesday', label: 'Thứ 3' },
  { key: 'wednesday', label: 'Thứ 4' },
  { key: 'thursday', label: 'Thứ 5' },
  { key: 'friday', label: 'Thứ 6' },
  { key: 'saturday', label: 'Thứ 7' },
  { key: 'sunday', label: 'Chủ nhật' },
];

export default function AvailabilityForm({
  initialAvailability,
  onSubmit,
  onCancel,
}: AvailabilityFormProps) {
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>(initialAvailability.timeBlocks);
  const [maxDailyHours, setMaxDailyHours] = useState(
    Math.floor(initialAvailability.maxDailyStudyMinutes / 60)
  );

  const addTimeBlock = (day: string) => {
    const newBlock: TimeBlock = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      day,
      startTime: '09:00',
      endTime: '11:00',
    };
    setTimeBlocks([...timeBlocks, newBlock]);
  };

  const updateTimeBlock = (id: string, field: 'startTime' | 'endTime', value: string) => {
    setTimeBlocks(
      timeBlocks.map(block =>
        block.id === id ? { ...block, [field]: value } : block
      )
    );
  };

  const removeTimeBlock = (id: string) => {
    setTimeBlocks(timeBlocks.filter(block => block.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (timeBlocks.length === 0) {
      alert('Vui lòng thêm ít nhất một khung giờ rảnh');
      return;
    }

    if (maxDailyHours < 1 || maxDailyHours > 16) {
      alert('Số giờ học tối đa mỗi ngày phải từ 1 đến 16 giờ');
      return;
    }

    // Validate time blocks
    for (const block of timeBlocks) {
      const [startHour, startMin] = block.startTime.split(':').map(Number);
      const [endHour, endMin] = block.endTime.split(':').map(Number);
      
      if (startHour * 60 + startMin >= endHour * 60 + endMin) {
        alert('Giờ kết thúc phải sau giờ bắt đầu');
        return;
      }
    }

    onSubmit({
      timeBlocks,
      maxDailyStudyMinutes: maxDailyHours * 60,
    });
  };

  const getBlocksForDay = (day: string) => {
    return timeBlocks.filter(block => block.day === day);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Cài đặt thời gian rảnh
      </h2>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <p className="text-sm text-blue-800">
          <strong>Quan trọng:</strong> Hãy nhập thời gian rảnh thực tế của bạn.
          StudyFlow sẽ dựa vào đây để tạo lịch học khả thi, tránh lịch học "ảo" không thực hiện được.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Số giờ học tối đa mỗi ngày
        </label>
        <input
          type="number"
          value={maxDailyHours}
          onChange={(e) => setMaxDailyHours(parseInt(e.target.value) || 0)}
          min="1"
          max="16"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Giới hạn này giúp tránh việc học quá nhiều trong một ngày
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Khung giờ rảnh trong tuần
        </h3>
        
        <div className="space-y-4">
          {DAYS.map(({ key, label }) => {
            const dayBlocks = getBlocksForDay(key);
            
            return (
              <div key={key} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-gray-700">{label}</h4>
                  <button
                    type="button"
                    onClick={() => addTimeBlock(key)}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    + Thêm khung giờ
                  </button>
                </div>

                {dayBlocks.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">Chưa có khung giờ nào</p>
                ) : (
                  <div className="space-y-2">
                    {dayBlocks.map(block => (
                      <div key={block.id} className="flex gap-2 items-center">
                        <input
                          type="time"
                          value={block.startTime}
                          onChange={(e) => updateTimeBlock(block.id, 'startTime', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                          required
                        />
                        <span className="text-gray-500">-</span>
                        <input
                          type="time"
                          value={block.endTime}
                          onChange={(e) => updateTimeBlock(block.id, 'endTime', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => removeTimeBlock(block.id)}
                          className="text-red-500 hover:text-red-700 text-sm ml-2"
                        >
                          Xóa
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors font-medium"
        >
          Lưu cài đặt
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300 transition-colors font-medium"
        >
          Hủy
        </button>
      </div>
    </form>
  );
}
