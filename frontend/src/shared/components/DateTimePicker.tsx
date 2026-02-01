import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, X } from 'lucide-react';

interface DateTimePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  label?: string;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  placement?: 'top' | 'bottom';
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = "Pick a date",
  minDate,
  maxDate,
  className = "",
  placement = "bottom",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value || new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update view date when value changes (if open)
  useEffect(() => {
    if (value) {
      setViewDate(value);
    }
  }, [value]);

  const toggleOpen = () => setIsOpen(!isOpen);

  // Calendar Logic
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    
    // Preserve time if value exists, else default to 00:00 or current time
    if (value) {
      newDate.setHours(value.getHours());
      newDate.setMinutes(value.getMinutes());
    } else {
      const now = new Date();
      newDate.setHours(now.getHours());
      newDate.setMinutes(now.getMinutes());
    }
    
    onChange(newDate);
  };

  const handleTimeChange = (type: 'hours' | 'minutes', val: string) => {
    let numVal = parseInt(val);
    if (isNaN(numVal)) return;

    if (type === 'hours') numVal = Math.max(0, Math.min(23, numVal));
    if (type === 'minutes') numVal = Math.max(0, Math.min(59, numVal));

    const newDate = value ? new Date(value) : new Date();
    if (type === 'hours') newDate.setHours(numVal);
    if (type === 'minutes') newDate.setMinutes(numVal);
    
    onChange(newDate);
  };

  const formatDate = (date: Date) => {
    const d = date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    const t = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    return `${d} ${t}`;
  };

  // Rendering Constants
  const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
  const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
  const monthName = viewDate.toLocaleString('default', { month: 'long' });
  const year = viewDate.getFullYear();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const isSelected = (day: number) => {
    if (!value) return false;
    return (
      value.getDate() === day &&
      value.getMonth() === viewDate.getMonth() &&
      value.getFullYear() === viewDate.getFullYear()
    );
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === viewDate.getMonth() &&
      today.getFullYear() === viewDate.getFullYear()
    );
  };

  const placementClasses = placement === 'top' 
    ? 'bottom-full mb-2 animate-fade-in-up origin-bottom' 
    : 'top-full mt-2 animate-fade-in-down origin-top';

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      
      {/* Trigger Button */}
      <div 
        onClick={toggleOpen}
        className={`
          flex items-center justify-between w-full px-3 py-2 rounded-lg border bg-white cursor-pointer transition-all
          ${isOpen ? 'ring-2 ring-brand-500 border-transparent' : 'border-gray-300 hover:border-gray-400'}
        `}
      >
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <CalendarIcon size={16} className="text-gray-500" />
          {value ? (
            <span className="font-medium">{formatDate(value)}</span>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>
        
        {value && (
          <div 
            onClick={(e) => { e.stopPropagation(); onChange(undefined); }}
            className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={14} />
          </div>
        )}
      </div>

      {/* Dropdown Content */}
      {isOpen && (
        <div className={`absolute z-50 p-4 bg-white rounded-xl shadow-xl border border-gray-200 w-[300px] transform left-0 sm:left-auto ${placementClasses}`}>
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <button 
              type="button"
              onClick={handlePrevMonth} 
              className="p-1 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-bold text-gray-800">{monthName} {year}</span>
            <button 
              type="button"
              onClick={handleNextMonth} 
              className="p-1 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Week Days */}
          <div className="grid grid-cols-7 mb-2">
            {weekDays.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {blanks.map(i => <div key={`blank-${i}`} />)}
            {days.map(day => (
              <button
                type="button"
                key={day}
                onClick={() => handleDateSelect(day)}
                className={`
                  h-8 w-8 rounded-lg text-sm flex items-center justify-center transition-colors
                  ${isSelected(day) 
                    ? 'bg-brand-600 text-white font-bold shadow-md' 
                    : isToday(day)
                      ? 'bg-brand-50 text-brand-600 font-semibold hover:bg-brand-100'
                      : 'text-gray-700 hover:bg-gray-100'}
                `}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Time Picker */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={14} className="text-gray-400" />
              <span className="text-xs font-semibold text-gray-500 uppercase">Time</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  min="0"
                  max="23"
                  className="w-full px-2 py-1.5 text-center text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-brand-500 outline-none"
                  value={value ? value.getHours().toString().padStart(2, '0') : '00'}
                  onChange={(e) => handleTimeChange('hours', e.target.value)}
                  placeholder="HH"
                />
              </div>
              <span className="text-gray-400 font-bold">:</span>
              <div className="relative flex-1">
                <input
                  type="number"
                  min="0"
                  max="59"
                  className="w-full px-2 py-1.5 text-center text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-brand-500 outline-none"
                  value={value ? value.getMinutes().toString().padStart(2, '0') : '00'}
                  onChange={(e) => handleTimeChange('minutes', e.target.value)}
                  placeholder="MM"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateTimePicker;
