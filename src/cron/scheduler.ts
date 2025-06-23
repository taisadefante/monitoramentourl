// cron/scheduler.ts
import cron from "node-cron";
import axios from "axios";

// Agendamento: a cada 30 minutos
cron.schedule("*/30 * * * *", async () => {
  try {
    await axios.get("http://localhost:3000/api/monitor"); // ajuste se for hospedado
    console.log("✅ Verificação executada com sucesso");
  } catch (err) {
    console.error("❌ Erro ao chamar monitoramento:", err);
  }
});
