const container = document.getElementById('container');
const images = document.querySelectorAll('.draggable');
const dropZone = document.getElementById('drop-zone');

let activeImage = null;
let offsetX = 0;
let offsetY = 0;

images.forEach(img => {
  img.addEventListener('dragstart', (e) => e.preventDefault());

  img.addEventListener('mousedown', (e) => {
    activeImage = img;
    offsetX = e.clientX - img.offsetLeft;
    offsetY = e.clientY - img.offsetTop;
    img.style.cursor = 'grabbing';
  });
});

document.addEventListener('mousemove', (e) => {
  if (activeImage) {
    const containerRect = container.getBoundingClientRect();
    const imgRect = activeImage.getBoundingClientRect();
    const imgWidth = imgRect.width;
    const imgHeight = imgRect.height;

    const mouseX = e.clientX;
    const mouseY = e.clientY;

    const rect = dropZone.getBoundingClientRect();
    const isHovering =
      mouseX >= rect.left &&
      mouseX <= rect.right &&
      mouseY >= rect.top &&
      mouseY <= rect.bottom;

    if (isHovering && !dropZone.classList.contains('occupied')) {
      dropZone.classList.add('hovering');
      dropZone.innerHTML = "<p>DROP<br>HERE</p>";
    } else {
      dropZone.classList.remove('hovering');
      dropZone.innerHTML = '';
    }

    if (dropZone.classList.contains('occupied')) {
      const isImageInDropZone =
        imgRect.left >= rect.left &&
        imgRect.right <= rect.right &&
        imgRect.top >= rect.top &&
        imgRect.bottom <= rect.bottom;

      if (isImageInDropZone) {
        dropZone.classList.remove('occupied');
      }
    }

    let newLeft = e.clientX - offsetX - containerRect.left;
    let newTop = e.clientY - offsetY - containerRect.top;

    newLeft = Math.max(0, Math.min(newLeft, container.clientWidth - imgWidth));
    newTop = Math.max(0, Math.min(newTop, container.clientHeight - imgHeight));

    activeImage.style.left = newLeft + 'px';
    activeImage.style.top = newTop + 'px';
  }
});

document.addEventListener('mouseup', (e) => {
  if (!activeImage) return;

  const mouseX = e.clientX;
  const mouseY = e.clientY;

  const dropZoneRect = dropZone.getBoundingClientRect();

  const isMouseInDropZone =
    mouseX >= dropZoneRect.left &&
    mouseX <= dropZoneRect.right &&
    mouseY >= dropZoneRect.top &&
    mouseY <= dropZoneRect.bottom;

  if (isMouseInDropZone && !dropZone.classList.contains('occupied')) {
    const containerRect = container.getBoundingClientRect();
    const imgRect = activeImage.getBoundingClientRect();

    const imgWidth = imgRect.width;
    const imgHeight = imgRect.height;

    const centerLeft =
      dropZoneRect.left - containerRect.left +
      (dropZoneRect.width - imgWidth) / 2;

    const centerTop =
      dropZoneRect.top - containerRect.top +
      (dropZoneRect.height - imgHeight) / 2;

    activeImage.style.left = centerLeft + 'px';
    activeImage.style.top = centerTop + 'px';

    dropZone.classList.add('occupied');
    dropZone.classList.remove('hovering');

    const sound = new Audio("pop.mp3");
    sound.volume = 0.3;
    sound.play();
  }

  activeImage.style.cursor = 'grab';
  activeImage = null;
});

// Resize text in drop zones
function resizeText() {
  const dropZones = document.querySelectorAll('.drop-zone');
  dropZones.forEach(zone => {
    const zoneWidth = zone.offsetWidth;
    zone.style.fontSize = (zoneWidth * 0.1) + 'px';
  });
}

window.addEventListener('resize', resizeText);
window.addEventListener('load', resizeText);
