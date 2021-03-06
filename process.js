var progressBar = function (element) {
    var canvas,
        configMap             = {
            width: 200,
            height: 200,
            deg: 0,
            new_deg: 0,
            dif: 0,
            total_time: 3000,
            start_color: 'yellow',
            end_color: 'blue',
            stroke_color: 'yellow',
            fill_color: 'red',
            font_style: '20px arial',
            line_width: 5,
            success_font: 'ok',
            success_font_color: 'white',
            failure_font: 'error',
            failure_font_color: 'red',
            radius: (this.width + this.height - 2 * this.line_width) / 4,
            font_offset: 5
        },
        ctx,
        closecallback,
        from,
        progress              = 100,
        type                  = 'success',
        requestAnimationFrame = window.requestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            function (callback) {
                setTimeout(callback, 1000 / 60);
            },

        step,
        stepArc,	//初始化内圆
        t                     = 0,
        text, text_w, notice, createElement, loading, setSucc;


    createElement = function (selector) {
        canvas        = document.createElement('canvas');
        canvas.width  = configMap.width;
        canvas.height = configMap.height;
        ctx           = canvas.getContext("2d");
        document.getElementById(selector).appendChild(canvas);
    }

    draw = function () {
        ctx.clearRect(0, 0, configMap.width, configMap.height);
        ctx.beginPath();
        ctx.strokeStyle = configMap.stroke_color;
        ctx.arc(configMap.width / 2, configMap.height / 2, configMap.radius, 0, Math.PI * 2, false);
        ctx.stroke();

        // var r= configMap.deg * Math.PI/180 +  (Math.PI/360 - configMap.deg * Math.PI/180)/2;
        var r = configMap.deg * Math.PI / 180;
        ctx.beginPath();

        //loading中间的渐变线效果
        var my_gradient = ctx.createLinearGradient(0, 0, configMap.width, configMap.height);
        my_gradient.addColorStop(0.5, configMap.start_color);
        my_gradient.addColorStop(0.6, configMap.end_color);

        ctx.strokeStyle = my_gradient;
        ctx.lineWidth   = configMap.line_width;
        ctx.arc(configMap.width / 2, configMap.height / 2, configMap.radius, 0 - 97 * Math.PI / 180, r - 90 * Math.PI / 180, false);
        ctx.stroke();

        ctx.fillStyle = configMap.fill_color;
        ctx.font      = configMap.font;
        step          = Math.round(configMap.deg / 360 * 100);
        console.log(step);
        text_w = ctx.measureText(step).width;
        ctx.fillText(step, configMap.width / 2 - text_w / 2, configMap.height / 2 + configMap.font_offset);

        //成功后画圆
        stepArc = configMap.radius;
    }


    init = function () {
        configMap.new_deg += Math.round(Math.random() * (360 - configMap.new_deg));
        draw();
        to();
        if (step < progress) {
            requestAnimationFrame(init);
        }
    }

    to = function () {
        if (step == progress) {
            initArc()
            return;
        }
        if (configMap.deg == configMap.new_deg) {
            draw();
        }

        if (configMap.deg < configMap.new_deg) {
            configMap.deg = configMap.deg + ((360 - configMap.deg) / ((configMap.deg || 1) * 180) )
        } else {
            configMap.deg--;
        }
    }

    //成功后中心渐变圆
    drawArc = function () {
        ctx.fillStyle = "lightgreen";
        ctx.beginPath();
        ctx.arc(configMap.width / 2, configMap.height / 2, stepArc, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.fill();
    }

    initArc = function () {
        stepArc = 0.6 * t * t / 2;
        drawArc();
        if (Math.ceil(stepArc) <= configMap.radius + configMap.line_width) {
            t += 1;
            requestAnimationFrame(initArc);
        } else {
            notice()
        }

    }

    notice = function () {
        var fillStyle,
            font,
            message;
        if (type == 'success') {
            fillStyle = configMap.success_font_color;
            message   = configMap.success_font;
        } else {
            fillStyle = configMap.failure_font_color;
            message   = configMap.failure_font;
        }
        ctx.fillStyle = fillStyle;
        ctx.font      = configMap.font;
        text_w        = ctx.measureText(message).width;
        ctx.fillText(message, configMap.width / 2 - text_w / 2, configMap.height / 2 + configMap.font_offset);
    }
    setOpt = function (obj) {
        configMap.width = obj.width || configMap.width,	//x
            configMap.height = obj.height || configMap.height,	//y
            configMap.deg = obj.deg || configMap.deg,	//默认加载的loading角度
            configMap.fill_color = obj.fillColor || configMap.fill_color,	//loading内文字颜色
            configMap.font = obj.font || configMap.font,	//文字大小及字体
            configMap.stroke_color = obj.strokeColor || configMap.stroke_color, //loading边框颜色
            configMap.start_color = obj.startColor || configMap.start_color, //渐变颜色1
            configMap.end_color = obj.endColor || configMap.end_color,	//渐变颜色2
            configMap.total_time = obj.totalTime || configMap.total_time;	//加载缓冲时间，不精确
        configMap.line_width  = obj.lineWidth || configMap.line_width;	//loading边框宽度
        configMap.radius      = obj.radius || configMap.radius //loading半径
        configMap.font_offset = obj.fontOffset || configMap.font_offset
    }

    loading = function (stop_progress, stop_type, selector) {
        if (arguments.length > 0) {
            for (var i = 0; i <= arguments.length; i++) {
                switch (i) {
                    case 0:
                        progress = arguments[i];
                        break;
                    case 1:
                        type = arguments[i];
                        break;
                }
            }

        }
        //创建canvas标签
        createElement(selector);
        init();
    }
    setSucc = function () {
        configMap.deg = 360;
        draw()
        step = progress = 100;
        initArc();
    }
    return {
        setOpt: setOpt,
        loading: loading,
        setSuccess: setSucc
    };
}
