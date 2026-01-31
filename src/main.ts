import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { Webhook, WebhookInput } from './types';
import { storage } from './storage';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.post('/webhooks', (req: Request, res: Response) => {
  const input = req.body as WebhookInput;
  const id = Math.random().toString(36).substring(7);
  const webhook: Webhook = {
    id,
    source: input.source,
    event: input.event,
    payload: input.payload,
    receivedAt: new Date()
  };
  storage.save(webhook);
  res.json({
    id: webhook.id,
    message: 'Webhook received'
  });
});
app.get('/webhooks', (req: Request, res: Response) => {
  const allWebhooks = storage.getAll();
  res.json({
    webhooks: allWebhooks,
    count: allWebhooks.length
  });
});
app.get('/webhooks/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const webhook = storage.getById(id);
  if (!webhook) {
    return res.status(404).json({ error: 'Webhook not found' });
  }
  res.json(webhook);
});
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.log('Error:', err);
  res.status(500).json({ error: 'Something went wrong' });
});
app.listen(PORT, () => {
  console.log(`Webhook service running on port ${PORT}`);
}); 