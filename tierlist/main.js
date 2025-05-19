import { colors } from "./colors.js";

const settingsModal = document.querySelector(".settings-modal");
const colorsContainer = settingsModal.querySelector(".colors");
const tiersContainer = document.querySelector(".tiers");
const cardsContainer = document.querySelector(".cards");
const fileInput = document.getElementById("image-upload");
const uploadButton = fileInput.closest(".upload-button");

let activeTier;

const resetTierImages = (tier) => {
  const images = tier.querySelectorAll(".items img");
  images.forEach((img) => {
    cardsContainer.insertBefore(img, uploadButton);
  });
};

const saveState = () => {
  const state = [];

  const tiers = tiersContainer.querySelectorAll(".tier");
  tiers.forEach((tier) => {
    const label = tier.querySelector(".label span").textContent;
    const color = getComputedStyle(tier.querySelector(".label"))
      .getPropertyValue("--color")
      .trim();
    const items = Array.from(tier.querySelectorAll(".items img")).map(
      (img) => img.src
    );

    state.push({ label, color, items });
  });

  const unassigned = Array.from(cardsContainer.querySelectorAll("img")).map(
    (img) => img.src
  );

  const fullState = { tiers: state, unassigned };

  localStorage.setItem("tierlist-data", JSON.stringify(fullState));
};

const loadState = () => {
  const data = localStorage.getItem("tierlist-data");
  if (!data) return;

  const { tiers, unassigned } = JSON.parse(data);

  tiersContainer.innerHTML = ""; // clear existing tiers

  tiers.forEach(({ label, color, items }) => {
    const tier = createTier(label);
    tier.querySelector(".label").style.setProperty("--color", color);

    const container = tier.querySelector(".items");
    items.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.draggable = true;

      img.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", "");
        img.classList.add("dragging");
      });

      img.addEventListener("dragend", () => img.classList.remove("dragging"));

      img.addEventListener("dblclick", () => {
        if (img.parentElement !== cardsContainer) {
          cardsContainer.insertBefore(img, uploadButton);
          cardsContainer.scrollLeft = cardsContainer.scrollWidth;
        }
        saveState();
      });

      container.appendChild(img);
    });

    tiersContainer.appendChild(tier);
  });

  cardsContainer.querySelectorAll("img").forEach((img) => img.remove());

  unassigned.forEach((src) => {
    const img = new Image();
    img.src = src;
    img.draggable = true;

    img.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", "");
      img.classList.add("dragging");
    });

    img.addEventListener("dragend", () => img.classList.remove("dragging"));

    img.addEventListener("dblclick", () => {
      if (img.parentElement !== cardsContainer) {
        cardsContainer.insertBefore(img, uploadButton);
        cardsContainer.scrollLeft = cardsContainer.scrollWidth;
      }
      saveState();
    });

    cardsContainer.insertBefore(img, uploadButton);
  });
};

const handleDeleteTier = () => {
  if (activeTier) {
    resetTierImages(activeTier);
    activeTier.remove();
    settingsModal.close();
    saveState();
  }
};

const handleClearTier = () => {
  if (activeTier) {
    resetTierImages(activeTier);
    settingsModal.close();
    saveState();
  }
};

const handlePrependTier = () => {
  if (activeTier) {
    tiersContainer.insertBefore(createTier(), activeTier);
    settingsModal.close();
    saveState();
  }
};

const handleAppendTier = () => {
  if (activeTier) {
    tiersContainer.insertBefore(createTier(), activeTier.nextSibling);
    settingsModal.close();
    saveState();
  }
};

const handleSettingsClick = (tier) => {
  activeTier = tier;
  const label = tier.querySelector(".label");
  settingsModal.querySelector(".tier-label").value = label.innerText;

  const color = getComputedStyle(label).getPropertyValue("--color");
  settingsModal.querySelector(`input[value="${color}"]`).checked = true;

  settingsModal.showModal();
};

