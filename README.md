
```markdown
#  GitHub Developer Profile Comparator

**GitHub Developer Profile Comparator** is a tool that uses the **GitHub API** to compare developer profiles based on key metrics like language usage, repository activity, followers, stars, and more. It helps users understand how two or more GitHub profiles stack up against each other — whether for learning, collaboration, or competition.

---

##  What It Does

-  Fetches live profile data from GitHub using a personal access token
-  Compares multiple devs based on:
  - Most used programming languages
  - Number of repositories
  - Stars, forks, and watchers
  - Followers/following ratio
  - Contribution and activity overview
-  Visual output to show which developer is ahead in what category

---

##  Project Structure

```

github-comparator/
├── client/   # Frontend (UI for input and result display)
├── server/   # Backend (handles GitHub API calls and comparison logic)

````

---

##  Tech Stack

**Frontend (client):**
- React (or Next.js)
- Tailwind / Bootstrap (UI)
- Axios

**Backend (server):**
- Node.js + Express
- GitHub REST API
- dotenv for API key management

---

##  Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/github-comparator.git
cd github-comparator
````

### 2. Setup backend

```bash
cd server
npm install
touch .env
```

Add your GitHub token in `.env`:

```env
GITHUB_TOKEN=your_personal_access_token_here
```

Then run:

```bash
npm run dev
```

### 3. Setup frontend

```bash
cd ../client
npm install
npm start
```

Visit: [http://localhost:3000](http://localhost:3000)

---

##  Use Cases

* Recruiters comparing candidates
* Devs tracking growth vs peers
* Competitive benchmarking
* Learning from open-source contributors

---

##  Roadmap

* ✅ Profile comparison with GitHub API
* ✅ Language breakdown visualizations
* 🔜 Historical commit graph comparison
* 🔜 Authenticated access for private data
* 🔜 Save and share comparisons
* 🔜 Dark mode & mobile view

---

##  Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss.

---

##  License

MIT License

---

##  Author

Made with 💻 & ☕ by **Brahma**
[LinkedIn](https://www.linkedin.com/in/brahmananda-tosh-770995266/) 

```

---


