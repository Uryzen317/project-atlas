const { app, BrowserWindow } = require("electron");
const { join } = require("path");
const url = require("url");

app.whenReady().then(() => {
  let loaderFrame = new BrowserWindow({
    width: 600,
    height: 150,
    autoHideMenuBar: true,
    web: {
      dev: false,
      nodeIntegration: true,
    },
    frame: false,
  });
  loaderFrame.loadFile("loader.html");

  setTimeout(() => {
    loaderFrame.close();

    let mainFrame = new BrowserWindow({
      width: 1280,
      height: 800,
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: true,
        devTools: false,
      },
    });

    mainFrame.loadURL(
      url.format({
        pathname: join(__dirname, "src", "browser", "index.html"),
        protocol: "file:",
        slashes: true,
      })
    );
  }, 3000 + Math.random() * 2000);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
