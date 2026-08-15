import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function extractPlaylistId(url: string): string | null {
  if (!url) return null;
  const cleanUrl = url.trim();
  const listMatch = cleanUrl.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  if (listMatch && listMatch[1]) {
    return listMatch[1];
  }
  if (/^[A-Za-z0-9_-]{10,}$/.test(cleanUrl) && (
    cleanUrl.startsWith("PL") || 
    cleanUrl.startsWith("UU") || 
    cleanUrl.startsWith("FL") || 
    cleanUrl.startsWith("RD") || 
    cleanUrl.startsWith("OLAK") ||
    cleanUrl.startsWith("TL") ||
    cleanUrl.startsWith("LL") ||
    cleanUrl.startsWith("WL") ||
    cleanUrl.startsWith("CL")
  )) {
    return cleanUrl;
  }
  return null;
}

function extractVideoId(url: string): string | null {
  if (!url) return null;
  const cleanUrl = url.trim();
  const match = cleanUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  return match ? match[1] : null;
}

function formatSeconds(sec: number): string {
  if (!sec || isNaN(sec) || sec <= 0) return "15:00";
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = Math.floor(sec % 60);
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function parseISO8601Duration(iso: string): string {
  if (!iso) return "15:00";
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "15:00";
  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);
  const totalSec = hours * 3600 + minutes * 60 + seconds;
  return formatSeconds(totalSec);
}

interface VideoItem {
  id: string;
  title: string;
  duration?: string;
  thumbnail?: string;
  description?: string;
  channelTitle?: string;
}

interface PlaylistResult {
  playlistId?: string;
  title: string;
  author: string;
  thumbnail?: string;
  description?: string;
  videos: VideoItem[];
}

