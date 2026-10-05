(() => {
  const W = 1920, H = 1200;

  // ============================================================
  //  CONFIGURACIÓN (todo lo visual se ajusta aquí)
  // ============================================================
  const CONFIG = {
    fontFamily: "CardFont",
    fallbackFont: "sans-serif",
    letterSpacing: 0,

    texts: {
      name: "Username",
      label: "Nominado",
      bottom: "Esto es un texto de prueba para previsualizar el comportamiento del texto",
    },

    // Marco exterior blanco 
    frame: {
      x: 20, y: 20,
      radius: 56,
      fill: "#ffffff",
      borderColor: "#d5d9e0",
      borderWidth: 2,
      innerMargin: 22,
      innerRadius: 40,
    },

    // Fondo (patrón genérico o imagen subida)
    pattern: {
      cell: 130,
      gap: 28,
      radius: 26,
      blur: 6,               // desenfoque del patrón
      imageBlur: 8,          // desenfoque cuando el fondo es una imagen subida
      colors: ["#8fa2bc", "#a7b6ca", "#b9c5d6", "#7f93af"],
      cellAlpha: 0.55,
      glyphColor: "rgba(255,255,255,0.65)",
      seed: 7,
      image: null,           // se llena al subir una imagen de fondo
      // Máscara diagonal: transparente en "from", opaco en "to" (fracciones de W/H)
      maskFrom: { x: 0.30, y: 1.0 },
      maskTo:   { x: 0.72, y: 0.0 },
      maskOffset: 0,
      maskAngle: -56.1,
    },

    glow: {
      color: "#ffffff",
      intensity: 38,
      x: 0.08,
      y: 0.98,
      radius: 780,
    },

    // Imagen del título
    title: {
      w: 920, h: 210,        // caja donde se ajusta la imagen (contain, centrada)
      y: 78,
      scale: 100,
      offsetX: 0,
      offsetY: 0,
      image: null,           // se llena al subir la imagen
      placeholderFill: "rgba(120,140,165,0.12)",
      placeholderStroke: "rgba(120,140,165,0.6)",
      placeholderText: "IMAGEN DEL TITULO",
      placeholderTextColor: "rgba(100,120,150,0.8)",
      placeholderFontSize: 38,
    },

    // Texto "Nominado"
    label: {
      y: 305,
      size: 80,
      weight: "700",
      maxWidth: 1400,
      gradient: ["#ff8a1f", "#ffd23f"],
      shadow: { color: "rgba(160,80,0,0.35)", blur: 18, offsetX: 0, offsetY: 8 },
      outline: "#000000",
      outlineWidth: 15,
    },

    // Avatar circular
    avatar: {
      cx: 340, cy: 600,
      r: 235,
      borderWidth: 22,
      borderColor: "#ffffff",
      shadow: { color: "rgba(40,55,80,0.28)", blur: 30, offsetX: 0, offsetY: 12 },
      image: null,           // se llena al subir la foto (recorte "cover")
      placeholderBg: "#b3bbc7",
      placeholderFg: "#8f99a8",
    },

    flag: {
      image: null,
      name: "",
      size: 210,
      offsetX: 160,
      offsetY: 160,
      placeholderFill: "rgba(120,140,165,0.12)",
      placeholderStroke: "rgba(120,140,165,0.6)",
      placeholderTextColor: "rgba(100,120,150,0.8)",
    },

    // Franja translúcida con el nombre
    band: {
      height: 210,
      endX: W - 90,
      radius: 105,
      fill: "rgba(54, 54, 54, 0.28)",
      text: {
        size: 140,
        weight: "700",
        color: "#ffffff",
        paddingLeft: 50,
        paddingRight: 60,
        minSize: 40,
      },
    },

    // Texto inferior
    bottom: {
      y: 1085,
      size: 78,
      minSize: 40,
      weight: "700",
      maxWidth: 1500,
      maxHeight: 140,
      lineHeight: 1.15,
      gradient: ["#ff8a1f", "#ffd23f"],
      shadow: { color: "rgba(160,80,0,0.22)", blur: 8, offsetX: 0, offsetY: 4 },
      outline: "#000000",
      outlineWidth: 15,
    },
  };
  const DEFAULT_CONFIG = structuredClone(CONFIG);

  // ============================================================
  //  Utilidades
  // ============================================================
  const canvas = document.getElementById("card");
  const ctx = canvas.getContext("2d");

  const inputs = {
    name: document.getElementById("inName"),
    label: document.getElementById("inLabel"),
    bottom: document.getElementById("inBottom"),
  };

  const fontStr = (size, weight) =>
    `${weight} ${size}px "${CONFIG.fontFamily}", ${CONFIG.fallbackFont}`;

  function roundRectPath(c, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }

  // Dibuja una imagen llenando el rectángulo (recorte tipo "cover")
  function drawCover(c, img, x, y, w, h) {
    const s = Math.max(w / img.width, h / img.height);
    const dw = img.width * s, dh = img.height * s;
    c.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  }

  // Dibuja una imagen completa dentro del rectángulo (tipo "contain", centrada)
  function drawContain(c, img, x, y, w, h) {
    const s = Math.min(w / img.width, h / img.height);
    const dw = img.width * s, dh = img.height * s;
    c.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  }

  function fitSize(text, maxWidth, startSize, weight, minSize = 24) {
    let size = startSize;
    while (size > minSize) {
      ctx.font = fontStr(size, weight);
      if (ctx.measureText(text).width <= maxWidth) break;
      size -= 2;
    }
    return size;
  }

  function drawGradientText(text, cfg) {
    const size = fitSize(text, cfg.maxWidth, cfg.size, cfg.weight);
    ctx.save();
    ctx.font = fontStr(size, cfg.weight);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const g = ctx.createLinearGradient(0, cfg.y - size / 2, 0, cfg.y + size / 2);
    g.addColorStop(0, cfg.gradient[0]);
    g.addColorStop(1, cfg.gradient[1]);
    ctx.fillStyle = g;
    ctx.lineJoin = "round";
    ctx.strokeStyle = cfg.outline;
    ctx.lineWidth = cfg.outlineWidth * (size / cfg.size);
    ctx.strokeText(text, W / 2, cfg.y);
    ctx.shadowColor = cfg.shadow.color;
    ctx.shadowBlur = cfg.shadow.blur;
    ctx.shadowOffsetX = cfg.shadow.offsetX;
    ctx.shadowOffsetY = cfg.shadow.offsetY;
    ctx.fillText(text, W / 2, cfg.y);
    ctx.restore();
  }

  function wrapText(text, maxWidth) {
    const lines = [];
    for (const paragraph of text.split(/\r?\n/)) {
      let line = "";
      for (const word of paragraph.trim().split(/\s+/).filter(Boolean)) {
        const candidate = line ? `${line} ${word}` : word;
        if (ctx.measureText(candidate).width <= maxWidth) {
          line = candidate;
          continue;
        }
        if (line) lines.push(line);
        line = "";
        for (const character of word) {
          const part = line + character;
          if (ctx.measureText(part).width > maxWidth && line) {
            lines.push(line);
            line = character;
          } else {
            line = part;
          }
        }
      }
      if (line) lines.push(line);
    }
    return lines;
  }

  function drawBottomText(text, cfg) {
    let size = cfg.size;
    let lines;
    while (size > cfg.minSize) {
      ctx.font = fontStr(size, cfg.weight);
      lines = wrapText(text, cfg.maxWidth);
      if (lines.length * size * cfg.lineHeight <= cfg.maxHeight) break;
      size -= 2;
    }
    size = Math.max(size, cfg.minSize);
    ctx.font = fontStr(size, cfg.weight);
    lines = wrapText(text, cfg.maxWidth);

    const lineHeight = size * cfg.lineHeight;
    const maxLines = Math.floor(cfg.maxHeight / lineHeight);
    if (lines.length > maxLines) {
      lines = lines.slice(0, maxLines);
      let lastLine = lines[maxLines - 1];
      while (lastLine && ctx.measureText(`${lastLine}…`).width > cfg.maxWidth) {
        lastLine = lastLine.slice(0, -1);
      }
      lines[maxLines - 1] = `${lastLine.trimEnd()}…`;
    }

    ctx.save();
    ctx.font = fontStr(size, cfg.weight);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    ctx.lineWidth = cfg.outlineWidth * (size / cfg.size);
    ctx.strokeStyle = cfg.outline;
    ctx.shadowColor = cfg.shadow.color;
    ctx.shadowBlur = cfg.shadow.blur;
    ctx.shadowOffsetX = cfg.shadow.offsetX;
    ctx.shadowOffsetY = cfg.shadow.offsetY;
    const firstY = cfg.y - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((line, index) => {
      const y = firstY + index * lineHeight;
      const gradient = ctx.createLinearGradient(0, y - size / 2, 0, y + size / 2);
      gradient.addColorStop(0, cfg.gradient[0]);
      gradient.addColorStop(1, cfg.gradient[1]);
      ctx.fillStyle = gradient;
      ctx.strokeText(line, W / 2, y);
      ctx.fillText(line, W / 2, y);
    });
    ctx.restore();
  }

  // ============================================================
  //  Fondo (patrón o imagen) + desenfoque + máscara diagonal
  // ============================================================
  function seeded(seed) {
    let s = seed;
    return () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  function drawGlyph(c, x, y, size, type) {
    const p = CONFIG.pattern;
    c.fillStyle = p.glyphColor;
    c.strokeStyle = p.glyphColor;
    c.lineWidth = 7;
    const cx = x + size / 2, cy = y + size / 2, u = size * 0.22;
    switch (type) {
      case 0:
        c.beginPath(); c.arc(cx, cy, u, 0, Math.PI * 2); c.fill(); break;
      case 1:
        c.beginPath();
        c.moveTo(cx, cy - u); c.lineTo(cx + u, cy + u); c.lineTo(cx - u, cy + u);
        c.closePath(); c.fill(); break;
      case 2:
        for (let i = -1; i <= 1; i++) c.fillRect(cx + i * u * 0.85 - 5, cy - u + Math.abs(i) * 10, 10, u * 2 - Math.abs(i) * 10);
        break;
      case 3:
        c.strokeRect(cx - u, cy - u, u * 2, u * 2); break;
      default:
        c.beginPath();
        c.moveTo(cx, cy - u); c.lineTo(cx + u, cy); c.lineTo(cx, cy + u); c.lineTo(cx - u, cy);
        c.closePath(); c.fill();
    }
  }

  function drawPatternGrid(rc) {
    const p = CONFIG.pattern;
    const rnd = seeded(p.seed);
    const step = p.cell + p.gap;
    for (let y = -step / 2; y < H; y += step) {
      for (let x = -step / 2; x < W; x += step) {
        rc.globalAlpha = p.cellAlpha;
        rc.fillStyle = p.colors[Math.floor(rnd() * p.colors.length)];
        roundRectPath(rc, x, y, p.cell, p.cell, p.radius);
        rc.fill();
        rc.globalAlpha = 1;
        drawGlyph(rc, x, y, p.cell, Math.floor(rnd() * 5));
      }
    }
  }

  let bgLayer = null;

  function buildBackground() {
    const p = CONFIG.pattern;
    const useImage = !!p.image;
    const blur = useImage ? p.imageBlur : p.blur;

    // 1) Capa base nítida (patrón o imagen subida)
    const raw = document.createElement("canvas");
    raw.width = W; raw.height = H;
    const rc = raw.getContext("2d");
    if (useImage) {
      // Sobredimensionada para que el desenfoque no deje bordes transparentes
      const m = blur * 3;
      drawCover(rc, p.image, -m, -m, W + m * 2, H + m * 2);
    } else {
      drawPatternGrid(rc);
    }

    // 2) Desenfoque
    const bg = document.createElement("canvas");
    bg.width = W; bg.height = H;
    const bc = bg.getContext("2d");
    if ("filter" in bc) {
      bc.filter = `blur(${blur}px)`;
      bc.drawImage(raw, 0, 0);
      bc.filter = "none";
    } else {
      // Fallback (Safari): reducir y ampliar
      const k = Math.max(2, Math.round(blur * 0.8));
      const small = document.createElement("canvas");
      small.width = Math.round(W / k); small.height = Math.round(H / k);
      small.getContext("2d").drawImage(raw, 0, 0, small.width, small.height);
      bc.imageSmoothingQuality = "high";
      bc.drawImage(small, 0, 0, W, H);
    }

    // 3) Máscara diagonal: se disuelve hacia la izquierda
    bc.globalCompositeOperation = "destination-in";
    const fromX = p.maskFrom.x * W;
    const fromY = p.maskFrom.y * H;
    const toX = p.maskTo.x * W;
    const toY = p.maskTo.y * H;
    const centerX = (fromX + toX) / 2;
    const centerY = (fromY + toY) / 2;
    const halfLength = Math.hypot(toX - fromX, toY - fromY) / 2;
    const angle = p.maskAngle * Math.PI / 180;
    const directionX = Math.cos(angle);
    const directionY = Math.sin(angle);
    const shiftedX = centerX + directionX * p.maskOffset;
    const shiftedY = centerY + directionY * p.maskOffset;
    const g = bc.createLinearGradient(
      shiftedX - directionX * halfLength,
      shiftedY - directionY * halfLength,
      shiftedX + directionX * halfLength,
      shiftedY + directionY * halfLength
    );
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(0,0,0,1)");
    bc.fillStyle = g;
    bc.fillRect(0, 0, W, H);
    bc.globalCompositeOperation = "source-over";

    bgLayer = bg;
  }

  // ============================================================
  //  Dibujo por partes
  // ============================================================
  function drawFrame() {
    const f = CONFIG.frame;
    ctx.save();
    roundRectPath(ctx, f.x, f.y, W - f.x * 2, H - f.y * 2, f.radius);
    ctx.fillStyle = f.fill;
    ctx.fill();
    ctx.lineWidth = f.borderWidth;
    ctx.strokeStyle = f.borderColor;
    ctx.stroke();
    ctx.restore();

    const m = f.x + f.innerMargin;
    ctx.save();
    roundRectPath(ctx, m, m, W - m * 2, H - m * 2, f.innerRadius);
    ctx.clip();
    ctx.drawImage(bgLayer, 0, 0);
    drawGlow();
    ctx.restore();
  }

  function drawGlow() {
    const glow = CONFIG.glow;
    const alpha = glow.intensity / 100;
    if (!alpha) return;

    const rgb = [1, 3, 5].map((index) => parseInt(glow.color.slice(index, index + 2), 16));
    const color = (opacity) => `rgba(${rgb.join(",")},${opacity})`;
    const x = glow.x * W;
    const y = glow.y * H;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, glow.radius);
    gradient.addColorStop(0, color(alpha));
    gradient.addColorStop(0.42, color(alpha * 0.55));
    gradient.addColorStop(1, color(0));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);
  }

  function drawTitle() {
    const t = CONFIG.title;
    const scale = t.scale / 100;
    const width = t.w * scale;
    const height = t.h * scale;
    const x = (W - width) / 2 + t.offsetX;
    const y = t.y + t.offsetY;
    if (t.image) {
      drawContain(ctx, t.image, x, y, width, height);
      return;
    }
    ctx.save();
    roundRectPath(ctx, x, y, width, height, 24 * scale);
    ctx.fillStyle = t.placeholderFill;
    ctx.fill();
    ctx.setLineDash([16 * scale, 12 * scale]);
    ctx.lineWidth = 3 * scale;
    ctx.strokeStyle = t.placeholderStroke;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = t.placeholderTextColor;
    ctx.font = fontStr(t.placeholderFontSize * scale, "600");
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(t.placeholderText, x + width / 2, y + height / 2);
    ctx.restore();
  }

  function drawBandAndName(name) {
    const a = CONFIG.avatar, b = CONFIG.band;
    const top = a.cy - b.height / 2;

    ctx.save();
    roundRectPath(ctx, a.cx, top, b.endX - a.cx, b.height, b.radius);
    ctx.fillStyle = b.fill;
    ctx.fill();
    ctx.restore();

    const t = b.text;
    const textX = a.cx + a.r + t.paddingLeft;
    const maxW = b.endX - textX - t.paddingRight;
    const txt = name.toUpperCase();
    const size = fitSize(txt, maxW, t.size, t.weight, t.minSize);
    ctx.save();
    ctx.font = fontStr(size, t.weight);
    ctx.fillStyle = t.color;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(txt, textX, a.cy);
    ctx.restore();
  }

  function drawAvatar() {
    const a = CONFIG.avatar;
    const inner = a.r - a.borderWidth;

    ctx.save();
    ctx.shadowColor = a.shadow.color;
    ctx.shadowBlur = a.shadow.blur;
    ctx.shadowOffsetX = a.shadow.offsetX;
    ctx.shadowOffsetY = a.shadow.offsetY;
    ctx.beginPath();
    ctx.arc(a.cx, a.cy, a.r, 0, Math.PI * 2);
    ctx.fillStyle = a.borderColor;
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(a.cx, a.cy, inner, 0, Math.PI * 2);
    ctx.clip();
    if (a.image) {
      drawCover(ctx, a.image, a.cx - inner, a.cy - inner, inner * 2, inner * 2);
    } else {
      ctx.fillStyle = a.placeholderBg;
      ctx.fillRect(a.cx - inner, a.cy - inner, inner * 2, inner * 2);
      ctx.fillStyle = a.placeholderFg;
      ctx.beginPath();
      ctx.arc(a.cx, a.cy - inner * 0.18, inner * 0.34, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(a.cx, a.cy + inner * 0.95, inner * 0.72, inner * 0.62, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawFlagBadge() {
    const avatar = CONFIG.avatar;
    const flag = CONFIG.flag;
    const cx = avatar.cx + flag.offsetX;
    const cy = avatar.cy + flag.offsetY;

    if (!flag.image) {
      const width = flag.size;
      const height = width * 0.64;
      const x = cx - width / 2;
      const y = cy - height / 2;
      ctx.save();
      roundRectPath(ctx, x, y, width, height, 18);
      ctx.fillStyle = flag.placeholderFill;
      ctx.fill();
      ctx.setLineDash([12, 9]);
      ctx.lineWidth = 3;
      ctx.strokeStyle = flag.placeholderStroke;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = flag.placeholderTextColor;
      ctx.font = fontStr(Math.max(15, width * 0.1), "600");
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("ELIGE BANDERA", cx, cy);
      ctx.restore();
      return;
    }

    if (!flag.layer) flag.layer = createFlagLayer(flag.image, flag.size, avatar.borderWidth);
    ctx.save();
    ctx.shadowColor = avatar.shadow.color;
    ctx.shadowBlur = avatar.shadow.blur;
    ctx.shadowOffsetX = avatar.shadow.offsetX;
    ctx.shadowOffsetY = avatar.shadow.offsetY;
    ctx.drawImage(flag.layer, cx - flag.layer.width / 2, cy - flag.layer.height / 2);
    ctx.restore();
  }

  function createFlagLayer(image, maxSize, borderWidth) {
    const scale = maxSize / Math.max(image.naturalWidth, image.naturalHeight);
    const imageWidth = Math.max(1, Math.round(image.naturalWidth * scale));
    const imageHeight = Math.max(1, Math.round(image.naturalHeight * scale));
    const width = imageWidth + borderWidth * 2;
    const height = imageHeight + borderWidth * 2;
    const silhouette = document.createElement("canvas");
    silhouette.width = width;
    silhouette.height = height;
    const silhouetteContext = silhouette.getContext("2d");
    silhouetteContext.drawImage(image, borderWidth, borderWidth, imageWidth, imageHeight);
    silhouetteContext.globalCompositeOperation = "source-in";
    silhouetteContext.fillStyle = "#ffffff";
    silhouetteContext.fillRect(0, 0, width, height);

    const layer = document.createElement("canvas");
    layer.width = width;
    layer.height = height;
    const layerContext = layer.getContext("2d");
    const samples = 64;
    for (let index = 0; index < samples; index++) {
      const angle = (index / samples) * Math.PI * 2;
      layerContext.drawImage(
        silhouette,
        Math.cos(angle) * borderWidth,
        Math.sin(angle) * borderWidth
      );
    }
    layerContext.drawImage(image, borderWidth, borderWidth, imageWidth, imageHeight);
    return layer;
  }

  function draw() {
    const texts = {
      name: inputs.name.value.trim() || CONFIG.texts.name,
      label: inputs.label.value.trim() || CONFIG.texts.label,
      bottom: inputs.bottom.value.trim() || CONFIG.texts.bottom,
    };

    ctx.clearRect(0, 0, W, H);
    ctx.letterSpacing = `${CONFIG.letterSpacing}px`;
    drawFrame();
    drawTitle();
    drawGradientText(texts.label, CONFIG.label);
    drawBandAndName(texts.name);
    drawAvatar();
    drawFlagBadge();
    drawBottomText(texts.bottom, CONFIG.bottom);
  }

  // ============================================================
  //  Subida de imágenes
  // ============================================================
  function loadImageFile(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("No se pudo leer la imagen")); };
      img.src = url;
    });
  }

  // Conecta un input de archivo con una ranura de imagen del CONFIG
  function bindUpload({ fileId, clearId, nameId, defaultName, target, key, onChange }) {
    const fileEl = document.getElementById(fileId);
    const nameEl = document.getElementById(nameId);

    fileEl.addEventListener("change", async () => {
      const file = fileEl.files[0];
      if (!file) return;
      try {
        target[key] = await loadImageFile(file);
        nameEl.textContent = file.name;
        onChange();
      } catch (err) {
        alert(err.message);
      }
      fileEl.value = ""; // permite volver a elegir el mismo archivo
    });

    document.getElementById(clearId).addEventListener("click", () => {
      target[key] = null;
      nameEl.textContent = defaultName;
      onChange();
    });
  }

  const redrawAll = () => draw();
  const rebuildBgAndDraw = () => { buildBackground(); draw(); };

  bindUpload({
    fileId: "fileTitle", clearId: "clearTitle", nameId: "nameTitle",
    defaultName: "Placeholder", target: CONFIG.title, key: "image", onChange: redrawAll,
  });
  bindUpload({
    fileId: "fileBg", clearId: "clearBg", nameId: "nameBg",
    defaultName: "Patrón genérico", target: CONFIG.pattern, key: "image",
    onChange: () => { syncBackgroundControls(); rebuildBgAndDraw(); },
  });
  bindUpload({
    fileId: "fileAvatar", clearId: "clearAvatar", nameId: "nameAvatar",
    defaultName: "Avatar genérico", target: CONFIG.avatar, key: "image", onChange: redrawAll,
  });

  const flagFileInput = document.getElementById("fileFlag");
  const flagSelectionName = document.getElementById("flagSelectionName");
  const flagChoices = document.getElementById("flagChoices");
  const clearFlagButton = document.getElementById("clearFlag");

  flagFileInput.addEventListener("change", async () => {
    const file = flagFileInput.files[0];
    if (!file) return;
    try {
      const image = await loadImageFile(file);
      CONFIG.flag.image = image;
      CONFIG.flag.layer = createFlagLayer(image, CONFIG.flag.size, CONFIG.avatar.borderWidth);
      CONFIG.flag.name = file.name;
      flagSelectionName.textContent = file.name.replace(/\.[^/.]+$/, "");
      flagChoices.querySelectorAll(".flag-choice").forEach((choice) => choice.classList.remove("is-selected"));
      draw();
    } catch (error) {
      alert(error.message);
    }
    flagFileInput.value = "";
  });

  clearFlagButton.addEventListener("click", () => {
    CONFIG.flag.image = null;
    CONFIG.flag.layer = null;
    CONFIG.flag.name = "";
    flagSelectionName.textContent = "Sin bandera seleccionada";
    flagChoices.querySelectorAll(".flag-choice").forEach((choice) => choice.classList.remove("is-selected"));
    draw();
  });

  const bgPicker = document.getElementById("bgPicker");
  const bgChoices = document.getElementById("bgChoices");
  const bgName = document.getElementById("nameBg");

  async function loadBackgroundCatalog() {
    try {
      const response = await fetch("./catalog-bg.json");
      if (!response.ok) throw new Error("No se pudo leer bg");
      const backgrounds = await response.json();
      bgChoices.replaceChildren();
      if (!backgrounds.length) {
        const empty = document.createElement("p");
        empty.className = "flag-empty";
        empty.textContent = "No hay imágenes en bg.";
        bgChoices.append(empty);
        return;
      }

      backgrounds.forEach((background) => {
        const choice = document.createElement("button");
        choice.type = "button";
        choice.className = "bg-choice";
        choice.setAttribute("aria-label", `Usar ${background.name}`);
        const thumbnail = document.createElement("img");
        thumbnail.src = new URL(background.url, document.baseURI).href;
        thumbnail.alt = "";
        const name = document.createElement("span");
        name.textContent = background.name;
        choice.append(thumbnail, name);
        choice.addEventListener("click", () => {
          const image = new Image();
          image.onload = () => {
            CONFIG.pattern.image = image;
            bgName.textContent = background.name;
            bgPicker.open = false;
            syncBackgroundControls();
            rebuildBgAndDraw();
          };
          image.onerror = () => {
            const empty = document.createElement("p");
            empty.className = "flag-empty";
            empty.textContent = `No se pudo cargar ${background.name}.`;
            bgChoices.replaceChildren(empty);
          };
          image.src = new URL(background.url, document.baseURI).href;
        });
        bgChoices.append(choice);
      });
    } catch {
      bgChoices.replaceChildren();
      const empty = document.createElement("p");
      empty.className = "flag-empty";
      empty.textContent = "No se pudo cargar el catálogo local de bg.";
      bgChoices.append(empty);
    }
  }

  loadBackgroundCatalog();

  let flagAssets = [];
  const displayAssetName = (name) => name.replace(/\.[^/.]+$/, "");

  async function loadFlagCatalog() {
    try {
      const response = await fetch("./catalog-assets.json");
      if (!response.ok) throw new Error("No se pudo leer assets");
      flagAssets = await response.json();
    } catch {
    flagChoices.replaceChildren();
      const empty = document.createElement("p");
      empty.className = "flag-empty";
      empty.textContent = "No se pudo cargar el catálogo local de assets.";
      flagChoices.append(empty);
      return;
    }

    flagChoices.replaceChildren();
    if (!flagAssets.length) {
      const empty = document.createElement("p");
      empty.className = "flag-empty";
      empty.textContent = "No hay imágenes en assets.";
      flagChoices.append(empty);
      return;
    }

    for (const asset of flagAssets) {
      const choice = document.createElement("button");
      choice.type = "button";
      choice.className = "flag-choice";
      const visibleName = displayAssetName(asset.name);
      choice.setAttribute("aria-label", `Usar ${visibleName}`);
      const thumbnail = document.createElement("img");
      thumbnail.src = new URL(asset.url, document.baseURI).href;
      thumbnail.alt = "";
      const name = document.createElement("span");
      name.textContent = visibleName;
      choice.append(thumbnail, name);
      choice.addEventListener("click", () => {
        try {
          const image = new Image();
          image.onload = () => {
            CONFIG.flag.image = image;
            CONFIG.flag.layer = createFlagLayer(image, CONFIG.flag.size, CONFIG.avatar.borderWidth);
            CONFIG.flag.name = asset.name;
            flagSelectionName.textContent = visibleName;
            flagChoices.querySelectorAll(".flag-choice").forEach((item) => item.classList.remove("is-selected"));
            choice.classList.add("is-selected");
            draw();
          };
          image.onerror = () => { throw new Error(`No se pudo cargar ${asset.name}`); };
          image.src = new URL(asset.url, document.baseURI).href;
        } catch (error) {
          alert(error.message);
        }
      });
      flagChoices.append(choice);
    }
  }

  loadFlagCatalog();

  // ============================================================
  //  Descarga y eventos
  // ============================================================
  function download() {
    canvas.toBlob((blob) => {
      const a = document.createElement("a");
      const base = (inputs.name.value.trim() || "nominado")
        .toLowerCase().replace(/[^a-z0-9áéíóúñ]+/gi, "-");
      a.href = URL.createObjectURL(blob);
      a.download = `tarjeta-${base}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    }, "image/png");
  }

  Object.values(inputs).forEach((el) => el.addEventListener("input", draw));
  const letterSpacingInput = document.getElementById("letterSpacing");
  const letterSpacingValue = document.getElementById("letterSpacingValue");
  letterSpacingInput.addEventListener("input", () => {
    CONFIG.letterSpacing = Number(letterSpacingInput.value);
    letterSpacingValue.value = `${letterSpacingInput.value}px`;
    letterSpacingValue.textContent = `${letterSpacingInput.value}px`;
    draw();
  });
  const labelGradientInputs = [
    document.getElementById("labelGradientStart"),
    document.getElementById("labelGradientEnd"),
  ];
  const bottomGradientInputs = [
    document.getElementById("bottomGradientStart"),
    document.getElementById("bottomGradientEnd"),
  ];
  const outlineWidthInput = document.getElementById("textOutlineWidth");
  const outlineWidthValue = document.getElementById("textOutlineWidthValue");

  function syncGradientInputs() {
    labelGradientInputs.forEach((input, index) => { input.value = CONFIG.label.gradient[index]; });
    bottomGradientInputs.forEach((input, index) => { input.value = CONFIG.bottom.gradient[index]; });
  }

  labelGradientInputs.forEach((input, index) => {
    input.addEventListener("input", () => {
      CONFIG.label.gradient[index] = input.value;
      draw();
    });
  });
  bottomGradientInputs.forEach((input, index) => {
    input.addEventListener("input", () => {
      CONFIG.bottom.gradient[index] = input.value;
      draw();
    });
  });
  outlineWidthInput.addEventListener("input", () => {
    const width = Number(outlineWidthInput.value);
    CONFIG.label.outlineWidth = width;
    CONFIG.bottom.outlineWidth = width;
    outlineWidthValue.value = `${width}px`;
    outlineWidthValue.textContent = `${width}px`;
    draw();
  });
  const glowColorInput = document.getElementById("glowColor");
  const glowIntensityInput = document.getElementById("glowIntensity");
  const glowIntensityValue = document.getElementById("glowIntensityValue");
  glowColorInput.addEventListener("input", () => {
    CONFIG.glow.color = glowColorInput.value;
    draw();
  });
  glowIntensityInput.addEventListener("input", () => {
    CONFIG.glow.intensity = Number(glowIntensityInput.value);
    glowIntensityValue.value = `${glowIntensityInput.value}%`;
    glowIntensityValue.textContent = `${glowIntensityInput.value}%`;
    draw();
  });
  const backgroundBlurInput = document.getElementById("backgroundBlur");
  const backgroundBlurValue = document.getElementById("backgroundBlurValue");
  const maskOffsetInput = document.getElementById("maskOffset");
  const maskOffsetValue = document.getElementById("maskOffsetValue");
  const maskAngleInput = document.getElementById("maskAngle");
  const maskAngleValue = document.getElementById("maskAngleValue");

  function syncBackgroundControls() {
    const blur = CONFIG.pattern.image ? CONFIG.pattern.imageBlur : CONFIG.pattern.blur;
    backgroundBlurInput.value = blur;
    backgroundBlurValue.value = `${blur}px`;
    backgroundBlurValue.textContent = `${blur}px`;
  }

  backgroundBlurInput.addEventListener("input", () => {
    const blur = Number(backgroundBlurInput.value);
    if (CONFIG.pattern.image) CONFIG.pattern.imageBlur = blur;
    else CONFIG.pattern.blur = blur;
    backgroundBlurValue.value = `${blur}px`;
    backgroundBlurValue.textContent = `${blur}px`;
    rebuildBgAndDraw();
  });
  maskOffsetInput.addEventListener("input", () => {
    CONFIG.pattern.maskOffset = Number(maskOffsetInput.value);
    maskOffsetValue.value = `${maskOffsetInput.value}px`;
    maskOffsetValue.textContent = `${maskOffsetInput.value}px`;
    rebuildBgAndDraw();
  });
  maskAngleInput.addEventListener("input", () => {
    CONFIG.pattern.maskAngle = Number(maskAngleInput.value);
    maskAngleValue.value = `${maskAngleInput.value}°`;
    maskAngleValue.textContent = `${maskAngleInput.value}°`;
    rebuildBgAndDraw();
  });
  syncBackgroundControls();
  [
    { input: "titleScale", output: "titleScaleValue", key: "scale", format: (value) => `${value}%` },
    { input: "titleOffsetX", output: "titleOffsetXValue", key: "offsetX", format: (value) => `${value}px` },
    { input: "titleOffsetY", output: "titleOffsetYValue", key: "offsetY", format: (value) => `${value}px` },
  ].forEach(({ input, output, key, format }) => {
    const slider = document.getElementById(input);
    const value = document.getElementById(output);
    slider.addEventListener("input", () => {
      CONFIG.title[key] = Number(slider.value);
      value.value = format(slider.value);
      value.textContent = format(slider.value);
      draw();
    });
  });
  [
    { input: "flagSize", output: "flagSizeValue", key: "size", format: (value) => `${value}px` },
    { input: "flagOffsetX", output: "flagOffsetXValue", key: "offsetX", format: (value) => `${value}px` },
    { input: "flagOffsetY", output: "flagOffsetYValue", key: "offsetY", format: (value) => `${value}px` },
  ].forEach(({ input, output, key, format }) => {
    const slider = document.getElementById(input);
    const value = document.getElementById(output);
    slider.addEventListener("input", () => {
      CONFIG.flag[key] = Number(slider.value);
      if (CONFIG.flag.image) {
        CONFIG.flag.layer = createFlagLayer(CONFIG.flag.image, CONFIG.flag.size, CONFIG.avatar.borderWidth);
      }
      value.value = format(slider.value);
      value.textContent = format(slider.value);
      draw();
    });
  });
  document.getElementById("btnDownload").addEventListener("click", download);

  document.getElementById("btnReset").addEventListener("click", () => {
    function restore(target, defaults) {
      Object.keys(defaults).forEach((key) => {
        const value = defaults[key];
        if (Array.isArray(value)) target[key] = [...value];
        else if (value && typeof value === "object") restore(target[key], value);
        else target[key] = value;
      });
    }

    restore(CONFIG, DEFAULT_CONFIG);
    document.getElementById("bgPicker").open = false;
    document.getElementById("flagPicker").open = false;
    inputs.name.value = DEFAULT_CONFIG.texts.name;
    inputs.label.value = DEFAULT_CONFIG.texts.label;
    inputs.bottom.value = DEFAULT_CONFIG.texts.bottom;
    document.getElementById("fileTitle").value = "";
    document.getElementById("fileBg").value = "";
    document.getElementById("fileAvatar").value = "";
    flagFileInput.value = "";
    document.getElementById("nameTitle").textContent = "Placeholder";
    document.getElementById("nameBg").textContent = "Patrón genérico";
    document.getElementById("nameAvatar").textContent = "Avatar genérico";
    document.getElementById("flagSelectionName").textContent = "Sin bandera seleccionada";
    document.querySelectorAll(".flag-choice.is-selected").forEach((choice) => choice.classList.remove("is-selected"));

    letterSpacingInput.value = DEFAULT_CONFIG.letterSpacing;
    letterSpacingValue.value = `${DEFAULT_CONFIG.letterSpacing}px`;
    letterSpacingValue.textContent = `${DEFAULT_CONFIG.letterSpacing}px`;
    syncGradientInputs();
    outlineWidthInput.value = DEFAULT_CONFIG.label.outlineWidth;
    outlineWidthValue.value = `${DEFAULT_CONFIG.label.outlineWidth}px`;
    outlineWidthValue.textContent = `${DEFAULT_CONFIG.label.outlineWidth}px`;
    glowColorInput.value = DEFAULT_CONFIG.glow.color;
    glowIntensityInput.value = DEFAULT_CONFIG.glow.intensity;
    glowIntensityValue.value = `${DEFAULT_CONFIG.glow.intensity}%`;
    glowIntensityValue.textContent = `${DEFAULT_CONFIG.glow.intensity}%`;
    maskOffsetInput.value = DEFAULT_CONFIG.pattern.maskOffset;
    maskOffsetValue.value = `${DEFAULT_CONFIG.pattern.maskOffset}px`;
    maskOffsetValue.textContent = `${DEFAULT_CONFIG.pattern.maskOffset}px`;
    maskAngleInput.value = DEFAULT_CONFIG.pattern.maskAngle;
    maskAngleValue.value = `${DEFAULT_CONFIG.pattern.maskAngle}°`;
    maskAngleValue.textContent = `${DEFAULT_CONFIG.pattern.maskAngle}°`;
    [
      ["titleScale", "titleScaleValue", "scale", (value) => `${value}%`],
      ["titleOffsetX", "titleOffsetXValue", "offsetX", (value) => `${value}px`],
      ["titleOffsetY", "titleOffsetYValue", "offsetY", (value) => `${value}px`],
      ["flagSize", "flagSizeValue", "size", (value) => `${value}px`],
      ["flagOffsetX", "flagOffsetXValue", "offsetX", (value) => `${value}px`],
      ["flagOffsetY", "flagOffsetYValue", "offsetY", (value) => `${value}px`],
    ].forEach(([inputId, outputId, key, format]) => {
      const input = document.getElementById(inputId);
      const output = document.getElementById(outputId);
      const group = inputId.startsWith("title") ? DEFAULT_CONFIG.title : DEFAULT_CONFIG.flag;
      input.value = group[key];
      output.value = format(input.value);
      output.textContent = format(input.value);
    });
    syncBackgroundControls();
    document.querySelectorAll('input[type="range"]').forEach(updateRangeProgress);
    buildBackground();
    draw();
  });

  function updateRangeProgress(input) {
    const min = Number(input.min) || 0;
    const max = Number(input.max) || 100;
    const progress = ((Number(input.value) - min) / (max - min)) * 100;
    input.style.setProperty("--range-progress", `${progress}%`);
  }
  document.querySelectorAll('input[type="range"]').forEach((input) => {
    updateRangeProgress(input);
    input.addEventListener("input", () => updateRangeProgress(input));
  });

  buildBackground();
  draw();
  document.fonts.load(fontStr(40, "700")).then(draw).catch(draw);
  document.fonts.ready.then(draw);
})();