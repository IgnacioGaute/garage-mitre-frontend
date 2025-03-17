
export const CUSTOMER_TYPE = ['OWNER', 'RENTER', 'PRIVATE'] as const;
export type CustomerType = (typeof CUSTOMER_TYPE)[number];

export type AmountCustomer = {
    amount: number;
    customerType: CustomerType;
}