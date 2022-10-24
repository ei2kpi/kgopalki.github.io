 // If you want to use this code,
// please credit gopal@claylabs.com
// and include this message with any modified form

spawn_rate = 5.0e-3;
max_fw = 10;
g = 9.8;

// console.log("Test");
fw_list = [];
last_time = null;
next_firework = -1.0;

var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
ctx.fillStyle = "#000000";
ctx.fillRect(0, 0, canvas.width, canvas.height);

let params = (new URL(document.location)).searchParams;
let recipient = params.get("r");
let op1 = params.get("op1");
let op2 = params.get("op2");

function drawName() {
    ctx.save();
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    ctx.save();
    fs = Math.min(canvas.width/20, canvas.height/20);
    ctx.font = fs + "px Grandstander";
    ctx.fillStyle = "goldenrod";
    // console.log("r:", recipient);
    message = "Happy Deepavali, " + recipient + "!";
    lines = message.split("\n");
    for (var i=0; i<lines.length; i++) {
        ctx.fillText(lines[i], canvas.width*0.05, canvas.height*0.1 + fs*1.2*i);
    }
    ctx.restore();

    ctx.save();
    fs2 = fs * 1.2;
    ctx.font = fs2 + "px Dancing Script";
    ctx.fillStyle = "gold";
    ctx.textAlign = "right";
    message = "From:\nMythili,\nMeenu,\nUma,\n"
                + ((op2=="n")?"and ":"")
                + ((op1=="g")?"Gopal":"Rahul")
                + ((op2!="n") ? ",\nand " + ((op2=="p")?"Papa.":"Shyamala.") : ".");
    lines = message.split("\n");
    for (var i=lines.length-1; i>=0; i--) {
        ctx.fillText(lines[i], canvas.width*0.95, canvas.height*0.9 + fs2*1.2*(i-lines.length+1));
    }
    // ctx.fillText(, canvas.width*0.95, canvas.height*0.9);
    ctx.restore();
}

window.addEventListener('resize', resizeCanvas, false);
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawName();
}
resizeCanvas();

HSBToRGB = function (h, s, v) { //360, 255, 255

    var rgb = { };

        if (s == 0) {

        rgb.r = rgb.g = rgb.b = v;
        } else {
        var t1 = v;
        var t2 = (255 - s) * v / 255;
        var t3 = (t1 - t2) * (h % 60) / 60;

            if (h == 360) h = 0;

                if (h < 60) { rgb.r = t1; rgb.b = t2; rgb.g = t2 + t3 }
                else if (h < 120) { rgb.g = t1; rgb.b = t2; rgb.r = t1 - t3 }
                else if (h < 180) { rgb.g = t1; rgb.r = t2; rgb.b = t2 + t3 }
                else if (h < 240) { rgb.b = t1; rgb.r = t2; rgb.g = t1 - t3 }
                else if (h < 300) { rgb.b = t1; rgb.g = t2; rgb.r = t2 + t3 }
                else if (h < 360) { rgb.r = t1; rgb.g = t2; rgb.b = t1 - t3 }
                else { rgb.r = 0; rgb.g = 0; rgb.b = 0 }
        }

    return "rgb(" + Math.round(rgb.r) + ", " +
                    Math.round(rgb.g) + ", " +
                    Math.round(rgb.b) + ")";
}

function addFirework(timestamp) {
    if (fw_list.length > max_fw) { return; }
    fw = {};
    fw.start_x = Math.random()*canvas.width;
    fw.start_y = canvas.height;
    ux = Math.random()*canvas.width*0.025;
    fw.ux = (fw.start_x > 0.5 * canvas.width) ? -ux : ux;
    fw.uy = -Math.sqrt(2 * g * canvas.height*(Math.random()*0.5 + 0.25));
    fw.t0 = last_time;
    fw.colour = HSBToRGB(Math.random()*360, (1-Math.random()**2)*255, 255);
    fw.life = -700 * fw.uy / g;
    fw.colour2 = HSBToRGB(Math.random()*360, (1-Math.random()**2)*255, 255);
    fw.life2 = -300 * fw.uy / g;
    fw.v2 = Math.min(canvas.width/8, canvas.height/8) * (1+Math.random())/4;
    fw.n2 = 10 + Math.round(20*Math.random());
    fw.reburst = (Math.random() > 0.8);
    if (fw.reburst) {
        fw.v3 = fw.v2 * (Math.random() * 0.5 + 0.25);
        fw.n3 = 5 + Math.round(10 * Math.random());
        fw.life3 = fw.life2 * 1.25;
        fw.colour3 = HSBToRGB(Math.random()*360, (1-Math.random()**2)*255, 255);
    }
    fw.end_time = (fw.life + fw.life2 + ((fw.reburst)? fw.life3 : 0)) + last_time;
    fw.hasburst1 = false;
    fw.hasburst2 = false;
    fw_list.push(fw);
    next_firework = -Math.log(Math.random())/spawn_rate + timestamp;

}

