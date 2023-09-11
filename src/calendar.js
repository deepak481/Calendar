import React, { useState, useEffect } from 'react';
import './calendar.css';
import axios from 'axios';

export default function Board() {
  const [dates, setDates] = useState(Array(34).fill(''));
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [holidayTiles, setHolidayTiles] = useState(
    JSON.parse(localStorage.getItem(`holidayTiles_${currentMonth}_${currentYear}`)) || Array(34).fill('')
  );
  const [loading, setLoading] = useState(false);

  function Day({ id, dates, bgColor }) {
    return (
      <div id={id} 
        style={{ backgroundColor: bgColor[id], cursor: 'pointer' }}  
        onClick={() => {let x = [...holidayTiles];
        x[id]= "green";
        localStorage.setItem(`holidayTiles_${currentMonth}_${currentYear}`, JSON.stringify(x));
        setHolidayTiles(x)
        }} 
      className="date">
        {dates[id]}
      </div>
    );
  }

  const getMonthName = () => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June', 'July',
      'August', 'September', 'October', 'November', 'December',
    ];
    return `${monthNames[currentMonth]} ${currentYear}`;
  };

  const getMonthDates = (year, month) => {
    const holidayColor = '#F7F7F7';
    const holidays = Array(34).fill('');
    const numberOfDays = new Date(year, month + 1, 0).getDate();
    const startDay = new Date(year, month, 1).getDay();
    const newDates = Array(34).fill('');

    if (startDay === 0) {
      for (let i = startDay + 6; i < numberOfDays + startDay + 6; i++) {
        const date = i - 5;
        const dayOfWeek = new Date(year, month, date).getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          holidays[i] = holidayColor;
        }
        newDates[i] = date.toString();
      }

      if (numberOfDays + startDay + 5 - 34 === 1) {
        newDates[0] = '30';
        const dayOfWeek = new Date(year, month, 30).getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          holidays[0] = holidayColor;
        }
      }

      if (numberOfDays + startDay + 5 - 34 === 2) {
        newDates[0] = '30';
        newDates[1] = '31';
      }
    } else {
      for (let i = startDay - 1; i < numberOfDays + startDay - 1; i++) {
        const date = i - (startDay - 2);
        const dayOfWeek = new Date(year, month, date).getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          holidays[i] = holidayColor;
        }
        newDates[i] = date.toString();
      }
    }

    setDates(newDates);
    setHolidayTiles(holidays);
  };

  const fetchData = (year, month) => {
    const holidayColor = 'pink';
    const currentMonth = month + 1;
    const currentYear = year;
    setLoading(true)
    axios.get(`http://localhost:3000/holidays?month=${currentMonth}&year=${currentYear}`)
      .then(response => response.data)
      .then(result => {
        const colour = holidayTiles.slice();

        for (let i = 0; i < result.length; i++) {
          colour[dates.indexOf(`${result[i].day}`)] = '#a0e7ff';
          const day = new Date(result[i].year, result[i].month - 1, result[i].day).getDay();

          if (day === 1) {
            colour[dates.indexOf(`${result[i].day}`) - 3] = holidayColor;
          } else if (day === 2) {
            colour[dates.indexOf(`${result[i].day}`) - 1] = holidayColor;
          } else if (day === 4) {
            colour[dates.indexOf(`${result[i].day}`) + 1] = holidayColor;
          } else if (day === 5) {
            colour[dates.indexOf(`${result[i].day}`) + 3] = holidayColor;
          }
        }
        setLoading(false)
        setHolidayTiles(JSON.parse(localStorage.getItem(`holidayTiles_${currentMonth}_${currentYear}`)) || colour);
      });
  };

  useEffect(() => {
    getMonthDates(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  useEffect(() => {
    fetchData(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  const renderDate = id => {
    return <Day id={id} bgColor={holidayTiles} dates={dates} />;
  };

  const renderDay = day => {
    return <div className="day">{day}</div>;
  };

  const setNextMonth = () => {
    const blank = Array(34).fill('');
    setHolidayTiles(blank);

    let newCurrentMonth = currentMonth + 1;
    let newCurrentYear = currentYear;
    if (newCurrentMonth === 12) {
      newCurrentMonth = 0;
      newCurrentYear = currentYear + 1;
    }
    setCurrentMonth(newCurrentMonth);
    setCurrentYear(newCurrentYear);
    getMonthDates(newCurrentYear, newCurrentMonth);
    fetchData(newCurrentYear, newCurrentMonth);
  };

  const setPreviousMonth = () => {
    const blank = Array(34).fill('');
    setHolidayTiles(blank);

    let newCurrentMonth = currentMonth - 1;
    let newCurrentYear = currentYear;
    if (newCurrentMonth === -1) {
      newCurrentMonth = 11;
      newCurrentYear = currentYear - 1;
    }
    setCurrentMonth(newCurrentMonth);
    setCurrentYear(newCurrentYear);
    getMonthDates(newCurrentYear, newCurrentMonth);
    fetchData(newCurrentYear, newCurrentMonth);
  };

  const renderTop = () => {
    return (
      <div className="topbar">
        <div className="back-switcher">
          <button id="back-button" onClick={setPreviousMonth}></button>
        </div>
        <h2 className="month-title">{getMonthName()}</h2>
        <div className="front-switcher">
          <button id="next-button" onClick={setNextMonth}></button>
        </div>
      </div>
    );
  };

  if(loading) {
    return (<div>
      ...Loading
    </div>)
  }

  return (
    <div className="parent">
      <div>{renderTop()}</div>
      <div id="board" className="grid">
        {renderDay('Mon')}
        {renderDay('Tue')}
        {renderDay('Wed')}
        {renderDay('Thu')}
        {renderDay('Fri')}
        {renderDay('Sat')}
        {renderDay('Sun')}
        {Array.from({ length: 35 }).map((_, index) => renderDate(index))}
        <div className="legend">
          <div className="icon"></div>
          <div id="weekend" className="icon"></div>
          <div className="content">Saturday / Sunday</div>
          <div id="holiday" className="icon"></div>
          <div className="content">Public Holiday</div>
          <div id="leave" className="icon"></div>
          <div className="content">Take a leave</div>
        </div>
      </div>
    </div>
  );
}
