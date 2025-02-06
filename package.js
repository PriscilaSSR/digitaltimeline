{
  "homepage": "https://yourusername.github.io/your-repo-name"
}
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
npm install gh-pages --save-dev
npm run deploy
