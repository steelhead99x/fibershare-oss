import "./style.css";
import { bindTheme } from "./layout.js";
import { renderHome } from "./home.js";
import { renderMap, bindMap } from "./map.js";
import { renderShop } from "./shop.js";
import { renderArchitecture } from "./architecture.js";

const routes = {
  "/": { render: renderHome, title: "FiberShare OSS · community MVP" },
  "/map": { render: renderMap, title: "Herd map · FiberShare OSS" },
  "/shop": { render: renderShop, title: "Stub fiber shop · FiberShare OSS" },
  "/architecture": {
    render: renderArchitecture,
    title: "Architecture · FiberShare OSS",
  },
};

function pathFromHash() {
  const raw = location.hash.replace(/^#/, "") || "/";
  return raw.startsWith("/") ? raw : "/" + raw;
}

async function render() {
  const path = pathFromHash();
  const route = routes[path];
  const view = route?.render || renderHome;
  if (!route && path !== "/") {
    document.title = "Not found · FiberShare OSS";
  } else {
    document.title = route?.title || routes["/"].title;
  }
  const html = await view();
  const app = document.getElementById("app");
  app.innerHTML = html;
  bindTheme(app);
  if (path === "/map") bindMap(app);
  if (!route && path !== "/") {
    // Unknown hash: keep home content but leave title as not-found signal.
    // Prefer correcting the hash so nav state matches.
    history.replaceState(null, "", "#/");
  }
}

window.addEventListener("hashchange", render);
render();
