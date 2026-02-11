import { useState } from 'react';
import { DifficultyLevel } from '@/types';

interface TaskFormProps {
  onSubmit: (data: {
    title: string;
    description?: string;
    deadline: Date;
    difficulty: DifficultyLevel;
    estimatedMinutes: number;
  }) => void;
  onCancel: () => void;
}

export default function TaskForm({ onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Vui lòng nhập tên nhiệm vụ');
      return;
    }

    if (!deadline) {
      alert('Vui lòng chọn deadline');
      return;
    }

    const totalMinutes = (parseInt(hours) || 0) * 60 + (parseInt(minutes) || 0);
    if (totalMinutes < 1) {
      alert('Vui lòng nhập thời gian ước tính (ít nhất 1 phút)');
      return;
    }

    onSubmit({
      title,
      description: description.trim() || undefined,
      deadline: new Date(deadline),
      difficulty,
      estimatedMinutes: totalMinutes,
    });
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Thêm nhiệm vụ mới</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tên nhiệm vụ *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ví dụ: Ôn thi Toán học"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mô tả
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Chi tiết về nhiệm vụ..."
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Deadline *
        </label>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          min={today}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Độ khó *
        </label>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="easy">Dễ</option>
          <option value="medium">Trung bình</option>
          <option value="hard">Khó</option>
          <option value="very-hard">Rất khó</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Thời gian ước tính *
        </label>
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              type="number"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              min="0"
              max="999"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Giờ"
            />
          </div>
          <div className="flex-1">
            <input
              type="number"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              min="0"
              max="59"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Phút"
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Hãy ước tính thật chính xác để lịch học được thực tế
        </p>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          Thêm nhiệm vụ
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
