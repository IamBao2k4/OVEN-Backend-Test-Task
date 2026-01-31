import { Webhook } from './types'; 
let webhooks: Webhook[] = []; 
export const storage = { 
  save(webhook: Webhook): void { 
    webhooks.push(webhook); 
  }, 
  getAll(): Webhook[] { 
return webhooks; 
  }, 
  getById(id: string): Webhook | undefined { 
return webhooks.find(w => w.id === id); 
  }, 
  count(): number { 
return webhooks.length; 
  }, 
  clear(): void { 
    webhooks = []; 
  } 
};