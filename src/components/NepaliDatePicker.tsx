import React, { useState } from "react";
import { Select, Row, Col } from "antd";
import dayjs from 'dayjs';
import { DualDateConverter } from '../utils/dateConverter';

// Picker value type (not the library class)
export interface NepaliDateValue {
  year: number;
  month: number;
  day: number;
}

interface NepaliDatePickerProps {
  value?: NepaliDateValue;
  onChange?: (date: NepaliDateValue) => void;
  label?: string;
}

// Accurate AD to BS conversion for today's date
function adToBs(adDate: Date): NepaliDateValue {
  // Use DualDateConverter for accurate conversion
  const dual = DualDateConverter.createDualDate(dayjs(adDate));
  const nepali = dual.nepali;
  return {
    year: nepali.getYear(),
    month: nepali.getMonth() + 1,
    day: nepali.getDate() - 1, // Fix off-by-one: NepaliDate.getDate() returns next day
  };
}

function getTodayNepaliDate(): NepaliDateValue {
  return adToBs(new Date());
}

const nepaliYears = Array.from({ length: 91 }, (_, i) => 2000 + i); // 2000 to 2090 BS
const nepaliMonths = [
  "Baishakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin",
  "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"
];
const nepaliDays = Array.from({ length: 32 }, (_, i) => i + 1);

const NepaliDatePicker: React.FC<NepaliDatePickerProps> = ({ value, onChange, label }) => {
  const defaultNepaliDate = value || getTodayNepaliDate();
  const [selectedYear, setSelectedYear] = useState<number>(defaultNepaliDate.year);
  const [selectedMonth, setSelectedMonth] = useState<number>(defaultNepaliDate.month);
  const [selectedDay, setSelectedDay] = useState<number>(defaultNepaliDate.day);

  const handleChange = (type: "year" | "month" | "day", val: number) => {
    let newYear = selectedYear;
    let newMonth = selectedMonth;
    let newDay = selectedDay;
    if (type === "year") newYear = val;
    if (type === "month") newMonth = val;
    if (type === "day") newDay = val;
    setSelectedYear(newYear);
    setSelectedMonth(newMonth);
    setSelectedDay(newDay);
    if (onChange) {
      onChange({ year: newYear, month: newMonth, day: newDay });
    }
  };

  return (
    <Row gutter={8} align="middle">
      {label && <Col span={24}><b>{label}</b></Col>}
      <Col span={8}>
        <Select
          value={selectedYear}
          onChange={val => handleChange("year", val)}
          style={{ width: "100%" }}
        >
          {nepaliYears.map(y => (
            <Select.Option key={y} value={y}>{y}</Select.Option>
          ))}
        </Select>
      </Col>
      <Col span={8}>
        <Select
          value={selectedMonth}
          onChange={val => handleChange("month", val)}
          style={{ width: "100%" }}
        >
          {nepaliMonths.map((m, i) => (
            <Select.Option key={i + 1} value={i + 1}>{m}</Select.Option>
          ))}
        </Select>
      </Col>
      <Col span={8}>
        <Select
          value={selectedDay}
          onChange={val => handleChange("day", val)}
          style={{ width: "100%" }}
        >
          {nepaliDays.map(d => (
            <Select.Option key={d} value={d}>{d}</Select.Option>
          ))}
        </Select>
      </Col>
    </Row>
  );
};

export default NepaliDatePicker;
