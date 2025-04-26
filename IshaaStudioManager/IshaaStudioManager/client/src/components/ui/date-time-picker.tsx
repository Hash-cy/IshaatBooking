import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface DateTimePickerProps {
  dateLabel?: string;
  timeLabel?: string;
  dateId: string;
  timeId: string;
  dateValue: string;
  timeValue: string;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  required?: boolean;
  minDate?: string;
  className?: string;
}

const DateTimePicker = React.forwardRef<HTMLDivElement, DateTimePickerProps>(
  ({ 
    dateLabel = "Date", 
    timeLabel = "Time", 
    dateId, 
    timeId, 
    dateValue, 
    timeValue, 
    onDateChange, 
    onTimeChange, 
    required = false, 
    minDate,
    className 
  }, ref) => {
    return (
      <div ref={ref} className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", className)}>
        <div className="form-control">
          <Input
            type="date"
            id={dateId}
            value={dateValue}
            onChange={(e) => onDateChange(e.target.value)}
            min={minDate}
            placeholder=" "
            required={required}
          />
          <Label htmlFor={dateId}>{dateLabel}</Label>
        </div>
        
        <div className="form-control">
          <Input
            type="time"
            id={timeId}
            value={timeValue}
            onChange={(e) => onTimeChange(e.target.value)}
            placeholder=" "
            required={required}
          />
          <Label htmlFor={timeId}>{timeLabel}</Label>
        </div>
      </div>
    );
  }
);

DateTimePicker.displayName = "DateTimePicker";

export { DateTimePicker };
