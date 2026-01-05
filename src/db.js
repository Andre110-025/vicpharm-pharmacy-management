import Dexie from 'dexie';

export const db = new Dexie('StoreHiveDB');

// The schema only needs the primary key and the fields you want to SEARCH by
db.version(2).stores({
  products: 'id, name, sku',
  customers: 'id, name, phone',
  top_customers: 'id, customer',
  activity: 'id, company_name',
  sales_returns: 'id',      
  credit_sales: 'id',
  sales: 'id, invoice_number, customer_name',
  adminRole: 'id, role_name',
  admin: 'id, username',
  income: 'id, date',
  inventory: 'id, product_name',
  creditTable: 'id, customer_name',
  categories: 'name',
  dashboard_cache: 'id',
  syncQueue: '++id, type, endpoint, method, payload' // Generic queue
});