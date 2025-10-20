import React from 'react';
import './performerCheck.css';
import Table from '@mui/material/Table';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';
import { grey } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import TableRows from './tableRow.jsx';


const StyledTableCell = styled(TableCell)(({ theme }) => ({
  '&.MuiTableCell-head': {
    backgroundColor: grey[50],
    color: grey[800],
    fontWeight: 700,
    fontFamily: '微軟正黑體',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
  },
  '&.MuiTableCell-body': {
    fontSize: 14,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
}));

const PerformerTable = (props) => {
  const totalPages = Math.max(1, Math.ceil((props.totalCount ?? 0) / (props.rowsPerPage ?? 10)));

  // 在檔案頂部或組件內
  // 前端欄位 name -> 後端 sortBy 名稱的對照表
  const FIELD_MAP = {
    isApproved: 'approvalstatus',       // 審核狀態
    applicationDate: 'applicationdate', // 申請日期（後端用小寫）
    performerName: 'performername',     // 注意：後端目前未處理 performername（要後端支援才有用）
    category: 'category',
    performanceTitle: 'performancetitle'
  };

  const handleSort = (columnKey) => {
    const backendField = FIELD_MAP[columnKey] || columnKey;
    const current = props.sort || {};
    const nextOrder = current.field === backendField && current.order === 'asc' ? 'desc' : 'asc';

    // 送給父元件的 sort 使用後端欄位命名（父層會把它加到 query string）
    props.onSortChange?.({ field: backendField, order: nextOrder });
  };

  // 簡單的排序圖示（會根據 props.sort.field 與 props.sort.order 顯示）
  const renderSortIcon = (columnKey) => {
    const backendField = FIELD_MAP[columnKey] || columnKey;
    if (!props.sort?.field || props.sort.field !== backendField) return <ExpandMoreIcon />;
    return props.sort.order === 'asc'
      ? <ExpandMoreIcon style={{ transform: 'rotate(180deg)' }} />
      : <ExpandMoreIcon />;
  };

  return (
    <div className="table-wrap" style={{ display: 'flex', flexDirection: 'column' }}>
      <TableContainer component={Paper} elevation={0}>
        <Table size="small" sx={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: 120 }} />  {/* 審核狀態 */}
            <col style={{ width: 160 }} />  {/* 表演日期 */}
            <col style={{ width: 160 }} />  {/* 表演者 */}
            <col style={{ width: 160 }} />  {/* 類別 */}
            <col />                          {/* 表演名稱（彈性） */}
            <col style={{ width: 64 }} />   {/* action（展開） */}
          </colgroup>

          <TableHead>
            <TableRow>
              <StyledTableCell onClick={() => handleSort('isApproved')}>
                審核狀態
                <IconButton
                  size="small"
                  onClick={(e) => { e.stopPropagation(); handleSort('isApproved'); }}
                >
                  {renderSortIcon('isApproved')}
                </IconButton>
              </StyledTableCell>

              <StyledTableCell onClick={() => handleSort('applicationDate')}>
                表演日期
                <IconButton
                  size="small"
                  onClick={(e) => { e.stopPropagation(); handleSort('applicationDate'); }}
                >
                  {renderSortIcon('applicationDate')}
                </IconButton>
              </StyledTableCell>

              <StyledTableCell onClick={() => handleSort('performerName')}>
                表演者
              </StyledTableCell>

              <StyledTableCell onClick={() => handleSort('category')}>
                類別
                <IconButton
                  size="small"
                  onClick={(e) => { e.stopPropagation(); handleSort('category'); }}
                >
                  {renderSortIcon('category')}
                </IconButton>
              </StyledTableCell>

              <StyledTableCell onClick={() => handleSort('performanceTitle')}>
                表演名稱
                <IconButton
                  size="small"
                  onClick={(e) => { e.stopPropagation(); handleSort('performanceTitle'); }}
                >
                  {renderSortIcon('performanceTitle')}
                </IconButton>
              </StyledTableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {props.loading && (
              <TableRow><TableCell colSpan={5}>載入中…</TableCell></TableRow>
            )}
            {!props.loading && (props.data?.length ?? 0) === 0 && (
              <TableRow><TableCell colSpan={5}>無資料</TableCell></TableRow>
            )}
            {!props.loading && props.data?.map(app => (
              <TableRows key={app.id} app={app} onSaved={props.onSaved} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 分頁控制列 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '8px',
          marginTop: '12px',
          paddingRight: '16px',
          fontFamily: '微軟正黑體',
          fontSize: '14px',
        }}
      >
        <p style={{ margin: 0 }}>
          第 {props.page + 1} / 共 {totalPages} 頁　|　每頁
        </p>
        <select
          value={props.rowsPerPage}
          onChange={(e) => props.onRowsPerPageChange(Number(e.target.value))}
        >
          {[5, 10, 20].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        筆
        <IconButton
          onClick={() => props.onPageChange(Math.max(0, props.page - 1))}
          disabled={props.page === 0}
        >
          <KeyboardArrowLeft />
        </IconButton>
        <IconButton
          onClick={() => props.onPageChange(Math.min(totalPages - 1, props.page + 1))}
          disabled={props.page >= totalPages - 1}
        >
          <KeyboardArrowRight />
        </IconButton>
      </div>
    </div>
  );
};

export default PerformerTable;