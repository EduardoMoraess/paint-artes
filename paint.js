const canvas = document.getElementById('paintCanvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const brushSize = document.getElementById('brushSize');
const toolSelect = document.getElementById('tool');
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');
const clearBtn = document.getElementById('clearBtn');
const saveBtn = document.getElementById('saveBtn');

let painting = false;
let startX, startY;
let tool = 'brush';
let undoStack = [];
let redoStack = [];

// Função para salvar o estado atual (para desfazer)
function saveState() {
    undoStack.push(canvas.toDataURL());
    redoStack = []; // limpa o refazer ao desenhar algo novo
}

function startDraw(e) {
    e.preventDefault();
    painting = true;
    const { x, y } = getCursorPos(e);
    startX = x;
    startY = y;

    if (tool === 'brush' || tool === 'eraser') {
        saveState();
        draw(e);
    }
}

function endDraw(e) {
    if (!painting) return;
    painting = false;

    if (['line', 'rect', 'circle'].includes(tool)) {
        saveState();
        const { x, y } = getCursorPos(e);
        drawShape(startX, startY, x, y);
    }

    ctx.beginPath();
}

function draw(e) {
    if (!painting) return;

    const { x, y } = getCursorPos(e);
    ctx.lineWidth = brushSize.value;
    ctx.lineCap = 'round';
    ctx.strokeStyle = tool === 'eraser' ? '#fff' : colorPicker.value;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function drawShape(x1, y1, x2, y2) {
    const w = x2 - x1;
    const h = y2 - y1;

    ctx.lineWidth = brushSize.value;
    ctx.strokeStyle = colorPicker.value;
    ctx.beginPath();

    switch (tool) {
        case 'line':
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            break;
        case 'rect':
            ctx.rect(x1, y1, w, h);
            break;
        case 'circle':
            const radius = Math.sqrt(w ** 2 + h ** 2);
            ctx.arc(x1, y1, radius, 0, 2 * Math.PI);
            break;
    }
    ctx.stroke();
}

function getCursorPos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
}

// Eventos do mouse
canvas.addEventListener('mousedown', startDraw);
canvas.addEventListener('mouseup', endDraw);
canvas.addEventListener('mousemove', draw);

// Eventos de toque (celular/tablet)
canvas.addEventListener('touchstart', startDraw);
canvas.addEventListener('touchend', endDraw);
canvas.addEventListener('touchmove', draw);

// Ferramentas
toolSelect.addEventListener('change', () => {
    tool = toolSelect.value;
});

// Desfazer / Refazer
undoBtn.addEventListener('click', () => {
    if (undoStack.length === 0) return;
    redoStack.push(canvas.toDataURL());
    const lastState = undoStack.pop();
    const img = new Image();
    img.src = lastState;
    img.onload = () => ctx.drawImage(img, 0, 0);
});

redoBtn.addEventListener('click', () => {
    if (redoStack.length === 0) return;
    undoStack.push(canvas.toDataURL());
    const nextState = redoStack.pop();
    const img = new Image();
    img.src = nextState;
    img.onload = () => ctx.drawImage(img, 0, 0);
});

// Limpar
clearBtn.addEventListener('click', () => {
    saveState();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Salvar
saveBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'super-paint.png';
    link.href = canvas.toDataURL();
    link.click();
});