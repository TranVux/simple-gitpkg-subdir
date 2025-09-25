require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch"); // v2 (require style). If using Node 18+ native fetch you can replace it.
const tar = require("tar");
const fs = require("fs");
const fsp = fs.promises;
const path = require("path");
const os = require("os");
const {pipeline} = require("stream/promises");

const app = express();
const PORT = process.env.PORT || 3000;

async function downloadToFile(stream, destPath) {
    const writeStream = fs.createWriteStream(destPath);
    await pipeline(stream, writeStream);
}

// Example URL: http://localhost:3000/devmobileaffina/react-native-affina-common/packages/constants?ref=62aa22dee2e518cb25123d71215274308d8bf979&token={token}
app.get("/:user/:repo/*subdir", async (req, res) => {
    const {user, repo, subdir} = req.params;
    // const subdir = req.params[0]; // catch-all part, e.g. "packages/constants"
    const commitish = req.query?.ref || "main";
    const token = req.query?.token || "";

    // make temp workspace
    const tmpBase = await fsp.mkdtemp(path.join(os.tmpdir(), "gitpkg-"));
    const tarPath = path.join(tmpBase, "repo.tar.gz");
    const extractDir = path.join(tmpBase, "extracted"); // where we'll place the extracted subdir

    try {
        const tarballUrl = `https://api.github.com/repos/${user}/${repo}/tarball/${commitish}`;
        console.log("⬇️ Fetching tarball:", tarballUrl);

        const ghRes = await fetch(tarballUrl, {
            headers: {
                "User-Agent": "gitpkg-selfhost",
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github+json",
            },
        });

        if (!ghRes.ok) {
            const text = await ghRes.text();
            res.status(ghRes.status).send(text);
            return;
        }

        // 1) Save tarball to disk
        await downloadToFile(ghRes.body, tarPath);

        // 2) Extract only the subdir into extractDir
        await fsp.mkdir(extractDir, {recursive: true});

        // Calculate how many path components to strip so the subdir contents land at extractDir root.
        // We will strip (1 + number of parts in subdir). Example:
        // archive paths are like: "<some-top-folder>/packages/constants/...".
        // To get "file.js" at extractDir root we strip 1 + subdirParts.length
        const stripCount = 1 + subdir?.length;

        // Filter function: accept entries that contain '/<subdir>/' anywhere in path
        const matchFragment = `/${subdir?.join("/")}/`; // safe enough for typical GitHub tarball structure
        await tar.x({
            file: tarPath,
            cwd: extractDir,
            strip: stripCount,
            filter: (entryPath) => {
                // entryPath looks like "<topfolder>/packages/constants/..."
                return entryPath.includes(matchFragment);
            },
        });

        // check package.json exists in extracted folder (root after strip)
        const pkgJsonPath = path.join(extractDir, "package.json");
        if (!fs.existsSync(pkgJsonPath)) {
            // Not every subdir has package.json; return 400 with helpful message
            res.status(400).send(
                `Subdir '${subdir}' extracted but no package.json found. npm expects a package.json at the package root.`
            );
            return;
        }

        // 3) Pack up the extracted folder into a gzipped tar stream and send to client
        res.setHeader("Content-Type", "application/gzip");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${path.basename(subdir.join("/"))}.tgz"`
        );

        // tar.c returns a readable stream; pipe it directly to response
        const packStream = tar.c(
            {
                gzip: true,
                cwd: extractDir,
                portable: true,
            },
            ["."]
        );

        // stream it out
        await pipeline(packStream, res);
    } catch (err) {
        console.error("Error building subdir tarball:", err);
        // If headers not sent yet:
        if (!res.headersSent) {
            res.status(500).send("Internal Server Error");
        } else {
            // If headers already sent, just end the response
            try {
                res.end();
            } catch {
            }
        }
    } finally {
        // best-effort cleanup
        try {
            await fsp.rm(tmpBase, {recursive: true, force: true});
        } catch (cleanupErr) {
            console.warn("Failed to cleanup tmp dir:", cleanupErr);
        }
    }
});

app.listen(PORT, () => {
    console.log(`✅ Gitpkg self-host running at http://localhost:${PORT}`);
});
