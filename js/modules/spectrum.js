class SpectrumAnalyzer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        const ro = new ResizeObserver(() => this.resize());
        ro.observe(this.canvas.parentElement);
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.width = this.canvas.width = rect.width;
        this.height = this.canvas.height = rect.height;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.strokeStyle = '#1e232d';
        this.ctx.lineWidth = 1;
        
        for (let x = 40; x <= this.width; x += (this.width-40) / 10) {
            this.ctx.beginPath(); this.ctx.moveTo(x, 0); this.ctx.lineTo(x, this.height-20); this.ctx.stroke();
        }
        for (let y = 0; y <= this.height-20; y += (this.height-20) / 8) {
            this.ctx.beginPath(); this.ctx.moveTo(40, y); this.ctx.lineTo(this.width, y); this.ctx.stroke();
        }

        // Axes
        this.ctx.strokeStyle = '#2a2f3a';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath(); this.ctx.moveTo(40, this.height - 20); this.ctx.lineTo(this.width, this.height - 20); this.ctx.stroke(); // X
        this.ctx.beginPath(); this.ctx.moveTo(40, 0); this.ctx.lineTo(40, this.height-20); this.ctx.stroke(); // Y
        
        this.ctx.fillStyle = '#8492a6';
        this.ctx.font = '10px Inter';
        this.ctx.textAlign = 'right';
        this.ctx.fillText('Power', 35, 12);
        this.ctx.fillText('0', 35, this.height - 22);
    }

    drawStems(stems, maxPower) {
        this.clear();
        if(stems.length === 0 || maxPower === 0) return;
        
        const usableWidth = this.width - 60; 
        const yBase = this.height - 20;
        const maxDisplayY = 20; 
        const usableHeight = yBase - maxDisplayY;
        
        const minFreq = 0;
        const maxFreq = Math.max(...stems.map(s => s.f)) * 1.5; 
        const freqRange = maxFreq > 0 ? maxFreq : 1;

        stems.forEach((stem, index) => {
            const x = 40 + ((stem.f - minFreq) / freqRange) * usableWidth;
            const y = yBase - (stem.p / maxPower) * usableHeight;

            // Stem line
            this.ctx.beginPath();
            this.ctx.strokeStyle = '#00f3ff';
            this.ctx.lineWidth = 2;
            this.ctx.moveTo(x, yBase);
            this.ctx.lineTo(x, y);
            this.ctx.stroke();

            // Dot
            this.ctx.beginPath();
            this.ctx.fillStyle = '#00f3ff';
            this.ctx.arc(x, y, 4, 0, 2 * Math.PI);
            this.ctx.fill();

            // Label (fc, fc-fm)
            this.ctx.fillStyle = '#e2e8f0';
            this.ctx.font = '11px Inter';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(stem.label, x, y - 10);
            
            // Value (40Hz)
            this.ctx.fillStyle = '#8492a6';
            this.ctx.font = '9px Inter';
            const yOffset = (index % 2 === 0) ? 14 : 26;
            this.ctx.fillText(`${stem.f.toFixed(0)}Hz`, x, yBase + yOffset);
        });
    }
}
