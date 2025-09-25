/* 渦巻きパイプパズル v008 - 外部サウンドファイル（最小変更版） */
/* v007からSoundManagerクラスをそのまま抽出 */

// サウンド管理システム
class SoundManager {
    constructor() {
        this.enabled = true;
        this.musicEnabled = false;
        this.audioContext = null;
        this.bgmGain = null;
        this.initAudio();
    }
    
    async initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.bgmGain = this.audioContext.createGain();
            this.bgmGain.connect(this.audioContext.destination);
            this.emergencyBeepInterval = null;
        } catch (error) {
            console.log('Web Audio API not supported, using fallback');
        }
    }
    
    // パイプ回転音（ホワイトノイズ）
    playRotateSound() {
        if (!this.enabled) return;
        this.playWhiteNoise(0.05, 0.03); // 短く、小さく
    }
    
    // ループ完成音（倍音実験）- 150ms間隔に調整
    playLoopCompleteSound(loopLength) {
        if (!this.enabled) return;
        
        // 倍音シリーズ実験: 基音200Hzから倍音を生成
        const baseFreq = 200;
        const harmonics = Math.min(loopLength, 16); // 最大16倍音まで
        
        for (let i = 1; i <= harmonics; i++) {
            const freq = baseFreq * i;
            const volume = 0.1 / Math.sqrt(i); // 高次倍音は音量を減衰
            setTimeout(() => {
                this.playTone(freq, 0.3, volume);
            }, (i - 1) * 150); // ✅ 150ms間隔に調整（アニメーションと同期）
        }
    }
    
    // ブロック出現音（木魚リズム）
    playBlockAppearSound() {
        if (!this.enabled) return;
        // 木魚のような低く短い音
        this.playTone(150, 0.1, 0.03);
    }
    
    // 緊急モード警告音（継続音）
    playEmergencySound() {
        if (!this.enabled) return;
        this.startContinuousEmergencySound();
    }
    
    startContinuousEmergencySound() {
        // 既存の緊急音をクリア
        if (this.emergencyBeepInterval) {
            clearInterval(this.emergencyBeepInterval);
        }
        
        // 継続的な警告音
        this.emergencyBeepInterval = setInterval(() => {
            if (!this.enabled) return;
            this.playTone(880, 0.2, 0.06);
            setTimeout(() => this.playTone(440, 0.2, 0.06), 250);
        }, 800);
    }
    
    stopEmergencySound() {
        if (this.emergencyBeepInterval) {
            clearInterval(this.emergencyBeepInterval);
            this.emergencyBeepInterval = null;
        }
    }
    
    // ホワイトノイズ生成
    playWhiteNoise(duration, volume = 0.1) {
        if (!this.audioContext) {
            console.log(`🔊 ホワイトノイズ再生（代替）: ${duration}s`);
            return;
        }
        
        try {
            const bufferSize = this.audioContext.sampleRate * duration;
            const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const data = buffer.getChannelData(0);
            
            // ホワイトノイズ生成
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * volume;
            }
            
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            
            source.buffer = buffer;
            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // フェードイン・アウト
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(1, this.audioContext.currentTime + 0.005);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
            
            source.start(this.audioContext.currentTime);
            source.stop(this.audioContext.currentTime + duration);
        } catch (error) {
            console.log(`🔊 ホワイトノイズエラー: ${error.message}`);
        }
    }
    
    // ゲームオーバー爆発音
    playGameOverSound() {
        if (!this.enabled) return;
        
        // 爆発音：複数の低周波を重ねる + ノイズ
        const frequencies = [60, 80, 120, 150, 200];
        frequencies.forEach((freq, i) => {
            setTimeout(() => {
                this.playTone(freq, 1.0, 0.12);
            }, i * 30);
        });
        
        // ノイズ成分を追加
        setTimeout(() => {
            this.playWhiteNoise(0.8, 0.08);
        }, 100);
    }
    
    // 基本トーン再生
    playTone(frequency, duration, volume = 0.1) {
        if (!this.audioContext) {
            console.log(`🔊 音再生（代替）: ${frequency}Hz, ${duration}s`);
            return;
        }
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (error) {
            console.log(`🔊 音再生エラー: ${error.message}`);
        }
    }
    
    // BGM開始/停止
    toggleMusic() {
        if (!this.musicEnabled) return;
        console.log('🎵 BGM切り替え（未実装）');
        // TODO: 実際のBGMファイル再生
    }
    
    setEnabled(enabled) {
        this.enabled = enabled;
        console.log(`🔊 サウンド効果: ${enabled ? 'ON' : 'OFF'}`);
    }
    
    setMusicEnabled(enabled) {
        this.musicEnabled = enabled;
        console.log(`🎵 BGM: ${enabled ? 'ON' : 'OFF'}`);
        this.toggleMusic();
    }
}
