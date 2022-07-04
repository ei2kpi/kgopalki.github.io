let draw_actual = true;
let draw_spring = true;
let draw_consta = true;
let draw_ball_pit = true;



let scroll_range = 100000;
let root_height = null;

let progress = null;

let context = null;

let speed = 0;
let acceleration = 0;
let last_y = document.documentElement.scrollTop;
let last_v = 0;
let last_t = performance.now();
let spring_y = last_y;
let spring_v = 0;
let spring_k = 1e-3;
let spring_damp = 1e-1;

let max_a = 0.02; // extend to max_a = const + delta_y * factor
let ca_speed = 0;
let ca_y = last_y;
let ca_a = 0;

function update_canvas_size() {
    context.canvas.width = context.canvas.clientWidth;
    context.canvas.height = context.canvas.clientHeight;
}

function update_body_height() {
    if (root_height === window.innerHeight) {
        return;
    }
    root_height = window.innerHeight;
    document.body.style.height = (scroll_range + root_height) + "px";
}

function update_animation() {
    let curr_y = document.documentElement.scrollTop;
    let curr_t = performance.now();
    let delta_t = curr_t - last_t;
    if (delta_t > 1e-5) {
        speed = (curr_y - last_y) / delta_t;
        acceleration = (speed - last_v) / delta_t;
    } else {
        speed = last_v;
    }

    let scroll_y = document.documentElement.scrollTop;
    context.fillStyle = "grey";
    context.globalAlpha = 1.0;
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);


    if (draw_actual) {
        draw_frame(curr_y, "red");
    }

    if (draw_spring) {
        if (delta_t > 200) {
            spring_y = curr_y;
            spring_v = 0;
        } else {
            spring_v += delta_t * (spring_k * (curr_y - spring_y) - spring_damp * spring_v);
            // spring_v = Math.min(Math.max(spring_v, -1), 1)
            dy = spring_v * delta_t;
            // if ((spring_y < curr_y) == (dy > 0)) {
            //     curr_y 
            // }
            spring_y += spring_v * delta_t;
        }
        draw_frame(spring_y, "green");
        // console.log(spring_y, spring_v);
    }

    if (draw_consta) {
        let delta_y = curr_y - ca_y;
        if (Math.abs(delta_y) > 1e-5) {console.log("1.)", curr_y, ca_y, ca_speed, ca_a, delta_y);}
        if (delta_t > 200) {
            ca_y = curr_y;
            ca_speed = 0;
            ca_a = 0;
        } else {
            if (Math.abs(delta_y) < 1e-5) {
                ca_y = curr_y;
                ca_speed = 0;
                ca_a = 0;
            } else {
                if ((delta_y > 0 && ca_speed < 0) || (delta_y < 0 && ca_speed>0)) {
                    ca_speed = 0;
                }
                let dist = Math.abs(ca_speed * ca_speed / 2 / max_a); // S = v^2 / 2a
                if (dist < Math.abs(delta_y)) {
                    ca_a = (delta_y > 0) ? max_a : (-max_a);
                } else {
                    ca_a = -ca_speed*ca_speed / 2 / delta_y;
                }
                console.log("2.)", curr_y, ca_y, ca_speed, ca_a, dist, delta_y);
                ca_y += ca_speed * delta_t + 0.5 * ca_a * delta_t * delta_t;
                if ((ca_y > curr_y) && (delta_y > 0)) {ca_y = curr_y};
                if ((ca_y < curr_y) && (delta_y < 0)) {ca_y = curr_y};
                ca_speed += ca_a * delta_t;
            }
        }
        if (Math.abs(delta_y) > 1e-5) {console.log("3.)", ca_y, ca_speed, ca_a)};
        draw_frame(ca_y, "blue");
    }

    last_t = curr_t;
    last_y = curr_y;
}

function draw_frame(scroll_y, colour) {

    context.save();

    let w = context.canvas.width;
    let h = context.canvas.height;

    // context.clearRect(x, y, w, h);


    let r = Math.min(w, h) / 16;
    let r2 = r * 6;
    let x_cen_2 = w / 2;
    let y_cen_2 = h / 2;
    let av = 0.003;
    let theta = av * scroll_y;
    let x_cen_1 = x_cen_2 + r2 * Math.cos(theta);
    let y_cen_1 = y_cen_2 + r2 * Math.sin(theta)

    context.globalAlpha = 0.5;
    context.fillStyle = colour;
    context.beginPath();
    context.arc(x_cen_1, y_cen_1, r, 0, 2*Math.PI);
    context.fill();
    // context.fillRect(x_cen_1, y_cen_1, 100, 100);

    context.restore();
}

function update_animation_every_frame() {
    update_animation();
    window.requestAnimationFrame(update_animation_every_frame);
}

window.addEventListener("DOMContentLoaded", () => {
    const up = new URLSearchParams(window.location.search);
    if (up.get('actual') == '0') {
        draw_actual = false;
    }
    if (up.get('spring') == '0') {
        draw_spring = false;
    }
    if (up.get('consta') == '0') {
        draw_consta = false;
    }
    if (up.get('ball_pit') == '0') {
        draw_ball_pit = false;
    }

    update_body_height();

    let root = document.getElementById("root");

    context =
        root.appendChild(document.createElement("canvas")).getContext("2d");
    context.canvas.style = [
        "width: 100%", "height: 100%",
        "background-color: beige",
        ""].join(";\n");

    update_canvas_size();

    window.addEventListener("resize", () => {
        update_canvas_size();
        update_body_height();
        progress = null;
    });
    update_animation_every_frame();

});