class Oscilloscope {
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

        // vertical grid
        for (let x = 40; x <= this.width; x += (this.width-40) / 10) {
            this.ctx.beginPath(); this.ctx.moveTo(x, 0); this.ctx.lineTo(x, this.height-20); this.ctx.stroke();
        }
        // horizontal grid
        for (let y = 0; y <= this.height-20; y += (this.height-20) / 8) {
            this.ctx.beginPath(); this.ctx.moveTo(40, y); this.ctx.lineTo(this.width, y); this.ctx.stroke();
        }

        // Axes
        this.ctx.strokeStyle = '#2a2f3a';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath(); this.ctx.moveTo(40, (this.height-20) / 2); this.ctx.lineTo(this.width, (this.height-20) / 2); this.ctx.stroke(); // X
        this.ctx.beginPath(); this.ctx.moveTo(40, 0); this.ctx.lineTo(40, this.height-20); this.ctx.stroke(); // Y
        
        // Labels
        this.ctx.fillStyle = '#8492a6';
        this.ctx.font = '10px Inter';
        this.ctx.textAlign = 'right';
        this.ctx.fillText('+V', 35, 12);
        this.ctx.fillText('-V', 35, this.height - 25);
        this.ctx.fillText('0', 35, (this.height-20)/2 + 4);
    }

    drawWaveform(data, color, lineWidth = 2, maxAmplitude = 15) {
        if (!data || data.length === 0) return;
        this.ctx.beginPath();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        
        const usableWidth = this.width - 40;
        const usableHeight = this.height - 20;
        const sliceWidth = usableWidth / (data.length - 1);
        let x = 40;

        for (let i = 0; i < data.length; i++) {
            const y = (usableHeight / 2) - ((data[i] / maxAmplitude) * (usableHeight / 2));
            if (i === 0) this.ctx.moveTo(x, y);
            else this.ctx.lineTo(x, y);
            x += sliceWidth;
        }
        this.ctx.stroke();
    }
}
