/**
 *
 * User: 管小龙
 * Date: 2020-05-20
 * Time: 17:10
 *
 * 1、创建音频上下文
 * 2、在音频上下文里创建源 — 例如 <audio>, 振荡器, 流
 * 3、创建效果节点，例如混响、双二阶滤波器、平移、压缩
 * 4、为音频选择一个目的地，例如你的系统扬声器
 * 5、连接源到效果器，对目的地进行效果输出
 */

class AudioFP {
    constructor(cb){
        this.context = null;
        this.currentTime = null;
        this.oscillator = null;
        this.compressor = null;
        this.gainNode = null;
        this.callback = cb
    }
    async run(){
        try {
            this.setup();
            this.oscillator.connect(this.compressor);
            this.oscillator.connect(this.gainNode);    // 发生源振荡器连接音量
            this.gainNode.connect(this.context.destination); //音量连接扬声器
            this.compressor.connect(this.context.destination);

            this.oscillator.start(0);
            this.getData()
            this.context.oncomplete = this.onComplete.bind(this);
        } catch (e) {
            throw e;
        }
    }

    setup() {
        this.setContext();
        this.currentTime = this.context.currentTime;
        this.setOscillator();
        this.setCompressor();
        this.setGainNode()
    }
    /**
     * 创建音频上下文
     */
    setContext() {
        //解析流 可以不发出声音
        var audioContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
        //Options 如下所示:
        // latencyHint: 这个参数表示了重放的类型, 参数是播放效果和资源消耗的一种权衡。可接受的值有 "balanced", "interactive" 和"playback"，默认值为 "interactive"。意思是 "平衡音频输出延迟和资源消耗", "提供最小的音频输出延迟最好没有干扰"和 "对比音频输出延迟，优先重放不被中断"。我们也可以用一个双精度的值来定义一个秒级的延迟数值做到更精确的控制。
        this.context = new audioContext(2,44100*40,44100);
        this.audioCtx = new AudioContext();
    }

    /**
     * 在音频上下文里创建源
     */
    setOscillator() {
        //这是声音的源头
        //createOscillator接口表示一个振荡器，它产生一个周期的波形信号（如正弦波）。它是一个 AudioScheduledSourceNode 音频处理模块， 这个模块会生成一个指定频率的波形信号（即一个固定的音调）
        this.oscillator = this.context.createOscillator();

        //一个字符串，决定 OscillatorNode 播放的声音的周期波形; 它的值可以是基础值中的一个或者用户使用 PeriodicWave。不同的波形可以产生不同的声调。 基础值有 "sine", "square", "sawtooth", "triangle" and "custom". 默认值是"sine"。
        this.oscillator.type = "triangle";
        //一个 a-rate AudioParam 对象的属性代表了振动的频率（单位为赫兹hertz） (虽然返回的AudioParam 是只读的，但是它所表示的值是可以修改的)。 默认值是 440 Hz (基本的中A音高).
        this.oscillator.frequency.setValueAtTime(500, this.currentTime);

    }
    setGainNode (){
        //创建一个增益节点(音量节点)，用来调节音量的变化
        this.gainNode = this.context.createGain();
        this.gainNode.gain.value = 0.1;  // 音量 0~1
    }

    /**
     * 创建效果节点，例如混响、双二阶滤波器、平移、压缩
     */
    setCompressor() {
        //接口提供了一个压缩效果器，用以降低信号中最响部分的音量，来协助避免在多个声音同时播放并叠加在一起的时候产生的削波失真。通常用于音乐创作和游戏音效中
        this.compressor = this.context.createDynamicsCompressor();
        //分贝高于此值时，将会进行压缩。
        this.setCompressorValueIfDefined('threshold', -50);
        //当超出 threshold 设置的值之后，曲线在哪个点开始朝着 ratio 设置的部分平滑变换。
        this.setCompressorValueIfDefined('knee', 40);
        //输入增益变化多少来产生 1 dB 的输出。
        this.setCompressorValueIfDefined('ratio', 12);
        //表示当前压缩器使用的增益压缩值。
        this.setCompressorValueIfDefined('reduction', -20);
        //降低增益 10 dB 的时间（单位为秒）。
        this.setCompressorValueIfDefined('attack', 10);
        //提升增益 10 dB 的时间（单位为秒）。
        this.setCompressorValueIfDefined('release', .25);
    }
    setCompressorValueIfDefined(item, value) {
        if (this.compressor[item] !== undefined && typeof this.compressor[item].setValueAtTime === 'function') {
            this.compressor[item].setValueAtTime(value, this.context.currentTime);
        }
    }
    onComplete(event) {
        this.generateFingerprints(event);
        //调用该方法的节点上断开一个或多个节点。
        this.compressor.disconnect();
    }
    generateFingerprints(event) {
        var output = null;
        for (var i = 4500; 5e3 > i; i++) {
            //接口的getChannelData()方法返回一Float32Array ，其中包含与通道关联的PCM数据，通道参数定义(0表示第一个通道)。
            var channelData = event.renderedBuffer.getChannelData(0)[i];
            output += Math.abs(channelData);

        }
        if (typeof this.callback === 'function') {
            console.log(output.toString());
            return this.callback(output.toString());
        }
    }
    getData() {
        var  _this = this
        let request = new XMLHttpRequest();
        var source = this.context.createBufferSource();

        request.open('GET', './audio/18.mp3', true);
        //request.open('GET', './audio/viper.ogg', true);

        request.responseType = 'arraybuffer';

        request.onload = function() {
            var audioData = request.response;
            _this.audioCtx.decodeAudioData(audioData, function(buffer) {
                let myBuffer = buffer;
                source.buffer = myBuffer;
                source.connect(_this.context.destination);
                source.start();
                //source.loop = true;
                _this.context.startRendering().then(function(renderedBuffer) {
                    console.log('渲染完全成功');
                    var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                    var song = audioCtx.createBufferSource();
                    song.buffer = renderedBuffer;

                    song.connect(audioCtx.destination);
                    document.querySelector('button').addEventListener('click', function() {
                        song.start(0);
                    });

                }).catch(function(err) {
                    console.log('渲染失败: ' + err);
                    // 注意: 当 OfflineAudioContext 上 startRendering 被立刻调用，Promise 应该被 reject
                });
            });
        }

        request.send();
    }
}
