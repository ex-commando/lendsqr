export interface User {
    id: string;
    name: string;
    email: string;
    password?: string;
    created_at: Date;
    updated_at: Date;
}

export interface Wallet {
    id: string;
    user_id: string;
    balance: number;
    currency: string;
    created_at: Date;
    updated_at: Date;
}

export interface Transaction {
    id: string;
    wallet_id: string;
    type: 'CREDIT' | 'DEBIT';
    amount: number;
    reference: string;
    status: 'PENDING' | 'SUCCESS' | 'FAILED';
    description?: string;
    created_at: Date;
    updated_at: Date;
}
