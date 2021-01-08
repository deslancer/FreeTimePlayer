class AudioSource {
    constructor(ctx) {
        this.context = ctx;
    }
    audioBuffer(url) {
        let audioBuffer;
        let xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer'; // важно
        xhr.onload = function(e) {
            // декодируем бинарный ответ
            this.context.decodeAudioData(this.response,
                function(decodedArrayBuffer) {
                    // получаем декодированный буфер
                    audioBuffer = decodedArrayBuffer;
                },
                function(e) {
                    console.log('Error decoding file', e);
                });
        };
        xhr.send();
        return audioBuffer
    }
    mediaElement(){

    }
    mediaStream(){

    }
}