const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { inflateRawSync } = require("node:zlib");

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "127.0.0.1";
const MODEL = process.env.GOOGLE_MODEL || "gemini-3.8-flash";
const indexPath = path.join(__dirname, "ia.html");

function sendJson(res, status, payload) {
	res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
	res.end(JSON.stringify(payload));
}

async function readJson(req) {
	let size = 0;
	const chunks = [];
	for await (const chunk of req) {
		size += chunk.length;
		if (size > 20 * 1024 * 1024) throw new Error("Archivo o mensaje demasiado grande.");
		chunks.push(chunk);
	}
	return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function fileToGeminiPart(file) {
	const base64Data = file.data.includes(",") ? file.data.split(",")[1] : file.data;
	if (file.mimeType.startsWith("image/") || file.mimeType === "application/pdf") {
		return { inlineData: { mimeType: file.mimeType, data: base64Data } };
	}
	try {
		const text = Buffer.from(base64Data, "base64").toString("utf8");
		return { text: `Contenido de ${file.name}:\n${text}` };
	} catch {
		return { text: `[Archivo adjunto: ${file.name}]` };
	}
}

async function handleChat(req, res) {
	const apiKey = process.env.GOOGLE_API_KEY?.trim();
	if (!apiKey) {
		sendJson(res, 503, { error: "Falta configurar la GOOGLE_API_KEY en el servidor." });
		return;
	}

	let body;
	try {
		body = await readJson(req);
	} catch (e) {
		sendJson(res, 400, { error: "Solicitud inválida." });
		return;
	}

	const contents = (body.messages || []).map((m) => ({
		role: m.role === "assistant" ? "model" : "user",
		parts: [{ text: m.content }]
	}));

	if (body.files && body.files.length > 0) {
		const lastUserParts = contents[contents.length - 1].parts;
		for (const file of body.files) {
			lastUserParts.push(fileToGeminiPart(file));
		}
	}

	try {
		const upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:streamGenerateContent?alt=sse`, {
			method: "POST",
			headers: {
				"x-goog-api-key": apiKey,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				systemInstruction: {
					parts: [{ text: "Eres BoscoIA, un asistente educativo claro, respetuoso y útil. Explica paso a paso para facilitar el aprendizaje." }]
				},
				contents
			})
		});

		if (!upstream.ok) {
			const errRes = await upstream.json().catch(() => ({}));
			sendJson(res, upstream.status, { error: errRes.error?.message || "Error al consultar Gemini." });
			return;
		}

		res.writeHead(200, {
			"Content-Type": "text/event-stream; charset=utf-8",
			"Cache-Control": "no-cache",
			"Connection": "keep-alive"
		});

		const reader = upstream.body.getReader();
		const decoder = new TextDecoder();
		let buffer = "";

		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			buffer += decoder.decode(value, { stream: true });
			let lines = buffer.split("\n");
			buffer = lines.pop();
			for (const line of lines) {
				if (line.startsWith("data:")) {
					const dataStr = line.slice(5).trim();
					if (dataStr === "[DONE]") continue;
					try {
						const parsed = JSON.parse(dataStr);
						const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
						if (text) {
							res.write(`data: ${JSON.stringify({ delta: text })}\n\n`);
						}
					} catch {}
				}
			}
		}
		res.end();
	} catch (e) {
		sendJson(res, 502, { error: "Fallo de comunicación con la API de IA." });
	}
}

const server = http.createServer(async (req, res) => {
	if (req.method === "GET" && req.url === "/api/health") {
		sendJson(res, 200, { ready: Boolean(process.env.GOOGLE_API_KEY), model: MODEL });
		return;
	}
	if (req.method === "POST" && req.url === "/api/chat") {
		await handleChat(req, res);
		return;
	}
	if (req.method === "GET" && ["/", "/ia.html"].includes(req.url)) {
		fs.readFile(indexPath, (err, content) => {
			if (err) {
				res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
				res.end("Error interno cargando la interfaz.");
				return;
			}
			res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
			res.end(content);
		});
		return;
	}
	sendJson(res, 404, { error: "No encontrado." });
});

server.listen(PORT, HOST, () => {
	console.log(`BoscoIA funcionando en http://${HOST}:${PORT}`);
});