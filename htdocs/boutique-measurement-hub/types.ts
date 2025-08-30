export enum Role {
    EMPLOYEE = 'employee',
    ADMIN = 'admin',
}

export interface User {
    id: string;
    name: string;
    phone: string;
    role: Role;
    designation?: string; // Added for backend-provided designation
    isNewUser?: boolean;
}

export interface Measurements {
    fullShoulder: string;
    shoulderWidth: string;
    backLength: string;
    backNeckLength: string;
    armholeLooseLeft: string;
    armholeLooseRight: string;
    handLength: string;
    handLooseAboveElbowLeft: string;
    handLooseAboveElbowRight: string;
    handLooseBelowElbowLeft: string;
    handLooseBelowElbowRight: string;
    frontLength: string;
    frontNeckLength: string;
    apexLength: string;
    apexToApex: string;
    chestLoose: string;
    upperChestLoose: string;
    waistLoose: string;
    lehengaLength: string;
    waistLength: string;
}

export interface BlouseDetails {
    opening: 'front' | 'back' | '';
    doris: 'yes' | 'no' | '';
    cut: 'princess' | '3dart' | '';
    fastener: 'zip' | 'hooks' | '';
    padding: 'yes' | 'no' | '';
    piping: 'self' | 'contrast' | '';
}

export interface ImageInfo {
    url: string;
    notes: string;
}

export enum OrderStatus {
    PENDING = 'Pending',
    IN_PROGRESS = 'In Progress',
    ALTERATION = 'Alteration',
    COMPLETED = 'Completed',
    DELIVERED = 'Delivered',
}

export interface CustomerData {
    id: string;
    name: string;
    phone: string;
    address: string;
    dueDate: string;
    avatarUrl: string;
    measurements: Measurements;
    blouseDetails: BlouseDetails;
    images: {
        saree: ImageInfo;
        blouseFront: ImageInfo;
        blouseBack: ImageInfo;
        blouseHand: ImageInfo;
    };
    orderStatus: OrderStatus;
    lastUpdated: string;
}