const handleMoveTier = (tier, direction) => {
  const sibling =
    direction === "up" ? tier.previousElementSibling : tier.nextElementSibling;

  if (sibling) {
    const position = direction === "up" ? "beforebegin" : "afterend";
    sibling.insertAdjacentElement(position, tier);
    saveState();
  }
};

const handleDragover = (event) => {
  event.preventDefault();

  const draggedImage = document.querySelector(".dragging");
  const target = event.target;

  if (target.classList.contains("items")) {
    target.appendChild(draggedImage);
    saveState();
  } else if (target.tagName === "IMG" && target !== draggedImage) {
    const { left, width } = target.getBoundingClientRect();
    const midPoint = left + width / 2;

    if (event.clientX < midPoint) {
      target.before(draggedImage);
    } else {
      target.after(draggedImage);
    }
    saveState();
  }
};

const handleDrop = (event) => {
  event.preventDefault();
  saveState();
};

const createTier = (label = "Change me") => {
  const tierColor = colors[tiersContainer.children.length % colors.length];

  const tier = document.createElement("div");
  tier.className = "tier";
  tier.innerHTML = `
  <div class="label" contenteditable="plaintext-only" style="--color: ${tierColor}">
    <span>${label}</span>
  </div>
  <div class="items"></div>
  <div class="controls">
    <button class="settings"><i class="bi bi-gear-fill"></i></button>
    <button class="moveup"><i class="bi bi-chevron-up"></i></button>
    <button class="movedown"><i class="bi bi-chevron-down"></i></button>
  </div>`;

  tier.querySelector(".settings").addEventListener("click", () => handleSettingsClick(tier));
  tier.querySelector(".moveup").addEventListener("click", () => handleMoveTier(tier, "up"));
  tier.querySelector(".movedown").addEventListener("click", () => handleMoveTier(tier, "down"));
  tier.querySelector(".items").addEventListener("dragover", handleDragover);
  tier.querySelector(".items").addEventListener("drop", handleDrop);

  return tier;
};

const initColorOptions = () => {
  colors.forEach((color) => {
    const label = document.createElement("label");
    label.style.setProperty("--color", color);
    label.innerHTML = `<input type="radio" name="color" value="${color}" />`;
    colorsContainer.appendChild(label);
  });
};

const initDefaultTierList = () => {
  ["S", "A", "B", "C", "D"].forEach((label) => {
    tiersContainer.appendChild(createTier(label));
  });
};

const initDraggables = () => {
  const images = cardsContainer.querySelectorAll("img");
  images.forEach((img) => {
    img.draggable = true;

    img.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", "");
      img.classList.add("dragging");
    });

    img.addEventListener("dragend", () => img.classList.remove("dragging"));

    img.addEventListener("dblclick", () => {
      if (img.parentElement !== cardsContainer) {
        cardsContainer.insertBefore(img, uploadButton);
        cardsContainer.scrollLeft = cardsContainer.scrollWidth;
        saveState();
      }
    });
  });
};

initDraggables();
if (!localStorage.getItem("tierlist-data")) {
  initDefaultTierList();
}
loadState();
initColorOptions();

document.querySelector("h1").addEventListener("click", () => {
  tiersContainer.appendChild(createTier());
  saveState();
});

settingsModal.addEventListener("click", (event) => {
  if (event.target === settingsModal) {
    settingsModal.close();
  } else {
    const action = event.target.id;
    const actionMap = {
      delete: handleDeleteTier,
      clear: handleClearTier,
      prepend: handlePrependTier,
      append: handleAppendTier,
    };

    if (action && actionMap[action]) {
      actionMap[action]();
    }
  }
});

settingsModal.addEventListener("close", () => (activeTier = null));

settingsModal.querySelector(".tier-label").addEventListener("input", (event) => {
  if (activeTier) {
    activeTier.querySelector(".label span").textContent = event.target.value;
    saveState();
  }
});

