// ============================================================
// MODULE-LEVEL TTS MANAGER
// Lives OUTSIDE React — component crashes can't touch it.
// Helps prevent WebGL "context lost" related unmount bugs from breaking audio.
// ============================================================

const TTS = {
    _speaking: false,
    _currentText: '',

    speak(text, onStart, onEnd, onError) {
        const synth = window.speechSynthesis;
        if (!synth || !text) return;

        // Already speaking the same thing? Do nothing.
        if (this._speaking && this._currentText === text) {
            console.log('[TTS] Already speaking this text, ignoring duplicate');
            return;
        }

        // Already speaking something ELSE? Also ignore — don't interrupt.
        if (synth.speaking && !synth.paused) {
            console.log('[TTS] Synth busy, ignoring');
            return;
        }

        this._speaking = true;
        this._currentText = text;

        const utterance = new SpeechSynthesisUtterance(text);

        // Pick a voice
        const voices = synth.getVoices();
        const pick = voices.find(v =>
            v.name.includes('Google US English') ||
            v.name.includes('Microsoft David') ||
            v.name.includes('Samantha')
        ) || voices[0];

        if (pick) utterance.voice = pick;

        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        // utterance.volume = 1.0;

        utterance.onstart = () => {
            console.log('[TTS] ▶ Speaking started');
            this._speaking = true;
            if (onStart) onStart();
        };

        utterance.onend = () => {
            console.log('[TTS] ■ Speaking ended');
            this._speaking = false;
            this._currentText = '';
            if (onEnd) onEnd();
        };

        utterance.onerror = (e) => {
            // 'interrupted' and 'canceled' are expected when user skips/stops
            if (e.error === 'interrupted' || e.error === 'canceled') {
                console.log('[TTS] Speech interrupted (expected)');
            } else {
                console.error('[TTS] ✖ Unexpected error:', e.error);
            }
            this._speaking = false;
            this._currentText = '';
            if (onError) onError(e.error);
        };

        // DO NOT call synth.cancel() here! That's the bug.
        // Just speak. The queue will handle it.
        synth.speak(utterance);

        // Chrome bug: if it auto-paused, resume
        if (synth.paused) synth.resume();

        // Keep utterance reference alive (prevents GC metadata loss)
        window.__ttsUtterance = utterance;
    },

    stop() {
        const synth = window.speechSynthesis;
        if (synth) {
            // Check if it's actually speaking to avoid unnecessary cancel calls
            if (synth.speaking || synth.pending) {
                synth.cancel();
            }
        }
        this._speaking = false;
        this._currentText = '';
    },

    isBusy() {
        return this._speaking || window.speechSynthesis?.speaking;
    }
};

export default TTS;
