
```bash
npm install @trpc/server @trpc/client ws zod
```
```bash
npm i --save-dev @types/express @types/ws
```

# usage
in your server file
```typescript
import { trpcExpressAdapter } from '@innobridge/lexi';

const { trpcExpressHandler, createWebSocketServer, applyWSSHandlerToServer } = trpcExpressAdapter;

const app = express();
app.use(express.json());

app.use('/trpc', trpcExpressHandler);

const server = app.listen(+PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
    console.log(`Swagger UI: http://localhost:${PORT}/docs`);
});
  
const wss = createWebSocketServer(server);
applyWSSHandlerToServer(wss);
```
