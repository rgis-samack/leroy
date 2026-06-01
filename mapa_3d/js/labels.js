import * as THREE from 'three';

export function createLabels(scene, sectorsData) {
    sectorsData.forEach(sector => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 180;
        const ctx = canvas.getContext('2d');

        // Draw background (Tonalidade preta para melhor visualização)
        ctx.fillStyle = 'rgba(25, 25, 25, 0.95)';
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(0, 0, 512, 180, 20);
        } else {
            ctx.rect(0, 0, 512, 180);
        }
        ctx.fill();

        // Draw border (Cor do setor para manter a identidade)
        ctx.lineWidth = 12;
        ctx.strokeStyle = sector.color;
        ctx.stroke();

        // Draw text (Sempre branco sobre o fundo preto)
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 42px Inter, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(sector.name, 256, 50);

        // Draw progress bar background
        const barWidth = 412;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(50, 90, barWidth, 30, 15);
        else ctx.rect(50, 90, barWidth, 30);
        ctx.fill();

        const prog = sector.progress ? sector.progress.Progresso_Num : 0;
        const fillWidth = barWidth * (prog / 100);
        
        // Draw progress bar fill
        if (fillWidth > 0) {
            ctx.fillStyle = sector.color; // Preenche com a cor do setor
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(50, 90, fillWidth, 30, 15);
            else ctx.rect(50, 90, fillWidth, 30);
            ctx.fill();
        }

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px Inter, Arial, sans-serif';
        ctx.fillText(`${prog}% Concluído`, 256, 147);

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;

        const material = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(material);
        
        // Position sprite in the middle of sector, hovering above
        sprite.position.set(sector.x, 150, sector.z);
        sprite.scale.set(200, 70, 1);
        
        sprite.renderOrder = 999; // Always on top
        
        scene.add(sprite);
    });
}
