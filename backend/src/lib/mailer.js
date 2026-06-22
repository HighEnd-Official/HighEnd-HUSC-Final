import net from "node:net";
import tls from "node:tls";
import { once } from "node:events";
import { createHttpError } from "./http.js";

function getSmtpConfig() {
  const host = String(process.env.SMTP_HOST || "").trim();
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || "").toLowerCase() === "true" || port === 465;
  const requireTls = String(process.env.SMTP_REQUIRE_TLS || "true").toLowerCase() !== "false";
  const user = String(process.env.SMTP_USER || "").trim();
  const pass = String(process.env.SMTP_PASS || "");
  const from = String(process.env.SMTP_FROM || "").trim();
  const fromName = String(process.env.SMTP_FROM_NAME || "Huse Support").trim();

  if (!host) {
    throw createHttpError(500, "SMTP_HOST is not configured.");
  }
  if (!from) {
    throw createHttpError(500, "SMTP_FROM is not configured.");
  }

  return { host, port, secure, requireTls, user, pass, from, fromName };
}

function encodeMimeWord(value) {
  return `=?UTF-8?B?${Buffer.from(String(value), "utf8").toString("base64")}?=`;
}

function dotStuff(text) {
  return String(text || "").replace(/^\./gm, "..");
}

function createSocket(config) {
  return config.secure
    ? tls.connect({
        host: config.host,
        port: config.port,
        servername: config.host,
      })
    : net.connect({
        host: config.host,
        port: config.port,
      });
}

async function readSmtpResponse(socket) {
  return new Promise((resolve, reject) => {
    let buffer = "";
    const lines = [];

    const cleanup = () => {
      socket.off("data", onData);
      socket.off("error", onError);
      socket.off("close", onClose);
    };

    const finish = () => {
      const lastLine = lines[lines.length - 1] || "";
      const code = Number(lastLine.slice(0, 3));
      cleanup();
      resolve({ code, lines, text: lines.join("\n") });
    };

    const onData = (chunk) => {
      buffer += chunk.toString("utf8");
      let index = buffer.indexOf("\n");
      while (index !== -1) {
        const line = buffer.slice(0, index).replace(/\r$/, "");
        buffer = buffer.slice(index + 1);
        lines.push(line);
        if (/^\d{3} /.test(line)) {
          finish();
          return;
        }
        index = buffer.indexOf("\n");
      }
    };

    const onError = (error) => {
      cleanup();
      reject(error);
    };

    const onClose = () => {
      cleanup();
      reject(new Error("SMTP connection closed unexpectedly."));
    };

    socket.on("data", onData);
    socket.on("error", onError);
    socket.on("close", onClose);
  });
}

async function sendCommand(socket, command) {
  socket.write(`${command}\r\n`);
  const response = await readSmtpResponse(socket);
  if (response.code >= 400) {
    throw new Error(`SMTP command failed: ${command}`);
  }
  return response;
}

async function ensureStartTls(socket, config) {
  if (config.secure) return socket;

  const ehlo = await sendCommand(socket, `EHLO ${config.host}`);
  if (!/STARTTLS/i.test(ehlo.text)) {
    if (config.requireTls) {
      throw createHttpError(500, "SMTP server does not advertise STARTTLS.");
    }
    return socket;
  }

  socket.write("STARTTLS\r\n");
  const startTlsResponse = await readSmtpResponse(socket);
  if (startTlsResponse.code !== 220) {
    throw new Error("SMTP STARTTLS negotiation failed.");
  }

  const secureSocket = tls.connect({
    socket,
    servername: config.host,
  });
  await once(secureSocket, "secureConnect");
  secureSocket.setEncoding("utf8");
  return secureSocket;
}

async function authenticateIfNeeded(socket, config) {
  if (!config.user) return;

  const authStart = await sendCommand(socket, "AUTH LOGIN");
  if (authStart.code !== 334) {
    throw new Error("SMTP AUTH LOGIN was rejected.");
  }

  socket.write(`${Buffer.from(config.user, "utf8").toString("base64")}\r\n`);
  const passChallenge = await readSmtpResponse(socket);
  if (passChallenge.code !== 334) {
    throw new Error("SMTP username was rejected.");
  }

  socket.write(`${Buffer.from(config.pass, "utf8").toString("base64")}\r\n`);
  const authResult = await readSmtpResponse(socket);
  if (authResult.code !== 235) {
    throw new Error("SMTP authentication failed.");
  }
}

export async function sendEmail({ to, subject, text }) {
  const config = getSmtpConfig();
  const socket = createSocket(config);
  socket.setEncoding("utf8");
  let activeSocket = socket;

  try {
    const greeting = await readSmtpResponse(socket);
    if (greeting.code !== 220) {
      throw new Error("SMTP server did not return a greeting.");
    }

    if (!config.secure) {
      activeSocket = await ensureStartTls(activeSocket, config);
      if (activeSocket !== socket) {
        await sendCommand(activeSocket, `EHLO ${config.host}`);
      }
    } else {
      await sendCommand(activeSocket, `EHLO ${config.host}`);
    }

    await authenticateIfNeeded(activeSocket, config);
    await sendCommand(activeSocket, `MAIL FROM:<${config.from}>`);
    await sendCommand(activeSocket, `RCPT TO:<${String(to).trim()}>`);
    await sendCommand(activeSocket, "DATA");

    const message = [
      `From: ${encodeMimeWord(config.fromName)} <${config.from}>`,
      `To: <${String(to).trim()}>`,
      `Subject: ${encodeMimeWord(subject)}`,
      "MIME-Version: 1.0",
      'Content-Type: text/plain; charset="UTF-8"',
      "Content-Transfer-Encoding: 8bit",
      "",
      dotStuff(text),
    ].join("\r\n");

    activeSocket.write(`${message}\r\n.\r\n`);
    const dataResult = await readSmtpResponse(activeSocket);
    if (dataResult.code !== 250) {
      throw new Error("SMTP server rejected the message body.");
    }

    try {
      await sendCommand(activeSocket, "QUIT");
    } catch {
      // Ignore QUIT errors after a successful send.
    }
  } finally {
    activeSocket.destroy();
  }
}
