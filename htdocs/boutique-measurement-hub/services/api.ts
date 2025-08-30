import type { CustomerData, User } from '../types';
import { Role, OrderStatus } from '../types';

const initialCustomers: CustomerData[] = [
    {
        id: 'CUST-001',
        name: 'Priya Sharma',
        phone: '9876543210',
        avatarUrl: 'https://picsum.photos/seed/priya/200',
        orderStatus: OrderStatus.IN_PROGRESS,
        lastUpdated: new Date('2024-07-20T10:00:00Z').toISOString(),
        measurements: {
            fullShoulder: '15', shoulderWidth: '14.5', backLength: '14', backNeckLength: '8',
            armholeLooseLeft: '16', armholeLooseRight: '16', handLength: '6', 
            handLooseAboveElbowLeft: '11', handLooseAboveElbowRight: '11', 
            handLooseBelowElbowLeft: '10', handLooseBelowElbowRight: '10',
            frontLength: '14.5', frontNeckLength: '7', apexLength: '10', apexToApex: '7.5',
            chestLoose: '36', upperChestLoose: '34', waistLoose: '30', lehengaLength: '', waistLength: ''
        },
        blouseDetails: {
            opening: 'front', doris: 'yes', cut: 'princess', fastener: 'hooks', padding: 'yes', piping: 'contrast',
        },
        images: {
            saree: { url: 'https://picsum.photos/seed/saree1/400', notes: 'Heavy silk saree for wedding.' },
            blouseFront: { url: 'https://picsum.photos/seed/bfront1/400', notes: 'Deep U-neck design.' },
            blouseBack: { url: 'https://picsum.photos/seed/bback1/400', notes: 'Backless with doris.' },
            blouseHand: { url: 'https://picsum.photos/seed/bhand1/400', notes: 'Elbow length sleeves.' },
        }
    },
    {
        id: 'CUST-002',
        name: 'Anjali Verma',
        phone: '8765432109',
        avatarUrl: 'https://picsum.photos/seed/anjali/200',
        orderStatus: OrderStatus.PENDING,
        lastUpdated: new Date('2024-07-22T14:30:00Z').toISOString(),
        measurements: {
            fullShoulder: '14.5', shoulderWidth: '14', backLength: '13.5', backNeckLength: '9',
            armholeLooseLeft: '15.5', armholeLooseRight: '15.5', handLength: '5', 
            handLooseAboveElbowLeft: '10.5', handLooseAboveElbowRight: '10.5', 
            handLooseBelowElbowLeft: '9.5', handLooseBelowElbowRight: '9.5',
            frontLength: '14', frontNeckLength: '6.5', apexLength: '9.5', apexToApex: '7',
            chestLoose: '34', upperChestLoose: '32', waistLoose: '28', lehengaLength: '', waistLength: ''
        },
        blouseDetails: {
            opening: 'back', doris: 'no', cut: '3dart', fastener: 'zip', padding: 'no', piping: 'self',
        },
        images: {
            saree: { url: 'https://picsum.photos/seed/saree2/400', notes: 'Simple cotton saree for office wear.' },
            blouseFront: { url: '', notes: '' },
            blouseBack: { url: '', notes: 'High neck with a small keyhole.' },
            blouseHand: { url: '', notes: 'Short sleeves.' },
        }
    },
     {
        id: 'CUST-003',
        name: 'Sneha Reddy',
        phone: '7654321098',
        avatarUrl: 'https://picsum.photos/seed/sneha/200',
        orderStatus: OrderStatus.COMPLETED,
        lastUpdated: new Date('2024-07-15T18:00:00Z').toISOString(),
        measurements: {
            fullShoulder: '16', shoulderWidth: '15', backLength: '15', backNeckLength: '7.5',
            armholeLooseLeft: '17', armholeLooseRight: '17', handLength: '10', 
            handLooseAboveElbowLeft: '12', handLooseAboveElbowRight: '12', 
            handLooseBelowElbowLeft: '11', handLooseBelowElbowRight: '11',
            frontLength: '15', frontNeckLength: '7.5', apexLength: '10.5', apexToApex: '8',
            chestLoose: '38', upperChestLoose: '36', waistLoose: '32', lehengaLength: '', waistLength: ''
        },
        blouseDetails: {
            opening: 'front', doris: 'yes', cut: 'princess', fastener: 'hooks', padding: 'yes', piping: 'self',
        },
        images: {
            saree: { url: 'https://picsum.photos/seed/saree3/400', notes: 'Georgette party wear saree.' },
            blouseFront: { url: 'https://picsum.photos/seed/bfront3/400', notes: '' },
            blouseBack: { url: 'https://picsum.photos/seed/bback3/400', notes: '' },
            blouseHand: { url: 'https://picsum.photos/seed/bhand3/400', notes: '3/4th sleeves.' },
        }
    },
];

