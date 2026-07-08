const axios = require("axios");

// Generic file-download proxy. Fetches a (usually S3) file server-side and
// streams it back with a Content-Disposition: attachment header, so the browser
// downloads it directly — no CORS issues and no new tab / redirect.
exports.downloadDoc = async (req, res) => {
  try {
    const { url, name } = req.query;
    if (!url) {
      return res.status(400).json({ message: "url query param is required" });
    }

    const resp = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 20000,
    });

    const match = String(url)
      .split("?")[0]
      .match(/\.(jpe?g|png|gif|webp|pdf)$/i);
    const ext = match
      ? match[1].toLowerCase()
      : (resp.headers["content-type"] || "image/jpeg").split("/")[1] || "jpg";

    const safeName =
      String(name || "document").replace(/[^a-z0-9_-]+/gi, "_") || "document";

    res.setHeader(
      "Content-Type",
      resp.headers["content-type"] || "application/octet-stream"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${safeName}.${ext}"`
    );
    return res.send(resp.data);
  } catch (error) {
    console.error("downloadDoc error:", error.message);
    res.status(500).json({ message: "Failed to download file" });
  }
};
