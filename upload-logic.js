// Konfigurasi bobot aspek
const ASPECT_WEIGHTS = {
  modeling: 30,
  lighting: 15,
  texturing: 25,
  rendering: 15,
  deskripsi: 15
};

// Dynamic labels per app
const APP_LABELS = {
  blender: {
    modeling: 'Modeling',
    lighting: 'Lighting',
    texturing: 'Texturing & Material',
    rendering: 'Rendering',
    deskripsi: 'Deskripsi Teknis'
  },
  zbrush: {
    modeling: 'Sculpting',
    lighting: 'Lighting',
    texturing: 'Texturing & Material',
    rendering: 'Rendering',
    deskripsi: 'Deskripsi Teknis'
  },
  substance: {
    modeling: 'Modeling',
    lighting: 'Lighting',
    texturing: 'Texturing & Material',
    rendering: 'Rendering',
    deskripsi: 'Deskripsi Teknis'
  },
  photoshop: {
    modeling: 'Composition',
    lighting: 'Lighting',
    texturing: 'Effects',
    rendering: 'Export',
    deskripsi: 'Deskripsi Teknis'
  },
  illustrator: {
    modeling: 'Layout',
    lighting: 'Color',
    texturing: 'Styling',
    rendering: 'Export',
    deskripsi: 'Deskripsi Teknis'
  },
  premiere: {
    modeling: 'Editing',
    lighting: 'Color Grading',
    texturing: 'Effects',
    rendering: 'Export',
    deskripsi: 'Deskripsi Teknis'
  },
  fotogrfi: {
    modeling: 'Composition',
    lighting: 'Lighting',
    texturing: 'Editing',
    rendering: 'Post-Processing',
    deskripsi: 'Deskripsi Teknis'
  },
  digitalart: {
    modeling: 'Concept',
    lighting: 'Color',
    texturing: 'Styling',
    rendering: 'Export',
    deskripsi: 'Deskripsi Teknis'
  },
  aftereffects: {
    modeling: 'Animation',
    lighting: 'Effects',
    texturing: 'Compositing',
    rendering: 'Export',
    deskripsi: 'Deskripsi Teknis'
  },
  traditionalart: {
    modeling: 'Composition',
    lighting: 'Color',
    texturing: 'Technique',
    rendering: 'Finishing',
    deskripsi: 'Deskripsi Teknis'
  }
};

// UI refs
const loginBtn = document.getElementById('loginBtn');
const loginSection = document.getElementById('loginSection');
const uploadContent = document.getElementById('uploadContent');
const loginError = document.getElementById('loginError');
const usernameEl = document.getElementById('username');
const passwordEl = document.getElementById('password');
const fileInput = document.getElementById('fileInput');
const previewWrap = document.getElementById('previewWrap');
const previewImg = document.getElementById('previewImg');
const previewVideo = document.getElementById('previewVideo');
const descEl = document.getElementById('desc');
const analyzeBtn = document.getElementById('analyzeBtn');
const aiResult = document.getElementById('aiResult');
const finalizeBtn = document.getElementById('finalizeBtn');
const status = document.getElementById('status');
const appSelect = document.getElementById('appSelect');

let currentImageData = null; // base64
let lastAiScores = null;
let lastAiText = '';
let editModeId = null;
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4'];

function showStatus(message, type = 'error') {
  status.innerHTML = `<span class="small" style="color:${type === 'error' ? '#f99' : '#9f9'}">${message}</span>`;
}

function validateFile(file) {
  if (!file) return false;
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    showStatus(`Error: Tipe file tidak didukung. Hanya izinkan: ${ALLOWED_FILE_TYPES.join(', ')}`);
    return false;
  }
  if (file.size > MAX_FILE_SIZE) {
    showStatus(`Error: Ukuran file terlalu besar (Maks: ${MAX_FILE_SIZE / 1024 / 1024} MB).`);
    return false;
  }
  return true;
}

