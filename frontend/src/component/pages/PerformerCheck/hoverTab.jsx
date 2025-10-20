import React, { useState } from 'react';
import SubButton from "./subButton";
import './performerCheck.css';

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5159";

const HoverTab = (props) => {
  const [activeTab, setActiveTab] = useState('表演者審核');

  const loadBy = async (query = {}, tabName = '表演者審核') => {
    try {
      const url = new URL(`${API}/api/applications/page`);
      url.searchParams.set('page', 1);
      url.searchParams.set('pageSize', props.rowsPerPage ?? 10);
      Object.entries(query).forEach(([k, v]) => {
        if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
      });
  
      const res = await fetch(url.toString());
      const json = await res.json();
  
      props.setData(json.data ?? []);
      props.setTotalCount?.(json.totalCount ?? 0);
      props.setPage(0);
  
      props.onQueryChange?.(query);  // ✅ 回報當前篩選
      setActiveTab(tabName);
    } catch (e) {
      console.error('載入資料失敗', e);
    }
  };

  return (
    <div className="tab">
      {/* 五個篩選 tab：activeTab === 'xxx' 時黑色，否則灰色 */}
      <SubButton 
        label= "表演者審核"
        active={activeTab === '表演者審核'}
        handleClick={() => loadBy({}, '表演者審核')} 
      />
      <SubButton
        label="未審核"
        active={activeTab === '未審核'}
        handleClick={() => loadBy({ isChecked: false }, '未審核')}
      />
      <SubButton
        label="審核完成"
        active={activeTab === '審核完成'}
        handleClick={() => loadBy({ isChecked: true }, '審核完成')}
      />
      <SubButton
        label="通過"
        active={activeTab === '通過'}
        handleClick={() => loadBy({ isApproved: true }, '通過')}
      />
      <SubButton
        label="未通過"
        active={activeTab === '未通過'}
        handleClick={() => loadBy({ isApproved: false }, '未通過')}
      />
    </div>
  );
};

export default HoverTab;