colorsContainer.addEventListener("change", (event) => {
  if (activeTier) {
    activeTier.querySelector(".label").style.setProperty("--color", event.target.value);
    saveState();
  }
});

cardsContainer.addEventListener("dragover", (event) => {
  event.preventDefault();

  const draggedImage = document.querySelector(".dragging");
  if (draggedImage) {
    cardsContainer.insertBefore(draggedImage, uploadButton);
    saveState();
  }
});

cardsContainer.addEventListener("drop", (event) => {
  event.preventDefault();
  cardsContainer.scrollLeft = cardsContainer.scrollWidth;
  saveState();
});

document.getElementById("reset-btn").addEventListener("click", () => {
  localStorage.removeItem("tierlist-data");
  location.reload();
});

fileInput.addEventListener("change", (event) => {
  const files = event.target.files;

  for (const file of files) {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = document.createElement("img");
      img.src = e.target.result;
      img.alt = file.name;
      img.draggable = true;

      img.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", "");
        img.classList.add("dragging");
      });

      img.addEventListener("dragend", () => {
        img.classList.remove("dragging");
      });

      img.addEventListener("dblclick", () => {
        if (img.parentElement !== cardsContainer) {
          cardsContainer.insertBefore(img, uploadButton);
          cardsContainer.scrollLeft = cardsContainer.scrollWidth;
        }
      });

      cardsContainer.insertBefore(img, uploadButton);
    };

    reader.readAsDataURL(file);
  }

  fileInput.value = "";
});

cardsContainer.addEventListener("dragover", (event) => {
  event.preventDefault();
  cardsContainer.classList.add("drag-over");
});

cardsContainer.addEventListener("dragleave", () => {
  cardsContainer.classList.remove("drag-over");
});

cardsContainer.addEventListener("drop", (event) => {
  event.preventDefault();
  cardsContainer.classList.remove("drag-over");

  const files = Array.from(event.dataTransfer.files).filter(file =>
    file.type.startsWith("image/")
  );

  for (const file of files) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.alt = file.name;
      img.draggable = true;

      img.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", "");
        img.classList.add("dragging");
      });

      img.addEventListener("dragend", () => {
        img.classList.remove("dragging");
      });

      img.addEventListener("dblclick", () => {
        if (img.parentElement !== cardsContainer) {
          cardsContainer.insertBefore(img, uploadButton);
          cardsContainer.scrollLeft = cardsContainer.scrollWidth;
        }
        saveState();
      });

      cardsContainer.insertBefore(img, uploadButton);
      saveState();
    };

    reader.readAsDataURL(file);
  }
});

cardsContainer.addEventListener("dblclick", (e) => {
  if (e.target.tagName === "IMG" && e.target.parentElement === cardsContainer) {
    e.target.remove();
    saveState();
  }
});

document.getElementById("export-btn").addEventListener("click", () => {
  const exportArea = document.querySelector(".tiers");

  html2canvas(exportArea, {
    backgroundColor: null,
    useCORS: true
  }).then((canvas) => {
    const link = document.createElement("a");
    link.download = "tierlist.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
});


// Export JSON
document.getElementById("export-json").addEventListener("click", () => {
  const data = localStorage.getItem("tierlist-data");
  if (!data) {
    alert("Aucune donnée à exporter.");
    return;
  }

  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "tierlist.json";
  a.click();
  URL.revokeObjectURL(url);
});

// Import JSON
const importInput = document.getElementById("import-json");
const importButton = document.getElementById("import-json-btn");

importButton.addEventListener("click", () => {
  importInput.click();
});

importInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const json = JSON.parse(e.target.result);
      if (!json.tiers || !json.unassigned) {
        alert("Fichier JSON invalide.");
        return;
      }

      localStorage.setItem("tierlist-data", JSON.stringify(json));
      location.reload();
    } catch (error) {
      alert("Erreur lors de la lecture du fichier JSON.");
      console.error(error);
    }
  };
  reader.readAsText(file);

  // Reset input
  importInput.value = "";
});
