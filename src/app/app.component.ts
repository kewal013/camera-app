import { Component, ViewChild, ElementRef } from '@angular/core';
declare let MediaRecorder: any;
declare global {
    interface Window { stream: any }
};

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    mediaRecorder: any;
    recordedBlob: any;
    recordButton: any = 'Start Recording';
    @ViewChild('recordedVideo') recordedVideo: ElementRef;
    @ViewChild('liveVideo') liveVideo: ElementRef;
    cameraStream: any;

    constructor() { }

    startRecord() {
        if (this.recordButton === 'Start Recording') {
            this.startRecording();
        } else {
            this.stopRecording();
            this.recordButton = 'Start Recording';
        }
    }


    play() {
        const superBuffer = new Blob(this.recordedBlob, { type: 'video/webm' });
        this.recordedVideo.nativeElement.src = null;
        this.recordedVideo.nativeElement.srcObject = null;
        this.recordedVideo.nativeElement.src = window.URL.createObjectURL(superBuffer);
        this.recordedVideo.nativeElement.controls = true;
        this.recordedVideo.nativeElement.play();
    }

    download() {
        const blob = new Blob(this.recordedBlob, { type: 'video/webm' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'test.webm';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
    };

    handleDataAvailable(event: any) {
        if (event.data && event.data.size > 0) {
            this.recordedBlob.push(event.data);
        }
    }

    startRecording() {
        this.recordedBlob = [];
        let options = { mimeType: 'video/webm;codecs=vp9,opus' };
        this.mediaRecorder = new MediaRecorder(window.stream, options);
        this.recordButton = 'Stop Recording';
        this.mediaRecorder.onstop = (event) => {
            console.log('Recorded Blobs: ', this.recordedBlob);
        };
        this.mediaRecorder.ondataavailable = this.handleDataAvailable.bind(this);
        this.mediaRecorder.start();
    }

    stopRecording() {
        this.mediaRecorder.stop();
        this.cameraStream.getTracks().forEach(element => {
            element.stop();
        });
    }

    handleSuccess(stream: any) {
        window.stream = stream;
        this.cameraStream = stream;

        this.liveVideo.nativeElement.srcObject = stream;
    }

    async init(constraints) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.handleSuccess(stream);
        } catch (e) {
            console.error(e);
        }
    }

    async start() {
        const constraints = {
            video: {
                width: 1280, height: 720
            }
        };
        await this.init(constraints);
    }
}


