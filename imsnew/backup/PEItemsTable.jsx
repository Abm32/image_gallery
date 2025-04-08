import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import {
  Trash2,
  Edit,
  Plus,
  Printer,
  X,
  Lightbulb,
  Loader2,
  Check
} from "lucide-react";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Tooltip = ({ content, children }) => {
  const [show, setShow] = useState(false);
  const tooltipRef = useRef(null);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {children}
      </div>
      {show && (
        <div
          ref={tooltipRef}
          className="absolute z-50 p-2 bg-gray-800 text-white text-sm rounded shadow-lg max-w-xs whitespace-normal -top-2 left-full ml-2"
        >
          {content}
        </div>
      )}
    </div>
  );
};

const SearchableSelect = ({ options, value, onChange, placeholder, label }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const filteredOptions = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return options.filter((opt) => 
      opt.label.toLowerCase().includes(searchLower) || 
      opt.value.toString().includes(searchLower)
    );
  }, [options, searchTerm]);

  const selectedOption = useMemo(() => 
    options.find((opt) => opt.value === value),
    [options, value]
  );

  const scrollToOption = useCallback((index) => {
    if (listRef.current && listRef.current.children[index]) {
      const option = listRef.current.children[index];
      const container = listRef.current;
      
      const optionTop = option.offsetTop;
      const optionBottom = optionTop + option.offsetHeight;
      const containerTop = container.scrollTop;
      const containerBottom = containerTop + container.offsetHeight;

      if (optionTop < containerTop) {
        container.scrollTop = optionTop;
      } else if (optionBottom > containerBottom) {
        container.scrollTop = optionBottom - container.offsetHeight;
      }
    }
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
        return;
      }
    }

    if (filteredOptions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => {
          const newIndex = prev < filteredOptions.length - 1 ? prev + 1 : 0;
          scrollToOption(newIndex);
          return newIndex;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => {
          const newIndex = prev > 0 ? prev - 1 : filteredOptions.length - 1;
          scrollToOption(newIndex);
          return newIndex;
        });
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredOptions.length) {
          const selected = filteredOptions[selectedIndex];
          onChange(selected.value);
          setSearchTerm(selected.label);
          setIsOpen(false);
          setSelectedIndex(-1);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        if (selectedOption) {
          setSearchTerm(selectedOption.label);
        }
        break;
    }
  }, [isOpen, filteredOptions, selectedIndex, onChange, selectedOption, scrollToOption]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSelectedIndex(-1);
        if (selectedOption) {
          setSearchTerm(selectedOption.label);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedOption]);

  const handleInputChange = useCallback((e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setIsOpen(true);
    setSelectedIndex(-1);

    if (newValue === "") {
      onChange("");
    }
  }, [onChange]);

  return (
    <div className="relative mb-4" ref={dropdownRef}>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          className="border rounded w-full px-3 py-2 pr-8"
          placeholder={`Search ${placeholder} by name or ID`}
          value={isOpen ? searchTerm : selectedOption?.label ?? searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsOpen(true);
            setSearchTerm("");
            setSelectedIndex(-1);
          }}
        />
        {(selectedOption || searchTerm) && (
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={(e) => {
              e.stopPropagation();
              setSearchTerm("");
              onChange("");
              setIsOpen(false);
              setSelectedIndex(-1);
              inputRef.current?.focus();
            }}
          >
            <X size={16} />
          </button>
        )}
        {isOpen && filteredOptions.length > 0 && (
          <div 
            ref={listRef}
            className="absolute z-50 w-full mt-1 max-h-60 overflow-auto bg-white border rounded shadow-lg"
          >
            {filteredOptions.map((option, index) => (
              <div
                key={option.value}
                className={`px-3 py-2 cursor-pointer flex justify-between items-center ${
                  index === selectedIndex ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
                }`}
                onClick={() => {
                  onChange(option.value);
                  setSearchTerm(option.label);
                  setIsOpen(false);
                  setSelectedIndex(-1);
                }}
              >
                <span>{option.label}</span>
                <span className="text-gray-400 text-sm">ID: {option.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};



const MobileOptimizedModal = ({ onClose, children }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 z-10"
          onClick={onClose}
        >
          <X size={24} />
        </button>
        {children}
      </div>
    </div>
  );
};

const Modal = ({ onClose, children }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-[800px] max-h-[80vh] overflow-y-auto relative">
        <button
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
          onClick={onClose}
        >
          <X size={24} />
        </button>
        {children}
      </div>
    </div>
  );
};

const ItemsTable = ({
  indentID,
  onAddItem,
  onDeleteItem,
  calculateTotalAmount,
  onUpdateItem,
  isDraft,
  isEditable = true,
  onSubmit,
  onSaveDraft,
  onPrint,
  indentStatus = { l1: 0, l2: 0, po: 0, ph: 0, so: 0 },
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [itemsUpdated, setItemsUpdated] = useState(false);
  const [receivedQuantities, setReceivedQuantities] = useState({});
  const [itemDescriptions, setItemDescriptions] = useState({});
  const [loadingDescriptions, setLoadingDescriptions] = useState({});

  const fetchItemDescription = async (itemId) => {
    if (loadingDescriptions[itemId] || itemDescriptions[itemId]) return;

    console.log("Fetching description for item:", itemId);
    setLoadingDescriptions((prev) => ({ ...prev, [itemId]: true }));

    try {
      const response = await axios.get(
        `${API_BASE_URL}/viewTable/itemdescription/${itemId}`,
        { params: { indentId: indentID } }
      );

      console.log("Description API response:", response.data);

      if (response.data && response.data.Description) {
        setItemDescriptions((prev) => ({
          ...prev,
          [itemId]: response.data.Description,
        }));
      }
    } catch (error) {
      console.error("Error fetching description:", error);
    } finally {
      setLoadingDescriptions((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  // Add useEffect to pre-fetch descriptions for all items
  useEffect(() => {
    if (items.length > 0) {
      items.forEach((item) => {
        if (item.itemID && !itemDescriptions[item.itemID]) {
          fetchItemDescription(item.itemID);
        }
      });
    }
  }, [items]);

  const [newItem, setNewItem] = useState({
    categoryID: "",
    itemID: "",
    quantity: "1.000",
    stock: 0,
    remarks: "",
    normalDays: 0,
    promisedDate: "",
    accountingUnitID: "",
    accountingUnitName: "",
  });

  const calculatePromisedDate = (normalDays) => {
    if (!normalDays || isNaN(normalDays)) return "";
    const today = new Date();
    const promiseDate = new Date(today);
    promiseDate.setDate(today.getDate() + parseInt(normalDays));
    return promiseDate.toISOString().split("T")[0]; // Returns in YYYY-MM-DD format
  };

  const handleCategoryChange = (categoryId) => {
    if (!categoryId) {
      setNewItem((prev) => ({
        ...prev,
        categoryID: "",
        itemID: "",
        normalDays: 0,
        promisedDate: "",
        accountingUnitID: "",
        accountingUnitName: "",
      }));
      setFilteredItems([]);
      return;
    }
    const parsedCategoryId = parseInt(categoryId, 10);
    const selectedCategory = categories.find(
      (cat) => cat.CategoryID === parsedCategoryId
    );

    if (selectedCategory) {
      const normalDays = selectedCategory.NormalDays || 0;
      const promisedDate = calculatePromisedDate(normalDays);

      setNewItem((prev) => ({
        ...prev,
        categoryID: parsedCategoryId,
        itemID: "", // Reset itemID
        normalDays: normalDays,
        promisedDate: promisedDate,
        accountingUnitID: "", // Reset accountingUnitID
        accountingUnitName: "", // Reset accountingUnitName
      }));

      const filtered = allItems.filter(
        (item) => item.CategoryID === parsedCategoryId
      );
      setFilteredItems(filtered);
    }
  };

  const handleQuantityChange = (value) => {
    // Allow decimal values up to 3 places
    const regex = /^\d*\.?\d{0,3}$/;
    if (regex.test(value)) {
      setNewItem((prev) => ({
        ...prev,
        quantity: value,
      }));
    }
  };

  useEffect(() => {
    if (newItem.normalDays > 0) {
      const today = new Date();
      const promiseDate = new Date(today);
      promiseDate.setDate(today.getDate() + parseInt(newItem.normalDays));
      const formattedDate = promiseDate.toISOString().split("T")[0];

      setNewItem((prev) => ({
        ...prev,
        promisedDate: formattedDate,
      }));
    }
  }, [newItem.normalDays]);

  // ... existing state
  const [changeLog, setChangeLog] = useState({
    addedItems: [],
    deletedItems: [],
    updatedItems: [],
  });

  useEffect(() => {
    console.log("Items state updated:", items);
  }, [items]);

  useEffect(() => {
    const fetchReceivedQuantities = async () => {
      if (indentStatus.so === 1 && indentID) {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/viewTable/receivedquantities`,
            {
              params: { indentId: indentID },
            }
          );

          // Transform the response into an object with itemID as key
          const quantities = {};
          response.data.forEach((item) => {
            quantities[item.ItemID] = {
              received: item.ReceivedQuantity || 0,
              difference: (item.Quantity || 0) - (item.ReceivedQuantity || 0),
            };
          });

          setReceivedQuantities(quantities);
        } catch (error) {
          console.error("Error fetching received quantities:", error);
        }
      }
    };

    fetchReceivedQuantities();
  }, [indentID, indentStatus.so]);

  // Fetch categories and items when the component mounts
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [
          categoryResponse,
          itemResponse,
          indentItemsResponse,
          accountingUnitsResponse,
        ] = await Promise.all([
          axios.get(`${API_BASE_URL}/dropdown/mcatdrop`),
          axios.get(`${API_BASE_URL}/dropdown/mitemdrop`),
          axios.get(`${API_BASE_URL}/viewTable/indentitems`, {
            params: { indentId: indentID },
          }),
          axios.get(`${API_BASE_URL}/dropdown/maudrop`), // New API call to fetch accounting units
        ]);

        setCategories(categoryResponse.data || []);
        setAllItems(itemResponse.data || []);

        const fetchedItems = indentItemsResponse.data
          .filter((item) => item.IndentID === indentID)
          .map((item) => ({
            indentItemID: item.IndentItemID,
            itemName: item.ItemName,
            quantity: item.Quantity,
            stock: item.Stock || 0,
            categoryID: item.CategoryID,
            itemID: item.ItemID,
            remarks: item.Description,
            promisedDate: item.PromisedDate,
            normalDays: item.NormalDays,
            accountingUnitID: item.AccountingUnitID, // Use the AccountingUnitID from MItem
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

  const refreshItemsData = async () => {
    if (!indentID) return;

    setIsRefreshing(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/viewTable/indentitems`,
        {
          params: { indentId: indentID },
        }
      );

      const fetchedItems = response.data
        .filter((item) => item.IndentID === indentID)
        .map((item) => ({
          indentItemID: item.IndentItemID,
          itemName: item.ItemName,
          quantity: item.Quantity,
          stock: item.Stock || 0,
          categoryID: item.CategoryID,
          itemID: item.ItemID,
          remarks: item.Description,
          promisedDate: item.PromisedDate,
          normalDays: item.NormalDays,
          accountingUnitID: item.AccountingUnitID,
          unitname: item.UnitName, // Make sure this is included
        }));

      setItems(fetchedItems);
    } catch (error) {
      console.error("Error refreshing items:", error);
      setError("Failed to refresh items. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleItemChange = (itemId) => {
    const parsedItemId = parseInt(itemId, 10);

    // Find the selected item
    const selectedItem = filteredItems.find(
      (item) => item.ItemID === parsedItemId
    );

    if (selectedItem) {
      // Keep the existing promised date and normal days when changing items
      setNewItem((prev) => ({
        ...prev,
        itemID: parsedItemId,
        accountingUnitID: selectedItem?.AccountingUnitID || "",
        accountingUnitName: selectedItem?.UnitName || "",
        stock: selectedItem?.Stock || 0,
      }));
    }
  };

  const handleNewItemFieldChange = (field, value) => {
    if (field === "quantity") {
      // Allow up to 3 decimal places for quantity
      const formattedValue = parseFloat(value).toFixed(3);
      setNewItem((prev) => ({
        ...prev,
        [field]: formattedValue,
      }));
    } else if (field === "normalDays") {
      const promisedDate = calculatePromisedDate(value);
      setNewItem((prev) => ({
        ...prev,
        [field]: value,
        promisedDate: promisedDate,
      }));
    } else {
      setNewItem((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleAddNewItem = async () => {
    if (!newItem.quantity || parseFloat(newItem.quantity) <= 0) {
      setError("Please enter a valid quantity");
      return;
    }

    const formattedQuantity = parseFloat(newItem.quantity).toFixed(3);

    // Check for duplicate item
    const isDuplicateItem = items.some(
      (existingItem) => existingItem.itemID === newItem.itemID
    );

    if (isDuplicateItem) {
      setError(
        `Item "${
          filteredItems.find((item) => item.ItemID === newItem.itemID)?.ItemName
        }" is already added. Please edit the existing item or choose a different one.`
      );
      return;
    }

    const selectedItem = filteredItems.find(
      (item) => item.ItemID === newItem.itemID
    );

    const accountingUnitID = selectedItem
      ? selectedItem.AccountingUnitID
      : null;

    if (!accountingUnitID) {
      setError(
        "Could not determine the Accounting Unit for the selected item."
      );
      return;
    }

    try {
      // Add the new item with promised date
      await axios.post(`${API_BASE_URL}/viewTable/indentitems`, {
        IndentID: indentID,
        ItemID: newItem.itemID,
        Quantity: formattedQuantity,
        Description: newItem.remarks || "",
        AccountingUnitID: accountingUnitID,
        CategoryID: newItem.categoryID,
        Stock: newItem.stock,
        PromisedDate: newItem.promisedDate,
        NormalDays: newItem.normalDays,
      });

      // Track changes and notify parent
      const addedItem = {
        itemID: newItem.itemID,
        quantity: formattedQuantity,
        stock: newItem.stock,
        categoryID: newItem.categoryID,
        remarks: newItem.remarks,
        promisedDate: newItem.promisedDate,
        normalDays: newItem.normalDays,
      };

      // Notify parent component about the change - this will trigger the loading state
      onUpdateItem &&
        onUpdateItem({
          type: "add",
          item: addedItem,
          changeLog,
        });

      // Reset form and clear error
      setNewItem({
        categoryID: "",
        itemID: "",
        quantity: 1,
        stock: 0,
        total: 0,
        remarks: "",
        normalDays: 0,
        promisedDate: "",
        accountingUnitID: "",
        accountingUnitName: "",
      });

      setModalOpen(false);
      setError(null);
    } catch (error) {
      console.error("Error adding item:", error.response?.data || error);
      setError(
        error.response?.data?.error || "Failed to add item. Please try again."
      );
    }
  };

  const handleDeleteItem = async (index) => {
    const itemToDelete = items[index];
    try {
      await axios.delete(
        `${API_BASE_URL}/viewTable/indentitems/${itemToDelete.itemID}`,
        {
          // Use query parameters instead of request body
          params: {
            indentID: indentID,
            itemID: itemToDelete.itemID,
          },
        }
      );

      // Immediately refresh the items
      await refreshItemsData();

      if (onDeleteItem) {
        onDeleteItem(index);
      }

      const updatedItems = items.filter((_, i) => i !== index);
      setItems(updatedItems);

      // Track deleted item
      setChangeLog((prev) => ({
        ...prev,
        deletedItems: [...prev.deletedItems, itemToDelete],
      }));

      // Notify parent component about the change
      onUpdateItem &&
        onUpdateItem({
          type: "delete",
          item: itemToDelete,
          changeLog,
        });
    } catch (error) {
      console.error("Error deleting item:", error.response?.data || error);
      alert("Failed to delete item. Please try again.");
    }
  };

  const handleEditItem = (item, index) => {
    setEditingItem({
      ...item,
      index: index,
      indentItemID: item.indentItemID,
      description: itemDescriptions[item.itemID] || '',
      isEditingDescription: false
    });
    setItemsUpdated(true);
  };

  const handleUpdateDescription = async (itemId, newDescription) => {
    
    try {
      await axios.put(`${API_BASE_URL}/viewTable/itemdescription/${itemId}`, {
        Description: newDescription,
        IndentID: indentID
      });

      setItemDescriptions(prev => ({
        ...prev,
        [itemId]: newDescription
      }));

      setEditingItem(prev => ({
        ...prev,
        description: newDescription,
        isEditingDescription: false
      }));

    } catch (error) {
      console.error("Error updating description:", error);
      setError("Failed to update description. Please try again.");
    }
  };


  const handleUpdateItem = async () => {
    try {
      if (!editingItem?.itemID || !editingItem?.indentItemID) {
        setError("Invalid item ID");
        return;
      }

      const formattedQuantity = parseFloat(editingItem.quantity).toFixed(3);

      await axios.put(
        `${API_BASE_URL}/viewTable/indentitems/${editingItem.indentItemID}`,
        {
          Quantity: formattedQuantity,
          Stock: editingItem.stock,
          Description: editingItem.description  // Add description to the update
        }
      );

      // Update local description state
      setItemDescriptions(prev => ({
        ...prev,
        [editingItem.itemID]: editingItem.description
      }));

      await refreshItemsData();

      setEditingItem(null);
      const updatedItems = items.map((item) => {
        if (item.indentItemID === editingItem.indentItemID) {
          return {
            ...item,
            quantity: formattedQuantity,
            stock: editingItem.stock,
            remarks: editingItem.description  // Update remarks in items array
          };
        }
        return item;
      });

      onUpdateItem({
        type: "update",
        item: editingItem,
        items: updatedItems,
      });

      setEditingItem(null);
    } catch (error) {
      console.error("Error updating item:", error);
      setError("Failed to update item. Please try again.");
    }
  };

  useEffect(() => {
    if (indentID) {
      refreshItemsData();
    }
  }, [indentID]);
  // Refresh items data after updates
  useEffect(() => {
    const refreshItems = async () => {
      if (itemsUpdated && indentID) {
        try {
          console.log("Refreshing items data...");
          const response = await axios.get(
            `${API_BASE_URL}/viewTable/indentitems`,
            {
              params: { indentId: indentID },
            }
          );

          const fetchedItems = response.data
            .filter((item) => item.IndentID === indentID)
            .map((item) => ({
              indentItemID: item.IndentItemID,
              itemName: item.ItemName,
              quantity: item.Quantity,
              stock: item.Stock || 0,
              categoryID: item.CategoryID,
              itemID: item.ItemID,
              remarks: item.Description,
              promisedDate: item.PromisedDate,
              normalDays: item.NormalDays,
              accountingUnitID: item.AccountingUnitID,
              unitname: item.UnitName,
            }));

          console.log("Refreshed items data:", fetchedItems);
          setItems(fetchedItems);
          setItemsUpdated(false);
        } catch (error) {
          console.error("Error refreshing items:", error);
        }
      }
    };

    refreshItems();
  }, [itemsUpdated, indentID]);

  const handleFinalSubmit = async () => {
    try {
      console.log("Starting final submit with items:", items);

      // Format items for submission
      const formattedItems = items.map((item) => {
        const formatted = {
          itemID: item.itemID,
          quantity: item.quantity,
          stock: item.stock,
          categoryID: item.categoryID,
          remarks: item.remarks,
          promisedDate: item.promisedDate,
        };
        console.log("Formatted item for submission:", formatted);
        return formatted;
      });

      console.log("Submitting with formatted items:", formattedItems);

      // Call the parent's submit handler
      await onSubmit({
        indentId: indentID,
        userId: localStorage.getItem("userId"),
        items: formattedItems,
      });

      setItemsUpdated(false);
    } catch (error) {
      console.error("Error during final submit:", error);
      setError("Failed to submit. Please try again.");
    }
  };

  const isSubmittedStage = indentStatus.l1 === 1;

  const renderDescriptionCell = (itemId) => {
    if (editingItem?.itemID === itemId && editingItem.isEditingDescription) {
      return (
        <div className="flex items-center space-x-2">
          <input
            type="text"
            className="border rounded px-2 py-1 text-sm w-32"
            value={editingItem.description}
            onChange={(e) => 
              setEditingItem(prev => ({
                ...prev,
                description: e.target.value
              }))
            }
          />
          <button
            className="text-green-500 hover:text-green-600"
            onClick={() => handleUpdateDescription(itemId, editingItem.description)}
          >
            <Check size={18} />
          </button>
          <button
            className="text-gray-500 hover:text-gray-600"
            onClick={() => 
              setEditingItem(prev => ({
                ...prev,
                isEditingDescription: false,
                description: itemDescriptions[itemId] || ''
              }))
            }
          >
            <X size={18} />
          </button>
        </div>
      );
    }

    if (loadingDescriptions[itemId]) {
      return (
        <div className="w-[18px] h-[18px] mx-auto flex items-center justify-center">
          <Loader2 size={18} className="animate-spin text-blue-500" />
        </div>
      );
    }

    const description = itemDescriptions[itemId];
    return (
      <div className="flex items-center space-x-2">
        <Tooltip content={description || 'No description available'}>
          <button
            className={`${description ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-gray-600'} transition-colors duration-200`}
            onClick={() => {
              if (!description) {
                fetchItemDescription(itemId);
              }
              if (!isDraft || editingItem?.itemID !== itemId) {
                return;
              }
              setEditingItem(prev => ({
                ...prev,
                isEditingDescription: true
              }));
            }}
          >
            <Lightbulb size={18} />
          </button>
        </Tooltip>
        {isDraft && editingItem?.itemID === itemId && !editingItem.isEditingDescription && (
          <button
            className="text-blue-500 hover:text-blue-600"
            onClick={() => 
              setEditingItem(prev => ({
                ...prev,
                isEditingDescription: true
              }))
            }
          >
            <Edit size={14} />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
      {/* If you want to show a global error */}
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

          {!isSubmittedStage && isDraft && isEditable && (
            /* Add Item Button - Circular */
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

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-gray-600">
          <thead className="bg-gray-100 text-gray-700 uppercase">
            <tr>
              <th className="px-4 py-3 text-left w-12">S.No</th>
              <th className="px-4 py-3 text-left">Item Name</th>
              <th className="px-4 py-3 text-center w-8"></th>
              <th className="px-4 py-3 text-left">AU</th>
              <th className="px-4 py-3 text-center w-24">Quantity</th>
              <th className="px-4 py-3 text-right">Stock</th>
              <th className="px-4 py-3 text-right">Promised Date</th>
              <th className="px-4 py-3 text-right">Promised Days</th>
              {indentStatus.so === 1 && (
                <>
                  <th className="px-4 py-3 text-right">Received Qty</th>
                  <th className="px-4 py-3 text-right">Difference</th>
                </>
              )}
              {!isSubmittedStage && (
                <th className="px-4 py-3 text-center w-24">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((item, index) => (
                <tr
                  key={index}
                  className="border-b hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                  <td className="px-4 py-3 font-medium">{item.itemName}</td>
                  <td className="px-4 py-3 text-center">
                    {renderDescriptionCell(item.itemID)}
                  </td>
                  <td className="px-4 py-3 font-medium">{item.unitname}</td>
                  {/* Edit mode for quantity and stock */}
                  {editingItem && editingItem.index === index ? (
                    <>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          className="w-full border rounded px-2 py-1"
                          value={editingItem.quantity}
                          onChange={(e) =>
                            setEditingItem((prev) => ({
                              ...prev,
                              quantity: e.target.value,
                            }))
                          }
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          className="w-full border rounded px-2 py-1"
                          value={editingItem.stock}
                          onChange={(e) =>
                            setEditingItem((prev) => ({
                              ...prev,
                              stock: parseFloat(e.target.value),
                            }))
                          }
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        {item.promisedDate}
                      </td>
                      {!isSubmittedStage && (
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center space-x-2">
                            <button
                              className="text-green-500 hover:text-green-700"
                              onClick={handleUpdateItem}
                            >
                              Save
                            </button>
                            <button
                              className="text-gray-500 hover:text-gray-700"
                              onClick={() => setEditingItem(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      )}
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 text-center">
                        {parseFloat(item.quantity).toFixed(3)}
                      </td>
                      <td className="px-4 py-3 text-right">{item.stock}</td>
                      <td className="px-4 py-3 text-right">
                        {new Date(item.promisedDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {item.normalDays}
                      </td>
                      {indentStatus.so === 1 && (
                        <>
                          <td className="px-4 py-3 text-right">
                            {receivedQuantities[item.itemID]?.received || 0}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {receivedQuantities[item.itemID]?.difference || 0}
                          </td>
                        </>
                      )}
                      {!isSubmittedStage && (
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center space-x-2">
                            {isDraft && isEditable && (
                              <>
                                <button
                                  className="text-blue-500 hover:text-blue-700"
                                  onClick={() => handleEditItem(item, index)}
                                >
                                  <Edit size={18} />
                                </button>
                                <button
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => handleDeleteItem(index)}
                                >
                                  <Trash2 size={18} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      )}
                    </>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={!isSubmittedStage ? 7 : 6}
                  className="text-center text-gray-500 py-6"
                >
                  No items added to the invoice
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 pt-4 border-t flex justify-between items-center">
        {/*<div className="text-lg font-bold text-gray-800">
              Total Invoice Amount:
              <span className="text-green-600 ml-2">
                ₹{calculateTotal().toLocaleString()}
              </span>
            </div>*/}
        <div className="flex space-x-4">
          {isSubmittedStage ? (
            <button
              className="bg-green-600 text-white px-5 py-2 rounded-md cursor-not-allowed opacity-50"
              disabled
            >
              Submitted
            </button>
          ) : (
            <>
              {isDraft && isEditable && (
                <>
                  <button
                    className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded-md transition-colors duration-300"
                    onClick={() => {
                      if (onSaveDraft) {
                        onSaveDraft();
                      }
                    }}
                    disabled={items.length === 0 || !isDraft}
                  >
                    Save Draft
                  </button>
                  <button
                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md transition-colors duration-300"
                    onClick={handleFinalSubmit}
                    disabled={items.length === 0 || !isDraft}
                  >
                    Submit Indent
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {modalOpen && (
        <>
          {/* Desktop Modal - Hidden on smaller screens */}
          <div className="hidden md:block">
            <Modal
              onClose={() => {
                setModalOpen(false);
                setError(null);
              }}
            >
              <div className="flex">
                {/* Left Column: Input Fields */}
                <div className="w-1/2 pr-4">
                  {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                      {error}
                    </div>
                  )}
                  <h2 className="text-xl font-bold mb-4">Add New Item</h2>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAddNewItem();
                    }}
                  >
                    <SearchableSelect
                      options={categories.map((cat) => ({
                        value: cat.CategoryID,
                        label: cat.CategoryName,
                      }))}
                      value={newItem.categoryID}
                      onChange={(value) => handleCategoryChange(value)}
                      placeholder="categories"
                      label="Category"
                    />

                    {newItem.categoryID && (
                      <SearchableSelect
                        options={filteredItems.map((item) => ({
                          value: item.ItemID,
                          label: item.ItemName,
                        }))}
                        value={newItem.itemID}
                        onChange={(value) => handleItemChange(value)}
                        placeholder="items"
                        label="Item"
                      />
                    )}
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">
                        Quantity
                      </label>
                      <input
                        type="text"
                        className="border rounded w-full px-3 py-2"
                        value={newItem.quantity}
                        onChange={(e) => handleQuantityChange(e.target.value)}
                        placeholder="Enter quantity (up to 3 decimal places)"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium">Stock</label>
                      <input
                        type="number"
                        className="border rounded w-full px-3 py-2"
                        value={newItem.stock}
                        onChange={(e) =>
                          handleNewItemFieldChange(
                            "stock",
                            parseFloat(e.target.value)
                          )
                        }
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium">
                        Remarks
                      </label>
                      <textarea
                        className="border rounded w-full px-3 py-2"
                        value={newItem.remarks}
                        onChange={(e) =>
                          handleNewItemFieldChange("remarks", e.target.value)
                        }
                        placeholder="Optional remarks about the item"
                        rows="3"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-green-500 text-white px-4 py-2 rounded"
                    >
                      Add Item
                    </button>
                    <button
                      type="button"
                      className="bg-gray-400 text-white px-4 py-2 rounded flex-grow"
                      onClick={() => setModalOpen(false)}
                    >
                      Cancel
                    </button>
                  </form>
                </div>

                {/* Right Column: Promise Date Info */}
                {/* Right Column: Promise Date Info */}
                <div className="w-1/2 pl-4 border-l">
                  <h3 className="text-lg font-semibold mb-4">
                    Delivery Details
                  </h3>
                  {newItem.categoryID ? (
                    <>
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">
                          Normal Days
                        </label>
                        <input
                          type="text"
                          className="border rounded w-full px-3 py-2 bg-gray-100"
                          value={newItem.normalDays || "Not set"}
                          readOnly
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">
                          Promised Date
                        </label>
                        <input
                          type="text"
                          className="border rounded w-full px-3 py-2 bg-gray-100"
                          value={
                            newItem.promisedDate
                              ? new Date(
                                  newItem.promisedDate
                                ).toLocaleDateString()
                              : "Not set"
                          }
                          readOnly
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">
                          Accounting Unit
                        </label>
                        <input
                          type="text"
                          className="border rounded w-full px-3 py-2 bg-gray-100"
                          value={newItem.accountingUnitName || "Not set"}
                          readOnly
                        />
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500">
                      Select a category to view delivery details
                    </p>
                  )}
                </div>
              </div>
            </Modal>
          </div>

          <div className="block md:hidden">
            <MobileOptimizedModal
              onClose={() => {
                setModalOpen(false);
                setError(null);
              }}
            >
              <div className="flex flex-col md:flex-row p-6">
                {/* Mobile-First Approach: Stacked Layout */}
                <div className="w-full">
                  {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                      {error}
                    </div>
                  )}
                  <h2 className="text-xl font-bold mb-4">Add New Item</h2>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAddNewItem();
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Category
                      </label>
                      <select
                        className="border rounded w-full px-3 py-2 mobile:text-base"
                        value={newItem.categoryID || ""}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        required
                      >
                        <option value="" disabled>
                          Select a Category
                        </option>
                        {categories.map((category) => (
                          <option
                            key={category.CategoryID}
                            value={category.CategoryID}
                          >
                            {category.CategoryName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Item
                      </label>
                      <select
                        className="border rounded w-full px-3 py-2 mobile:text-base"
                        value={newItem.itemID || ""}
                        onChange={(e) => handleItemChange(e.target.value)}
                        disabled={!newItem.categoryID}
                        required
                      >
                        <option value="" disabled>
                          Select an Item
                        </option>
                        {filteredItems.length > 0 ? (
                          filteredItems.map((item) => (
                            <option key={item.ItemID} value={item.ItemID}>
                              {item.ItemName}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>
                            No items available
                          </option>
                        )}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          className="border rounded w-full px-3 py-2 mobile:text-base"
                          value={newItem.quantity}
                          onChange={(e) =>
                            handleNewItemFieldChange(
                              "quantity",
                              parseInt(e.target.value, 10)
                            )
                          }
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Stock
                        </label>
                        <input
                          type="number"
                          className="border rounded w-full px-3 py-2 mobile:text-base"
                          value={newItem.stock}
                          onChange={(e) =>
                            handleNewItemFieldChange(
                              "stock",
                              parseFloat(e.target.value)
                            )
                          }
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Remarks
                      </label>
                      <textarea
                        className="border rounded w-full px-3 py-2 mobile:text-base"
                        value={newItem.remarks}
                        onChange={(e) =>
                          handleNewItemFieldChange("remarks", e.target.value)
                        }
                        placeholder="Optional remarks about the item"
                        rows="3"
                      />
                    </div>
                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        className="flex-1 bg-green-500 text-white px-4 py-2 rounded mobile:text-base"
                      >
                        Add Item
                      </button>
                      <button
                        type="button"
                        className="flex-1 bg-gray-400 text-white px-4 py-2 rounded mobile:text-base"
                        onClick={() => setModalOpen(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>

                {/* Delivery Details Section - Collapsible on Mobile */}
                <div className="w-1/2 pl-4 border-l">
                  <h3 className="text-lg font-semibold mb-4">
                    Delivery Details
                  </h3>
                  {newItem.categoryID ? (
                    <>
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">
                          Normal Days
                        </label>
                        <input
                          type="text"
                          className="border rounded w-full px-3 py-2 bg-gray-100"
                          value={newItem.normalDays || "Not set"}
                          readOnly
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">
                          Promised Date
                        </label>
                        <input
                          type="text"
                          className="border rounded w-full px-3 py-2 bg-gray-100"
                          value={
                            newItem.promisedDate
                              ? new Date(
                                  newItem.promisedDate
                                ).toLocaleDateString()
                              : "Not set"
                          }
                          readOnly
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">
                          Accounting Unit
                        </label>
                        <input
                          type="text"
                          className="border rounded w-full px-3 py-2 bg-gray-100"
                          value={newItem.accountingUnitName || "Not set"}
                          readOnly
                        />
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500">
                      Select a category to view delivery details
                    </p>
                  )}
                </div>
              </div>
            </MobileOptimizedModal>
          </div>
        </>
      )}
    </div>
  );
};

export default ItemsTable;