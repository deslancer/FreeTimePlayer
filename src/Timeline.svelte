
<style>
    .range_block {
        display: flex;
        width: 100%;
        padding: 1rem 0.25rem;
    }
    .range_block p:first-child {
        flex: 1;
        text-align: left;
    }
    .range_block p:nth-child(2){
        flex: 10;
    }
    .range_block p:last-child {
        flex: 1;
        text-align: right;
    }
    .control_panel {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    #timeline {
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        height: 20px;
        padding: 0;
        box-shadow: inset 0 0 0 2px #1d1d1d;
        background: #333333;
        overflow: hidden;
        border-radius: 5px;
    }
    #timeline::-webkit-slider-thumb {
        -webkit-appearance: none;
        width:20px;
        height:20px;
        border-radius: 70%/30%;
        border: 2px solid #818181;
        background: #fff;
    }
    .volume {
        display: flex;
    }
    .form-range::-webkit-slider-thumb {
        -webkit-appearance: none;
        width:20px;
        height:20px;
        border-radius: 70%/30%;
        border: 2px solid #818181;
        background: #fff;
    }

</style>
<div class="range_block">
    <p>00:00</p>
    <p><input type="range" id="timeline"  name="my_range" value="" /></p>
    <p>11:30</p>
</div>
<div class="control_panel">
    <div class="btn-group" role="group" aria-label="Basic outlined example">
        <button type="button" class="btn btn-sm btn-outline-dark">
            <i class="fas fa-sliders-v"></i>
        </button>
        <button type="button" class="btn btn-sm btn-outline-dark">
            <i class="fas fa-repeat"></i>
        </button>
        <button type="button" class="btn btn-sm btn-outline-dark">
            <i class="fas fa-random"></i>
        </button>
    </div>
    <div class="play_btns">
        <div class="btn-group" role="group" aria-label="Basic outlined example">
            <button type="button" class="btn btn-outline-dark"><i class="fas fa-step-backward"></i></button>
            <button type="button" class="btn btn-outline-dark"><i class="fas fa-play"></i></button>
            <button type="button" class="btn btn-outline-dark"><i class="fas fa-stop"></i></button>
            <button type="button" class="btn btn-outline-dark"><i class="fas fa-step-forward"></i></button>
        </div>
    </div>
    <div class="volume">
        <div class="mr-2 pt-1"><i class="fas fa-volume-down"></i></div>
        <div class="ml-2"><input type="range" class="form-range"  name="my_range" value="" /></div>
    </div>
</div>