let db: CustomerData[] = JSON.parse(JSON.stringify(initialCustomers));

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const mockAdminLogin = async (): Promise<User> => {
    await delay(500);
    return { id: 'ADMIN-001', name: 'Admin User', phone: '0000000000', role: Role.ADMIN };
};

export const mockEmployeeLogin = async (phone: string): Promise<User> => {
    await delay(500);
    // For demo, always return the same employee user. In real app, lookup or create employee.
    return { id: `EMP-${phone}`, name: 'Employee User', phone, role: Role.EMPLOYEE };
};

export const realEmployeeLogin = async (phone: string, password: string): Promise<User> => {
    const response = await fetch('http://localhost/backend/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
    });
    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.error || 'Login failed');
    }
    // Treat 'admin' and 'tailor' as admin role for dashboard routing
    const role = (result.designation === 'admin' || result.designation === 'tailor') ? Role.ADMIN : Role.EMPLOYEE;
    return {
        id: '',
        name: '',
        phone,
        role,
        designation: result.designation
    };
};

export const createCustomer = async (id: string, name: string, phone: string): Promise<CustomerData> => {
    await delay(1000);
    const existing = db.find(c => c.id === id);
    if (existing) {
        existing.name = name;
        existing.phone = phone;
        return JSON.parse(JSON.stringify(existing));
    }

    const newCustomer: CustomerData = {
        id,
        name,
        phone,
        avatarUrl: `https://picsum.photos/seed/${id}/200`,
        orderStatus: OrderStatus.PENDING,
        lastUpdated: new Date().toISOString(),
        measurements: {
            fullShoulder: '', shoulderWidth: '', backLength: '', backNeckLength: '',
            armholeLoose: '', handLength: '', handLooseAboveElbow: '', handLooseBelowElbow: '',
            frontLength: '', frontNeckLength: '', apexLength: '', apexToApex: '',
            chestLoose: '', upperChestLoose: '', waistLoose: '',
        },
        blouseDetails: {
            opening: '', doris: '', cut: '', fastener: '', padding: '', piping: '',
        },
        images: {
            saree: { url: '', notes: '' },
            blouseFront: { url: '', notes: '' },
            blouseBack: { url: '', notes: '' },
            blouseHand: { url: '', notes: '' },
        }
    };

    db.push(newCustomer);
    return JSON.parse(JSON.stringify(newCustomer));
};


export const getCustomers = async (): Promise<CustomerData[]> => {
    await delay(800);
    return JSON.parse(JSON.stringify(db));
};

export const getCustomerById = async (id: string): Promise<CustomerData | null> => {
    await delay(500);
    const customer = db.find(c => c.id === id);
    return customer ? JSON.parse(JSON.stringify(customer)) : null;
};

export const updateCustomer = async (id: string, data: CustomerData): Promise<CustomerData> => {
    await delay(1000);
    const index = db.findIndex(c => c.id === id);
    if (index !== -1) {
        db[index] = {
            ...JSON.parse(JSON.stringify(data)),
            lastUpdated: new Date().toISOString(),
        };
        return db[index];
    }
    throw new Error('Customer not found');
};