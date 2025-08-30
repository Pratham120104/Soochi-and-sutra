import { apiClient } from './apiClient';
import type { CustomerData, OrderStatus, ImageInfo } from '../types';

// Backend API endpoints
const API_BASE = 'http://localhost/backend';

// Customer API
export const getCustomersFromBackend = async (): Promise<CustomerData[]> => {
  try {
    const response = await fetch(`${API_BASE}/customer-management.php`);
    if (!response.ok) {
      throw new Error('Failed to fetch customers');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};

export const getCustomerByPhoneFromBackend = async (phone: string): Promise<CustomerData | null> => {
  try {
    const response = await fetch(`${API_BASE}/customer-management.php?phone=${encodeURIComponent(phone)}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch customer');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching customer by phone:', error);
    throw error;
  }
};

export const getCustomerByIdFromBackend = async (id: string): Promise<CustomerData | null> => {
  try {
    const response = await fetch(`${API_BASE}/customer-management.php?id=${encodeURIComponent(id)}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch customer');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching customer by ID:', error);
    throw error;
  }
};

export const createCustomerInBackend = async (customerData: Partial<CustomerData>): Promise<CustomerData> => {
  try {
    // Log the data being sent
    console.log('Creating customer with data:', JSON.stringify(customerData, null, 2));
    
    // First send to debug endpoint
    await fetch(`${API_BASE}/debug_post.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customerData),
    });
    
    const response = await fetch(`${API_BASE}/customer-management.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customerData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create customer');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
};

export const updateCustomerInBackend = async (id: string, customerData: Partial<CustomerData>): Promise<CustomerData> => {
  try {
    // Log the data being sent
    console.log('Updating customer with data:', JSON.stringify({ ...customerData, id }, null, 2));
    
    // First send to debug endpoint
    await fetch(`${API_BASE}/debug_post.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...customerData, id }),
    });
    
    const response = await fetch(`${API_BASE}/customer-management.php`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...customerData, id }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update customer');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
};

// Image Upload API
export const uploadImageToBackend = async (file: File, customerId: string, imageType: string): Promise<{ url: string }> => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('customer_id', customerId);
    formData.append('image_type', imageType);
    
    const response = await fetch(`${API_BASE}/image-upload.php`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload image');
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to upload image');
    }
    
    return { url: result.url };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Order API
export const createOrderInBackend = async (customerId: string, status: OrderStatus = 'Pending'): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE}/order-management.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customerId, status }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create order');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const getOrdersFromBackend = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${API_BASE}/order-management.php`);
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

export const getOrderByIdFromBackend = async (id: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE}/order-management.php?id=${encodeURIComponent(id)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch order');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    throw error;
  }
};

export const getOrdersByCustomerIdFromBackend = async (customerId: string): Promise<any[]> => {
  try {
    const response = await fetch(`${API_BASE}/order-management.php?customer_id=${encodeURIComponent(customerId)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch customer orders');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    throw error;
  }
};

export const updateOrderInBackend = async (id: string, status: OrderStatus): Promise<any> => {
  try {
    // First check if this is an order ID or customer ID
    let orderId = id;
    
    // If the ID starts with CUST-, it's a customer ID, so we need to get the latest order for this customer
    if (id.startsWith('CUST-')) {
      const customerOrders = await getOrdersByCustomerIdFromBackend(id);
      if (customerOrders && customerOrders.length > 0) {
        // Use the most recent order for this customer
        orderId = customerOrders[0].id;
      } else {
        // No existing order, create a new one
        const newOrder = await createOrderInBackend(id, status);
        return newOrder;
      }
    }
    
    // Update the order with the order ID
    const response = await fetch(`${API_BASE}/order-management.php`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: orderId, status }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update order');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
};