// image preview
fileInput.addEventListener('change', (e)=>{
  const f = e.target.files[0];
  if(!f) return;

  // Reset previews
  if (!validateFile(f)) {
    fileInput.value = ''; // Clear the invalid file
    return;
  }

  previewImg.style.display = 'none';
  previewVideo.style.display = 'none';
  previewVideo.src = '';

  const reader = new FileReader();
  reader.onload = function(ev){
    currentImageData = ev.target.result;
    if (f.type.startsWith('video/')) {
      previewVideo.src = currentImageData;
      previewVideo.style.display = 'block';
    } else {
      previewImg.src = currentImageData;
      previewImg.style.display = 'block';
    }
    previewWrap.style.display = 'block';
  }
  reader.readAsDataURL(f);
  debouncedAutoAnalyze();
});

// simple AI text analyzer (keyword-based) - dynamic based on app
function analyzeText(desc, app){
  const text = (desc||'').toLowerCase();
  // keywords per aspek per app
  const kw = {
    blender: {
      modeling: ['retopo','topology','topologi','retopology','edge loop','quad','subdivision','bevel','sculpt','sculpting','blockout','lowpoly','highpoly','modifier','boolean','extrude','loop cut'],
      lighting: ['hdr','hdri','lighting','light','exposure','key light','rim light','ambient occlusion','ao','shadow','bounce','cycles','eevee','world lighting'],
      texturing: ['pbr','albedo','roughness','metallic','texture','uv','unwrap','bake','normal map','detail','node','shader','principled bsdf','image texture'],
      rendering: ['cycles','eevee','render','samples','denoise','noise','resolution','rendering','filmic','pass','render pass','compositor'],
      deskripsi: ['workflow','pipeline','step','technique','workflow','modifier','nodes','shader','maps','blender','addon']
    },
    zbrush: {
      modeling: ['sculpt','sculpting','dynamesh','zremesher','subdivision','polypaint','masking','morph','deformation','brush','alpha','stencil'],
      lighting: ['light','shadow','matcap','material','render','bpr','zbrush render','lighting setup'],
      texturing: ['polypaint','texture','uv','unwrap','normal map','detail','brush','alpha','stencil','material','surface noise'],
      rendering: ['bpr','render','resolution','anti-aliasing','shadow','matcap','zbrush render','best preview render'],
      deskripsi: ['workflow','pipeline','step','technique','zbrush','dynamesh','polypaint','brush','alpha']
    },
    substance: {
      modeling: [], // substance is texturing
      lighting: [], // minimal
      texturing: ['pbr','albedo','roughness','metallic','height','normal','ao','substance painter','sps','layer','mask','generator','filter','smart material','smart mask','baking','uv','unwrap'],
      rendering: ['render','preview','environment','lighting','hdri'],
      deskripsi: ['workflow','pipeline','step','technique','substance','pbr','material','baking','uv']
    },
    photoshop: {
      modeling: [], // 2d
      lighting: ['lighting','shadow','highlight','dodge','burn','curves','levels','exposure','brightness','contrast'],
      texturing: ['texture','layer','mask','brush','clone','heal','content aware','pattern','gradient','filter','effect','blend mode'],
      rendering: ['render','resolution','export','save for web','jpeg','png','tiff','quality','compression'],
      deskripsi: ['workflow','pipeline','step','technique','photoshop','layer','mask','filter','effect','adjustment']
    },
    illustrator: {
      modeling: [], // vector
      lighting: [], // minimal
      texturing: ['vector','path','pen tool','brush','gradient','pattern','swatch','stroke','fill','effect','filter','blend mode','opacity'],
      rendering: ['export','pdf','svg','eps','ai','resolution','rasterize','artboard'],
      deskripsi: ['workflow','pipeline','step','technique','illustrator','vector','path','pen','brush','effect']
    },
    premiere: {
      modeling: [], // video
      lighting: ['color grading','lut','curves','levels','exposure','brightness','contrast','shadow','highlight'],
      texturing: ['color correction','color grading','lut','secondary color','tracking','mask','keying','green screen','chroma key'],
      rendering: ['export','render','codec','resolution','frame rate','bitrate','h264','prores','timeline','sequence'],
      deskripsi: ['workflow','pipeline','step','technique','premiere','editing','color grading','audio','transition','effect']
    },
    fotogrfi: {
      modeling: [], // photography
      lighting: ['lighting','exposure','iso','aperture','shutter speed','white balance','flash','natural light','studio light','hdr','bracketing'],
      texturing: ['composition','angle','focus','depth of field','sharpness','contrast','saturation','color balance','editing','retouch','dodge','burn'],
      rendering: ['resolution','jpeg','raw','tiff','export','print','web','compression','quality'],
      deskripsi: ['workflow','pipeline','step','technique','photography','camera','lens','lighting','editing','post-processing']
    },
    digitalart: {
      modeling: ['concept','sketch','idea','design','layout','composition'],
      lighting: ['color','palette','hue','saturation','brightness','contrast','tone','shade','highlight','shadow'],
      texturing: ['styling','brush','layer','effect','filter','blend mode','texture','pattern','gradient','opacity'],
      rendering: ['export','resolution','jpeg','png','tiff','quality','compression','save for web','artboard'],
      deskripsi: ['workflow','pipeline','step','technique','digital art','illustration','concept art','design','styling']
    },
    aftereffects: {
      modeling: ['animation','keyframe','motion','timeline','layer','composition','precomp','null object','shape layer'],
      lighting: ['effects','visual effects','vfx','particle','glow','blur','shadow','light','flare','adjustment layer'],
      texturing: ['compositing','mask','tracking','keying','green screen','rotoscoping','matte','alpha','blend mode'],
      rendering: ['export','render','codec','resolution','frame rate','bitrate','quicktime','mp4','after effects','ae'],
      deskripsi: ['workflow','pipeline','step','technique','after effects','motion graphics','visual effects','compositing','animation']
    },
    traditionalart: {
      modeling: ['composition','sketch','drawing','painting','form','structure'],
      lighting: ['color','tone','shade','highlight','shadow','value','contrast'],
      texturing: ['technique','brushwork','medium','texture','detail','rendering','style'],
      rendering: ['finishing','presentation','framing','scan','photography'],
      deskripsi: ['workflow','pipeline','step','technique','traditional art','illustration','painting','drawing','medium']
    }
  };
  const appKw = kw[app] || kw.blender; // fallback
  const baseScore = {modeling:4, lighting:4, texturing:4, rendering:4, deskripsi:3}; // baseline
  const maxAdd = 6; // so text-based score up to 10
  const res = {};
  for(const aspect in appKw){
    let cnt = 0;
    appKw[aspect].forEach(k=>{
      if(text.includes(k)) cnt++;
    });
    // score based on count (saturate)
    const score = Math.min(10, baseScore[aspect] + Math.min(maxAdd, cnt*1.8));
    res[aspect] = Number(score.toFixed(2));
  }

  // analysis text (summary) - dynamic per app
  const analysis = [];
  if(text.trim().length === 0) analysis.push('Deskripsi kosong — AI merekomendasikan menuliskan langkah workflow & fitur yang digunakan.');
  else {
    if(res.modeling >= 8) analysis.push(`Deskripsi menunjukkan praktik ${appKw[app].modeling.toLowerCase()} yang baik untuk ${app}.`);
    if(res.lighting >= 7) analysis.push(`Deskripsi menyebut teknik ${appKw[app].lighting.toLowerCase()} sehingga AI menganggap perhatian terhadap ${appKw[app].lighting.toLowerCase()} baik.`);
    if(res.texturing >= 7) analysis.push(`Ada penyebutan teknik ${appKw[app].texturing.toLowerCase()} sehingga ${appKw[app].texturing.toLowerCase()} dinilai kuat.`);
    if(res.rendering >= 7) analysis.push(`Penggunaan ${appKw[app].rendering.toLowerCase()} / setting ${appKw[app].rendering.toLowerCase()} disebutkan.`);
  }
  return {scores:res, text: analysis.join(' ') || 'Analisis teks singkat: tidak banyak kata kunci teknis.'};
}

