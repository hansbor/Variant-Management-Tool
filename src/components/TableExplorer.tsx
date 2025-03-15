import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { supabase } from '../lib/supabase';

const staticTableNames = [
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
  const [columnDefs, setColumnDefs] = useState<any[]>([]);
  const [rowData, setRowData] = useState([]);
  const gridRef = useRef<AgGridReact>(null);
  const [quickFilterText, setQuickFilterText] = useState('');


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
        if (data && data.length > 0) {
          const sampleRow = data[0] as Record<string, any>;
          const columns = Object.keys(sampleRow).map(key => ({
            headerName: key,
            field: key,
            sortable: true,
            resizable: true,
            filter: true, // Enable filtering for each column
          }));
          setColumnDefs(columns);
        } else {
          setColumnDefs([]); // No columns if no data
        }
      }
    } catch (error) {
      console.error(`Unexpected error fetching data from table ${tableName}:`, error);
    }
  }, []);


  useEffect(() => {
    if (tableNames.length > 0) {
      setSelectedTable(tableNames[0]); // Select the first table by default
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
        </div>

        <div className="ag-theme-alpine" style={{ height: 600, width: '100%' }}>
          <AgGridReact
            ref={gridRef}
            columnDefs={columnDefs}
            rowData={rowData}
            defaultColDef={{
              sortable: true,
              resizable: true,
              filter: true, // Enable filtering by default for all columns
            }}
            quickFilterText={quickFilterText} // Pass quickFilterText to AgGridReact
          />
        </div>
      </div>
    </div>
  );
};

export default TableExplorer;
