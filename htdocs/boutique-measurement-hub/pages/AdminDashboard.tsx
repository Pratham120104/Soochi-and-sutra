import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from '../components/Header';
import { updateCustomer } from '../services/api'; // Keep updateCustomer for now
import { OrderStatus, type CustomerData } from '../types'; // Assuming these exist
import Spinner from '../components/Spinner';
import Input from '../components/Input';
import SelectInput from '../components/SelectInput';
import ImageUpload from '../components/ImageUpload';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { getOrdersFromBackend, getCustomerByIdFromBackend, updateOrderInBackend, getCustomersFromBackend } from '../services/backendApi';

type SortKey = 'name' | 'lastUpdated' | 'orderStatus';
type SortDirection = 'asc' | 'desc';

const designationOptions = [
  { value: 'employee', label: 'Employee' },
  { value: 'admin', label: 'Admin' },
  { value: 'tailor', label: 'Tailor' },
];

interface Employee {
  id?: number; // Added optional id for fetched employees
  name: string;
  mobile: string;
  password?: string; // Password for display and editing
  designation: string;
  customerId: string; // Auto-generated customer ID
}

interface EditingEmployee {
  id: number;
  name: string;
  mobile: string;
  password: string;
  designation: string;
  customerId: string;
}

interface Order {
    id: string;
    customerId: string;
    customerName: string;
    customerPhone: string;
    status: OrderStatus;
    createdAt: string;
    updatedAt: string;
}