// simple image analyzer (basic metrics)
async function analyzeImage(imgDataUrl){
  if (!imgDataUrl) {
    // fallback neutral scores
    return {modeling:6, lighting:6, texturing:6, rendering:6, text:'Tidak ada gambar ter-upload.'};
  }
  // If it's a video, skip analysis and return neutral scores
  if (imgDataUrl.startsWith('data:video')) {
    return {modeling:6, lighting:6, texturing:6, rendering:6, text:'Analisis gambar dilewati untuk file video.'};
  }
  return new Promise((resolve)=>{
    const img = new Image();
    img.onload = function(){
      // draw to canvas scaled down for speed
      const cw = Math.min(300, img.width);
      const ch = Math.round(img.height * (cw / img.width));
      const c = document.createElement('canvas');
      c.width = cw; c.height = ch;
      const ctx = c.getContext('2d');
      ctx.drawImage(img,0,0,cw,ch);
      const data = ctx.getImageData(0,0,cw,ch).data;
      // compute average luminance and edge density
      let lumSum = 0;
      let edgeSum = 0;
      // simple sobel-like approximation for edges: compare with neighbor
      for(let y=0;y<ch;y++){
        for(let x=0;x<cw;x++){
          const i = (y*cw + x)*4;
          const r = data[i], g = data[i+1], b = data[i+2];
          const lum = 0.2126*r + 0.7152*g + 0.0722*b;
          lumSum += lum;
          // neighbor difference
          if(x < cw-1){
            const ni = (y*cw + (x+1))*4;
            const nr = data[ni], ng = data[ni+1], nb = data[ni+2];
            const diff = Math.abs(r-nr)+Math.abs(g-ng)+Math.abs(b-nb);
            edgeSum += diff;
          }
        }
      }
      const pix = cw*ch;
      const avgLum = lumSum / pix; // 0-255
      const avgEdge = edgeSum / pix; // avg diff across neighbors
      // map lum to lighting score: mid-range lum tends to indicate balanced lighting
      let lightingScore = 6;
      if(avgLum < 30) lightingScore = 4; // too dark
      else if(avgLum < 80) lightingScore = 5.5;
      else if(avgLum < 140) lightingScore = 7;
      else if(avgLum < 200) lightingScore = 6.5;
      else lightingScore = 5.5; // too bright

      // map edge to modeling detail: higher edges -> more detail (but noisy increases edge too)
      let modelingScore = Math.min(9.5, Math.max(3.5, (avgEdge / 40) )); // scale approx
      modelingScore = Number((modelingScore).toFixed(2));

      // texturing score: use edge and some lum heuristics
      let texturingScore = (modelingScore*0.6) + (lightingScore*0.4);
      texturingScore = Math.min(9.8, Math.max(3.5, texturingScore));

      // rendering: consider smoothness (low edge + mid lum) -> render quality
      let renderingScore = 7 - Math.min(3, avgEdge/120) + ((avgLum>60 && avgLum<180)?0.6:0);
      renderingScore = Math.min(9.5, Math.max(3.5, renderingScore));

      resolve({
        modeling: Number(modelingScore.toFixed(2)),
        lighting: Number(lightingScore.toFixed(2)),
        texturing: Number(texturingScore.toFixed(2)),
        rendering: Number(renderingScore.toFixed(2)),
        text: `Analisis gambar: avgLum=${Math.round(avgLum)}, avgEdge=${Math.round(avgEdge)}`
      });
    };
    img.onerror = function(){ resolve({modeling:6,lighting:6,texturing:6,rendering:6,text:'Gagal memuat gambar.'});}
    img.src = imgDataUrl;
  });
}

