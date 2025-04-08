import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { ChevronLeft, ChevronRight, Upload } from "lucide-react";
import ActionBar from "./MItemActionBar/ActionBar";
import DynamicTable from "../../../components/Table/MTable";
import Header from "../../../components/Header/Header";
import Footer from "../../../components/Footer/Footer";
import { useSelector } from "react-redux";

const MItems = () => {
  const [items, setItems] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const { role } = useSelector((state) => state.auth);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const itemsPerPage = isMobile ? 5 : 10;
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const apiEndpoint = `${API_BASE_URL}/mitem/mitems`;

  const handleFileImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    setImporting(true);
    setImportError("");

    try {
      await axios.post(`${apiEndpoint}/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      await fetchItems();
      alert("File imported successfully!");
    } catch (error) {
      setImportError(error.response?.data?.error || "Error importing file");
    } finally {
      setImporting(false);
    }
  };

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(apiEndpoint);
      setItems(response.data);
    } catch (err) {
      setError("Failed to fetch items. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [fetchItems]);

  const filteredItems = items.filter((item) =>
    item.ItemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.CategoryID.toString().includes(searchQuery) ||
    item.CategoryName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const renderMobileView = () => (
    <div className="space-y-4 p-4">
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        currentItems.map((item) => (
          <div 
            key={item.ItemID} 
            className={`p-4 border rounded-lg shadow-sm ${
              selectedRow?.ItemID === item.ItemID ? 'bg-blue-50 border-blue-300' : 'bg-white'
            }`}
            onClick={() => setSelectedRow(item)}
          >
            <div className="flex justify-between">
              <h3 className="text-lg font-semibold">{item.ItemName}</h3>
              <span className="text-gray-500">ID: {item.ItemID}</span>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              <p>Category: {item.CategoryName}</p>
              <p>Description: {item.Description}</p>
              <p>Unit: {item.UnitName}</p>
            </div>
          </div>
        ))
      )}

      <div className="flex justify-between items-center mt-4">
        <button 
          onClick={() => paginate(currentPage - 1)} 
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 flex items-center"
        >
          <ChevronLeft size={20} /> Previous
        </button>
        <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>
        <button 
          onClick={() => paginate(currentPage + 1)} 
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 flex items-center"
        >
          Next <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header exportEndpoint={apiEndpoint} />
      <div className="flex-grow">
        <div className="flex justify-between items-center p-4">
          <ActionBar
            apiEndpoint={apiEndpoint}
            selectedRow={selectedRow}
            onRowSelect={setSelectedRow}
            refreshData={fetchItems}
            rowKey="ItemID"
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            userRole={role}
          />

          <div className="flex items-center">
            <label className="relative cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center">
              <Upload className="mr-2" size={20} />
              {importing ? "Importing..." : "Import CSV/ODS"}
              <input
                type="file"
                className="hidden"
                accept=".csv,.ods"
                onChange={handleFileImport}
                disabled={importing}
              />
            </label>
            {importError && (
              <div className="text-red-500 ml-2">{importError}</div>
            )}
          </div>
        </div>

        <div className="mt-6 mb-2 text-center">
          <h3 className="text-xl font-semibold">Item Table</h3>
        </div>

        {isMobile ? (
          renderMobileView()
        ) : (
          <DynamicTable
            data={currentItems}
            columns={[
              { key: "ItemID", label: "Item ID" },
              { key: "CategoryName", label: "Category Name" },
              { key: "ItemName", label: "Item Name" },
              { key: "Description", label: "Description" },
              { key: "UnitName", label: "Unit Name" },
            ]}
            rowKey="ItemID"
            selectedRow={selectedRow}
            onRowSelect={setSelectedRow}
          />
        )}

        {!isMobile && (
          <div className="flex justify-center mt-4">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => paginate(i + 1)}
                className={`mx-1 px-3 py-1 rounded ${
                  currentPage === i + 1 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default MItems;