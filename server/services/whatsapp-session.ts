import { makeWASocket, useMultiFileAuthState, DisconnectReason, WASocket } from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import path from "path";
import fs from "fs";

// Store active sessions in memory
const activeSessions = new Map<
  string,
  {
    socket: WASocket | null;
    qrCode: string | null;
    status: "pending" | "connected" | "disconnected";
    phoneNumber?: string;
    createdAt: Date;
  }
>();

// Create sessions directory
const sessionsDir = path.join(process.cwd(), "whatsapp-sessions");
if (!fs.existsSync(sessionsDir)) {
  fs.mkdirSync(sessionsDir, { recursive: true });
}

export async function startWhatsAppSession(sessionId: string): Promise<{
  qrCode: string;
  status: string;
}> {
  try {
    const sessionPath = path.join(sessionsDir, sessionId);

    // Use multi-file auth state
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

    // Create socket
    const socket = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      browser: ["ConversaAI", "Desktop", "1.0.0"],
    });

    let qrCode = "";

    // Handle QR code
    socket.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        qrCode = qr;
        console.log(`[WhatsApp] QR Code generated for session ${sessionId}`);
      }

      if (connection === "open") {
        console.log(`[WhatsApp] Connected for session ${sessionId}`);
        const session = activeSessions.get(sessionId);
        if (session) {
          session.status = "connected";
          session.phoneNumber = socket.user?.id?.split(":")[0];
        }
      } else if (connection === "close") {
        const shouldReconnect =
          (lastDisconnect?.error as Boom)?.output?.statusCode !==
          DisconnectReason.loggedOut;

        console.log(
          `[WhatsApp] Disconnected for session ${sessionId}, reconnect: ${shouldReconnect}`
        );

        if (!shouldReconnect) {
          const session = activeSessions.get(sessionId);
          if (session) {
            session.status = "disconnected";
            session.socket = null;
          }
        }
      }
    });

    // Handle credentials update
    socket.ev.on("creds.update", saveCreds);

    // Store session
    activeSessions.set(sessionId, {
      socket,
      qrCode,
      status: "pending",
      createdAt: new Date(),
    });

    // Wait for QR code to be generated (max 10 seconds)
    let attempts = 0;
    while (!qrCode && attempts < 100) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }

    return {
      qrCode: qrCode || "",
      status: "pending",
    };
  } catch (error) {
    console.error(`Error starting WhatsApp session ${sessionId}:`, error);
    throw new Error("Failed to start WhatsApp session");
  }
}

export function getSessionStatus(sessionId: string): {
  status: string;
  phoneNumber?: string;
} {
  const session = activeSessions.get(sessionId);
  if (!session) {
    return { status: "not_found" };
  }

  return {
    status: session.status,
    phoneNumber: session.phoneNumber,
  };
}

export function disconnectSession(sessionId: string): boolean {
  const session = activeSessions.get(sessionId);
  if (!session || !session.socket) {
    return false;
  }

  try {
    session.socket.end(undefined);
    session.status = "disconnected";
    session.socket = null;

    // Clean up session files
    const sessionPath = path.join(sessionsDir, sessionId);
    if (fs.existsSync(sessionPath)) {
      fs.rmSync(sessionPath, { recursive: true });
    }

    activeSessions.delete(sessionId);
    return true;
  } catch (error) {
    console.error(`Error disconnecting session ${sessionId}:`, error);
    return false;
  }
}

export function getQRCode(sessionId: string): string | null {
  const session = activeSessions.get(sessionId);
  return session?.qrCode || null;
}
