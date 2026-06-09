document.addEventListener('DOMContentLoaded', () => {
    const oscMsg = new Oscilloscope('osc-msg');
    const oscCar = new Oscilloscope('osc-car');
    const oscMod = new Oscilloscope('osc-mod');
    const spec = new SpectrumAnalyzer('spectrum-canvas');
    
    let currentScheme = 'am';
    let timeOffset = 0;
    const ANIMATION_SPEED = 0.002;

    // Inputs
    const sliders = {
        ac: document.getElementById('slider-ac'),
        fc: document.getElementById('slider-fc'),
        am: document.getElementById('slider-am'),
        fm: document.getElementById('slider-fm'),
        dev: document.getElementById('slider-dev'), // FM dev
        zx: document.getElementById('zoom-x'),
        zy: document.getElementById('zoom-y')
    };

    const displays = {
        ac: document.getElementById('val-ac'),
        fc: document.getElementById('val-fc'),
        am: document.getElementById('val-am'),
        fm: document.getElementById('val-fm'),
        dev: document.getElementById('val-dev')
    };
    
    // Telemetry Elements
    const tel = {
        status: document.getElementById('tel-status'),
        statusSub: document.getElementById('tel-status-sub'),
        pc: document.getElementById('tel-pc'),
        pcSub: document.getElementById('tel-pc-sub'),
        psb: document.getElementById('tel-psb'),
        psbSub: document.getElementById('tel-psb-sub'),
        pt: document.getElementById('tel-pt'),
        ptSub: document.getElementById('tel-pt-sub'),
        eff: document.getElementById('tel-eff'),
        bw: document.getElementById('tel-bw'),
        bwSub: document.getElementById('tel-bw-sub')
    };

    const mathFormula = document.getElementById('math-formula');
    const mathValues = document.getElementById('math-values');
    const fmControls = document.getElementById('fm-controls');

    let state = {
        ac: 4, fc: 40, am: 2, fm: 2, dev: 10, zx: 1, zy: 1, mu: 0.5
    };

    // Buttons
    document.querySelectorAll('.scheme-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.scheme-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentScheme = e.target.dataset.scheme;
            fmControls.style.display = (currentScheme === 'fm' || currentScheme === 'pm') ? 'block' : 'none';
            updateTelemetry();
        });
    });

    function updateTelemetry() {
        const ac = parseFloat(sliders.ac.value);
        const fc = parseFloat(sliders.fc.value);
        const am = parseFloat(sliders.am.value);
        const fm = parseFloat(sliders.fm.value);
        const dev = parseFloat(sliders.dev.value);
        const zx = parseFloat(sliders.zx.value);
        const zy = parseFloat(sliders.zy.value);

        state = { ac, fc, am, fm, dev, zx, zy, mu: am/ac };

        displays.ac.innerText = `${ac.toFixed(1)} V`;
        displays.fc.innerText = `${fc.toFixed(1)} Hz`;
        displays.am.innerText = `${am.toFixed(1)} V`;
        displays.fm.innerText = `${fm.toFixed(1)} Hz`;
        displays.dev.innerText = `${dev.toFixed(1)} Hz`;

        let mu = state.mu;
        let pc = (ac * ac) / 2;
        let psb = 0;
        let pt = 0;
        let eff = 0;
        let bw = 0;
        
        let formulaTex = "";
        let valuesText = "";

        if (currentScheme === 'am') {
            psb = pc * (mu * mu) / 2;
            pt = pc + psb;
            eff = (psb / pt) * 100;
            bw = 2 * fm;
            formulaTex = `s(t) = A_c [1 + \\mu \\cos(2\\pi f_m t)] \\cos(2\\pi f_c t)`;
            valuesText = `s(t) = ${ac.toFixed(2)} [1 + ${mu.toFixed(2)} \\cos(2\\pi \\cdot ${fm.toFixed(1)} t)] \\cos(2\\pi \\cdot ${fc.toFixed(1)} t)`;
            
            tel.status.innerText = mu < 1 ? "UNDERMODULATION" : (mu === 1 ? "CRITICAL MOD" : "OVERMODULATION");
            tel.status.style.color = mu > 1 ? "#ff003c" : "#00f3ff";
            tel.statusSub.innerText = `\\(\\mu = ${mu.toFixed(2)}\\)`;
            tel.pcSub.innerText = `\\(P_c = A_c^2 / 2\\)`;
            tel.psbSub.innerText = `Total Sideband`;
            tel.ptSub.innerText = `\\(P_T = P_c + P_{sb}\\)`;
            tel.bwSub.innerText = `\\(BW = 2f_m\\)`;
        } 
        else if (currentScheme === 'dsbsc') {
            psb = (ac * ac * am * am) / 4; 
            pc = 0; 
            pt = psb;
            eff = 100;
            bw = 2 * fm;
            formulaTex = `s(t) = A_c A_m \\cos(2\\pi f_m t) \\cos(2\\pi f_c t)`;
            valuesText = `s(t) = ${ac.toFixed(2)} \\cdot ${am.toFixed(2)} \\cos(2\\pi \\cdot ${fm.toFixed(1)} t) \\cos(2\\pi \\cdot ${fc.toFixed(1)} t)`;
            
            tel.status.innerText = "SUPPRESSED CARRIER";
            tel.status.style.color = "#00f3ff";
            tel.statusSub.innerText = `Carrier removed`;
            tel.pcSub.innerText = `\\(P_c = 0\\)`;
            tel.psbSub.innerText = `Total Sideband`;
            tel.ptSub.innerText = `\\(P_T = P_{sb}\\)`;
            tel.bwSub.innerText = `\\(BW = 2f_m\\)`;
        }
        else if (currentScheme === 'ssb') {
            psb = (ac * ac * am * am) / 8; 
            pc = 0;
            pt = psb;
            eff = 100;
            bw = fm;
            formulaTex = `s(t) = \\frac{A_c A_m}{2} \\cos(2\\pi (f_c + f_m) t)`;
            valuesText = `s(t) = ${(ac*am/2).toFixed(2)} \\cos(2\\pi \\cdot ${(fc+fm).toFixed(1)} t)`;
            
            tel.status.innerText = "SINGLE SIDEBAND";
            tel.status.style.color = "#00f3ff";
            tel.statusSub.innerText = `USB Only`;
            tel.pcSub.innerText = `\\(P_c = 0\\)`;
            tel.psbSub.innerText = `USB Power`;
            tel.ptSub.innerText = `\\(P_T = P_{USB}\\)`;
            tel.bwSub.innerText = `\\(BW = f_m\\)`;
        }
        else if (currentScheme === 'fm') {
            let beta = dev / fm;
            pc = (ac * ac) / 2;
            pt = pc;
            psb = 0;
            eff = 100;
            bw = 2 * (dev + fm); 
            formulaTex = `s(t) = A_c \\cos(2\\pi f_c t + \\beta \\sin(2\\pi f_m t))`;
            valuesText = `s(t) = ${ac.toFixed(2)} \\cos(2\\pi \\cdot ${fc.toFixed(1)} t + ${beta.toFixed(2)} \\sin(2\\pi \\cdot ${fm.toFixed(1)} t))`;
            
            tel.status.innerText = "FREQUENCY MODULATED";
            tel.status.style.color = "#ff7a00";
            tel.statusSub.innerText = `\\(\\beta = ${beta.toFixed(2)}\\)`;
            tel.pcSub.innerText = `\\(P_c = A_c^2 / 2\\)`;
            tel.psbSub.innerText = `Infinite Sidebands`;
            tel.ptSub.innerText = `\\(P_T = P_c\\)`;
            tel.bwSub.innerText = `Carson: \\(2(\\Delta f + f_m)\\)`;
        }
        else if (currentScheme === 'pm') {
            let kp = dev; 
            let beta = kp * am; 
            pc = (ac * ac) / 2;
            pt = pc;
            psb = 0;
            eff = 100;
            bw = 2 * (beta + 1) * fm; 
            formulaTex = `s(t) = A_c \\cos(2\\pi f_c t + k_p A_m \\cos(2\\pi f_m t))`;
            valuesText = `s(t) = ${ac.toFixed(2)} \\cos(2\\pi \\cdot ${fc.toFixed(1)} t + ${(kp*am).toFixed(2)} \\cos(2\\pi \\cdot ${fm.toFixed(1)} t))`;
            
            tel.status.innerText = "PHASE MODULATED";
            tel.status.style.color = "#ff7a00";
            tel.statusSub.innerText = `\\(\\beta_p = ${beta.toFixed(2)}\\)`;
            tel.pcSub.innerText = `\\(P_c = A_c^2 / 2\\)`;
            tel.psbSub.innerText = `Infinite Sidebands`;
            tel.ptSub.innerText = `\\(P_T = P_c\\)`;
            tel.bwSub.innerText = `Carson Approx`;
        }

        tel.pc.innerText = pc.toFixed(2);
        tel.psb.innerText = psb.toFixed(2);
        tel.pt.innerText = pt.toFixed(2);
        tel.eff.innerText = eff.toFixed(1);
        tel.bw.innerText = bw.toFixed(2);

        mathFormula.innerHTML = `\\(${formulaTex}\\)`;
        mathValues.innerHTML = `Active values: \\(${valuesText}\\)`;
        if (window.MathJax) {
            MathJax.typesetPromise([mathFormula, mathValues, tel.statusSub, tel.pcSub, tel.psbSub, tel.ptSub, tel.bwSub]).catch(err => console.log(err));
        }

        updateSpectrum();
    }

    function animate() {
        timeOffset += ANIMATION_SPEED;
        generateWaveforms();
        requestAnimationFrame(animate);
    }

    function generateWaveforms() {
        const { scheme } = { scheme: currentScheme };
        const { fm, am, fc, ac, dev, zx, zy, mu } = state;

        const samples = 1200; // optimized for 60fps
        const duration = (5 / fm) / zx; 
        const dt = duration / samples;

        const msgData = [];
        const carData = [];
        const modData = [];
        const envData = [];

        for (let i = 0; i < samples; i++) {
            const t = timeOffset + (i * dt);
            let m_t = am * Math.cos(2 * Math.PI * fm * t);
            let c_t = ac * Math.cos(2 * Math.PI * fc * t);
            let s_t = 0;

            if (scheme === 'am') {
                s_t = (ac + m_t) * Math.cos(2 * Math.PI * fc * t);
                envData.push(ac + m_t);
            } 
            else if (scheme === 'dsbsc') {
                s_t = ac * m_t * Math.cos(2 * Math.PI * fc * t);
                envData.push(Math.abs(ac * m_t));
            }
            else if (scheme === 'ssb') {
                s_t = (ac * am / 2) * Math.cos(2 * Math.PI * (fc + fm) * t);
                envData.push(ac * am / 2);
            }
            else if (scheme === 'fm') {
                let beta = dev / fm;
                s_t = ac * Math.cos(2 * Math.PI * fc * t + beta * Math.sin(2 * Math.PI * fm * t));
                envData.push(ac);
            }
            else if (scheme === 'pm') {
                let kp = dev;
                s_t = ac * Math.cos(2 * Math.PI * fc * t + kp * m_t);
                envData.push(ac);
            }

            msgData.push(m_t);
            carData.push(c_t);
            modData.push(s_t);
        }

        oscMsg.clear();
        oscCar.clear();
        oscMod.clear();
        
        const maxAmp = ((ac + am) * 1.2) / zy; 
        oscMsg.drawWaveform(msgData, '#39ff14', 1.5, maxAmp);
        oscCar.drawWaveform(carData, '#a1a1aa', 1.5, maxAmp);
        oscMod.drawWaveform(modData, '#ff7a00', 1.5, maxAmp); 
        
        if (scheme === 'am' || scheme === 'dsbsc') {
            oscMod.drawWaveform(envData, '#00f3ff', 1.5, maxAmp);
            oscMod.drawWaveform(envData.map(v => -v), '#00f3ff', 1.5, maxAmp);
        }
    }

    function updateSpectrum() {
        const { scheme } = { scheme: currentScheme };
        const { fm, fc, ac, am, dev } = state;
        
        let stems = [];
        let maxP = 0;
        
        if (scheme === 'am') {
            let pc = (ac*ac)/2;
            let psb = pc * ((am/ac)*(am/ac)) / 4;
            maxP = pc * 1.5;
            stems = [
                {f: fc - fm, p: psb, label: 'fc - fm'},
                {f: fc, p: pc, label: 'fc'},
                {f: fc + fm, p: psb, label: 'fc + fm'}
            ];
        } else if (scheme === 'dsbsc') {
            let psb = (ac*ac*am*am)/8;
            maxP = psb * 1.5;
            stems = [
                {f: fc - fm, p: psb, label: 'fc - fm'},
                {f: fc + fm, p: psb, label: 'fc + fm'}
            ];
        } else if (scheme === 'ssb') {
            let psb = (ac*ac*am*am)/8;
            maxP = psb * 1.5;
            stems = [
                {f: fc + fm, p: psb, label: 'fc + fm'}
            ];
        } else if (scheme === 'fm' || scheme === 'pm') {
            let pc = (ac*ac)/2;
            maxP = pc * 1.5;
            let beta = scheme === 'fm' ? dev / fm : dev * am;
            let j0 = Math.abs(1 - beta*beta/4);
            let j1 = Math.abs(beta/2);
            let j2 = Math.abs(beta*beta/8);
            let j3 = Math.abs(beta*beta*beta/48);
            
            stems.push({f: fc, p: pc * j0, label: 'fc'});
            if(j1 > 0.05) {
                stems.push({f: fc - fm, p: pc * j1, label: '-1'});
                stems.push({f: fc + fm, p: pc * j1, label: '+1'});
            }
            if(j2 > 0.05) {
                stems.push({f: fc - 2*fm, p: pc * j2, label: '-2'});
                stems.push({f: fc + 2*fm, p: pc * j2, label: '+2'});
            }
            if(j3 > 0.05) {
                stems.push({f: fc - 3*fm, p: pc * j3, label: '-3'});
                stems.push({f: fc + 3*fm, p: pc * j3, label: '+3'});
            }
        }

        spec.drawStems(stems, maxP);
    }

    Object.values(sliders).forEach(slider => {
        slider.addEventListener('input', updateTelemetry);
    });

    setTimeout(() => {
        updateTelemetry();
        animate();
    }, 200);
});
