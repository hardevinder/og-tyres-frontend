// src/utils/toast.ts
type ToastType = "success" | "error" | "info";

function makeContainer() {
  let c = document.getElementById("__app_toast_container__");
  if (c) return c;
  c = document.createElement("div");
  c.id = "__app_toast_container__";
  c.style.position = "fixed";
  c.style.top = "16px";
  c.style.right = "16px";
  c.style.zIndex = "9999";
  c.style.display = "flex";
  c.style.flexDirection = "column";
  c.style.gap = "8px";
  document.body.appendChild(c);
  return c;
}

function renderToast(text: string, type: ToastType = "info", autoDismiss = true) {
  const container = makeContainer();
  const el = document.createElement("div");
  el.className = `app-toast app-toast-${type}`;
  el.style.minWidth = "180px";
  el.style.maxWidth = "320px";
  el.style.padding = "10px 12px";
  el.style.borderRadius = "8px";
  el.style.display = "flex";
  el.style.alignItems = "center";
  el.style.justifyContent = "space-between";
  el.style.boxShadow = "0 6px 18px rgba(0,0,0,0.12)";
  el.style.color = "#fff";
  el.style.fontFamily = "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue'";
  el.style.fontSize = "13px";

  const left = document.createElement("div");
  left.style.display = "flex";
  left.style.alignItems = "center";
  left.style.gap = "8px";

  const icon = document.createElement("span");
  icon.innerHTML =
    type === "success"
      ? "✔"
      : type === "error"
      ? "✖"
      : "ℹ";
  icon.style.fontWeight = "700";
  icon.style.display = "inline-block";
  icon.style.width = "18px";
  icon.style.textAlign = "center";

  const message = document.createElement("div");
  message.textContent = text;

  left.appendChild(icon);
  left.appendChild(message);

  const closeBtn = document.createElement("button");
  closeBtn.innerHTML = "×";
  closeBtn.style.background = "transparent";
  closeBtn.style.border = "none";
  closeBtn.style.color = "rgba(255,255,255,0.95)";
  closeBtn.style.fontSize = "16px";
  closeBtn.style.cursor = "pointer";
  closeBtn.style.marginLeft = "12px";

  el.appendChild(left);
  el.appendChild(closeBtn);

  // styles by type
  if (type === "success") {
    el.style.background = "linear-gradient(90deg,#059669,#10b981)"; // green gradient
  } else if (type === "error") {
    el.style.background = "linear-gradient(90deg,#ef4444,#f97316)"; // red/orange
  } else {
    el.style.background = "linear-gradient(90deg,#3b82f6,#06b6d4)"; // blue
  }

  // close handler
  const remove = () => {
    if (el.parentElement) container.removeChild(el);
  };
  closeBtn.addEventListener("click", remove);

  container.appendChild(el);

  if (autoDismiss) {
    setTimeout(() => {
      try {
        remove();
      } catch {}
    }, 2400);
  }

  return {
    dismiss: remove,
  };
}

export const toast = {
  success: (text: string, autoDismiss = true) => renderToast(text, "success", autoDismiss),
  error: (text: string, autoDismiss = true) => renderToast(text, "error", autoDismiss),
  info: (text: string, autoDismiss = true) => renderToast(text, "info", autoDismiss),
};
