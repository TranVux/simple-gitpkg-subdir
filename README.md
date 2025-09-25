# 📦 Simple GitPkg Subdir

A lightweight proxy service that lets you **install a subfolder from a GitHub repository** directly as an npm package. Perfect for monorepos.

---

## 🚀 Usage

Assume the service is hosted at:

```
http://mydomain
```

### Install a package from a subfolder

```bash
npm install http://mydomain/:user/:repo/:path?ref={commit|tag|branch}&token={github_token}
```

🔹 Example:

```bash
npm install http://mydomain/devmobileaffina/react-native-affina-common/packages/constants?ref=62aa22dee2e518cb25123d71215274308d8bf979&token=ghp_xxx123
```

* `:user` → GitHub user or org
* `:repo` → repository name
* `:path` → subfolder path inside the repo
* `ref` → commit SHA, tag, or branch (default: `main`)
* `token` → GitHub personal access token

---

## ⚡ Benefits

* Use **subfolders** in a monorepo as standalone npm packages.
* No need to publish to npm registry.
* Works seamlessly with `npm install`, `yarn add`, and `pnpm add`.

---

## 📜 License

MIT © 2025