// combine text-analysis and image-analysis into AI scores
async function runAiAnalysis(desc, imgDataUrl, app){
  const textRes = analyzeText(desc, app);
  const imgRes = await analyzeImage(imgDataUrl);
  // combine: text influences deskripsi strongly, image influences visual aspects strongly
  const combined = {
    modeling: Number(((imgRes.modeling*0.75) + (textRes.scores.modeling*0.25)).toFixed(2)),
    lighting: Number(((imgRes.lighting*0.75) + (textRes.scores.lighting*0.25)).toFixed(2)),
    texturing: Number(((imgRes.texturing*0.75) + (textRes.scores.texturing*0.25)).toFixed(2)),
    rendering: Number(((imgRes.rendering*0.75) + (textRes.scores.rendering*0.25)).toFixed(2)),
    deskripsi: Number((textRes.scores.deskripsi).toFixed(2)),
    textSummary: (textRes.text + ' ' + imgRes.text).trim()
  };
  return combined;
}

// Function to update labels based on selected app
function updateLabels(app) {
  const labels = APP_LABELS[app] || APP_LABELS.blender;
  document.getElementById('label_modeling').textContent = labels.modeling;
  document.getElementById('label_lighting').textContent = labels.lighting;
  document.getElementById('label_texturing').textContent = labels.texturing;
  document.getElementById('label_rendering').textContent = labels.rendering;
  document.getElementById('label_deskripsi').textContent = labels.deskripsi;
}