const AdminDashboard: React.FC = () => {
    const { user } = useAuth();
    const [customers, setCustomers] = useState<CustomerData[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);
    const [loadingCustomers, setLoadingCustomers] = useState(true); // Renamed for clarity
    const [searchTerm, setSearchTerm] = useState('');
    const [savingCustomer, setSavingCustomer] = useState(false); // Renamed for clarity
    const [sortKey, setSortKey] = useState<SortKey>('lastUpdated');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [showOrdersTable, setShowOrdersTable] = useState(false);
    const [showOrdersByMobile, setShowOrdersByMobile] = useState(false); // New state for toggling view
    
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [newEmployee, setNewEmployee] = useState<Employee>({ name: '', mobile: '', password: '', designation: 'employee', customerId: '' });
    const [showEmployeeMgmt, setShowEmployeeMgmt] = useState(false);
    const [addingEmployee, setAddingEmployee] = useState(false); // For add employee button loading
    const [loadingEmployees, setLoadingEmployees] = useState(false); // For loading employee list
    const [editingEmployee, setEditingEmployee] = useState<EditingEmployee | null>(null);
    const [updatingEmployee, setUpdatingEmployee] = useState(false); // For edit employee button loading
    const [showPassword, setShowPassword] = useState(false); // For password visibility toggle
    const [showEditPassword, setShowEditPassword] = useState(false); // For edit form password visibility toggle

    // Fetch Customers
    useEffect(() => {
        const fetchAllCustomers = async () => {
            setLoadingCustomers(true);
            try {
                // Replace getCustomers with getCustomersFromBackend
                const data = await getCustomersFromBackend();
                setCustomers(data);
            } catch (error) {
                console.error("Failed to fetch customers:", error);
                alert("Failed to load customers from the backend. Please try again.");
            } finally {
                setLoadingCustomers(false);
            }
        };
        fetchAllCustomers();
    }, []);
    
    // Fetch Orders
    useEffect(() => {
        const fetchOrders = async () => {
            if (showOrdersTable) {
                setLoadingOrders(true);
                try {
                    const data = await getOrdersFromBackend();
                    // Sort orders by creation date, newest first
                    const sortedOrders = [...data].sort((a, b) => {
                        const dateA = new Date(a.createdAt).getTime();
                        const dateB = new Date(b.createdAt).getTime();
                        return dateB - dateA; // Descending order (newest first)
                    });
                    setOrders(sortedOrders);
                } catch (error) {
                    console.error("Failed to fetch orders:", error);
                    // Optionally show an error message to the user
                } finally {
                    setLoadingOrders(false);
                }
            }
        };
        fetchOrders();
    }, [showOrdersTable]);

    // Fetch Employees when switching to Employee Management
    useEffect(() => {
        const fetchEmployees = async () => {
            if (showEmployeeMgmt) {
                setLoadingEmployees(true);
                try {
                    const response = await fetch('http://localhost/backend/employee-management.php', {
                        method: 'GET',
                    });
                    const result = await response.json();
                    if (result.success) {
                        // Map the customer_id from backend to customerId for frontend
                        setEmployees(result.employees.map((emp: any) => ({
                            id: emp.id,
                            name: emp.name,
                            mobile: emp.mobile,
                            password: '', // Password not returned from GET request for security
                            designation: emp.designation,
                            customerId: emp.customer_id // Map to frontend's camelCase
                        })));
                    } else {
                        alert('Error fetching employees: ' + result.message);
                    }
                } catch (err) {
                    console.error('Error fetching employees:', err);
                    alert('Error connecting to backend to fetch employees.');
                } finally {
                    setLoadingEmployees(false);
                }
            }
        };
        fetchEmployees();
    }, [showEmployeeMgmt]); // Refetch when showEmployeeMgmt changes

    const sortedAndFilteredCustomers = useMemo(() => {
        const filtered = customers.filter(c =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.phone.includes(searchTerm)
        );

        return filtered.sort((a, b) => {
            let valA: any = a[sortKey];
            let valB: any = b[sortKey];

            // Handle date comparison for 'lastUpdated' if it's a date string/object
            if (sortKey === 'lastUpdated') {
                valA = new Date(valA).getTime();
                valB = new Date(valB).getTime();
            }

            let comparison = 0;
            if (valA > valB) {
                comparison = 1;
            } else if (valA < valB) {
                comparison = -1;
            }

            return sortDirection === 'asc' ? comparison : -comparison;
        });

    }, [customers, searchTerm, sortKey, sortDirection]);

    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value as OrderStatus;
        if (selectedCustomer) {
            try {
                setSavingCustomer(true);
                // Update the order status in the backend
                await updateOrderInBackend(selectedCustomer.id, newStatus);
                
                // Update the customer in the local state
                setSelectedCustomer({ ...selectedCustomer, orderStatus: newStatus });
                
                // Also update in the customers list
                setCustomers(prevCustomers => 
                    prevCustomers.map(c => 
                        c.id === selectedCustomer.id ? {...c, orderStatus: newStatus} : c
                    )
                );
                
                // Also update in the orders if applicable
                if (showOrdersTable) {
                    setOrders(prevOrders => {
                        const customerOrders = prevOrders.filter(o => o.customerId === selectedCustomer.id);
                        if (customerOrders.length > 0) {
                            return prevOrders.map(o => 
                                o.customerId === selectedCustomer.id ? {...o, status: newStatus, updatedAt: new Date().toISOString()} : o
                            );
                        }
                        return prevOrders;
                    });
                }
            } catch (error) {
                console.error("Failed to update order status:", error);
            } finally {
                setSavingCustomer(false);
            }
        }
    };

    const handleSaveChanges = async () => {
        if (selectedCustomer) {
            setSavingCustomer(true);
            try {
                // Update customer in local state
                const updatedCustomer = await updateCustomer(selectedCustomer.id, selectedCustomer);
                
                // Also update the order status in the backend
                await updateOrderInBackend(selectedCustomer.id, selectedCustomer.orderStatus);
                
                // Refresh the customer list from backend
                const refreshedCustomers = await getCustomersFromBackend();
                setCustomers(refreshedCustomers);
                
                // Find the updated customer in the refreshed list
                const refreshedCustomer = refreshedCustomers.find(c => c.id === updatedCustomer.id) || updatedCustomer;
                setSelectedCustomer(refreshedCustomer);
                
                // Refresh orders list if we're showing the orders table
                if (showOrdersTable) {
                    const updatedOrders = await getOrdersFromBackend();
                    const sortedOrders = [...updatedOrders].sort((a, b) => {
                        const dateA = new Date(a.createdAt).getTime();
                        const dateB = new Date(b.createdAt).getTime();
                        return dateB - dateA; // Descending order (newest first)
                    });
                    setOrders(sortedOrders);
                }
                
                alert(`Status for ${updatedCustomer.name} updated!`);
            } catch (error) {
                console.error("Failed to update customer:", error);
                alert("Failed to update customer status.");
            } finally {
                setSavingCustomer(false);
            }
        }
    }

    const handleEmployeeChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewEmployee(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleAddEmployee = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEmployee.name || !newEmployee.mobile || !newEmployee.password) {
            alert("Please fill all employee fields: Name, Mobile, and Password.");
            return;
        }

        // Check for duplicate mobile number
        const existingEmployee = employees.find(emp => emp.mobile === newEmployee.mobile);
        if (existingEmployee) {
            alert("Mobile number already exists. Please use a different mobile number.");
            return;
        }

        setAddingEmployee(true);
        try {
            const response = await fetch('http://localhost/backend/employee-management.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newEmployee),
            });
            const result = await response.json();
            if (result.success) {
                setEmployees(prev => [...prev, {
                    id: result.employee.id,
                    name: result.employee.name,
                    mobile: result.employee.mobile,
                    password: result.employee.password, // Include password for display
                    designation: result.employee.designation,
                    customerId: result.employee.customerId
                }]);
                setNewEmployee({ name: '', mobile: '', password: '', designation: 'employee', customerId: '' });
                setShowPassword(false); // Reset password visibility
                alert('Employee added successfully!');
            } else {
                alert('Error adding employee: ' + result.message);
                console.error("Backend error response:", result);
            }
        } catch (err) {
            console.error('Backend connection error:', err);
            alert('Error connecting to backend to add employee.');
        } finally {
            setAddingEmployee(false);
        }
    };

    const handleEditEmployee = (employee: Employee) => {
        if (employee.id) {
            setEditingEmployee({
                id: employee.id,
                name: employee.name,
                mobile: employee.mobile,
                password: '', // Start with empty password - user can enter new one or leave blank
                designation: employee.designation,
                customerId: employee.customerId
            });
        }
    };

    const handleUpdateEmployee = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingEmployee) return;

        if (!editingEmployee.name || !editingEmployee.mobile) {
            alert("Please fill all required fields: Name and Mobile.");
            return;
        }

        // Check for duplicate mobile number (excluding current employee)
        const existingEmployee = employees.find(emp => emp.mobile === editingEmployee.mobile && emp.id !== editingEmployee.id);
        if (existingEmployee) {
            alert("Mobile number already exists. Please use a different mobile number.");
            return;
        }

        setUpdatingEmployee(true);
        try {
            const response = await fetch('http://localhost/backend/employee-management.php', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingEmployee),
            });
            const result = await response.json();
            if (result.success) {
                setEmployees(prev => prev.map(emp => 
                    emp.id === editingEmployee.id 
                        ? { ...emp, ...result.employee }
                        : emp
                ));
                setEditingEmployee(null);
                setShowEditPassword(false); // Reset password visibility
                alert('Employee updated successfully!');
            } else {
                alert('Error updating employee: ' + result.message);
            }
        } catch (err) {
            console.error('Error updating employee:', err);
            alert('Error connecting to backend to update employee.');
        } finally {
            setUpdatingEmployee(false);
        }
    };

    const handleCancelEdit = () => {
        setEditingEmployee(null);
        setShowEditPassword(false); // Reset password visibility
    };

    const handleDeleteEmployee = async (id: number | undefined) => {
        if (id === undefined) {
            console.warn("Attempted to delete employee without an ID.");
            return;
        }
        
        if (!confirm(`Are you sure you want to delete this employee?`)) {
            return;
        }
        
        try {
            const response = await fetch(`http://localhost/backend/employee-management.php?id=${id}`, {
                method: 'DELETE',
            });
            const result = await response.json();
            if (result.success) {
                setEmployees(prev => prev.filter(emp => emp.id !== id));
                alert('Employee deleted successfully!');
            } else {
                alert('Error deleting employee: ' + result.message);
            }
        } catch (err) {
            console.error('Error deleting employee:', err);
            alert('Error connecting to backend to delete employee.');
        }
    };

    // Group orders by customer phone number
    const ordersByMobileNumber = useMemo(() => {
        const grouped: Record<string, Order[]> = {};
        
        orders.forEach(order => {
            if (!grouped[order.customerPhone]) {
                grouped[order.customerPhone] = [];
            }
            grouped[order.customerPhone].push(order);
        });
        
        return grouped;
    }, [orders]);
    
    return (
        <div className="h-screen flex flex-col">
            <Header />
            <div className="flex-grow flex overflow-hidden">
                {/* Sidebar */}
                <aside className="w-1/3 xl:w-1/4 bg-white border-r border-neutral-200 flex flex-col">
                    <div className="p-4 border-b border-neutral-200">
                        <div className="flex flex-col space-y-2 mb-4">
                            <button
                                onClick={() => {
                                    if (user?.designation !== 'tailor') {
                                        setShowEmployeeMgmt(!showEmployeeMgmt);
                                        setShowOrdersTable(false);
                                        setShowOrdersByMobile(false); // Reset when switching views
                                    }
                                }}
                                className={`bg-brand-primary text-white px-4 py-2 rounded w-full hover:bg-brand-secondary transition-colors ${user?.designation === 'tailor' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={user?.designation === 'tailor'}
                            >
                                {showEmployeeMgmt ? 'Back to Customer Management' : 'Employee Management'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowOrdersTable(!showOrdersTable);
                                    setShowEmployeeMgmt(false);
                                    setShowOrdersByMobile(false); // Reset when toggling orders table
                                }}
                                className="bg-brand-primary text-white px-4 py-2 rounded w-full hover:bg-brand-secondary transition-colors"
                            >
                                {showOrdersTable ? 'Back to Customer Management' : 'Orders Management'}
                            </button>
                            {showOrdersTable && (
                                <button
                                    onClick={() => setShowOrdersByMobile(!showOrdersByMobile)}
                                    className="bg-brand-secondary text-white px-4 py-2 rounded w-full hover:bg-brand-primary transition-colors"
                                >
                                    {showOrdersByMobile ? 'Show All Orders' : 'Group by Mobile Number'}
                                </button>
                            )}
                        </div>
                        {!showEmployeeMgmt && (
                            <>
                                <h2 className="text-lg font-semibold text-neutral-800">Customers</h2>
                                <div className="mt-2">
                                    <Input
                                        label=""
                                        id="search"
                                        type="text"
                                        placeholder="Search by ID, name, or phone..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="mt-3 flex items-center justify-between gap-2">
                                    <SelectInput
                                        label=""
                                        id="sortKey"
                                        value={sortKey}
                                        onChange={e => setSortKey(e.target.value as SortKey)}
                                        containerClassName="flex-grow"
                                        aria-label="Sort by"
                                    >
                                        <option value="lastUpdated">Last Updated</option>
                                        <option value="name">Name</option>
                                        <option value="orderStatus">Order Status</option>
                                    </SelectInput>
                                    <Button
                                        variant="secondary"
                                        onClick={() => setSortDirection(d => d === 'asc' ? 'desc' : 'asc')}
                                        className="p-2"
                                        aria-label={`Sort direction: ${sortDirection === 'asc' ? 'ascending' : 'descending'}`}
                                    >
                                        {sortDirection === 'asc' ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                        )}
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                    <div className="flex-grow overflow-y-auto">
                        {!showEmployeeMgmt && (
                            loadingCustomers ? <div className="flex justify-center items-center h-full"><Spinner /></div> : (
                                <ul>
                                    {sortedAndFilteredCustomers.length === 0 ? (
                                        <p className="text-center text-neutral-500 p-4">No customers found.</p>
                                    ) : (
                                        sortedAndFilteredCustomers.map(customer => (
                                            <li key={customer.id}>
                                                <button
                                                    onClick={() => setSelectedCustomer(customer)}
                                                    className={`w-full text-left p-4 flex items-center space-x-3 transition-colors duration-150 ${selectedCustomer?.id === customer.id ? 'bg-primary/10' : 'hover:bg-neutral-100'}`}
                                                >
                                                    <img src={customer.avatarUrl} alt={customer.name} className="h-10 w-10 rounded-full object-cover" />
                                                    <div>
                                                        <p className={`font-semibold ${selectedCustomer?.id === customer.id ? 'text-primary' : 'text-neutral-800'}`}>{customer.name}</p>
                                                        <p className="text-sm text-neutral-500">{customer.id}</p>
                                                    </div>
                                                </button>
                                            </li>
                                        ))
                                    )}
                                </ul>
                            )
                        )}
                        {showEmployeeMgmt && loadingEmployees && (
                            <div className="flex justify-center items-center h-full"><Spinner /></div>
                        )}
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-grow bg-neutral-50 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {showOrdersTable ? (
                        <>
                            <h2 className="text-2xl font-bold mb-4 text-neutral-800">Orders Management</h2>
                            {loadingOrders ? (
                                <div className="flex justify-center items-center h-64"><Spinner /></div>
                            ) : orders.length === 0 ? (
                                <p className="text-center text-neutral-500 mt-8">No orders found.</p>
                            ) : showOrdersByMobile ? (
                                // Display orders grouped by mobile number
                                <div className="space-y-6">
                                    {Object.entries(ordersByMobileNumber).map(([phone, customerOrders]) => (
                                        <div key={phone} className="bg-white rounded-lg shadow-sm overflow-hidden">
                                            <div className="bg-neutral-100 px-6 py-3 border-b border-neutral-200">
                                                <h3 className="text-lg font-semibold text-neutral-800">
                                                    Mobile: {phone} - {customerOrders[0].customerName}
                                                </h3>
                                                <p className="text-sm text-neutral-600">
                                                    {customerOrders.length} order{customerOrders.length !== 1 ? 's' : ''}
                                                </p>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-neutral-200">
                                                    <thead className="bg-neutral-50">
                                                        <tr>
                                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Order ID</th>
                                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Address</th>
                                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Due Date</th>
                                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Created At</th>
                                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Updated At</th>
                                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-neutral-200">
                                                        {customerOrders.map((order) => (
                                                            <tr key={order.id} className="hover:bg-neutral-50">
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">{order.id}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{order.customerAddress || 'N/A'}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{order.dueDate ? new Date(order.dueDate).toLocaleDateString() : 'N/A'}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                                                                    <div className="flex items-center space-x-2">
                                                                        <SelectInput
                                                                            label=""
                                                                            name="orderStatus"
                                                                            value={order.status}
                                                                            onChange={async (e) => {
                                                                                const newStatus = e.target.value as OrderStatus;
                                                                                try {
                                                                                    setSavingCustomer(true);
                                                                                    // Update the order status in the backend
                                                                                    await updateOrderInBackend(order.id, newStatus);
                                                                                    
                                                                                    // Update the order in the local state
                                                                                    setOrders(prevOrders => 
                                                                                        prevOrders.map(o => 
                                                                                            o.id === order.id ? {...o, status: newStatus, updatedAt: new Date().toISOString()} : o
                                                                                        )
                                                                                    );
                                                                                    
                                                                                    // Also update the ordersByMobileNumber state
                                                                                    setOrdersByMobileNumber(prev => {
                                                                                        const newState = {...prev};
                                                                                        Object.keys(newState).forEach(phone => {
                                                                                            newState[phone] = newState[phone].map(o => 
                                                                                                o.id === order.id ? {...o, status: newStatus, updatedAt: new Date().toISOString()} : o
                                                                                            );
                                                                                        });
                                                                                        return newState;
                                                                                    });
                                                                                } catch (error) {
                                                                                    console.error("Failed to update order status:", error);
                                                                                } finally {
                                                                                    setSavingCustomer(false);
                                                                                }
                                                                            }}
                                                                            containerClassName="w-36"
                                                                        >
                                                                            {Object.values(OrderStatus).map(status => <option key={status} value={status}>{status}</option>)}
                                                                        </SelectInput>
                                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : order.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : order.status === 'Alteration' ? 'bg-purple-100 text-purple-800' : order.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                                            {order.status}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{new Date(order.createdAt).toLocaleString()}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{new Date(order.updatedAt).toLocaleString()}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                                                                    <button 
                                                                        className="text-brand-primary hover:text-brand-secondary transition-colors"
                                                                        onClick={() => {
                                                                            // Always fetch fresh customer data from backend to ensure we have the latest measurements
                                                                            const fetchCustomerById = async () => {
                                                                                try {
                                                                                    const customerData = await getCustomerByIdFromBackend(order.customerId);
                                                                                    if (customerData) {
                                                                                        setSelectedCustomer(customerData);
                                                                                        setShowOrdersTable(false);
                                                                                    } else {
                                                                                        alert('Customer details not found. Please refresh the page and try again.');
                                                                                    }
                                                                                } catch (error) {
                                                                                    console.error('Error fetching customer:', error);
                                                                                    alert('Failed to fetch customer details. Please try again.');
                                                                                }
                                                                            };
                                                                            fetchCustomerById();
                                                                        }}
                                                                    >
                                                                        View Details
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                // Original orders table
                                <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
                                    <table className="min-w-full divide-y divide-neutral-200">
                                        <thead className="bg-neutral-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Order ID</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Customer Name</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Phone</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Address</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Due Date</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Created At</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Updated At</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-neutral-200">
                                            {orders.map((order) => {
                                                // Find the customer to get their measurements
                                                const customer = customers.find(c => c.id === order.customerId);
                                                
                                                return (
                                                    <tr key={order.id} className="hover:bg-neutral-50">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">{order.id}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{order.customerName}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{order.customerPhone}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{order.customerAddress || 'N/A'}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{order.dueDate ? new Date(order.dueDate).toLocaleDateString() : 'N/A'}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                                                            <div className="flex items-center space-x-2">
                                                                <SelectInput
                                                                    label=""
                                                                    name="orderStatus"
                                                                    value={order.status}
                                                                    onChange={async (e) => {
                                                                        const newStatus = e.target.value as OrderStatus;
                                                                        try {
                                                                            setSavingCustomer(true);
                                                                            // Update the order status in the backend
                                                                            await updateOrderInBackend(order.id, newStatus);
                                                                            
                                                                            // Update the order in the local state
                                                                            setOrders(prevOrders => 
                                                                                prevOrders.map(o => 
                                                                                    o.id === order.id ? {...o, status: newStatus, updatedAt: new Date().toISOString()} : o
                                                                                )
                                                                            );
                                                                            
                                                                            // Also update in the grouped view if applicable
                                                                            if (showOrdersByMobile) {
                                                                                const updatedOrders = await getOrdersFromBackend();
                                                                                const sortedOrders = [...updatedOrders].sort((a, b) => {
                                                                                    const dateA = new Date(a.createdAt).getTime();
                                                                                    const dateB = new Date(b.createdAt).getTime();
                                                                                    return dateB - dateA; // Descending order (newest first)
                                                                                });
                                                                                setOrders(sortedOrders);
                                                                            }
                                                                        } catch (error) {
                                                                            console.error("Failed to update order status:", error);
                                                                        } finally {
                                                                            setSavingCustomer(false);
                                                                        }
                                                                    }}
                                                                    containerClassName="w-36"
                                                                >
                                                                    {Object.values(OrderStatus).map(status => <option key={status} value={status}>{status}</option>)}
                                                                </SelectInput>
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : order.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : order.status === 'Alteration' ? 'bg-purple-100 text-purple-800' : order.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                                    {order.status}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{new Date(order.createdAt).toLocaleString()}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{new Date(order.updatedAt).toLocaleString()}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                                                            <button 
                                                                className="text-brand-primary hover:text-brand-secondary transition-colors"
                                                                onClick={() => {
                                                                    // Always fetch fresh customer data from backend to ensure we have the latest measurements
                                                                    const fetchCustomerById = async () => {
                                                                        try {
                                                                            const customerData = await getCustomerByIdFromBackend(order.customerId);
                                                                            if (customerData) {
                                                                                setSelectedCustomer(customerData);
                                                                                setShowOrdersTable(false);
                                                                            } else {
                                                                                alert('Customer details not found. Please refresh the page and try again.');
                                                                            }
                                                                        } catch (error) {
                                                                            console.error('Error fetching customer:', error);
                                                                            alert('Failed to fetch customer details. Please try again.');
                                                                        }
                                                                    };
                                                                    fetchCustomerById();
                                                                }}
                                                            >
                                                                View Details
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            
                            <h2 className="text-2xl font-bold mb-4 mt-8 text-neutral-800">Customer Measurements</h2>
                            {loadingCustomers ? (
                                <div className="flex justify-center items-center h-64"><Spinner /></div>
                            ) : customers.length === 0 ? (
                                <p className="text-center text-neutral-500 mt-8">No customers found.</p>
                            ) : (
                                <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
                                    <table className="min-w-full divide-y divide-neutral-200">
                                        <thead className="bg-neutral-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Customer ID</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Name</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Phone</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Address</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Due Date</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Order Status</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Last Updated</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-neutral-200">
                                            {customers
                                                .sort((a, b) => {
                                                    if (sortKey === 'lastUpdated') {
                                                        const dateA = new Date(a.lastUpdated || 0).getTime();
                                                        const dateB = new Date(b.lastUpdated || 0).getTime();
                                                        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
                                                    }
                                                    return 0;
                                                })
                                                .map((customer) => (
                                                <tr key={customer.id} className="hover:bg-neutral-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">{customer.id}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{customer.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{customer.phone}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{customer.address || '-'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{customer.dueDate ? new Date(customer.dueDate).toLocaleDateString() : '-'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                                                        <div className="flex items-center space-x-2">
                                                            <SelectInput
                                                                label=""
                                                                name="orderStatus"
                                                                value={customer.orderStatus}
                                                                onChange={async (e) => {
                                                                    const newStatus = e.target.value as OrderStatus;
                                                                    try {
                                                                        setSavingCustomer(true);
                                                                        // Update the order status in the backend
                                                                        await updateOrderInBackend(`CUST-${customer.id}`, newStatus);
                                                                        
                                                                        // Update the customer in the local state
                                                                        setCustomers(prevCustomers => 
                                                                            prevCustomers.map(c => 
                                                                                c.id === customer.id ? {...c, orderStatus: newStatus} : c
                                                                            )
                                                                        );
                                                                        
                                                                        // Also update in the orders if applicable
                                                                        setOrders(prevOrders => {
                                                                            const customerOrders = prevOrders.filter(o => o.customerId === customer.id);
                                                                            if (customerOrders.length > 0) {
                                                                                return prevOrders.map(o => 
                                                                                    o.customerId === customer.id ? {...o, status: newStatus, updatedAt: new Date().toISOString()} : o
                                                                                );
                                                                            }
                                                                            return prevOrders;
                                                                        });
                                                                    } catch (error) {
                                                                        console.error("Failed to update order status:", error);
                                                                    } finally {
                                                                        setSavingCustomer(false);
                                                                    }
                                                                }}
                                                                containerClassName="w-36"
                                                            >
                                                                {Object.values(OrderStatus).map(status => <option key={status} value={status}>{status}</option>)}
                                                            </SelectInput>
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${customer.orderStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' : customer.orderStatus === 'In Progress' ? 'bg-blue-100 text-blue-800' : customer.orderStatus === 'Alteration' ? 'bg-purple-100 text-purple-800' : customer.orderStatus === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                                {customer.orderStatus}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{customer.lastUpdated ? new Date(customer.lastUpdated).toLocaleString() : 'N/A'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                                                        <button 
                                                            className="text-brand-primary hover:text-brand-secondary transition-colors"
                                                            onClick={() => {
                                                                // Always fetch fresh customer data from backend to ensure we have the latest measurements
                                                                const fetchCustomerById = async () => {
                                                                    try {
                                                                        const customerData = await getCustomerByIdFromBackend(customer.id);
                                                                        if (customerData) {
                                                                            setSelectedCustomer(customerData);
                                                                            setShowOrdersTable(false);
                                                                        } else {
                                                                            alert('Customer details not found. Please refresh the page and try again.');
                                                                        }
                                                                    } catch (error) {
                                                                        console.error('Error fetching customer:', error);
                                                                        alert('Failed to fetch customer details. Please try again.');
                                                                    }
                                                                };
                                                                fetchCustomerById();
                                                            }}
                                                        >
                                                            View Details
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    ) : !showEmployeeMgmt ? (
                        <>
                            {selectedCustomer ? (
                                <div>
                                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                                        <div className="flex items-center space-x-4">
                                            <img src={selectedCustomer.avatarUrl} alt={selectedCustomer.name} className="h-16 w-16 rounded-full object-cover" />
                                            <div>
                                                <h2 className="text-2xl font-bold text-neutral-800">{selectedCustomer.name}</h2>
                                                <p className="text-neutral-500">{selectedCustomer.phone}</p>
                                                {selectedCustomer.address && <p className="text-neutral-500">Address: {selectedCustomer.address}</p>}
                                                {selectedCustomer.dueDate && <p className="text-neutral-500">Due Date: {new Date(selectedCustomer.dueDate).toLocaleDateString()}</p>}
                                            </div>
                                        </div>
                                        <div className="flex items-end gap-4">
                                            <SelectInput
                                                label="Order Status"
                                                name="orderStatus"
                                                value={selectedCustomer.orderStatus}
                                                onChange={handleStatusChange}
                                                containerClassName="w-48"
                                            >
                                                {Object.values(OrderStatus).map(status => <option key={status} value={status}>{status}</option>)}
                                            </SelectInput>
                                            
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                                        <h3 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-3 mb-4">Measurements</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-4">
                                            {Object.entries(selectedCustomer.measurements).map(([key, value]) => (
                                                <div key={key}>
                                                    <p className="block text-sm font-medium text-neutral-700 mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                                                    <p className="block w-full px-3 py-2 bg-neutral-100 border border-neutral-200 rounded-md sm:text-sm text-neutral-800">{value || '-'}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
                                            <h3 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-3 mb-4">Uploaded Images & Notes</h3>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <ImageUpload title="Saree" imageInfo={selectedCustomer.images.saree} onNotesChange={() => { }} onImageChange={() => { }} isReadOnly />
                                                <ImageUpload title="Blouse Front" imageInfo={selectedCustomer.images.blouseFront} onNotesChange={() => { }} onImageChange={() => { }} isReadOnly />
                                                <ImageUpload title="Blouse Back" imageInfo={selectedCustomer.images.blouseBack} onNotesChange={() => { }} onImageChange={() => { }} isReadOnly />
                                                <ImageUpload title="Blouse Hand" imageInfo={selectedCustomer.images.blouseHand} onNotesChange={() => { }} onImageChange={() => { }} isReadOnly />
                                            </div>
                                        </div>
                                        <div className="bg-white p-6 rounded-lg shadow-sm">
                                            <h3 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-3 mb-4">Blouse Details</h3>
                                            <div className="space-y-3">
                                                {Object.entries(selectedCustomer.blouseDetails).map(([key, value]) => (
                                                    <div key={key}>
                                                        <p className="text-sm font-medium text-neutral-700 capitalize">{key}</p>
                                                        <p className="text-neutral-800 capitalize">{value || '-'}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center text-neutral-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.975 5.975 0 0112 15a5.975 5.975 0 013 5.197" />
                                    </svg>
                                    <h3 className="text-xl font-semibold text-neutral-700">Select a customer</h3>
                                    <p>Choose a customer from the list to view their details.</p>
                                </div>
                            )}
                        </>
                    ) : ( // Employee Management Section
                        <>
                            <h2 className="text-2xl font-bold mb-4 text-neutral-800">Employee Management</h2>
                            <form onSubmit={handleAddEmployee} className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end bg-white p-4 rounded-lg shadow-sm">
                                <div>
                                    <label htmlFor="employeeName" className="block text-sm font-medium text-neutral-700 mb-1">Name</label>
                                    <Input
                                        id="employeeName"
                                        name="name"
                                        value={newEmployee.name}
                                        onChange={handleEmployeeChange}
                                        placeholder="Employee Name"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="employeeMobile" className="block text-sm font-medium text-neutral-700 mb-1">Mobile No</label>
                                    <Input
                                        id="employeeMobile"
                                        name="mobile"
                                        value={newEmployee.mobile}
                                        onChange={handleEmployeeChange}
                                        placeholder="10-digit mobile"
                                        type="tel"
                                        pattern="\d{10}"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="employeePassword" className="block text-sm font-medium text-neutral-700 mb-1">Password</label>
                                    <div className="relative">
                                        <Input
                                            id="employeePassword"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            value={newEmployee.password}
                                            onChange={handleEmployeeChange}
                                            placeholder="Strong password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-500 hover:text-neutral-700"
                                        >
                                            {showPassword ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                                                                )}
                                                </button>
                                            </div>
                                            
                                        </div>
                                <div>
                                    <label htmlFor="employeeDesignation" className="block text-sm font-medium text-neutral-700 mb-1">Designation</label>
                                    <SelectInput
                                        label="Designation"
                                        id="employeeDesignation"
                                        name="designation"
                                        value={newEmployee.designation}
                                        onChange={handleEmployeeChange}
                                    >
                                        {designationOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </SelectInput>
                                </div>
                                <Button type="submit" isLoading={addingEmployee} className="mt-6 md:mt-0">
                                    Add Employee
                                </Button>
                            </form>
                            {editingEmployee && (
                                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-blue-800 mb-4">Edit Employee</h3>
                                    <form onSubmit={handleUpdateEmployee} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
                                        <div>
                                            <label htmlFor="editName" className="block text-sm font-medium text-neutral-700 mb-1">Name</label>
                                            <Input
                                                id="editName"
                                                value={editingEmployee.name}
                                                onChange={(e) => setEditingEmployee(prev => prev ? {...prev, name: e.target.value} : null)}
                                                placeholder="Employee Name"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="editMobile" className="block text-sm font-medium text-neutral-700 mb-1">Mobile No</label>
                                            <Input
                                                id="editMobile"
                                                value={editingEmployee.mobile}
                                                onChange={(e) => setEditingEmployee(prev => prev ? {...prev, mobile: e.target.value} : null)}
                                                placeholder="10-digit mobile"
                                                type="tel"
                                                pattern="\d{10}"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="editCustomerId" className="block text-sm font-medium text-neutral-700 mb-1">Customer ID</label>
                                            <Input
                                                id="editCustomerId"
                                                value={editingEmployee.customerId}
                                                disabled
                                                className="bg-neutral-100"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="editPassword" className="block text-sm font-medium text-neutral-700 mb-1">New Password</label>
                                            <div className="relative">
                                                <Input
                                                    id="editPassword"
                                                    type={showEditPassword ? "text" : "password"}
                                                    value={editingEmployee.password}
                                                    onChange={(e) => setEditingEmployee(prev => prev ? {...prev, password: e.target.value} : null)}
                                                    placeholder="Enter new password or leave blank"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowEditPassword(!showEditPassword)}
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-500 hover:text-neutral-700"
                                                >
                                                    {showEditPassword ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                                        </svg>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="editDesignation" className="block text-sm font-medium text-neutral-700 mb-1">Designation</label>
                                            <SelectInput
                                                label=""
                                                id="editDesignation"
                                                value={editingEmployee.designation}
                                                onChange={(e) => setEditingEmployee(prev => prev ? {...prev, designation: e.target.value} : null)}
                                            >
                                                {designationOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                            </SelectInput>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button type="submit" isLoading={updatingEmployee} className="flex-1">
                                                Update
                                            </Button>
                                            <Button type="button" variant="secondary" onClick={handleCancelEdit} className="flex-1">
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            )}
                            {loadingEmployees ? (
                                <div className="flex justify-center items-center h-64"><Spinner /></div>
                            ) : employees.length === 0 ? (
                                <p className="text-center text-neutral-500 mt-8">No employees added yet.</p>
                            ) : (
                                <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
                                    <table className="min-w-full divide-y divide-neutral-200">
                                        <thead className="bg-neutral-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Name</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Mobile No</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Customer ID</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Password</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Designation</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-neutral-200">
                                            {employees.map((emp) => (
                                                <tr key={emp.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">{emp.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{emp.mobile}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{emp.customerId}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 font-mono">
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            Password Set
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 capitalize">{emp.designation}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                        <button 
                                                            onClick={() => handleEditEmployee(emp)} 
                                                            className="text-blue-600 hover:text-blue-900"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteEmployee(emp.id)} 
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;