// Scrape YouTube playlist page with continuation token support for 40+, 80+, 100+ videos
async function fetchYouTubePlaylist(playlistId: string): Promise<PlaylistResult | null> {
  try {
    const res = await fetch(`https://www.youtube.com/playlist?list=${playlistId}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
        "Sec-Ch-Ua": '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Cookie": "CONSENT=YES+cb.20210328-17-p0.en+FX+; SOCS=CAESEwgDEgk2MTQ1MTQ2NzQaAmVuIAEaBgiA_LyaBg;",
      },
    });

    if (!res.ok) return null;
    const html = await res.text();

    // Extract INNERTUBE API Key & Client Version for pagination continuations
    const apiKeyMatch = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/) || html.match(/"innertubeApiKey":"([^"]+)"/);
    const apiKey = apiKeyMatch ? apiKeyMatch[1] : "";
    const clientVersionMatch = html.match(/"INNERTUBE_CLIENT_VERSION":"([^"]+)"/);
    const clientVersion = clientVersionMatch ? clientVersionMatch[1] : "2.20260813.05.00";

    // Extract ytInitialData with robust brace matching
    const idx = html.indexOf("ytInitialData =");
    if (idx === -1) return null;

    const after = html.slice(idx + 15).trim();
    let depth = 0;
    let endIdx = -1;
    for (let i = 0; i < after.length; i++) {
      if (after[i] === "{") depth++;
      else if (after[i] === "}") {
        depth--;
        if (depth === 0) {
          endIdx = i;
          break;
        }
      }
    }

    if (endIdx === -1) return null;
    const data = JSON.parse(after.slice(0, endIdx + 1));

    // Check if playlist exists
    if (data.alerts) {
      for (const alert of data.alerts) {
        if (alert.alertRenderer?.type === "ERROR") {
          console.warn("YouTube playlist error alert:", alert.alertRenderer?.text?.runs?.[0]?.text);
          return null;
        }
      }
    }

    let title = "Curso Importado do YouTube";
    let author = "YouTube Instrutor";
    let playlistThumbnail = "";

    // Metadata title
    const metaTitle = data.metadata?.playlistMetadataRenderer?.title;
    if (metaTitle) title = metaTitle;

    // Header info
    const header = data.header?.playlistHeaderRenderer;
    if (header) {
      const hTitle = header.title?.simpleText || header.title?.runs?.[0]?.text;
      if (hTitle) title = hTitle;
      const hAuthor = header.ownerText?.runs?.[0]?.text || header.ownerText?.simpleText;
      if (hAuthor) author = hAuthor;
      const thumbs = header.playlistHeaderBanner?.thumbnails || header.image?.thumbnails;
      if (thumbs && thumbs.length > 0) {
        playlistThumbnail = thumbs[thumbs.length - 1].url;
      }
    }

    // Sidebar fallback info
    const sidebarItems = data.sidebar?.playlistSidebarRenderer?.items;
    if (sidebarItems && sidebarItems.length > 0) {
      const primary = sidebarItems[0]?.playlistSidebarPrimaryInfoRenderer;
      if (primary?.title?.runs?.[0]?.text && title === "Curso Importado do YouTube") {
        title = primary.title.runs[0].text;
      }
      if (primary?.thumbnailRenderer?.playlistVideoThumbnailRenderer?.thumbnail?.thumbnails && !playlistThumbnail) {
        const thumbs = primary.thumbnailRenderer.playlistVideoThumbnailRenderer.thumbnail.thumbnails;
        playlistThumbnail = thumbs[thumbs.length - 1]?.url || "";
      }
      const secondary = sidebarItems[1]?.playlistSidebarSecondaryInfoRenderer;
      if (secondary?.videoOwner?.videoOwnerRenderer?.title?.runs?.[0]?.text) {
        author = secondary.videoOwner.videoOwnerRenderer.title.runs[0].text;
      }
    }

    const videos: VideoItem[] = [];
    const seen = new Set<string>();
    let continuationToken: string | null = null;

    function traverseForVideos(obj: any) {
      if (!obj || typeof obj !== "object") return;

      // 1. Classic Renderers
      const pvr = obj.playlistVideoRenderer || obj.playlistPanelVideoRenderer || obj.videoRenderer || obj.compactVideoRenderer;
      if (pvr && pvr.videoId) {
        const vid = String(pvr.videoId).trim();
        if (vid && !seen.has(vid)) {
          seen.add(vid);
          const vTitle = pvr.title?.runs?.[0]?.text || pvr.title?.simpleText || pvr.title?.accessibility?.accessibilityData?.label || `Aula ${videos.length + 1}`;
          
          let duration = "15:00";
          if (pvr.lengthText?.simpleText) {
            duration = pvr.lengthText.simpleText;
          } else if (pvr.lengthText?.runs?.[0]?.text) {
            duration = pvr.lengthText.runs[0].text;
          } else if (pvr.lengthSeconds) {
            duration = formatSeconds(Number(pvr.lengthSeconds));
          }

          const thumbs = pvr.thumbnail?.thumbnails;
          const thumbUrl = thumbs && thumbs.length ? thumbs[thumbs.length - 1].url : `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`;
          const chan = pvr.shortBylineText?.runs?.[0]?.text || author;

          videos.push({
            id: vid,
            title: vTitle,
            duration,
            thumbnail: thumbUrl,
            channelTitle: chan,
            description: `Aula ${videos.length + 1} do curso ${title}`,
          });
        }
        return;
      }

      // 2. Modern Lockup View Model (2024-2026 YouTube UI)
      if (obj.lockupViewModel) {
        const lvm = obj.lockupViewModel;
        const vid = lvm.contentId || lvm.rendererContext?.commandContext?.onTap?.innertubeCommand?.watchEndpoint?.videoId;
        if (vid && !seen.has(vid)) {
          seen.add(vid);
          const vTitle = lvm.metadata?.lockupMetadataViewModel?.title?.content || 
                        lvm.rendererContext?.accessibilityContext?.label?.split(" - ")[0] || 
                        `Aula ${videos.length + 1}`;

          let duration = "15:00";
          // Try badge overlay text first
          const overlays = lvm.contentImage?.thumbnailViewModel?.overlays;
          if (Array.isArray(overlays)) {
            for (const ov of overlays) {
              const badge = ov?.thumbnailBottomOverlayViewModel?.badges?.[0]?.thumbnailBadgeViewModel;
              if (badge?.text) {
                duration = badge.text;
                break;
              }
            }
          }
          // Try accessibility label if duration not found
          if (duration === "15:00" && lvm.rendererContext?.accessibilityContext?.label) {
            const label = lvm.rendererContext.accessibilityContext.label;
            const durMatch = label.match(/(\d+:\d+(?::\d+)?)/);
            if (durMatch) {
              duration = durMatch[1];
            }
          }

          const thumbs = lvm.contentImage?.thumbnailViewModel?.image?.sources;
          const thumbUrl = thumbs && thumbs.length ? thumbs[thumbs.length - 1].url : `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`;

          videos.push({
            id: vid,
            title: vTitle,
            duration,
            thumbnail: thumbUrl,
            channelTitle: author,
            description: `Aula ${videos.length + 1} do curso ${title}`,
          });
        }
        return;
      }

      if (obj.continuationItemRenderer) {
        const token = obj.continuationItemRenderer?.continuationEndpoint?.continuationCommand?.token;
        if (token) continuationToken = token;
        return;
      }

      for (const key of Object.keys(obj)) {
        if (Array.isArray(obj[key])) {
          for (const item of obj[key]) {
            traverseForVideos(item);
          }
        } else if (typeof obj[key] === "object") {
          traverseForVideos(obj[key]);
        }
      }
    }

    traverseForVideos(data);

    // Follow continuation tokens if playlist has more than 1 page (40+, 80+, 100+ videos)
    let pageCount = 0;
    while (continuationToken && apiKey && pageCount < 8) {
      pageCount++;
      const currentToken = continuationToken;
      continuationToken = null;

      try {
        const contRes = await fetch(`https://www.youtube.com/youtubei/v1/browse?key=${apiKey}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
          },
          body: JSON.stringify({
            context: {
              client: {
                clientName: "WEB",
                clientVersion,
                hl: "pt",
                gl: "BR",
              },
            },
            continuation: currentToken,
          }),
        });

        if (!contRes.ok) break;
        const contData = await contRes.json();
        traverseForVideos(contData);
      } catch (contErr) {
        console.error("Continuation pagination error:", contErr);
        break;
      }
    }

    if (videos.length > 0) {
      return {
        playlistId,
        title,
        author,
        thumbnail: playlistThumbnail || videos[0].thumbnail,
        description: `Curso completo com ${videos.length} aulas sincronizadas.`,
        videos,
      };
    }
  } catch (err) {
    console.error("fetchYouTubePlaylist error:", err);
  }
  return null;
}

