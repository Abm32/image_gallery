import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Printer, Edit, Check, X, XOctagon } from "lucide-react";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Modal = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
      <div className="relative w-auto max-w-3xl mx-auto my-6">
        <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none">
          <div className="flex items-start justify-between p-5 border-b border-solid rounded-t border-blueGray-200">
            <h3 className="text-3xl font-semibold">{title}</h3>
            <button
              className="float-right p-1 ml-auto text-3xl font-semibold leading-none text-black bg-transparent border-0 outline-none opacity-5 focus:outline-none"
              onClick={onClose}
            >
              <span className="block w-6 h-6 text-2xl text-black bg-transparent opacity-5 focus:outline-none">
                ×
              </span>
            </button>
          </div>
          <div className="relative flex-auto p-6">{children}</div>
          {footer && (
            <div className="flex items-center justify-end p-6 border-t border-solid rounded-b border-blueGray-200">
              {footer}
            </div>
          )}
        </div>
      </div>
      <div className="fixed inset-0 z-40 bg-black opacity-25"></div>
    </div>
  );
};

const IRItemsTable = ({
  indentID,
  calculateTotalAmount,
  isDraft,
  isEditable = true,
  onSubmit,
  onPrint,
  onCloseIndent,
  forceClosureStatus,
  userId,
  isClosed = false,
  indentStatus = { l1a: 0, l1: 0, l2: 0, po: 0, ph: 0, ir: 0 },
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [receivingQuantities, setReceivingQuantities] = useState({});
  const [editModes, setEditModes] = useState({});
  const [tempQuantities, setTempQuantities] = useState({});
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [itemsWithDifference, setItemsWithDifference] = useState([]);
  const [newItem, setNewItem] = useState({
    categoryID: "",
    itemID: "",
    quantity: 1,
    stock: 0,
    total: 0,
    remarks: "",
    normalDays: 0,
    promisedDate: "",
  });

  // Fetch categories and items when the component mounts
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [categoryResponse, itemResponse, indentItemsResponse] =
          await Promise.all([
            axios.get(`${API_BASE_URL}/dropdown/mcatdrop`),
            axios.get(`${API_BASE_URL}/dropdown/mitemdrop`),
            axios.get(`${API_BASE_URL}/viewTable/indentitems`, {
              params: { indentId: indentID },
            }),
          ]);

        setCategories(categoryResponse.data || []);
        setAllItems(itemResponse.data || []);

        const fetchedItems = indentItemsResponse.data
          .filter((item) => item.IndentID === indentID)
          .map((item) => ({
            indentItemID: item.IndentItemID,
            itemName: item.ItemName,
            quantity: item.Quantity,
            quantityReceived: item.QuantityReceived || 0,
            difference: item.Difference || 0,
            stock: item.Stock || 0,
            categoryID: item.CategoryID,
            itemID: item.ItemID,
            remarks: item.Description,
            promisedDate: item.PromisedDate,
            accountingUnitID: item.AccountingUnitID,
            unitname: item.UnitName,
          }));

        setItems(fetchedItems);
      } catch (error) {
        console.error(
          "Detailed error fetching data:",
          error.response?.data || error.message
        );
        setCategories([]);
        setAllItems([]);
        setItems([]);
      }
    };

    if (indentID) {
      fetchAllData();
    }
  }, [indentID]);

  const handleCloseIndent = async () => {
    // Check if all items have zero difference
    const hasNonZeroDifference = items.some((item) => item.difference !== 0);

    if (hasNonZeroDifference) {
      // Open modal to show items with differences and force close option
      setItemsWithDifference(
        items
          .filter((item) => item.difference !== 0)
          .map((item) => ({
            itemName: item.itemName,
            difference: item.difference,
          }))
      );
      setIsCloseModalOpen(true);
    } else {
      // If all differences are zero, proceed with closing
      try {
        const response = await axios.post(
          `${API_BASE_URL}/irpage/indents/close`,
          {
            indentId: indentID,
            userId: userId,
            forceClose: false,
          }
        );
        console.log("Indent closed successfully:", response.data);
      } catch (error) {
        console.error("Detailed Close Indent Error:", {
          errorMessage: error.message,
          responseData: error.response?.data,
          responseStatus: error.response?.status,
          errorStack: error.stack,
        });
        setError(
          error.response?.data?.details ||
            error.response?.data?.error ||
            "Failed to close indent"
        );
      }
    }
  };

  const handleQuantityReceived = async (index, quantityReceived) => {
    const currentItem = items[index];

    const safeQuantityReceived =
      quantityReceived === "" ? 0 : Number(quantityReceived);

    const difference = currentItem.quantity - safeQuantityReceived;

    try {
      const response = await axios.put(
        `${API_BASE_URL}/irpage/indentitems/${currentItem.indentItemID}`,
        {
          QuantityReceived: safeQuantityReceived,
          Difference: difference,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const updatedItems = [...items];
      updatedItems[index] = {
        ...updatedItems[index],
        quantityReceived: safeQuantityReceived,
        difference,
      };

      setItems(updatedItems);
      setEditModes((prev) => ({ ...prev, [currentItem.indentItemID]: false }));
    } catch (error) {
      console.error("Detailed Error in Quantity Update:", {
        errorMessage: error.message,
        responseData: error.response?.data,
        responseStatus: error.response?.status,
      });

      setError(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to update received quantity"
      );
    }
  };

  const toggleEditMode = (itemId, currentQuantity) => {
    setEditModes((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));

    // Set temporary quantity when entering edit mode
    if (!editModes[itemId]) {
      setTempQuantities((prev) => ({
        ...prev,
        [itemId]: currentQuantity,
      }));
    }
  };

  const handleQuantityChange = (itemId, value) => {
    setTempQuantities((prev) => ({
      ...prev,
      [itemId]: value,
    }));
  };

  const handleCategoryChange = (categoryId) => {
    const parsedCategoryId = parseInt(categoryId, 10);

    // Find the selected category to get normalDays
    const selectedCategory = categories.find(
      (cat) => cat.CategoryID === parsedCategoryId
    );

    // Calculate promised date
    const currentDate = new Date();
    const promisedDate = new Date(currentDate);
    promisedDate.setDate(
      currentDate.getDate() + (selectedCategory?.NormalDays || 0)
    );

    setNewItem((prev) => ({
      ...prev,
      categoryID: parsedCategoryId,
      itemID: "",
      normalDays: selectedCategory?.NormalDays || 0,
      promisedDate: promisedDate.toISOString().split("T")[0],
    }));

    const filtered = allItems.filter(
      (item) => item.CategoryID === parsedCategoryId
    );

    setFilteredItems(filtered);
  };

  const isSubmittedStage =
    indentStatus.l1a === 1 &&
    indentStatus.l1 === 1 &&
    indentStatus.l2 === 1 &&
    indentStatus.po === 1 &&
    indentStatus.ph === 1 &&
    indentStatus.ir === 1;

  return (
    <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
      {isClosed && (
        <div
          className={`
            ${
              forceClosureStatus
                ? "bg-yellow-100 border-yellow-400 text-yellow-700"
                : "bg-green-100 border-green-400 text-green-700"
            }
            px-4 py-3 rounded mb-4
          `}
        >
          {forceClosureStatus
            ? "This Indent was Force Closed"
            : "This Indent has been Closed"}
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <div className="flex justify-between items-center border-b pb-4 mb-4">
        <h2 className="text-xl font-bold text-gray-800">Invoice Items</h2>

        <div className="flex items-center space-x-2">
          {/* Print Button */}
          <button
            className="text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors duration-300"
            onClick={onPrint}
            title="Print Invoice"
          >
            <PrinterButton
  getPDFComponent={getPDFComponent}
  filename={
    indentID && ProjectName 
      ? `indent-${indentID}-${ProjectName?.replace(/\s+/g, '-')}` 
      : 'indent' 
  }
  fetchData={fetchIndentData}
  onError={(error) => setPdfError("Failed to generate PDF. Please try again.")}
/>          </button>

          {/* Add Item Button */}
          {!isSubmittedStage && isDraft && isEditable && (
            <button
              className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors duration-300"
              onClick={() => setModalOpen(true)}
              title="Add Item"
            >
              <Plus size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Close Indent Modal */}
      <Modal
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        title="Close Indent"
        footer={
          <>
            <button
              className="px-6 py-2 mb-1 mr-1 text-sm font-bold text-red-500 uppercase transition-all duration-150 ease-linear outline-none background-transparent focus:outline-none"
              type="button"
              onClick={() => setIsCloseModalOpen(false)}
            >
              Cancel
            </button>
            <button
              className="px-6 py-2 mb-1 mr-1 text-sm font-bold text-white uppercase bg-red-500 rounded shadow outline-none active:bg-red-600 hover:shadow-lg focus:outline-none"
              type="button"
              onClick={() => {
                // Proceed with force close
                handleCloseIndent(true);
                setIsCloseModalOpen(false);
              }}
            >
              Force Close
            </button>
          </>
        }
      >
        <p className="mb-4 text-sm text-gray-600">
          The following items have non-zero differences and cannot be closed:
        </p>
        <div className="max-h-60 overflow-y-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left">Item Name</th>
                <th className="text-right">Difference</th>
              </tr>
            </thead>
            <tbody>
              {itemsWithDifference.map((item, index) => (
                <tr key={index} className="border-b">
                  <td>{item.itemName}</td>
                  <td className="text-right text-red-600">{item.difference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-gray-600">
          Do you want to force close this indent?
        </p>
      </Modal>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-gray-600">
          <thead className="bg-gray-100 text-gray-700 uppercase">
            <tr>
              <th className="px-4 py-3 text-left w-12">S.No</th>
              <th className="px-4 py-3 text-left">Item Name</th>
              <th className="px-4 py-3 text-left">AU</th>
              <th className="px-4 py-3 text-center w-24">Quantity</th>
              <th className="px-4 py-3 text-center">Quantity Received</th>
              <th className="px-4 py-3 text-center">Difference</th>
              <th className="px-4 py-3 text-right">Stock</th>
              <th className="px-4 py-3 text-right">Promise Date</th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((item, index) => (
                <tr
                  key={index}
                  className={
                    isClosed
                      ? "bg-gray-50"
                      : "border-b hover:bg-gray-50 transition-colors duration-200"
                  }
                >
                  <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                  <td className="px-4 py-3 font-medium">{item.itemName}</td>
                  <td className="px-4 py-3 font-medium">{item.unitname}</td>
                  <td className="px-4 py-3 text-center">{item.quantity}</td>
                  {isClosed ? (
                    <td className="px-4 py-3 text-center">
                      {item.quantityReceived}
                    </td>
                  ) : (
                    <td className="px-4 py-3 text-center flex items-center justify-center">
                      {editModes[item.indentItemID] ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            className="w-20 border rounded px-2 py-1 text-center"
                            value={tempQuantities[item.indentItemID] || ""}
                            onChange={(e) => {
                              const value =
                                e.target.value === ""
                                  ? 0
                                  : parseInt(e.target.value, 10);
                              handleQuantityChange(item.indentItemID, value);
                            }}
                            min="0"
                          />
                          <button
                            className="text-green-500 hover:bg-green-100 rounded-full p-1"
                            onClick={() =>
                              handleQuantityReceived(
                                index,
                                tempQuantities[item.indentItemID]
                              )
                            }
                          >
                            <Check size={16} />
                          </button>
                          <button
                            className="text-red-500 hover:bg-red-100 rounded-full p-1"
                            onClick={() =>
                              toggleEditMode(
                                item.indentItemID,
                                item.quantityReceived
                              )
                            }
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          {item.quantityReceived}
                          <button
                            className="text-blue-500 hover:bg-blue-100 rounded-full p-1"
                            onClick={() =>
                              toggleEditMode(
                                item.indentItemID,
                                item.quantityReceived
                              )
                            }
                          >
                            <Edit size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  )}

                  <td className="px-4 py-3 text-center">{item.difference}</td>
                  <td className="px-4 py-3 text-right">{item.stock}</td>
                  <td className="px-4 py-3 text-right">{item.promisedDate}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={isClosed ? 7 : 8}
                  className="text-center text-gray-500 py-6"
                >
                  No items added to the invoice
                </td>
              </tr>
            )}
          </tbody>
          {!isClosed && !isSubmittedStage && (
            <tfoot>
              <tr>
                <td colSpan="100%">
                  <div className="mt-4 flex justify-end">
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors duration-300"
                      onClick={handleCloseIndent}
                    >
                      Close Indent
                    </button>
                  </div>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

export default IRItemsTable;
