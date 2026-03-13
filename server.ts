import express from "express";
import { createServer as createViteServer } from "vite";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { MercadoPagoConfig, Preference } from "mercadopago";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();

  // Middleware de CORS manual para aceitar requisições do Electron (file://)
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  app.use(express.json());

  const PORT = process.env.PORT || 3000;

  // Mercado Pago Initialization
  const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || "APP_USR-5486188186277562-123109-0c5bb1142056dd529240d38a493ce08d-650681524"
  });

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString(), env: process.env.NODE_ENV });
  });

  app.post("/api/create-preference", async (req, res) => {
    const { planId, email } = req.body;
    const plans: Record<string, { name: string, price: number }> = {
      basic: { name: "Plano Basico", price: 5 },
      pro: { name: "Plano Profissional", price: 10 },
      extreme: { name: "Plano Extremo", price: 15 },
    };

    const plan = plans[planId];
    if (!plan) return res.status(400).json({ error: "Invalid plan" });

    const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;

    try {
      const preference = new Preference(client);
      const response = await preference.create({
        body: {
          items: [{ id: planId, title: plan.name, quantity: 1, unit_price: plan.price, currency_id: "BRL" }],
          payer: { email: email || "comprador.teste@neonrush.com" },
          back_urls: { success: `${appUrl}/success`, failure: `${appUrl}/failure`, pending: `${appUrl}/pending` },
          auto_return: "approved",
          binary_mode: true,
          payment_methods: {
            excluded_payment_types: [],
            excluded_payment_methods: [],
            installments: 1
          },
        },
      });
      res.json({ id: response.id, init_point: response.init_point });
    } catch (error: any) {
      // Extrai o erro profundo do Mercado Pago
      const deepError = error.cause || error.message || error;
      const errorMessage = typeof deepError === 'object' ? JSON.stringify(deepError) : deepError;

      console.error("Mercado Pago error full:", errorMessage);

      res.status(500).json({
        error: "Failed to create preference",
        details: errorMessage
      });
    }
  });

  // Load config safely
  let firebaseConfig: any = {};
  try {
    if (fs.existsSync("./firebase-applet-config.json")) {
      const rawConfig = fs.readFileSync("./firebase-applet-config.json", "utf-8");
      firebaseConfig = JSON.parse(rawConfig);
    }
  } catch (err) {
    console.error("Error loading firebase-applet-config.json:", err);
  }

  // Initialize Firebase Admin
  try {
    if (!getApps().length) {
      let serviceAccount: any = null;
      if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        try {
          serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        } catch (err) {
          console.error("Error parsing FIREBASE_SERVICE_ACCOUNT env var:", err);
        }
      }

      if (serviceAccount) {
        initializeApp({
          credential: cert(serviceAccount),
        });
      } else {
        const projectId = process.env.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId;
        if (projectId) {
          initializeApp({ projectId });
        }
      }
    }
  } catch (err) {
    console.error("Error initializing Firebase Admin:", err);
  }

  const db = getFirestore(process.env.VITE_FIREBASE_DATABASE_ID || firebaseConfig.firestoreDatabaseId || "(default)");

  // Production Setup
  if (process.env.NODE_ENV === "production") {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      if (!req.path.startsWith("/api")) {
        res.sendFile(path.join(distPath, "index.html"));
      }
    });
  } else {
    // Vite middleware for development
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch (err) {
      console.error("Vite init error:", err);
    }
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

startServer().catch(err => {
  console.error("Fatal server error:", err);
});