// Update labels on app change
appSelect.addEventListener('change', () => {
  updateLabels(appSelect.value);
});

// Initialize labels on load
updateLabels(appSelect.value);

// compute final and store
finalizeBtn.addEventListener('click', async ()=>{
  if(!currentImageData){
    showStatus('Silakan upload gambar terlebih dulu.');
    return;
  }
  if (descEl.value.trim().length < 10) {
    showStatus('Deskripsi proyek terlalu pendek. Mohon jelaskan lebih detail.');
    return;
  }
  // ensure AI run
  if(!lastAiScores){
    showStatus('Klik "Analisis AI" dulu sebelum finalize.');
    return;
  }
  // collect user scores
  const userScores = {
    modeling: Number(document.getElementById('u_modeling').value) || 0,
    lighting: Number(document.getElementById('u_lighting').value) || 0,
    texturing: Number(document.getElementById('u_texturing').value) || 0,
    rendering: Number(document.getElementById('u_rendering').value) || 0,
    deskripsi: Number(document.getElementById('u_deskripsi').value) || 0
  };

  // Validate userScores: ensure all are numbers between 0-10
  for (const key in userScores) {
    if (isNaN(userScores[key]) || userScores[key] < 0 || userScores[key] > 10) {
      showStatus(`Error: Nilai ${key} tidak valid (harus 0-10).`);
      return;
    }
  }

  // Validate lastAiScores: ensure exists and all are numbers
  if (!lastAiScores) {
    showStatus('Error: Jalankan Analisis AI dulu sebelum finalize.');
    return;
  }
  for (const key in lastAiScores) {
    if (key === 'textSummary') continue; // Skip non-numeric fields
    if (isNaN(lastAiScores[key]) || lastAiScores[key] < 0 || lastAiScores[key] > 10) {
      console.error(`AI score for ${key} is invalid: ${lastAiScores[key]}`);
      showStatus('Error: Analisis AI gagal, coba lagi.');
      return;
    }
  }

  // final per-aspect = (user*0.5 + ai*0.5)
  const finalScores = {};
  for(const k in userScores){
    finalScores[k] = Number(((userScores[k]*0.5) + (lastAiScores[k]*0.5)).toFixed(2));
  }

  // compute total skill percent using weights (0-10 -> percent)
  let total = 0;
  for(const k in finalScores){
    const weight = ASPECT_WEIGHTS[k] || 0;
    total += (finalScores[k] * (weight/100)) * 10; // because finalScores in 0-10 -> *10 to get percent
  }
  // Bug Fix: Ensure totalPercent is a valid number before saving
  let totalPercent = Number(total.toFixed(2)); // 0-100
  if (isNaN(totalPercent)) {
    console.error("Calculation error: totalPercent is NaN. Defaulting to 0.", { userScores, lastAiScores, finalScores });
    totalPercent = 0;
  }

  // build upload object
  const obj = {
    id: 'upl_'+Date.now(),
    app: appSelect.value, // e.g., 'blender'
    imageData: currentImageData,
    description: descEl.value,
    userScores,
    aiScores: lastAiScores,
    finalScores,
    totalPercent,
    aiText: lastAiText,
    timestamp: new Date().toISOString()
  };

  // store in uploads (check for edit mode)
  const uploads = getUploads();
  if (editModeId) {
    const index = uploads.findIndex(u => u.id === editModeId);
    if (index !== -1) {
      // Preserve original ID and timestamp when editing
      uploads[index] = { ...obj, id: editModeId, timestamp: uploads[index].timestamp };
    } else {
      uploads.unshift(obj); // Fallback: add as new if ID not found
    }
  } else {
    uploads.unshift(obj); // add newest front
  }
  saveUploads(uploads);

  // Hapus perhitungan summary dari sini. Biarkan index.html yang menghitung.
  status.innerHTML = `<span class="success">${editModeId ? 'Berhasil diperbarui!' : 'Berhasil di-upload!'} Persentase skill akan diperbarui di halaman utama.</span>`;

  // reset-ish
  lastAiScores = null;
  lastAiText = '';
  // redirect to target page based on app
  setTimeout(()=>{
    // Redirect ke halaman aplikasi terkait untuk melihat karya
    let appPage = obj.app;
    if (appPage === 'digitalart') appPage = 'Digital Art';
    else if (appPage === 'aftereffects') appPage = 'aftereffects';
    else if (appPage === 'traditionalart') appPage = 'Traditional Art';
    else appPage = obj.app; // blender, zbrush, etc.
    const target = `${appPage}.html#karya=${editModeId || obj.id}`;
    console.log('Redirecting to:', target); // Debug log
    window.location.href = target;
  },800);
});

