import { storage, auth } from '../../utils/firebaseClient';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updatePackage } from '../../utils/packagesService';

let observer: MutationObserver | null = null;
let active = false;

function makeButton() {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Admin upload image');
  btn.style.position = 'absolute';
  btn.style.right = '8px';
  btn.style.bottom = '8px';
  btn.style.zIndex = '9999';
  btn.style.background = 'rgba(0,0,0,0.6)';
  btn.style.border = '1px solid rgba(255,255,255,0.08)';
  btn.style.color = 'white';
  btn.style.padding = '6px';
  btn.style.borderRadius = '6px';
  btn.style.cursor = 'pointer';
  btn.innerText = '👁️';
  return btn;
}

async function uploadFileAndGetURL(file: File) {
  if (!auth || !auth.currentUser) {
    alert('Debes iniciar sesión como administrador para subir imágenes.');
    throw new Error('NOT_AUTHENTICATED');
  }
  const key = `site_admin_uploads/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, key);
  try {
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (e: any) {
    console.error('Upload failed', e);
    if (e && e.code === 'storage/unauthorized') {
      alert('No tienes permiso para subir archivos al storage. Verifica las reglas de Firebase Storage o tu sesión de administrador.');
    } else {
      alert('Error al subir la imagen. Revisa la consola para más detalles.');
    }
    throw e;
  }
}

async function handleFilesForImage(img: HTMLImageElement, files: FileList | null) {
  if (!files || files.length === 0) return;
  // If multiple files and parent contains multiple images, distribute
  const parent = img.parentElement;
  const siblingsImgs = parent ? Array.from(parent.querySelectorAll('img')) as HTMLImageElement[] : [img];
  const fileArray = Array.from(files);
  const urls = [] as string[];
  for (const f of fileArray) {
    try {
      const url = await uploadFileAndGetURL(f);
      urls.push(url);
    } catch (e) {
      console.error('Upload failed', e);
    }
  }

  if (urls.length === 0) return;

  if (fileArray.length > 1 && siblingsImgs.length > 1) {
    // map urls to siblings
    for (let i = 0; i < Math.min(urls.length, siblingsImgs.length); i++) {
      siblingsImgs[i].src = urls[i];
    }
  } else {
    // single replacement
    img.src = urls[0];
  }

  // If image belongs to a package (data-pkg-id), update package image_url to first url
  const pkgId = img.getAttribute('data-pkg-id');
  if (pkgId) {
    try {
      await updatePackage(pkgId, { image_url: urls[0] });
      alert('Imagen actualizada y guardada en el paquete');
    } catch (e) {
      console.error('Failed to update package', e);
      alert('Imagen subida, pero no se pudo actualizar el paquete en la base de datos');
    }
  } else {
    alert('Imagen sustituida (cambios no persistidos en la base de datos)');
  }
}

function addOverlayToImage(img: HTMLImageElement) {
  try {
    if ((img as any).__admin_overlay_added) return;
    const parent = img.parentElement;
    if (!parent) return;
    const prevPos = window.getComputedStyle(parent).position;
    if (prevPos === 'static') {
      parent.style.position = 'relative';
    }

    const btn = makeButton();
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.style.display = 'none';

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      input.click();
    });

    input.addEventListener('change', () => handleFilesForImage(img, input.files));

    parent.appendChild(btn);
    parent.appendChild(input);

    (img as any).__admin_overlay_added = true;
  } catch (e) {
    console.error('addOverlayToImage error', e);
  }
}

function removeAllOverlays() {
  const addedInputs = Array.from(document.querySelectorAll('input[type="file"][style]')) as HTMLInputElement[];
  for (const inp of addedInputs) {
    inp.remove();
  }
  const addedButtons = Array.from(document.querySelectorAll('button')) as HTMLButtonElement[];
  for (const btn of addedButtons) {
    if (btn.innerText === '👁️' && btn.style && btn.style.zIndex === '9999') {
      btn.remove();
    }
  }
  // remove __admin_overlay_added flags
  const imgs = Array.from(document.querySelectorAll('img')) as HTMLImageElement[];
  imgs.forEach(img => { try { delete (img as any).__admin_overlay_added; } catch(_){} });
}

export function initImageAdminOverlay() {
  if (active) return;
  // Require authenticated user
  if (!auth || !auth.currentUser) {
    return;
  }

  active = true;
  // initial pass
  const imgs = Array.from(document.querySelectorAll('img')) as HTMLImageElement[];
  imgs.forEach(addOverlayToImage);

  // observe future images
  observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'childList') {
        m.addedNodes.forEach(node => {
          if (!(node instanceof HTMLElement)) return;
          const newImgs = Array.from(node.querySelectorAll ? node.querySelectorAll('img') : []) as HTMLImageElement[];
          newImgs.forEach(addOverlayToImage);
          if (node.tagName === 'IMG') addOverlayToImage(node as HTMLImageElement);
        });
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

export function destroyImageAdminOverlay() {
  active = false;
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  removeAllOverlays();
}

export default { initImageAdminOverlay, destroyImageAdminOverlay };
