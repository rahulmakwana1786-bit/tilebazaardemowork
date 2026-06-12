const previewPaths = [
  "600x1200/single_tiles/ARTE FLUO WHITE 1.jpg",
  "600x600/single_tiles/Arte fluo white r1.png"
];

// Normalize helper
const normalize = (name) => {
  const nameWithoutQuery = name.split("?")[0];
  let norm = nameWithoutQuery
    .toLowerCase()
    .replace(/\.(jpg|jpeg|png|webp|avif)/g, "") // remove all extensions
    .replace(/\.[^/.]+$/, "")                  // remove any remaining extension
    .split("--")[0]                            // remove suffix like --GLOSS
    .replace(/[^a-z0-9]/g, "");                // remove all non-alphanumeric characters
  
  // Handle spelling inconsistencies
  norm = norm.replace(/brwon/g, "brown");
  norm = norm.replace(/earharo/g, "eartharo");
  return norm;
};

const getPreviewUrl = (
  imagePath,
  size,
  previewPaths
) => {
  if (!previewPaths || previewPaths.length === 0) return null;

  const targetSize = size.toLowerCase().replace(/\s/g, ""); // e.g. "600x600" or "600x1200"

  const urlWithoutQuery = imagePath.split("?")[0];
  const fileNameOnly = urlWithoutQuery.split("/").pop() || urlWithoutQuery;

  let normalizedFile = normalize(fileNameOnly);
  
  if (imagePath.includes("?")) {
    try {
      const queryStr = imagePath.split("?")[1];
      const params = new URLSearchParams(queryStr);
      const nameParam = params.get("name");
      if (nameParam) {
        normalizedFile = normalize(nameParam);
      }
    } catch (e) {
      console.error("Error parsing name param in getPreviewUrl:", e);
    }
  }

  if (normalizedFile === "lux09r1") {
    normalizedFile = "lux09hl1";
  }
  if (normalizedFile.includes("salted") && (normalizedFile.includes("concreto") || normalizedFile.includes("concrete"))) {
    normalizedFile = "saltedconcretecrema";
  }
  if (normalizedFile === "artefluowhite1" && targetSize === "600x600") {
    normalizedFile = "artefluowhiter1";
  }
  if (normalizedFile.startsWith("phantom")) {
    normalizedFile = "phantomdecor";
  }

  const sizeFilteredPaths = previewPaths.filter((p) => {
    const normP = p.replace(/\\/g, "/");
    return normP.startsWith(`${targetSize}/`);
  });

  if (sizeFilteredPaths.length === 0) return null;

  const singleTiles = [];
  const comboTiles = [];

  for (const pathStr of sizeFilteredPaths) {
    const parts = pathStr.replace(/\\/g, "/").split("/");
    const folder = parts[1]; // e.g. "single_tiles" or "combo_tiles"
    const file = parts[2];   // e.g. "alexa_beige_r1_preview.png"
    if (file) {
      if (folder === "single_tiles") {
        singleTiles.push(file);
      } else if (folder === "combo_tiles") {
        comboTiles.push(file);
      }
    }
  }

  for (const preview of singleTiles) {
    let normPreview = normalize(preview);
    if (normPreview.endsWith("preview")) {
      normPreview = normPreview.slice(0, -7);
    }
    
    if (normalizedFile === normPreview || normalizedFile.startsWith(normPreview) || normPreview.startsWith(normalizedFile)) {
      return `/previews/${targetSize}/single_tiles/${preview}`;
    }
  }

  return null;
};

console.log("600x1200 Result:", getPreviewUrl("ARTE FLUO WHITE_1--CARVING.jpg", "600x1200", previewPaths));
console.log("600x600 Result:", getPreviewUrl("ARTE FLUO WHITE_1--CARVING.jpg", "600x600", previewPaths));