// Bug Fix: Reset AI analysis if description or file changes
function resetAiAnalysisState() {
  if (lastAiScores) {
    lastAiScores = null;
    lastAiText = '';
    aiResult.style.display = 'block';
    aiResult.innerHTML = '<span style="color:#f99">Deskripsi atau file berubah. Mohon klik "Analisis AI" lagi.</span>';
    analyzeBtn.disabled = false;
    analyzeBtn.innerHTML = 'Analisis AI';
  }
  // Jika belum ada analisis sama sekali, pastikan status bersih
  else {
    // Ini mencegah pesan error lama muncul jika pengguna belum melakukan apa-apa
    status.innerHTML = '';
  }
}

descEl.addEventListener('input', debouncedAutoAnalyze);
fileInput.addEventListener('change', resetAiAnalysisState);
appSelect.addEventListener('change', resetAiAnalysisState);

// login functionality
loginBtn.addEventListener('click', ()=>{
  const username = usernameEl.value.trim();
  const password = passwordEl.value.trim();
  // Pengecekan kredensial langsung (seperti semula)
  if(username === "MELABAR157" && password === "06-10-08"){
    loginSection.style.opacity = '0';
    setTimeout(() => {
      loginSection.style.display = 'none';
      uploadContent.style.display = 'block';
      uploadContent.classList.add('show');
    }, 500);
    loginError.style.display = 'none';
  } else {
    loginError.textContent = 'sandi anda salah';
    loginError.style.display = 'block';
    loginError.classList.add('message');
  }
});

// drag and drop functionality
const dropZone = document.querySelector('.drop-zone');
const dragOverlay = document.getElementById('dragOverlay');
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});
dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragover');
});
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    if (validateFile(files[0])) {
      fileInput.files = files;
      fileInput.dispatchEvent(new Event('change'));
    }
  }
});
// Global drag-drop overlay
window.addEventListener('dragenter', (e) => {
  dragOverlay.classList.add('visible');
});
// Use a counter to deal with child elements firing dragleave
let dragCounter = 0;
window.addEventListener('dragenter', () => dragCounter++);
window.addEventListener('dragleave', () => {
  dragCounter--;
  if (dragCounter === 0) {
    dragOverlay.classList.remove('visible');
  }
});
window.addEventListener('drop', () => { dragCounter = 0; dragOverlay.classList.remove('visible'); });

