export interface Webhook { 
  id: string; 
  source: string; 
  event: string; 
  payload: any; 
  receivedAt: Date; 
} 
export interface WebhookInput { 
  source: string; 
  event: string; 
  payload: any; 
} 