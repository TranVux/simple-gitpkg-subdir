# 📦 Simple GitPkg Subdir

A lightweight proxy service that lets you **install a subfolder from a GitHub repository** directly as an npm package. Perfect for monorepos.

---

## 🚀 Usage

Assume the service is hosted at:

```
https://simple-gitpkg-subdir.vercel.app
```

### Install a package from a subfolder

```bash
npm install 'https://simple-gitpkg-subdir.vercel.app/:user/:repo/:path?ref={commit|tag|branch}&token={github_token}'
```

🔹 Example:

```bash
npm install 'https://simple-gitpkg-subdir.vercel.app/devmobileaffina/react-native-affina-common/packages/constants?ref=62aa22dee2e518cb25123d71215274308d8bf979&token=ghp_xxx123'
```

* `:user` → GitHub user or org
* `:repo` → repository name
* `:path` → subfolder path inside the repo
* `ref` → commit SHA, tag, or branch (default: `main`)
* `token` → GitHub personal access token

---

## 🔑 Authentication Options

You need a **GitHub Personal Access Token (PAT)** with at least `repo` read access (for private repos) or `public_repo` (for public repos).

There are multiple ways to provide the token:

### 1. Query parameter (quick & simple)

```bash
npm install 'https://simple-gitpkg-subdir.vercel.app/user/repo/packages/constants?ref=main&token=ghp_xxx123'
```

---

### 2. `.npmrc` (npm / pnpm)

Add to your **project or user** `.npmrc`:

```ini
# Link token to your proxy domain
//simple-gitpkg-subdir.vercel.app/:_authToken=ghp_xxx123
```

Now you can install without passing `token` in the URL:

```bash
npm install 'https://simple-gitpkg-subdir.vercel.app/user/repo/packages/constants?ref=main'
```

Works with **npm**, **pnpm**, and **npx**.

---

## ⚡ Benefits

* Use **subfolders** in a monorepo as standalone npm packages.
* No need to publish to npm registry.
* Works seamlessly with `npm install`, `yarn add`, and `pnpm add`.
* Token can be managed via `.npmrc`, `.yarnrc.yml`, or query params.

---

## 📜 License

MIT © 2025

---