// Fetch exact details for individual YouTube video
async function fetchVideoDetails(videoId: string): Promise<VideoItem> {
  try {
    const oembedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    if (oembedRes.ok) {
      const data = await oembedRes.json();
      return {
        id: videoId,
        title: data.title || `Aula #${videoId}`,
        channelTitle: data.author_name || "YouTube Instrutor",
        thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        duration: "18:30",
        description: `Aula sobre ${data.title || videoId}`,
      };
    }
  } catch (e) {
    console.error(`Error fetching oEmbed for video ${videoId}:`, e);
  }

  return {
    id: videoId,
    title: `Aula #${videoId}`,
    thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    duration: "15:00",
    channelTitle: "YouTube Instrutor",
    description: `Aula #${videoId}`,
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Fetch playlist / video info / file contents endpoint
  app.post("/api/playlist", async (req, res) => {
    try {
      const { url, title: customTitle, rawContent } = req.body;
      const targetInput = String(rawContent || url || "").trim();

      if (!targetInput) {
        return res.status(400).json({ error: "URL da playlist, vídeo ou lista de aulas é obrigatória." });
      }

      // Check if input is a playlist URL or playlist ID
      const playlistId = extractPlaylistId(targetInput);

      if (playlistId) {
        const result = await fetchYouTubePlaylist(playlistId);

        if (result && result.videos.length > 0) {
          if (customTitle && customTitle.trim()) {
            result.title = customTitle.trim();
          }
          return res.json({ success: true, course: result });
        }
      }

      // Extract all YouTube video IDs from the text (whether pasted URLs, file contents, or single ID)
      const videoMatches = Array.from(targetInput.matchAll(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/g));
      const extractedIds: string[] = [];

      for (const m of videoMatches) {
        if (m[1] && !extractedIds.includes(m[1])) {
          extractedIds.push(m[1]);
        }
      }

      // Also check line-by-line for 11-char standalone IDs
      const lines = targetInput.split(/[\r\n]+/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (/^[\w-]{11}$/.test(trimmed) && !extractedIds.includes(trimmed)) {
          extractedIds.push(trimmed);
        }
      }

      if (extractedIds.length > 0) {
        // Fetch metadata in parallel batches (concurrency: 8)
        const videos: VideoItem[] = [];
        const batchSize = 8;
        
        for (let i = 0; i < extractedIds.length; i += batchSize) {
          const chunk = extractedIds.slice(i, i + batchSize);
          const chunkResults = await Promise.all(chunk.map(id => fetchVideoDetails(id)));
          videos.push(...chunkResults);
        }

        const courseTitle = customTitle || (videos.length === 1 ? videos[0].title : `Curso Completo (${videos.length} Aulas)`);
        const courseAuthor = videos[0]?.channelTitle || "YouTube Instrutor";

        return res.json({
          success: true,
          course: {
            playlistId: playlistId || undefined,
            title: courseTitle,
            author: courseAuthor,
            thumbnail: videos[0]?.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
            description: `Curso estruturado com ${videos.length} aulas sincronizadas.`,
            videos,
          },
        });
      }

      // If the user provided a YouTube link that could not be accessed
      const isYouTubeUrl = targetInput.includes("youtube.com") || targetInput.includes("youtu.be") || targetInput.startsWith("PL");
      if (isYouTubeUrl) {
        return res.status(404).json({
          error: "Não foi possível carregar os vídeos dessa playlist do YouTube. Verifique se a playlist é pública e possui vídeos disponíveis.",
        });
      }

      // Fallback: If GenAI is available and input is a topic or text outline
      const ai = getGenAI();
      if (ai) {
        try {
          const prompt = `O usuário forneceu o seguinte texto/tópico: "${targetInput.slice(0, 1000)}".
Crie uma grade de curso completa e estruturada em formato JSON com aulas práticas:
{
  "title": "Título do Curso",
  "author": "Instrutor Especialista",
  "description": "Descrição detalhada do curso",
  "videos": [
    { "id": "S9uPNppGsGo", "title": "Aula 01: Fundamentos e Visão Geral", "duration": "24:30", "description": "Conceitos introdutórios" },
    { "id": "31llNGKWDdo", "title": "Aula 02: Configuração e Primeiros Passos", "duration": "35:10", "description": "Prática guiada" },
    { "id": "hdDGoQC132k", "title": "Aula 03: Desenvolvimento e Arquitetura", "duration": "28:45", "description": "Estruturação de projetos" },
    { "id": "PkZNo7MFNFg", "title": "Aula 04: Aplicação Prática e Boas Práticas", "duration": "31:20", "description": "Implementação completa" }
  ]
}
Retorne APENAS o JSON válido.`;

          const response = await ai.models.generateContent({
            model: "gemini-3.7-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
            },
          });

          const rawText = response.text || "";
          const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
          const parsed = JSON.parse(cleanJson);
          if (parsed && Array.isArray(parsed.videos) && parsed.videos.length > 0) {
            return res.json({ success: true, course: parsed });
          }
        } catch (aiErr) {
          console.error("AI outline fallback error:", aiErr);
        }
      }

      return res.status(404).json({
        error: "Não foi possível identificar vídeos ou conteúdo para criar o curso. Forneça uma URL de playlist do YouTube válida ou uma lista de links de vídeos.",
      });
    } catch (err: any) {
      console.error("Playlist route error:", err);
      res.status(500).json({ error: err.message || "Erro interno ao processar a playlist." });
    }
  });

  // AI Lesson Assistant Endpoint
  app.post("/api/ai-lesson-notes", async (req, res) => {
    try {
      const { lessonTitle, courseTitle, channel } = req.body;
      const ai = getGenAI();
      if (!ai) {
        return res.status(503).json({ error: "Gemini API key não configurada no servidor." });
      }

      const prompt = `Você é um assistente pedagógico de elite de uma plataforma de cursos estilo Udemy/Hotmart.
O aluno está assistindo à seguinte aula:
- Curso: "${courseTitle || "Geral"}"
- Aula: "${lessonTitle}"
- Canal/Instrutor: "${channel || "Instrutor"}"

Gere um resumo estruturado de estudos em Português (Brasil) com:
1. Resumo Executivo (2 a 3 frases claras e diretas)
2. Principais Conceitos & Tópicos-Chave (3 a 5 itens em bullet points)
3. 2 Perguntas rápidas de autoavaliação para fixar o aprendizado (com respostas curtas explicadas)
4. Dica Prática de Aplicação imediata

Retorne em formato JSON válido:
{
  "summary": "...",
  "keyTakeaways": ["item 1", "item 2", "item 3"],
  "quiz": [
    { "question": "Pergunta 1?", "answer": "Resposta explicada" }
  ],
  "practicalTip": "Dica prática para colocar em ação"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const rawText = response.text || "";
      const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanJson);
      res.json({ success: true, data: parsed });
    } catch (err: any) {
      console.error("AI Notes error:", err);
      res.status(500).json({ error: "Erro ao gerar anotações inteligentes com IA." });
    }
  });

  // Vite middleware in dev mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor rodando em http://0.0.0.0:${PORT}`);
  });
}

startServer();

