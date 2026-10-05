import "./style.css";
import { bindTheme } from "./layout.js";
import { renderHome } from "./home.js";
import { renderMap, bindMap } from "./map.js";
import { renderShop } from "./shop.js";
import { renderArchitecture } from "./architecture.js";

const routes = {
  "/": { render: renderHome, title: "FiberShare · follow a herd" },
  "/map": { render: renderMap, title: "Herd map · FiberShare" },
  "/shop": { render: renderShop, title: "Sample fiber · FiberShare" },
  "/architecture": {
    render: renderArchitecture,
    title: "How it is built · FiberShare",
  },
};

function pathFromHash() {
  const raw = location.hash.replace(/^#/, "") || "/";
  return raw.startsWith("/") ? raw : "/" + raw;
}

async function render() {
  let path = pathFromHash();
  if (!routes[path]) {
    history.replaceState(null, "", "#/");
    path = "/";
  }
  const route = routes[path];
  document.title = route.title;
  const html = await route.render();
  const app = document.getElementById("app");
  app.innerHTML = html;
  bindTheme(app);
  if (path === "/map") bindMap(app);
}

window.addEventListener("hashchange", render);
render();
