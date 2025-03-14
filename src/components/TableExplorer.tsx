import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { supabase } from '../lib/supabase';
import * as XLSX from 'xlsx';
import { GridApi, RowNode, ColDef, GridOptions } from 'ag-grid-community';

export const staticTableNames = [
  "addresses",
  "brands",
  "categories",
  "collections",
  "colors",
  "product_types",
  "products",
  "purchase_order_items",
  "purchase_orders",
  "sequence_counters",
  "settings",
  "sizes",
  "suppliers",
  "variants"
];

const TableExplorer: React.FC = () => {
  const [tableNames, setTableNames] = useState<string[]>(staticTableNames);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [columnDefs, setColumnDefs] = useState<ColDef[]>([]);
  const [rowData, setRowData] = useState([]);
  const gridRef = useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [quickFilterText, setQuickFilterText] = useState('');
  const [selectedRows, setSelectedRows] = useState<RowNode[]>([]);
  const [pageSize, setPageSize] = useState<string>('20'); // Default page size
  const pageSizeOptions = ['20', '50', '100', 'all'];
  const [gridHeight, setGridHeight] = useState<number | undefined>(undefined);

  const fetchTableData = useCallback(async (tableName: string) => {
    if (!tableName) return;
    try {
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact' });

      if (error) {
        console.error(`Error fetching data from table ${tableName}:`, error);
      } else {
        setRowData(data || []);
        console.log('Row Data fetched:', data); // ADDED CONSOLE LOG
        if (data && data.length > 0) {
          const sampleRow = data[0] as Record<string, any>;
          const columns: ColDef[] = Object.keys(sampleRow).map((key, index) => {
            const colDef: ColDef = {
              headerName: key,
              field: key,
              sortable: true,
              resizable: true,
              filter: true,
            };
            if (index === 0) {
              colDef.checkboxSelection = true;
              colDef.headerCheckboxSelection = true;
            }
            return colDef;
          });
          setColumnDefs(columns);
        } else {
          setColumnDefs([]);
        }
      }
    } catch (error) {
      console.error(`Unexpected error fetching data from table ${tableName}:`, error);
    }
  }, []);

  useEffect(() => {
    if (tableNames.length > 0) {
      setSelectedTable(tableNames[0]);
    }
  }, [tableNames]);

  useEffect(() => {
    if (selectedTable) {
      fetchTableData(selectedTable);
    }
  }, [selectedTable, fetchTableData]);

  const onTableChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTable(event.target.value);
  };

  const onQuickFilterTextChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setQuickFilterText(event.target.value);
  }, []);

  const handleExportExcelData = useCallback(() => {
    console.log('Export button clicked.');

    if (!gridRef.current?.api) {
      console.warn('AgGrid API not yet available');
      return;
    }

    const api = gridRef.current.api;

    try {
      const exportData = [];
      api.forEachNode((node) => {
        if (node.data) {
          exportData.push(node.data);
        }
      });
      console.log('Export data:', exportData); // Log exportData

      if (!exportData || !Array.isArray(exportData) || exportData.length === 0) {
        console.warn('No data to export');
        return;
      }

      const aoaData = exportData.map(item => {
        return columnDefs.map(colDef => {
          return item[colDef.field] !== undefined && item[colDef.field] !== null ? item[colDef.field] : '';
        });
      });

      aoaData.unshift(columnDefs.map(colDef => colDef.headerName || ''));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(aoaData);
      XLSX.utils.book_append_sheet(wb, ws, selectedTable || 'TableData');

      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([new Uint8Array(wbout)], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedTable || 'table_data'}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error during Excel export:', error instanceof Error ? error.message : error);
    }
  }, [columnDefs, selectedTable, gridApi]);

  const onGridReady = useCallback((params) => {
    setGridApi(params.api);
  }, []);

  const onSelectionChanged = useCallback(() => {
    if (gridApi) {
      setSelectedRows(gridApi.getSelectedRows());
    }
  }, [gridApi]);

  const onPageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(event.target.value);
  };

  const calculateGridHeight = useCallback(() => {
    const headerHeight = 128; // Adjust this value based on your header's height
    const otherElementsHeight = 150; // Adjust this value based on the height of elements above the grid
    const padding = 32; // Adjust this value based on the padding of the container

    const availableHeight = window.innerHeight - headerHeight - otherElementsHeight - padding;
    setGridHeight(availableHeight);
  }, []);

  useEffect(() => {
    calculateGridHeight();
    window.addEventListener('resize', calculateGridHeight);
    return () => {
      window.removeEventListener('resize', calculateGridHeight);
    };
  }, [calculateGridHeight]);

  const gridOptions: GridOptions = {
    pagination: pageSize !== 'all',
    paginationPageSize: pageSize === 'all' ? undefined : Number(pageSize),
    statusBar: {
      statusPanels: [
        {
          statusPanel: 'agTotalAndFilteredRowCountComponent',
          align: 'left'
        }
      ],
    },
  };

  return (
    <div className="p-6 w-full">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Table Explorer</h2>

        <div className="mb-4 flex items-center space-x-4">
          <label htmlFor="tableSelect" className="block text-gray-700 text-sm font-bold mb-2 sm:mb-0">
            Select Table:
          </label>
          <select
            id="tableSelect"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline sm:w-auto"
            value={selectedTable}
            onChange={onTableChange}
          >
            {tableNames.map((tableName) => (
              <option key={tableName} value={tableName}>{tableName}</option>
            ))}
          </select>

          <div className="flex-grow">
            <input
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Search..."
              value={quickFilterText}
              onChange={onQuickFilterTextChange}
            />
          </div>
          <label htmlFor="pageSizeSelect" className="block text-gray-700 text-sm font-bold mb-2 sm:mb-0 ml-4">
            Page Size:
          </label>
          <select
            id="pageSizeSelect"
            className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ml-2"
            value={pageSize}
            onChange={onPageSizeChange}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>{size === 'all' ? 'All' : size}</option>
            ))}
          </select>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={handleExportExcelData}
            type="button"
            disabled={!gridApi && !gridRef.current?.api}
          >
            Export to Excel
          </button>
        </div>

        <div>
          <p className="text-sm text-gray-700 mb-2">Selected Rows: {selectedRows.length}</p>
        </div>

        <div className="ag-theme-alpine" style={{ height: gridHeight, width: '100%' }}>
          <AgGridReact
            ref={gridRef}
            columnDefs={columnDefs}
            rowData={rowData}
            defaultColDef={{
              sortable: true,
              resizable: true,
              filter: true,
            }}
            rowSelection="multiple"
            onSelectionChanged={onSelectionChanged}
            quickFilterText={quickFilterText}
            onGridReady={onGridReady}
            gridOptions={gridOptions}
          />
        </div>
      </div>
    </div>
  );
};

export default TableExplorer;