function draw_circle(x, y, r, colour) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2*Math.PI, false);
    ctx.fillStyle = colour;
    ctx.fill();
    ctx.restore();
    // console.log(x, y, canvas.width, canvas.height);
}

function burst(colour) {
    ctx.save();
    ctx.fillStyle = colour;
    ctx.globalAlpha = 0.2;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
}

function drawFireworks(timestamp) {
    // if (fw_list.length > 0) {
    //     console.log(fw_list);
    // }
    r = Math.min(canvas.width*0.002, canvas.height * 0.002);
    // r=5;
    for (var i=0; i<fw_list.length; i++) {
        ctx.save();
        fw = fw_list[i];
        fw_opacity = 1;
        // if (timestamp > fw.end_time - 1000) {
        //     fw_opacity = (fw.end_time - timestamp)/1000;
        //     ctx.globalAlpha = fw_opacity;
        // }
        fw_opacity = (fw.end_time - timestamp)/1000;
        fw_opacity = Math.max(0, fw_opacity);
        fw_opacity = Math.min(1, fw_opacity);
        // console.log(fw_opacity, fw.end_time, timestamp);
        ctx.globalAlpha = fw_opacity;
        t = timestamp - fw.t0;
        t *= 1e-3;
        px = fw.start_x + fw.ux * t;
        py = fw.start_y + fw.uy * t + 0.5 * g * t * t;
        // console.log(t, fw.life);
        if (t < fw.life*1e-3) {
            ctx.save();
            ctx.globalAlpha = 0.3 * fw_opacity;
            ctx.beginPath();
            ctx.moveTo(px,py);
            curr_vy = fw.uy + g*t;
            delta_t = 0.5;
            ox = px - delta_t * fw.ux;
            oy = py - delta_t * curr_vy;
            ctx.lineTo(ox, oy);
            ctx.lineWidth = 1.5*r;
            var gradient = ctx.createLinearGradient(px, py, ox, oy);
            gradient.addColorStop("0", "#FFFFFF");
            gradient.addColorStop("1.0", "rgba(255, 128, 0, 0)");

            ctx.strokeStyle = gradient;
            ctx.stroke();
            ctx.restore();
            draw_circle(px, py, r, fw.colour);
        } else {
            if (!fw.hasburst1) {
                fw.hasburst1 = true;
                burst(fw.colour2);
            }
            t2 = t - fw.life*1e-3;
            r2 = t2 * fw.v2;
            for (var j=0; j<fw.n2; j++) {
                px2 = px + r2* Math.cos(j/fw.n2 * 2*Math.PI);
                py2 = py + r2* Math.sin(j/fw.n2 * 2*Math.PI);
                if ((t < (fw.life + fw.life2) * 1e-3) || (!fw.reburst))  {
                    ctx.save();
                    ctx.globalAlpha = 0.1 * fw_opacity;
                    ctx.beginPath();
                    ctx.moveTo(px2,py2);
                    curr_vy = fw.uy + g*t;
                    delta_t = 0.5;
                    ox = px2 - delta_t * fw.ux;
                    oy = py2 - delta_t * curr_vy;
                    ox -= delta_t * fw.v2 * Math.cos(j/fw.n2 * 2*Math.PI);
                    oy -= delta_t * fw.v2 * Math.sin(j/fw.n2 * 2*Math.PI);
                    ctx.lineTo(ox, oy);
                    ctx.lineWidth = 1.5*r;
                    var gradient = ctx.createLinearGradient(px2, py2, ox, oy);
                    gradient.addColorStop("0", "#FFFFFF");
                    gradient.addColorStop("1.0", "rgba(255, 128, 0, 0)");

                    ctx.strokeStyle = gradient;
                    ctx.stroke();
                    ctx.restore();
                    draw_circle(px2, py2, r, fw.colour2);
                } else {
                    if (!fw.hasburst2) {
                        fw.hasburst2 = true;
                        burst(fw.colour3);
                    }
                    t3 = t2 - fw.life2 * 1e-3;
                    r3 = t3 * fw.v3;
                    for (var k = 0; k < fw.n3; k++) {
                        px3 = px2 + r3 * Math.cos(k/fw.n3 * 2 * Math.PI);
                        py3 = py2 + r3 * Math.sin(k/fw.n3 * 2 * Math.PI);
                        draw_circle(px3, py3, r, fw.colour3);
                    }
                }
            }
        }
        ctx.restore();
    }
}

function ProcessEvents(timestamp) {
    for (var i=0; i<fw_list.length; i++) {
        if (fw_list[i].end_time <= timestamp) {
            fw_list.splice(i, 1);
            i--;
        }
    }
    if (timestamp > next_firework) {addFirework(timestamp);}
}

function drawFrame(timestamp) {
    if (!last_time) {
        last_time = timestamp;
        addFirework(timestamp);
    }
    drawName(timestamp);
    drawFireworks(timestamp);
    ProcessEvents(timestamp);
    last_time = timestamp;
    window.requestAnimationFrame(drawFrame);
    //console.log(fw_list);
    //console.log("drawing...");
}

window.requestAnimationFrame(drawFrame);
