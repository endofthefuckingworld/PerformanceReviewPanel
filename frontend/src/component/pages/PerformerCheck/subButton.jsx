import React from 'react';
import './performerCheck.css';

const SubButton = ({ label, handleClick, active }) => {
  return (
    <button
      onClick={handleClick}
      className={active ? "mainButton" : "subButton"}  // 選中=黑色樣式，否則灰色樣式
    >
      {label}
    </button>
  );
};

export default SubButton;