// loading spinner for AI analysis
analyzeBtn.addEventListener('click', async ()=>{
  analyzeBtn.disabled = true;
  analyzeBtn.innerHTML = '<span class="spinner"></span> Menganalisis...';
  aiResult.style.display='block';
  aiResult.textContent = 'AI sedang menganalisis...';
  const desc = descEl.value;
  const app = appSelect.value;
  const ai = await runAiAnalysis(desc, currentImageData, app);
  analyzeBtn.disabled = false; analyzeBtn.innerHTML = 'Analisis AI';
  lastAiScores = ai;
  lastAiText = ai.textSummary;
  const labels = APP_LABELS[app] || APP_LABELS.blender;
  aiResult.innerHTML = `<strong>Hasil AI (skor 0–10):</strong>
    <table>
      <tr><th>Aspek</th><th>Skor AI</th></tr>
      <tr><td>${labels.modeling}</td><td>${ai.modeling}</td></tr>
      <tr><td>${labels.lighting}</td><td>${ai.lighting}</td></tr>
      <tr><td>${labels.texturing}</td><td>${ai.texturing}</td></tr>
      <tr><td>${labels.rendering}</td><td>${ai.rendering}</td></tr>
      <tr><td>${labels.deskripsi}</td><td>${ai.deskripsi}</td></tr>
    </table>
    <p style="margin-top:8px"><strong>Ringkasan AI:</strong> ${ai.textSummary}</p>
  `;
  analyzeBtn.disabled = false;
  analyzeBtn.innerHTML = 'Analisis AI';
});

// Debounce function for auto-analysis
let debounceTimeout;
function debouncedAutoAnalyze() {
  resetAiAnalysisState();
  clearTimeout(debounceTimeout);
  if (currentImageData && descEl.value.trim().length > 10) {
    debounceTimeout = setTimeout(() => {
      if (currentImageData && descEl.value.trim().length > 10) { // Double check
        analyzeBtn.click();
      }
    }, 1500); // Wait 1.5s after user stops typing
  }
}

// tooltips for inputs
const inputs = document.querySelectorAll('input, textarea');
inputs.forEach(input => {
  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  tooltip.innerHTML = `<span class="tooltiptext">${input.placeholder || 'Masukkan nilai'}</span>`;
  input.parentNode.appendChild(tooltip);
});

// success message animation
const statusEl = document.getElementById('status');
const observer = new MutationObserver(() => {
  if (statusEl.innerHTML.includes('Berhasil')) {
    statusEl.classList.add('message');
  }
});
observer.observe(statusEl, { childList: true });

// load existing for debugging
(function init() {
  const urlParams = new URLSearchParams(window.location.search);
  const workIdToEdit = urlParams.get('edit');
  if (workIdToEdit) {
    const uploads = getUploads();
    const workToEdit = uploads.find(u => u.id === workIdToEdit);
    if (workToEdit) {
      editModeId = workIdToEdit;
      // Populate form with existing data
      document.querySelector('h1').textContent = 'Edit Proyek';
      appSelect.value = workToEdit.app;
      descEl.value = workToEdit.description;
      currentImageData = workToEdit.imageData;
      if (currentImageData.startsWith('data:video')) {
        previewVideo.src = currentImageData;
        previewVideo.style.display = 'block';
      } else {
        previewImg.src = currentImageData;
        previewImg.style.display = 'block';
      }
      previewWrap.style.display = 'block';
      // Populate manual scores
      if (workToEdit.userScores) {
        for (const key in workToEdit.userScores) {
          const input = document.getElementById(`u_${key}`);
          if (input) input.value = workToEdit.userScores[key];
        }
      }
      finalizeBtn.textContent = 'Update Karya';
      updateLabels(workToEdit.app); // Update labels for the correct app
    }
  }
})();