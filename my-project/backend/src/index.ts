import '../../db/client';
import { app } from './app';

const PORT = Number(process.env.PORT) || 3001;

app.listen(PORT, () => {
  console.log(`Servidor de reservas de pádel activo en http://localhost:${PORT}`);
});
